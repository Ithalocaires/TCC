import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { database } from '../../config/firebase';
import { useNavigation } from '@react-navigation/native';

const HistoricoChats = ({ route }) => {
    const { userId } = route.params; // ID do paciente
    const [chats, setChats] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                const chatRef = collection(database, 'closedChats');
                const q = query(chatRef, where("pacienteId", "==", userId));
                const querySnapshot = await getDocs(q);

                const now = new Date();
                const formattedChats = querySnapshot.docs.map((doc) => {
                    const chatData = doc.data();
                    const isAccessible = chatData.accessibleUntil.toDate() > now; // Verifica se ainda está no prazo
                    const endedAt = chatData.endedAt.toDate();
                    
                    // Formatar a data no formato DD/MM/AA HH:mm
                    const formattedDate = formatDate(endedAt);

                    return {
                        id: doc.id,
                        nomeMedico: chatData.nomeMedico,
                        endedAt: formattedDate, // A data já está formatada como string
                        isAccessible,
                    };
                });

                setChats(formattedChats);
            } catch (error) {
                console.error("Erro ao buscar histórico de chats:", error);
            }
        };

        fetchChatHistory();
    }, [userId]);

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Janeiro é 0
        const year = String(date.getFullYear()).slice(-2); // Ano no formato AA
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const handleAccessChat = (chat) => {
        if (chat.isAccessible) {
            // Navegar para a tela de histórico de mensagens
            navigation.navigate('Historico de Mensagens', { sessionId: chat.id });
        } else {
            Alert.alert('Acesso Negado', 'O acesso ao histórico deste chat expirou.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Histórico de Chats</Text>
            <FlatList
                data={chats}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.chatItem}>
                        <Text style={styles.chatInfo}>Médico: {item.nomeMedico}</Text>
                        <Text style={styles.chatInfo}>Encerrado em: {item.endedAt}</Text> 
                        <TouchableOpacity
                            onPress={() => handleAccessChat(item)}
                            style={[
                                styles.accessButton,
                                !item.isAccessible && styles.disabledButton,
                            ]}
                            disabled={!item.isAccessible}
                        >
                            <Text style={styles.accessButtonText}>
                                {item.isAccessible ? 'Acessar Chat' : 'Acesso Expirado'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    chatItem: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#ccc'
    },
    chatInfo: {
        fontSize: 16,
        marginBottom: 8,
    },
    accessButton: {
        backgroundColor: '#53affa',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    accessButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default HistoricoChats;


