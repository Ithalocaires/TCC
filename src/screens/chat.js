import { GiftedChat, Bubble, Send, InputToolbar } from 'react-native-gifted-chat';
import { useCallback, useEffect, useState } from 'react';
import { View, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, addDoc, onSnapshot, query, orderBy, doc, getDoc } from "firebase/firestore";
import { database } from "../../config/firebase";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/Ionicons';

const ChatScreen = () => {
    const [messages, setMessages] = useState([]);
    const route = useRoute();
    const navigation = useNavigation();
    const { sessionId, name, userId } = route.params;

    const [userRole, setUserRole] = useState('medico');
    const [dadosMedico, setDadosMedico] = useState({});
    const [dadosPaciente, setDadosPaciente] = useState({});

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

        addDoc(collection(database, `chatSessions/${sessionId}/messages`), {
            _id,
            createdAt,
            text,
            user: {
                _id: user._id,
                name: user.name,
            },
        }).catch((error) => {
            console.error("Erro ao enviar mensagem: ", error);
        });
    }, [sessionId]);

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
            renderActions={() => (
                <View style={styles.actionsContainer}>
                    {/* Botão de Emoji */}
                    <TouchableOpacity style={styles.actionButton}>
                        <Icon name="happy-outline" size={24} color="#53affa" />
                    </TouchableOpacity>

                    {/* Botão de Anexo */}
                    <TouchableOpacity style={styles.actionButton}>
                        <Icon name="attach-outline" size={24} color="#53affa" />
                    </TouchableOpacity>
                </View>
            )}
        />
    );

    return (
        <View style={styles.container}>
            <GiftedChat
                messages={messages}
                onSend={(messages) => mensagemEnviada(messages)}
                user={{ _id: userId || 'anon', name: name || 'Anônimo' }}
                renderBubble={renderBubble}
                renderSend={renderSend}
                renderInputToolbar={renderInputToolbar}
                placeholder="Digite uma mensagem..."
                alwaysShowSend={true} // Garante que o botão de envio sempre apareça
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
