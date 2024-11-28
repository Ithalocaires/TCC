import { GiftedChat, Bubble, Send, InputToolbar } from 'react-native-gifted-chat';
import { useCallback, useEffect, useState, useRef, useLayoutEffect } from 'react';
import { View, Alert, TouchableOpacity, StyleSheet, Modal, Text, Button } from 'react-native';
import { collection, addDoc, onSnapshot, query, orderBy, doc, getDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { database } from "../../config/firebase";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/Ionicons';

const ChatScreen = () => {
    const [messages, setMessages] = useState([]);
    const route = useRoute();
    const navigation = useNavigation();
    const { sessionId, name, userId } = route.params;
    const [isInitializing, setIsInitializing] = useState(true);
    const [userRole, setUserRole] = useState('medico');
    const [dadosMedico, setDadosMedico] = useState({});
    const [dadosPaciente, setDadosPaciente] = useState({});
    const timeoutRef = useRef(null);
    const [modalVisible, setModalVisible] = useState(false); 

      // Função para encerrar consulta automaticamente
      const encerrarConsultaAutomaticamente = async () => {
        try {
            const sessionRef = doc(database, 'chatSessions', sessionId);
            const archiveRef = collection(database, 'closedChats');
            const sessionSnap = await getDoc(sessionRef);
    
            if (sessionSnap.exists()) {
                const sessionData = sessionSnap.data();
    
                // Adiciona o chat encerrado na coleção "closedChats"
                const closedChatRef = doc(archiveRef, sessionId);
                await setDoc(closedChatRef, {
                    ...sessionData,
                    status: 'encerrada',
                    endedAt: new Date(),
                    accessibleUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
                });
    
                // Atualiza o status do paciente e do médico para liberar novas consultas
                if (sessionData.pacienteId) {
                    const pacienteRef = doc(database, 'pacientes', sessionData.pacienteId);
                    await updateDoc(pacienteRef, { possuiConsultaAtiva: false });
                }
    
                if (sessionData.medicoId) {
                    const medicoRef = doc(database, 'medicos', sessionData.medicoId);
                    await updateDoc(medicoRef, { possuiConsultaAtiva: false });
                }
    
                // Remove o chat ativo
                await deleteDoc(sessionRef);
            }
    
            // Alerta o usuário e redireciona para a tela inicial
            Alert.alert('Consulta Encerrada', 'A consulta foi encerrada com sucesso.');
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } catch (error) {
            console.error('Erro ao encerrar consulta automaticamente:', error);
        }
    };
    const configurarTimeout = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current); // Limpa o temporizador anterior
        timeoutRef.current = setTimeout(() => {
            encerrarConsultaAutomaticamente(); // Encerra a consulta após 10 minutos de inatividade
        }, 10 * 60 * 1000); // 10 minutos
    };

    // Atualizar o status para "ativo" ao abrir o chat
    useEffect(() => {
        const updateChatStatus = async () => {
            try {
                const docRef = doc(database, 'chatSessions', sessionId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const { status } = docSnap.data();
                    if (status !== 'ativo') {
                        await updateDoc(docRef, { status: 'ativo' });
                    }
                } else {
                    await setDoc(docRef, {
                        status: 'ativo',
                        createdAt: new Date(),
                    });
                }
            } catch (error) {
                console.error("Erro ao atualizar o status do chat:", error);
            }
        };

        updateChatStatus();
    }, [sessionId]);

    // Buscar informações do usuário
   useEffect(() => {
    const fetchUserDetails = async () => {
        try {
            // Verifica se é um médico
            const medicoDoc = await getDoc(doc(database, 'medicos', userId));
            if (medicoDoc.exists()) {
                setUserRole('medico');
                setDadosMedico(medicoDoc.data());

                // Busca os dados do paciente relacionado à sessão atual
                if (sessionId) {
                    const chatDoc = await getDoc(doc(database, 'chatSessions', sessionId));
                    if (chatDoc.exists()) {
                        const pacienteId = chatDoc.data().pacienteId;
                        const pacienteDoc = await getDoc(doc(database, 'pacientes', pacienteId));
                        if (pacienteDoc.exists()) {
                            setDadosPaciente(pacienteDoc.data());
                        } else {
                            console.error("Dados do paciente não encontrados.");
                        }
                    } else {
                        console.error("Sessão de chat não encontrada.");
                    }
                }
            } else {
                // Caso seja paciente
                const pacienteDoc = await getDoc(doc(database, 'pacientes', userId));
                if (pacienteDoc.exists()) {
                    setUserRole('paciente');
                    setDadosPaciente(pacienteDoc.data());
                }
            }
        } catch (error) {
            console.error("Erro ao buscar dados do usuário:", error);
        }
    };

    fetchUserDetails();
}, [userId, sessionId]);

    // Buscar mensagens do chat
    useEffect(() => {
        const getMessages = async () => {
            try {
                const values = query(
                    collection(database, `chatSessions/${sessionId}/messages`),
                    orderBy('createdAt', 'desc')
                );
                onSnapshot(values, (snapshot) => {
                        setMessages(
                        snapshot.docs.map(doc => ({
                            _id: doc.id,
                            createdAt: doc.data().createdAt.toDate(),
                            text: doc.data().text,
                            user: doc.data().user,
                        }))
                    );
                    configurarTimeout(); // Reinicia o temporizador a cada mensagem nova
                });
            } catch (error) {
                console.error("Erro ao buscar mensagens: ", error);
            }
        };
        getMessages();

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current); // Limpa o temporizador ao desmontar
        };
    }, [sessionId]);

    // Enviar mensagem
    const sentMessage = useCallback((messages = []) => {
        // A parte previousMessages serve para informar ao Gifted chat que são mensagens antigas, a mensagem mais atual é atribuida no "messages"
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
        // Atribuição dos valores dentro de uma mensagem
        const { _id, createdAt, text, user } = messages[0];
        const userName = name || 'Anônimo';
        addDoc(collection(database, `chatSessions/${sessionId}/messages`), {
            _id, // ID da mensagem
            createdAt, // Data de Criação
            text, // Texto de mensagem
            user: { // Busca o usuário que enviou a mensagem
                _id: user._id,  // ID do usuário
                name: userName ,  // Nome do usuário
            },
            
            //Tratamento de exceçõs para caso o App apresentar problmas
        }).catch((error) =>{
            console.error("Erro ao enviar mensagem: ", error);
        });
    }, [sessionId, name]);

    // Encerrar consulta
    const encerrarConsulta = async () => {
    Alert.alert(
        "Encerrar Consulta",
        "Tem certeza de que deseja encerrar a consulta? Essa ação não pode ser desfeita.",
        [
            {
                text: "Cancelar",
                style: "cancel",
            },
            {
                text: "Encerrar",
                style: "destructive",
                onPress: async () => {
                    try {
                        const sessionRef = doc(database, 'chatSessions', sessionId);
                        const archiveRef = collection(database, 'closedChats');
                        const sessionSnap = await getDoc(sessionRef);
    
                        if (sessionSnap.exists()) {
                            const sessionData = sessionSnap.data();
    
                            // Verificar se medicoId está presente
                            if (!sessionData.medicoId) {

                                Alert.alert("Erro", "Dados do médico estão incompletos. Não é possível encerrar a consulta.");
                                return;
                            }
    
                            const medicoRef = doc(database, 'medicos', sessionData.medicoId);
                            const medicoSnap = await getDoc(medicoRef);
    
                            // Garantir que crmMedico tenha um valor válido
                            const crmMedico = medicoSnap.exists() ? medicoSnap.data().crm || 'N/A' : 'N/A';
    
                            let nomeMedico = "Desconhecido";
                            if (medicoSnap.exists()) {
                                nomeMedico = medicoSnap.data().nome || "Desconhecido"; // Campo 'nome' do médico
                            }
    
                            // Atualiza o status do chat para "encerrada" antes de arquivar
                            await updateDoc(sessionRef, { status: 'encerrada' });
    
                            // Adiciona o chat encerrado na coleção 'closedChats'
                            const closedChatRef = doc(archiveRef, sessionId);
                            await setDoc(closedChatRef, {
                                ...sessionData,
                                nomeMedico,  // Salva o nome do médico
                                crmMedico,  // Salva o CRM do médico
                                status: 'encerrada',  // Altera o status da consulta como encerrada
                                endedAt: new Date(),  // Define a data de encerramento da consulta
                                accessibleUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Deixa a consulta disponível por 7 dias.
                            });
    
                            // Remove o chat ativo
                            await deleteDoc(sessionRef);
                        } else {
                            console.error("Sessão não encontrada para encerrar.");
                            Alert.alert("Erro", "Sessão não encontrada.");
                            return;
                        }
    
                        // Redirecionar o médico para a tela Home
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Home' }],
                        });
                    } catch (error) {
                        console.error("Erro ao encerrar consulta:", error);
                    }
                },
            },
        ],
        { cancelable: true }
    );
};

    
    useEffect(() => {
        if (userRole === 'medico') { // Verifica se o usuário é médico
            navigation.setOptions({
                headerRight: () => (
                    <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.headerButton}>
                        <Icon name="person-circle-outline" size={30} color="#53affa" />
                    </TouchableOpacity>
                ),
            });
        } else {
            navigation.setOptions({
                headerRight: () => null, // Remove o botão para pacientes
            });
        }
    }, [navigation, userRole]);

    useEffect(() => {
        const docRef = doc(database, 'chatSessions', sessionId);

        const unsubscribe = onSnapshot(docRef, async (docSnap) => {
            if (docSnap.exists()) {
                const { status } = docSnap.data();

                if (isInitializing) {
                    // Durante a inicialização, atualize o status para "ativo" se necessário
                    if (status !== 'ativo') {
                        try {
                            await updateDoc(docRef, { status: 'ativo' });
                        } catch (error) {
                            console.error("Erro ao atualizar status para ativo:", error);
                        }
                    }
                    setIsInitializing(false); // Finalizar a inicialização
                } else {
                    // Redirecionar somente se a consulta for encerrada após a inicialização
                    if (status === 'encerrada') {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Home' }],
                        });
                    }
                }
            } else if (isInitializing) {
                // Criar o documento caso ele não exista durante a inicialização
                try {
                    await setDoc(docRef, { status: 'ativo', createdAt: new Date() });
                    setIsInitializing(false);
                } catch (error) {
                    console.error("Erro ao criar documento do chat:", error);
                }
            }
        });

        return () => unsubscribe();
    }, [sessionId, navigation, isInitializing]);

    const formatDate = (timestamp) => {
        if (timestamp?.seconds) {
            const date = new Date(timestamp.seconds * 1000); // Converte segundos para milissegundos
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            });
        }
        return "N/A";
    };

    const renderBubble = (props) => (
        <Bubble
            {...props}
            wrapperStyle={{
                right: {
                    backgroundColor: '#53affa',
                    borderRadius: 10,
                    marginBottom: 5,
                    alignSelf: 'flex-end',  // Garante que a bolha da direita esteja alinhada à direita
                    maxWidth: '80%', // Limita a largura da bolha
                },
                left: {
                    backgroundColor: '#003770',
                    borderRadius: 10,
                    marginBottom: 5,
                    alignSelf: 'flex-start',  // Garante que a bolha da esquerda esteja alinhada à esquerda
                    maxWidth: '80%', // Limita a largura da bolha
                },
            }}
            textStyle={{
                right: { color: '#fff', fontSize: 14 }, // Ajuste do texto da bolha da direita
                left: { color: '#fff', fontSize: 14 },  // Ajuste do texto da bolha da esquerda
            }}
        />
    );

    const renderSend = (props) => (
        <Send {...props}>
            <View style={styles.sendButton}>
                <Icon name="send" size={24} color="#53affa" />
            </View>
        </Send>
    );

    // Props do Gifted chat permitindo alterar a barra de input
    const renderInputToolbar = (props) => (
        <InputToolbar
            {...props}
            containerStyle={styles.inputToolbar}
            primaryStyle={styles.inputToolbarPrimary}
            renderActions={() =>
                userRole === 'medico' && (
                    <View style={styles.actionsContainer}>
                        {/* Botão para encerrar consulta */}
                        <TouchableOpacity onPress={encerrarConsulta} style={styles.actionButton}>
                            <Icon name="close-outline" size={24} color="#E05151" />
                        </TouchableOpacity>
                         {/* Botão de Anexo */}
                        <TouchableOpacity style={styles.actionButton}>
                            <Icon name="attach-outline" size={24} color="#53affa" />
                        </TouchableOpacity>
                    </View>
                )
            }
        />
    );

    // Remover o botão de voltar no React Navigation
    useLayoutEffect(() => {
        navigation.setOptions({
          headerLeft: () => null, 
        });
      }, [navigation]);


    // Renderização do front end
    return (
        <View style={styles.container}>
        {/* Modal para exibir os dados do paciente */}
        <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Dados do Paciente</Text>

                    {dadosPaciente ? (
                        <>
                            <Text style={styles.modalText}>Nome: {dadosPaciente.nome || "N/A"}</Text>
                            <Text style={styles.modalText}>Email: {dadosPaciente.email || "N/A"}</Text>
                            <Text style={styles.modalText}>Telefone: {dadosPaciente.celular || "N/A"}</Text>
                            <Text style={styles.modalText}>Carteirinha SUS: {dadosPaciente.cartaoSUS || "N/A"}</Text>
                            <Text style={styles.modalText}>CPF: {dadosPaciente.cpf || "N/A"}</Text>
                            <Text style={styles.modalText}>Data de Nascimento: {formatDate(dadosPaciente.dataNascimento)}</Text>
                            <Text style={styles.modalText}>RG: {dadosPaciente.rg || "N/A"}</Text>
                        </>
                    ) : (
                        <Text>Carregando dados do paciente...</Text>
                    )}

                    <TouchableOpacity style={styles.closeButton}  onPress={() => setModalVisible(false)} >
                        <Text style={styles.closeButtonText}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
            {/* Utilização do componente importado Gifted chat */}
            <GiftedChat
                messages={messages}
                onSend={(messages) => sentMessage(messages)}
                user={{ _id: userId || 'anon', name: name || 'Anônimo' }} 
                renderBubble={renderBubble}
                renderSend={renderSend}
                renderInputToolbar={(props) => renderInputToolbar(props)}
                placeholder="Digite uma mensagem..."
                alwaysShowSend={true}
                renderAvatar={() => null}

            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    inputToolbar: {
        backgroundColor: '#FFF',
        paddingHorizontal: 5,
    },
    inputToolbarPrimary: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    actionsContainer: {
        flexDirection: 'row',
        marginRight: 10,
    },
    actionButton: {
        marginHorizontal: 5,
        padding: 5,
        borderRadius: 50,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerButton: {
        marginRight: 15,
    },
    sendButton: {
        padding: 10,
        borderRadius: 50,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        color: '#000',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#53affa',
    },
    modalText: {
        fontSize: 14,
        marginBottom: 5,
        color: '#000',
        marginVertical: '2%',
        textAlign: 'justify',  // Justifica o texto
        lineHeight: 20, // Ajusta o espaçamento entre as linhas
    },
    closeButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 8,
        width: '60%',
        alignItems: 'center',
        marginVertical: 10,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default ChatScreen;
