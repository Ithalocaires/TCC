import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, database } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { customStyles } from '../source/styles';

const HomeScreen = () => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null); 
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                await fetchUserData(currentUser.uid);
            } else {
                console.log("Nenhum usuário autenticado");
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const fetchUserData = async (userId) => {
        try {
            // Primeiramente, tenta buscar o usuário na coleção de médicos
            let userDoc = await getDoc(doc(database, 'medicos', userId));

            if (userDoc.exists()) {
                // Se o usuário for encontrado na coleção de médicos, ele é um médico
                setUser({
                    nome: userDoc.data().nome,
                    email: userDoc.data().email,
                    rg: userDoc.data().rg,
                    CRM: userDoc.data().CRM,
                    userId
                });
                setUserRole('medico');  // Define o role como 'medico'
            } else {
                // Se não encontrado como médico, tenta na coleção de pacientes
                userDoc = await getDoc(doc(database, 'pacientes', userId));

                if (userDoc.exists()) {
                    // Se o usuário for encontrado na coleção de pacientes, ele é um paciente
                    setUser({
                        nome: userDoc.data().nome,
                        email: userDoc.data().email,
                        rg: userDoc.data().rg,
                        cartaoSUS: userDoc.data().cartaoSUS,
                        userId
                    });
                    setUserRole('paciente');  // Define o role como 'paciente'
                } else {
                    console.log("Usuário não encontrado em nenhuma coleção");
                }
            }
        } catch (error) {
            console.error("Erro ao buscar dados do usuário:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            alert('Erro ao sair. Tente novamente.');
        }
    };
    
    if (loading) {
        return (
            <View style={customStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={customStyles.loadingContainer}>
                <Text style={customStyles.loadingText}>Carregando informações do perfil...</Text>
            </View>
        );
    }

    const buttons = [
        { 
          id: '1', 
          title: 'Rede Credenciada', 
          icon: 'bookmarks', 
          //onPress: () => navigation.navigate('RedeCredenciada') 
        },
        { 
          id: '2', 
          title: 'Consulta pelo Celular', 
          icon: 'chatbox-outline', 
          onPress: () => navigation.navigate(userRole === 'medico' ? 'WaitRoom' : 'Consulta', { userId: user.userId, userRole }) 
        },
        { 
          id: '3', 
          title: 'Como emitir', 
          icon: 'newspaper-outline', 
          onPress: () => console.log('Clicou em: Como emitir') 
        },
        { 
          id: '4', 
          title: 'Histórico', 
          icon: 'analytics-outline', 
          //onPress: () => navigation.navigate('Historico') 
        },
      ];
      
      // Renderização do botão
      const renderButton = (button) => (
        <TouchableOpacity
          key={button.id}
          style={customStyles.Homebutton}
          onPress={button.onPress} // Usa a ação específica do botão
        >
          <Text style={customStyles.HomebuttonText}>{button.title}</Text>
          <Icon name={button.icon} size={25} color="#0071CF" />
        </TouchableOpacity>
      );
    
      return (
      <View style={customStyles.container}>
        {/* Cabeçalho com saudação e ícone de perfil */}
        <View style={customStyles.header}>
        <Text style={customStyles.greeting}>Olá, Boas Vindas {user.nome.split(' ')[0]}!</Text>
          <TouchableOpacity
            style={customStyles.profileIcon}
            onPress={() => console.log('Acessou o perfil!')}
          >
            <Icon name="person-circle-outline" size={30} color="#0071CF"  />
          </TouchableOpacity>
        </View>
          <View style={customStyles.buttonContainer}>
            {buttons.map(renderButton)}
          </View>
        </View>
      );
    };

export default HomeScreen;
