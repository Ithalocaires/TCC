import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { collection, query, where, onSnapshot, doc, getDocs, orderBy } from 'firebase/firestore';
import { database } from "../../config/firebase";
import { useNavigation } from '@react-navigation/native';
import { format, differenceInDays } from 'date-fns';

const HistoryScreen = ({ route }) => {
    const [history, setHistory] = useState([]);
    const navigation = useNavigation();
    const { userId, userRole } = route.params;

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                const chatsQuery = query(
                    collection(database, 'chatSessions'),
                    where(userRole === 'medico' ? 'medicoId' : 'pacienteId', '==', userId),
                    where('status', '==', 'encerrada'),
                    orderBy('endedAt', 'desc')
                );
    
                const snapshot = await getDocs(chatsQuery);
    
                const fetchedHistory = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
    
                setHistory(fetchedHistory);
            } catch (error) {
                console.error("Erro ao buscar histórico:", error);
            }
        };
    
        fetchChatHistory();
    }, [userId, userRole]);

    const handleSelectChat = (session) => {
        const canAccessChat = differenceInDays(new Date(), session.createdAt) <= 7;
        if (canAccessChat) {
            navigation.navigate('Chat', {
                sessionId: session.id,
                name: session.medico?.nome,
                userId,
            });
        } else {
            alert('O histórico do chat só pode ser acessado por até 7 dias após a consulta.');
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelectChat(item)}
        >
            <Text style={styles.text}>Data: {format(item.createdAt, 'dd/MM/yyyy')}</Text>
            <Text style={styles.text}>Médico: {item.medico?.nome || 'Desconhecido'}</Text>
            <Text style={styles.text}>CRM: {item.medico?.CRM || 'Não informado'}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Histórico de Consultas</Text>
            <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma consulta encontrada.</Text>}
            />
        </View>
    );
};

export default HistoryScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 10,
    }, 
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#53affa',
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginVertical: 8,
        elevation: 3,
    },
    text: {
        fontSize: 16,
        color: '#333',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginTop: 20,
    },
});
