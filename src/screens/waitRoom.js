import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, Text, View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { collection, getDocs, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, getDoc  } from '@firebase/firestore';
import { database } from "../../config/firebase";
import Icon from 'react-native-vector-icons/Ionicons';
import { customStyles } from '../source/styles';

const WaitRoom = ({ navigation, route }) => {
    const { userRole, userId } = route.params; // Adicione userId às props de navegação
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
    
            // Filtra os pacientes que estão aguardando (chatActive: false)
            const pacientesAguardando = pacientesList.filter(paciente => !paciente.chatActive);
    
            // Define a lista de pacientes que serão renderizados
            setPacientes(pacientesAguardando);
    
            // Calcula a quantidade de pacientes não renderizados
            const pacientesNaoRenderizados = pacientesAguardando.length - pacientes.length;
            setNumPacientesNaoRenderizados(pacientesNaoRenderizados > 0 ? pacientesNaoRenderizados : 0);
    
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
        //  Aqui, a função cria uma referência ao documento do paciente no banco de dados Firestore com base na waitRoom e no ID do paciente
        const pacienteRef = doc(database, 'waitRoom', paciente.id);

        try {
            // Verifica se o paciente já está sendo atendido
            const pacienteDoc = await getDoc(pacienteRef);

            {/*Caso a propriedade chatActive seja true (significando que o paciente já está sendo atendido) emite um alerta informando ao usuário que o paciente
             em questão já foi atendido e em seguida atualiza a página*/}

             if (pacienteDoc.exists() && pacienteDoc.data().chatActive) {
                Alert.alert("Erro", "Esse paciente já está sendo atendido");
                // Atualiza a lista de pacientes
                fetchPacientes();
            } else {
                // Atualiza o estado para indicar que o paciente está sendo atendido
                await updateDoc(pacienteRef, {
                    chatActive: true,
                    sessionId: paciente.id
                });
    
                // Remove o paciente da lista no Firestore antes de navegar para o chat
                await deleteDoc(pacienteRef);
    
                // Remove o paciente da lista local
                setPacientes(prevPacientes => prevPacientes.filter(p => p.id !== paciente.id));
    
                // Navega para a tela de chat
                navigation.navigate('Chat', { sessionId: paciente.id, name: paciente.name, userRole: 'medico', userId: 'medico' });
            }
        } catch (error) {
            console.error("Erro ao selecionar paciente:", error);
        }
    };
    

    // Função para atualizar a lista de pacientes
    const refreshPacientes = () => {
        fetchPacientes();
    };

    //Caso o usuário seja um paciente o App irá mostra-lo uma tela de loading informando-o para aguardar
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
                {userRole === 'paciente' && <Text>Aguardando atendimento...</Text>}
            </View>
        );
    }

    //Caso o usuário seja um médico o App irá renderizar a Lista de espera normalmente
    if (userRole === 'medico') {
        return (
            <View style={customStyles.waitRoomContainer}>
                <Text style={customStyles.pacienteCount}>Pacientes na espera: {pacientes.length}</Text>
                <FlatList
                    data={pacientes}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={customStyles.pacienteContainer} onPress={() => handleSelectPaciente(item)}>
                            <Text style={customStyles.pacienteNome}>Nome: {item.name}</Text>
                            <Text style={customStyles.pacienteSusCard}>Carteirinha SUS: {item.susCard}</Text>
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