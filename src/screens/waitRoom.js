import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, Text, View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { collection, getDocs, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from '@firebase/firestore';
import { database } from "../../config/firebase";
import Icon from 'react-native-vector-icons/Ionicons';

const WaitRoom = ({ navigation, route }) => {
    const { userRole, userId } = route.params; // Adicione userId às props de navegação
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const fetchPacientes = async () => {
        setLoading(true);
        try {
            const q = query(collection(database, 'waitRoom'), orderBy('createdAt', 'asc')); // Ordenar por createdAt em ordem ascendente (mais antigo primeiro)
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

    useEffect(() => {
        if (userRole === 'medico') {
            fetchPacientes();
        }
    }, [userRole]);

    useEffect(() => {
        if (userRole === 'paciente') {
            const unsubscribe = onSnapshot(doc(database, 'waitRoom', userId), (doc) => {
                const data = doc.data();
                if (data && data.chatActive) {
                    navigation.navigate('Chat', { sessionId: data.sessionId, name: data.name, susCard: data.susCard, obs: data.obs, userRole: 'paciente', userId }); // Passa userId
                }
            });
            return () => unsubscribe();
        }
    }, [userRole, userId]);

    const handleSelectPaciente = async (paciente) => {
        const pacienteRef = doc(database, 'waitRoom', paciente.id);

        try {
            const pacienteDoc = await getDoc(pacienteRef);
            if (pacienteDoc.exists() && pacienteDoc.data().chatActive) {
                Alert.alert("Erro", "Esse paciente já está sendo atendido");
                // Atualiza a lista de pacientes
                fetchPacientes();
            } else {
                await updateDoc(pacienteRef, {
                    chatActive: true,
                    sessionId: paciente.id
                });
                navigation.navigate('Chat', { sessionId: paciente.id, name: paciente.name, userRole: 'medico', userId: 'medico' }); // Passa userId como 'medico'
                // Remove paciente da lista após iniciar o atendimento
                await deleteDoc(pacienteRef);
                setPacientes(prevPacientes => prevPacientes.filter(p => p.id !== paciente.id));
            }
        } catch (error) {
            console.error("Erro ao selecionar paciente:", error);
        }
    };

    // Função para atualizar a lista de pacientes
    const refreshPacientes = () => {
        fetchPacientes();
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
                {userRole === 'paciente' && <Text>Aguardando atendimento...</Text>}
            </View>
        );
    }

    if (userRole === 'medico') {
        return (
            <View style={styles.container}>
                <Text style={styles.pacienteCount}>Pacientes na espera: {pacientes.length}</Text>
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
                <View style={styles.refreshButtonContainer}>
                    <TouchableOpacity style={styles.refreshButton} onPress={refreshPacientes}>
                        <Icon name="refresh" size={25} color='white' style={styles.refreshIcon} />
                    </TouchableOpacity>
                    {pacientes.length > 0 && (
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationText}>{pacientes.length}</Text>
                        </View>
                    )}
                </View>
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
    },
    refreshButtonContainer: {
        position: 'absolute',
        bottom: 20,
        left: '95%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    refreshButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 25,
    },
    refreshIcon: {
        borderRadius: 8,
    },
    notificationBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    pacienteCount: {
        fontSize: 18,
        marginBottom: 10,
        textAlign: 'center',
    }
});

export default WaitRoom;