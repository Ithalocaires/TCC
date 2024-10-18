import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, Text, View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, getDoc } from '@firebase/firestore';
import { database } from "../../config/firebase";
import Icon from 'react-native-vector-icons/Ionicons';

const WaitRoom = ({ navigation, route }) => {
    const { userRole, userId } = route.params;
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pacienteCount, setPacienteCount] = useState(0); // Estado para contagem de pacientes

    // Escuta em tempo real os pacientes na waitRoom
    useEffect(() => {
        const q = query(collection(database, 'waitRoom'), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const pacientesList = [];
            querySnapshot.forEach(doc => {
                pacientesList.push({ ...doc.data(), id: doc.id });
            });
            setPacientes(pacientesList);
            setPacienteCount(pacientesList.length); // Atualiza a contagem de pacientes
            setLoading(false);
        }, (error) => {
            console.error('Erro ao escutar pacientes:', error);
            setLoading(false);
        });

        return () => unsubscribe(); // Limpa o listener quando o componente desmonta
    }, []);

    useEffect(() => {
        if (userRole === 'paciente') {
            const unsubscribe = onSnapshot(doc(database, 'waitRoom', userId), (doc) => {
                const data = doc.data();
                if (data && data.chatActive) {
                    navigation.navigate('Chat', { sessionId: data.sessionId, name: data.name, susCard: data.susCard, obs: data.obs, userRole: 'paciente', userId: userId });
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
            } else {
                await updateDoc(pacienteRef, {
                    chatActive: true,
                    sessionId: paciente.id
                });
                await deleteDoc(pacienteRef);
                setPacientes(prevPacientes => prevPacientes.filter(p => p.id !== paciente.id));
                navigation.navigate('Chat', { sessionId: paciente.id, name: paciente.name, userRole: 'medico', userId: 'medico' });
            }
        } catch (error) {
            console.error("Erro ao selecionar paciente:", error);
        }
    };

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
                {pacienteCount > 0 && (
                    <Text style={styles.countText}>
                        Pacientes na sala de espera: {pacienteCount}
                    </Text>
                )}
                {pacientes.length === 0 ? (
                    <Text>Nenhum paciente aguardando atendimento.</Text>
                ) : (
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
                )}
                <TouchableOpacity style={styles.staticButton} onPress={() => fetchPacientes()}>
                    <Icon name="refresh" size={25} color='white' style={{ borderRadius: 8, padding: 10, width: 45, paddingHorizontal: 13 }} />
                </TouchableOpacity>
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
    countText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    staticButton: {
        position: 'absolute',
        bottom: 20,
        left: '96%',
        transform: [{ translateX: -50 }],
        backgroundColor: '#007BFF',
        padding: 6,
        borderRadius: 20,
    },
});

export default WaitRoom;
