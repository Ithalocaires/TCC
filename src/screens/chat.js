import { useRoute } from "@react-navigation/native";
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { useCallback, useEffect, useState} from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View, Alert,  Modal, Text, TextInput, TouchableOpacity } from 'react-native';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc } from "firebase/firestore";
import { database } from "../../config/firebase";
import Icon from 'react-native-vector-icons/FontAwesome'; // Ícones

const ChatScreen = () => {
    const [messages, setMessages] = useState([]);
    const route = useRoute();
    const { sessionId, name, userRole, userId } = route.params; // Certifique-se de que userId está sendo passado corretamente
    const [modalVisible, setModalVisible] = useState(false);
    const [nome, setNome] = useState();
    

    useEffect(() => {
        const getMessages = async () => {
            try {
                const values = query(collection(database, `chatSessions/${sessionId}/messages`), orderBy('createdAt', 'desc'));
                onSnapshot(values, (snapshot) => {
                    setMessages(
                        snapshot.docs.map(doc => ({
                            _id: doc.id,
                            createdAt: doc.data().createdAt.toDate(),
                            text: doc.data().text,
                            user: doc.data().user,
                            userRole: doc.data().userRole || 'desconhecido'
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

        // Verificar se todos os campos necessários estão definidos
        if (!createdAt) console.error("Campo 'createdAt' indefinido");
        if (!text) console.error("Campo 'text' indefinido");
        if (!user) console.error("Campo 'user' indefinido");
        if (!_id) console.error("Campo '_id' indefinido");
        if (!user?._id) console.error("Campo 'user._id' indefinido");
        if (!user?.name) console.error("Campo 'user.name' indefinido");
        if (!user?.userRole) console.error("Campo 'user.userRole' indefinido");

        if (!createdAt || !text || !user || !_id || !user._id || !user.name || !user.userRole) {
            console.error("Dados inválidos ao enviar mensagem:", { _id, createdAt, text, user });
            return;
        }

        console.log("Enviando mensagem com dados:", { _id, createdAt, text, user, userRole: user.userRole });

        addDoc(collection(database, `chatSessions/${sessionId}/messages`), {
            _id,
            createdAt,
            text,
            user: {
                _id: user._id,
                name: user.name,
                userRole: user.userRole
            }
        }).then(() => {
            console.log("Mensagem enviada com sucesso!");
        }).catch((error) => {
            console.error("Erro ao enviar mensagem: ", error);
        });
    }, [sessionId, userRole]);

    const renderBubble = (props) => {
        const isCurrentUser = props.currentMessage.user._id === userId;
        const backgroundColor = isCurrentUser ? '#53affa' : '#003770';
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

    const handleFinish = () => {
        Alert.alert(
            "Sair",
            "Você tem certeza que deseja sair?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Sim",
                    onPress: async () => {
                        try {
                            const patientDoc = doc(database, 'waitRoom', userId);
                            await updateDoc(patientDoc, {
                                chatActive: false
                            });
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