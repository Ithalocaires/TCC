import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const timestamp = new Date();
      setMessages((prevMessages) => [...prevMessages, { id: Date.now(), text: message, isUser: true, timestamp }]);
      setMessage('');
  
      setTimeout(() => {
        setMessages((prevMessages) => [...prevMessages, { id: Date.now() + 1, text: 'Obrigado pela sua mensagem! Como posso ajudar?', isUser: false, timestamp }]);
      }, 100); 
    }
  };

  return (
    <View style={styles.container}>
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
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholderTextColor="#999"
          placeholder="Digite sua mensagem..."
          value={message}
          onChangeText={setMessage}
        />
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