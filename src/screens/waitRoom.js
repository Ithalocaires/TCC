import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, Text, View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { collection, getDocs, onSnapshot, doc, updateDoc, deleteDoc, getDoc, query, orderBy, setDoc, where } from '@firebase/firestore';
import { database } from "../../config/firebase";
import Icon from 'react-native-vector-icons/Ionicons';
import { customStyles } from '../source/styles';

const WaitRoom = ({ navigation, route }) => {
    const { userRole, userId } = route.params; 
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [numPacientesNaoRenderizados, setNumPacientesNaoRenderizados] = useState(0);

    const fetchPacientes = async () => {
        setLoading(true);
        try {
            const q = query(collection(database, 'waitRoom'), orderBy('createdAt', 'asc'));
            const pacientesCollection = await getDocs(q);
            const pacientesList = pacientesCollection.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            }));

            // Filtra os pacientes aguardando
            const pacientesAguardando = pacientesList.filter(paciente => !paciente.chatActive);

            setPacientes(pacientesAguardando);
            setNumPacientesNaoRenderizados(pacientesAguardando.length - pacientes.length);
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
                    navigation.navigate('Chat', { 
                        sessionId: data.sessionId, 
                        nome: data.nome, 
                        cartaoSus: data.cartaoSUS, 
                        obs: data.obs, 
                        userRole: 'paciente', 
                        userId 
                    });
                }
            });
            return () => unsubscribe();
        }
    }, [userRole, userId]);

    const handleSelectPaciente = async (paciente) => {
        const pacienteRef = doc(database, 'waitRoom', paciente.id);
        const chatRef = collection(database, 'chatSessions'); // Certifique-se de que este é o caminho correto.
        const q = query(chatRef, where("pacienteId", "==", paciente.id), orderBy("createdAt", "desc"));
    
        try {
            const chatDocs = await getDocs(q);
    
            if (!chatDocs.empty) {
                const previousChat = chatDocs.docs[0].data();
    
                if (previousChat.status === 'encerrada') {
                    // Reativar chat encerrado
                    await updateDoc(doc(chatRef, previousChat.sessionId), {
                        status: 'ativo',
                        reactivatedAt: new Date(),
                        medicoId: userId, // Incluindo medicoId na reativação
                    });
    
                    await updateDoc(pacienteRef, {
                        chatActive: true,
                        sessionId: previousChat.sessionId,
                    });
    
                    navigation.navigate('Chat', {
                        sessionId: previousChat.sessionId,
                        nome: paciente.nome,
                        cartaoSus: paciente.cartaoSUS,
                        obs: paciente.obs,
                        userRole: 'medico',
                        userId,
                    });
                } else {
                    Alert.alert('Erro', 'O paciente já está em consulta ativa.');
                }
            } else {
                // Criar um novo chat
                const newChatRef = doc(chatRef);
                await setDoc(newChatRef, {
                    sessionId: newChatRef.id,
                    pacienteId: paciente.id,
                    medicoId: userId,
                    nomePaciente: paciente.nome,
                    status: 'ativo',
                    createdAt: new Date(),
                });
    
                await updateDoc(pacienteRef, {
                    chatActive: true,
                    sessionId: newChatRef.id,
                });
    
                navigation.navigate('Chat', {
                    sessionId: newChatRef.id,
                    nome: paciente.nome,
                    cartaoSus: paciente.cartaoSUS,
                    obs: paciente.obs,
                    userRole: 'medico',
                    userId,
                });
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
            <View style={customStyles.waitRoomContainer}>
                <Text style={customStyles.pacienteCount}>Pacientes na espera: {pacientes.length}</Text>
                <FlatList
                    data={pacientes}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={customStyles.pacienteContainer} onPress={() => handleSelectPaciente(item)}>
                            <Text style={customStyles.pacienteNome}>Nome: {item.nome}</Text>
                            <Text style={customStyles.pacienteSusCard}>Carteirinha SUS: {item.cartaoSUS}</Text>
                            <Text style={customStyles.pacienteObs}>Motivo da consulta: {item.obs}</Text>
                        </TouchableOpacity>
                    )}
                />
                <View style={customStyles.refreshButtonContainer}>
                    <TouchableOpacity style={customStyles.refreshButton} onPress={refreshPacientes}>
                        <Icon name="refresh" size={25} color='white' style={customStyles.refreshIcon} />
                    </TouchableOpacity>
                    {numPacientesNaoRenderizados > 0 && (
                        <View style={customStyles.notificationBadge}>
                            <Text style={customStyles.notificationText}>{numPacientesNaoRenderizados}</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    }

    return null;
};

export default WaitRoom;
