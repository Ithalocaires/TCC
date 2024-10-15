import { useRoute } from "@react-navigation/native";
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { useCallback, useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { database } from "../../config/firebase";

export default function ChatScreen() {
    const [messages, setMessages] = useState([]);
    const route = useRoute();
    const { sessionId, name, userRole, userId } = route.params; 

    //Pesquisa as mensagens no Firebase
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
                //Erro caso o cliente perca conexão com o servidor e não possa buscar mensagens
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


    // Função para estilizar bolha do chat
    const renderBubble = (props) => {
        const isCurrentUser = props.currentMessage.user._id === userId;
        const backgroundColor = isCurrentUser ? '#003770' : '#0071CF';
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
                        color: '#fff'
                    },
                    left: {
                        color: '#fff'
                    }
                }}
            />
        );
    };

    return (
        <GiftedChat
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
    );
}
