import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { database } from '../../config/firebase';

const MessageHistory = ({ route }) => {
    const { sessionId, medicoId } = route.params; // Recebe sessionId e medicoId da rota
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userNames, setUserNames] = useState({}); // Cache para nomes de usuários

    // Função para buscar o nome do usuário pelo ID em duas coleções
    const fetchUserName = async (userId) => {
        // Evita consultas repetidas ao Firestore
        if (userNames[userId]) {
            return userNames[userId];
        }

        try {
            // Primeiro tenta buscar na coleção "pacientes"
            let userDoc = await getDoc(doc(database, 'pacientes', userId));
            if (userDoc.exists()) {
                const userName = userDoc.data().nome || 'Sem nome';
                setUserNames((prev) => ({ ...prev, [userId]: userName })); // Armazena no cache
                return userName;
            }

            // Caso não encontre, tenta na coleção "medicos"
            userDoc = await getDoc(doc(database, 'medicos', userId));
            if (userDoc.exists()) {
                const userName = userDoc.data().nome || 'Sem nome';
                setUserNames((prev) => ({ ...prev, [userId]: userName })); // Armazena no cache
                return userName;
            }

            // Se não for econtrado o nome em nenhuma coleção de usuário irá retornar como "Sem nome"
            console.warn(`Usuário com ID ${userId} não encontrado em nenhuma coleção.`);
            return 'Sem nome';
        } catch (error) {
            Alert.alert('Erro', 'Erro ao buscar o Id do usuário.');
            return 'Erro ao buscar';
        }
    };

    // Busca as mensagens do chat selecionado pelo paciente
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                // As mensagens ficam armazendas dentro da coleção chatSessions
                const messagesRef = collection(database, 'chatSessions', sessionId, 'messages');
                // Ordena pela mais antiga até a mais recente
                const q = query(messagesRef, orderBy('createdAt', 'asc'));
                const querySnapshot = await getDocs(q);

                // Processa mensagens e busca nomes dos usuários
                const loadedMessages = await Promise.all(
                    querySnapshot.docs.map(async (doc) => {
                        const message = doc.data();
                        // Busca nome do usuário a partir do Id (Estava dando problema pesquisar diretamente pelo nome)
                        const userName = await fetchUserName(message.user._id); 

                        return {
                            id: doc.id,
                            text: message.text,
                            createdAt: message.createdAt.toDate(),
                            user: {
                                _id: message.user._id,
                                name: message.user._id === medicoId ? 'Médico' : userName, // Nome do médico ou do paciente
                            },
                        };
                    })
                );

                setMessages(loadedMessages);
            } catch (error) {
                console.error('Erro ao buscar histórico de mensagens:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [sessionId, medicoId]); // Dependências do efeito

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Carregando mensagens...</Text>
            </View>
        );
    }

    // Rendereização da Lista das mensagens
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
        color: '#000',
    },
    messageText: {
        fontSize: 16,
        marginVertical: 5,
        color: '#000'
    },
    messageTimestamp: {
        fontSize: 12,
        color: '#aaa',
        textAlign: 'right',

    },
});

export default MessageHistory;
