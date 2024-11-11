import { useRoute } from "@react-navigation/native";
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { useCallback, useEffect, useState} from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View, Alert,  Modal, Text, TextInput, TouchableOpacity } from 'react-native';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, getDoc } from "firebase/firestore";
import { database } from "../../config/firebase";
import Icon from 'react-native-vector-icons/FontAwesome'; // Ícones
import { useNavigation } from '@react-navigation/native';

const ChatScreen = () => {
    const [messages, setMessages] = useState([]);
    const route = useRoute();
    const navigation = useNavigation();
    const { sessionId, name, userId } = route.params; 
    const [userRole, setUserRole] = useState('desconhecido'); // Definimos um valor padrão
    const [modalVisible, setModalVisible] = useState(false);
    const [nome, setNome] = useState();

    useEffect(() => {
        // Busca o papel do usuário com base no CRM ou cartaoSUS
        const fetchUserRole = async () => {
            try {
                // O usuário terá a userRole no chat setado a partir do cadastro, sendo paciente e médico
                const userDoc = await getDoc(doc(database, 'medicos', userId));
                if (userDoc.exists()) {
                    setUserRole(userDoc.data().CRM ? 'medico' : 'paciente');
                } else {
                    const patientDoc = await getDoc(doc(database, 'pacientes', userId));
                    if (patientDoc.exists()) {
                        setUserRole(patientDoc.data().cartaoSUS ? 'paciente' : 'desconhecido');
                    }
                }
            } catch (error) {
                console.error("Erro ao buscar o papel do usuário:", error);
            }
        };

        fetchUserRole();
    }, [userId]);

    useEffect(() => {
        const getMessages = async () => {
            // Busca as mensagens no banco para renderizar na tela
            try {
                const values = query(collection(database, `chatSessions/${sessionId}/messages`), orderBy('createdAt', 'desc'));
                onSnapshot(values, (snapshot) => {
                    setMessages(
                        // Informações armazenadas dentro da mensagem
                        snapshot.docs.map(doc => ({
                            _id: doc.id,                                    //ID da mensagem
                            createdAt: doc.data().createdAt.toDate(),       //Data de criação de mensagem
                            text: doc.data().text,                          //Texto da mensagem
                            user: doc.data().user,                          //Usuário que enviou a mensagem
                            userRole: doc.data().userRole || 'desconhecido' //Role do usuário que enviou a mensagem
                        }))
                    );
                });
            } catch (error) {
                console.error("Erro ao buscar mensagens: ", error);
            }
        };
        getMessages();
    }, [sessionId]);

    
    const mensagemEnviada = useCallback((messages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
        const { _id, createdAt, text, user } = messages[0];

        // Caso encontre alguma informação errada irá reportar este erro
        if (!createdAt || !text || !user || !_id || !user._id || !user.name || !user.userRole) {
            console.error("Dados inválidos ao enviar mensagem:", { _id, createdAt, text, user });
            return;
        }

        //Adiciona e mensagem no Banco de dados
        addDoc(collection(database, `chatSessions/${sessionId}/messages`), {
            _id,
            createdAt,
            text,
            user: {
                _id: user._id,
                name: user.name,
                userRole: user.userRole
            }
        }).catch((error) => {
            console.error("Erro ao enviar mensagem: ", error);
        });
    }, [sessionId]);

    // Renderização da bolha do chat
    const renderBubble = (props) => {
        const isCurrentUser = props.currentMessage.user._id === userId;
        const backgroundColor = isCurrentUser ? '#53affa' : '#003770';  // Diferenciar as cores das mensagens do médico e do usuário
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor,
                        alignSelf: 'flex-end' // Alinha a mensagem enviada à direita
                    },
                    left: {
                        backgroundColor,
                        alignSelf: 'flex-start' // Alinha a mensagem recebida à esquerda
                    }
                }}
                textStyle={{
                    right: {
                        color: '#fff',

                    },
                    left: {
                        color: '#fff',

                    }
                }}
            />
        );
    };

    //Função para quando o médico terminar o atendimento
    const handleFinish = () => {
        Alert.alert(
            "Sair",
            "Você tem certeza que deseja sair?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Sim",
                    // Ao terminar o atendimento o estado do chatActive de ambos usuários é passado para o false
                    // tirando o acesso que eles tem a esse chat em questão
                    onPress: async () => {
                        try {
                            const patientDoc = doc(database, 'waitRoom', userId);
                            await updateDoc(patientDoc, {
                                chatActive: false
                            });
                            // Quando o chatActive é passado para o false o paciente será enviado para a Home
                            navigation.navigate("Home"); 
                        } catch (error) {
                            console.error("Erro ao finalizar o atendimento:", error);
                        }
                    }
                },
            ],
            { cancelable: false }
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <View
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                 <GiftedChat
                    minComposerHeight={70}
                    messages={messages}
                    onSend={msg => mensagemEnviada(msg)}
                    user={{
                        _id: userId || 'anon',
                        name: name || 'Anônimo',
                        userRole: userRole || 'desconhecido'
                    }}
                    renderBubble={renderBubble}
                    renderAvatar={null}
                    textInputStyle={{
                        color: '#000',
                        backgroundColor: '#FFF'
                    }}
                    isCustomViewBottom={false}
                    keyboardShouldPersistTaps='handled' // Garante que o teclado não feche inesperadamente
                    alwaysShowSend 
                />

                {userRole === 'medico' && (
                    <View style={styles.footer}>
                        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.receitaButton}>
                            <Icon name="file-text-o" size={20} color="white" />
                            <Text style={styles.receitaButtonText}>Receita</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleFinish} style={styles.logoutButton}>
                            <Text style={styles.logoutButtonText}>Finalizar</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Preencha o Formulário</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite seu nome"
                                value={nome}
                                onChangeText={setNome}
                            />
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.button}>
                                <Text style={styles.buttonText}>Enviar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    receitaButtonText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: '10%',  
        fontWeight:'bold',
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: '10%',
        fontWeight:'bold',
    },
    footer: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    receitaButton: {
        backgroundColor: '#007BFF',
        borderRadius: 8,
        width: '25%',
        marginVertical: 10,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutButton: {
        backgroundColor: 'red',
        borderRadius: 8,
        width: '25%',
        marginVertical: 10,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#0071CF',
        padding: 10,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default ChatScreen;