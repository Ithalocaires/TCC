import { GiftedChat, Bubble, Send, InputToolbar } from 'react-native-gifted-chat';
import { useCallback, useEffect, useState } from 'react';
import { View, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, addDoc, onSnapshot, query, orderBy, doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
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
                const medicoDoc = await getDoc(doc(database, 'medicos', userId));
                if (medicoDoc.exists()) {
                    setUserRole('medico');
                    setDadosMedico(medicoDoc.data());
                } else {
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
    }, [userId]);

    // Buscar mensagens do chat
    useEffect(() => {
        const getMessages = async () => {
            try {
                //Busca as mensagens no banco de dados na tabela sessionId
                const values = query(
                    collection(database, `chatSessions/${sessionId}/messages`),
                    // Ordena as mensagens por data de criação, deixando as mais antigas no topo e mais recentes abaixo
                    orderBy('createdAt', 'desc')
                );
                //O onSnapshot é um listener do Firebase que permite uma verificação continua
                onSnapshot(values, (snapshot) => {
                    setMessages(
                        //Faz uma verificação se foram envidas mensagens novas
                        snapshot.docs.map(doc => ({
                            _id: doc.id,
                            createdAt: doc.data().createdAt.toDate(),
                            text: doc.data().text,
                            user: doc.data().user,
                        }))
                    );
                });
                //Tratamento de exceçõs para caso o App apresentar problmas
            } catch (error) {
                console.error("Erro ao buscar mensagens: ", error);
            }
        };
        getMessages();
    }, [sessionId]);

    // Enviar mensagem
    const sentMessage = useCallback((messages = []) => {
        // A parte previousMessages serve para informar ao Gifted chat que são mensagens antigas, a mensagem mais atual é atribuida no "messages"
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
        // Atribuição dos valores dentro de uma mensagem
        const { _id, createdAt, text, user } = messages[0];

        addDoc(collection(database, `chatSessions/${sessionId}/messages`), {
            _id, // ID da mensagem
            createdAt, // Data de Criação
            text, // Texto de mensagem
            user: { // Busca o usuário que enviou a mensagem
                _id: user._id,  // ID do usuário
                name: user.name,  // Nome do usuário
            },
            //Tratamento de exceçõs para caso o App apresentar problmas
        }).catch((error) => {
            console.error("Erro ao enviar mensagem: ", error);
        });
    }, [sessionId]);

    // Encerrar consulta
    const encerrarConsulta = async () => {
        // Emite um alerta perguntando ao médico se ele realmente deseja encerrar a consulta
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
                    // Ao confirmar a ação o app irá fazer uma busca no banco de dados buscando a sessão atual
                    onPress: async () => {
                        try {
                            // O docRef vai apontar um documento dentro do firestore para que possa ser manipulado
                            const docRef = doc(database, 'chatSessions', sessionId);
                            // O docSnape irá ler o documento apontado pelo docRef, a parte await serve para
                            // aguardar uma resposta do docRef
                            const docSnap = await getDoc(docRef);
                            
                            // Se a consulta já havia sido encerrada anteriormente ele irá atualizar novamente a consulta como encerrada
                            if (docSnap.exists()) {
                                await updateDoc(docRef, {
                                    status: 'encerrada',
                                    endedAt: new Date(),
                                });

                            // Caso não tenha nenhum registrado de uma consulta com esse ID encerrada anteriormente
                            // Será criada uma referência e atribuida o status de 'encerrada'
                            } else {
                                await setDoc(docRef, {
                                    status: 'encerrada',
                                    createdAt: new Date(),
                                    endedBy: userId,
                                });
                            }

                            // Redirecionar ambos os usuários para a tela Home
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

    const renderBubble = (props) => (
        <Bubble
            {...props}
            wrapperStyle={{
                right: { backgroundColor: '#53affa' },
                left: { backgroundColor: '#003770' },
            }}
            textStyle={{
                right: { color: '#fff' },
                left: { color: '#fff' },
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

    return (
        <View style={styles.container}>
            <GiftedChat
                messages={messages}
                onSend={(messages) => sentMessage(messages)}
                user={{ _id: userId || 'anon', name: name || 'Anônimo' }}
                renderBubble={renderBubble}
                renderSend={renderSend}
                renderInputToolbar={(props) => renderInputToolbar(props)}
                placeholder="Digite uma mensagem..."
                alwaysShowSend={true}
                showUserAvatar={false}
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
    sendButton: {
        padding: 10,
        borderRadius: 50,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
    },
});

export default ChatScreen;
