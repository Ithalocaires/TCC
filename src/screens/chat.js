import { useRoute } from "@react-navigation/native";
import { StyleSheet } from "react-native";

import { GiftedChat } from 'react-native-gifted-chat'
import { useCallback, useEffect, useState } from "react";

//importação do firebase e database
import { collection, addDoc, onSnapshot, query,orderBy } from "firebase/firestore";
import { database } from "../../config/firebase";

export default function ChatScreen() {
    const [messages, setMessages] = useState([]);
    const route = useRoute();
    const { name, susCard, obs } = route.params;
    useEffect(() => {
        async function getMessages() {
            const values = query(collection(database, 'chats'), orderBy('createdAt', 'desc'));
            //orderBy('createdAt', 'desc') ordena as mensagens por data de criação
            //onSnapshot é um listener que fica escutando as alterações no banco de dados
            //sempre que houver uma alteração, ele vai executar a função que está dentro dele
            onSnapshot(values, (snapshot) => setMessages(
                snapshot.docs.map(doc => ({
                    _id: doc.data()._id,
                    createdAt: doc.data().createdAt.toDate(),
                    text: doc.data().text,
                    user: doc.data().user,
                }))
            ));
        }
        getMessages();
    }, []);


    //função que aciona assim que envia a mensagem no aplicativo
    const mensagemEnviada = useCallback((messages = []) => {

        setMessages(previousMessages =>{
              GiftedChat.append(previousMessages, messages)

            }
        );
        const { _id, createdAt, text, user } = messages[0];

        addDoc(collection(database, "chats"), {
            _id,
            createdAt,
            text,
            user,
        });
    }, []);
    
    return (
        <GiftedChat
          messages={messages}
          onSend={msg => mensagemEnviada(msg)}
          user={{
                _id: name,
            }}
        />
    )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  userMessage: {
    backgroundColor: '#003770',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderColor: 'black',
    alignSelf: 'flex-end',
    marginStart: 100,
  },
  docMessage: {
    backgroundColor: '#0071CF',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginEnd: 100,
  },
  messageText: {
    fontSize: 16,
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
    color:'black',
  },
  sendButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#0071CF',
    color:'white',
  },
  timestamp: {
    fontSize: 8,
    color: 'white',
  },
});