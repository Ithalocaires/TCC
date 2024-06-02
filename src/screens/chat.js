import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

const ChatScreen = ({route}) => {
  {/*Constatantes para armazenar valor da mensagem*/}
  const { nome, carteirinhaSus, observacoes } = route.params;
  {/*Armazena mensagem que está sendo digitada*/}
  const [message, setMessage] = useState([]);

  {/*Mensagem enviada*/}
  const [messages, setMessages] = useState([
  { id: Date.now(), text: `Nome: ${nome}`, isUser: true, timestamp: new Date() },
  { id: Date.now() + 1, text: `Carteirinha SUS: ${carteirinhaSus}`, isUser: true, timestamp: new Date() },
  { id: Date.now() + 2, text: `Observações: ${observacoes}`, isUser: true, timestamp: new Date() },
  ]);

  {/*Função para funcionamento do chat*/}
  const handleSendMessage = () => {
   
    if (message.trim()) {
      const timestamp = new Date();
      setMessages((prevMessages) => [...prevMessages, { id: Date.now(), text: message, isUser: true, timestamp }]);
      setMessage('');

       {/*Resposta automática para teste*/}
      setTimeout(() => {
        setMessages((prevMessages) => [...prevMessages, { id: Date.now() + 1, text: `Olá ${nome}, como posso ajudar?`, isUser: false, timestamp }]);
      }, 100); 
    }
  };

  return (
    <View style={styles.container}>
      {/*Resposta automática para teste*/}
     <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={item.isUser ? styles.userMessage : styles.botMessage}>
            <Text style={styles.messageText}>{item.text}</Text>
            {item.timestamp && (
              <Text style={styles.timestamp}>{item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            )}
          </View>
        )}
      />
      {/*Input para escrever mesangem*/}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholderTextColor="#999"
          placeholder="Digite sua mensagem..."
          value={message}
          onChangeText={setMessage}
        />
        {/*Botão para enviar mensagem*/}
        <TouchableOpacity onPress={handleSendMessage}>
          <Text style={styles.sendButton}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
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
  botMessage: {
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

export default ChatScreen;