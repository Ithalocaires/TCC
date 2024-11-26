import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { database } from '../../config/firebase';

const MessageHistory = ({ route }) => {
    const { sessionId, medicoId } = route.params; // Recebe também o medicoId para identificar quem é o médico
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const messagesRef = collection(database, 'chatSessions', sessionId, 'messages'); // Caminho atualizado
                const q = query(messagesRef, orderBy('createdAt', 'asc')); // Ordena as mensagens por data
    
                const querySnapshot = await getDocs(q);
    
                const loadedMessages = querySnapshot.docs.map((doc) => {
                    const message = doc.data();
                    return {
                        id: doc.id, // ID único da mensagem
                        text: message.text, // Conteúdo da mensagem
                        createdAt: message.createdAt.toDate(), // Timestamp convertido para Date
                        user: {
                            _id: message.user._id, // ID do usuário que enviou a mensagem
                            // Se o usuário for o médico, mostra "Médico", caso contrário "Você" para o paciente
                            name: message.user._id === medicoId ? "Médico" : "Você", 
                        },
                    };
                });
    
                setMessages(loadedMessages);
            } catch (error) {
                console.error('Erro ao buscar histórico de mensagens:', error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchMessages();
    }, [sessionId, medicoId]); // Inclui o medicoId para identificar se é o médico ou paciente
    
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Carregando mensagens...</Text>
            </View>
        );
    }
    
    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.messageContainer}>
                        <Text style={styles.messageUser}>{item.user.name}:</Text>
                        <Text style={styles.messageText}>{item.text}</Text>
                        <Text style={styles.messageTimestamp}>
                            {item.createdAt.toLocaleString()}
                        </Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#888',
    },
    messageContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    messageUser: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    messageText: {
        fontSize: 16,
        marginVertical: 5,
    },
    messageTimestamp: {
        fontSize: 12,
        color: '#aaa',
        textAlign: 'right',
    },
});

export default MessageHistory;
