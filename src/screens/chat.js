import { useRoute } from "@react-navigation/native";
import { StyleSheet } from "react-native";

import { GiftedChat } from 'react-native-gifted-chat'
import { useCallback, useEffect, useState } from "react";

//importação do firebase e database
import { collection, addDoc, onSnapshot, query,orderBy } from "firebase/firestore";
import { database } from "../../config/firebase";
import { getAnalytics } from "firebase/analytics";

export default function ChatScreen() {
    const [messages, setMessages] = useState([]);
    const route = useRoute();
    const { sessionId, name, susCard, obs } = route.params;
    const [id, setId] = useState ('')
    const [user, setUser] = useState ('')

    useEffect(() => {
      async function getMessages() {
          const values = query(collection(database, `chatSessions/${sessionId}/messages`), orderBy('createdAt', 'desc'));
          onSnapshot(values, (snapshot) => {
            setMessages(
              snapshot.docs.map(doc => ({
                  _id: doc.data()._id,
                  createdAt: doc.data().createdAt.toDate(),
                  text: doc.data().text,
                  user: doc.data().user,
              }))
          )});
      }
      getMessages();
      }, [sessionId]);

  const mensagemEnviada = useCallback((messages = []) => {
      setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
      const { _id, createdAt, text, user } = messages[0];

      addDoc(collection(database, `chatSessions/${sessionId}/messages`), {
          _id,
          createdAt,
          text,
          user,
      });
  }, [sessionId]);

  

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