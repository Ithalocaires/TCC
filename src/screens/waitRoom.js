import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { collection, getDocs, onSnapshot, doc, updateDoc, setDoc, query, orderBy } from '@firebase/firestore';
import { database } from "../../config/firebase";

const WaitRoom = ({ navigation, route }) => {
    const { userRole, userId } = route.params; // Adicione userId às props de navegação
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);

    //Busca os pacientes em espera no Firabase
    useEffect(() => {
        const fetchPacientes = async () => {
            try {
                const q = query(collection(database, 'waitRoom'), orderBy('createdAt', 'desc')); // Ordena do mais recente para o mais antigo como uma pilha
                const pacientesCollection = await getDocs(q);
                const pacientesList = pacientesCollection.docs.map(doc => ({ 
                    ...doc.data(), 
                    id: doc.id 
                }));
                setPacientes(pacientesList);
                setLoading(false);
            } catch (error) {
                console.error('Erro ao buscar pacientes:', error);
                setLoading(false);
            }
        };

        if (userRole === 'medico') {
            fetchPacientes();
        }
    }, [userRole]);

    useEffect(() => {
        if (userRole === 'paciente') {
            const unsubscribe = onSnapshot(doc(database, 'waitRoom', userId), (doc) => {
                const data = doc.data();
                if (data && data.chatActive) {
                    navigation.navigate('Chat', { sessionId: data.sessionId, name: data.name, susCard: data.susCard, obs: data.obs, userRole: 'paciente', userId: userId }); // Passa userId
                }
            });
            return () => unsubscribe();
        }
    }, [userRole, userId]);

    const handleSelectPaciente = async (paciente) => {
        await updateDoc(doc(database, 'waitRoom', paciente.id), {
            chatActive: true,
            sessionId: paciente.id
        });
        navigation.navigate('Chat', { sessionId: paciente.id, name: paciente.name, userRole: 'medico', userId: 'medico' }); // Passa userId como 'medico'
    };

    // Tela de loading enquanto o Paciente aguarda um médico atende-lo
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
                {userRole === 'paciente' && <Text>Aguardando atendimento...</Text>}
            </View>
        );
    }

    // A mensagem irá aparecer caso não tenha nenhum paciente na fila
    if (userRole === 'medico') {
        if (pacientes.length === 0) {
            return <Text>Nenhum paciente aguardando atendimento.</Text>;
        }
        return (
            <View style={styles.container}>
                <FlatList
                    data={pacientes}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.pacienteContainer} onPress={() => handleSelectPaciente(item)}>
                            <Text style={styles.pacienteNome}>Nome: {item.name}</Text>
                            <Text style={styles.pacienteSusCard}>SUS Card: {item.susCard}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        );
    }

    return null;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    pacienteContainer: {
        padding: 15,
        marginVertical: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderColor: '#ddd',
        borderWidth: 1,
    },
    pacienteNome: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    pacienteSusCard: {
        fontSize: 14,
        color: '#555',
    }
});

export default WaitRoom;
