import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { database } from "../../config/firebase";
import { customStyles } from '../source/styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Form = ({ navigation, route }) => {
    const [nome, setNome] = useState('');
    const [cartaoSUS, setCartaoSUS] = useState('');
    const [obs, setObservacoes] = useState('');

    const { userId } = route.params || {};


    useEffect(() => {
        const fetchUserIdAndData = async () => {
            try {
                // Recupera o userId do AsyncStorage caso não seja passado diretamente
                const storedUserId = userId || await AsyncStorage.getItem('@userToken');
                if (!storedUserId) {
                    Alert.alert('Erro', 'Usuário não autenticado.');
                    navigation.goBack(); // Voltar para a tela anterior se necessário
                    return;
                }
                
                const userDoc = await getDoc(doc(database, 'pacientes', storedUserId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setNome(userData?.nome || '');
                    setCartaoSUS(userData?.cartaoSUS || '');
                } else {
                    Alert.alert('Erro', 'Dados do usuário não encontrados.');
                }
            } catch (error) {
                console.error('Erro ao buscar dados do usuário:', error);
                Alert.alert('Erro', 'Houve um problema ao buscar os dados do usuário.');
            }
        };
    
        fetchUserIdAndData();
    }, [userId]);
    
    

    const handleSubmitPaciente = async () => {
        
        if (!obs.trim()) {
            Alert.alert('Atenção', 'Por favor, preencha o campo de observações.');
            return;
        }

        try {
            await setDoc(doc(database, 'waitRoom', userId), {
                nome: nome,
                cartaoSUS: cartaoSUS,
                obs,
                chatActive: false,
                createdAt: new Date()
            });
            console.log('userId:', userId);
            navigation.navigate('WaitRoom', { userRole: 'paciente', nome: nome, cartaoSUS: cartaoSUS, obs, userId });
        } catch (error) {
            console.log('userId:', userId);
            console.error('Erro ao adicionar paciente:', error);
        }
    };

    return (
        <View style={customStyles.formView}>
            <Text style={customStyles.formTextBlue}>Por favor, insira os dados abaixo para continuar com a consulta</Text>

            <TextInput
                style={customStyles.formInput}
                placeholder="Nome"
                value={nome}
                editable={false}
                color='black'
                placeholderTextColor="#999"
                marginTop={70}
            />

            <TextInput
                style={customStyles.formInput}
                placeholder="Número da carteirinha SUS"
                value={cartaoSUS}
                editable={false}
                color='black'
                placeholderTextColor="#999"
                keyboardType="numeric"
            />

            <Text style={customStyles.textInfo}>Insira suas observações, como sintomas e a quanto tempo está se sentindo dessa forma</Text>

            <TextInput
                style={customStyles.formInputObs}
                placeholder="Digite suas observações"
                value={obs}
                onChangeText={setObservacoes}
                color='black'
                placeholderTextColor="#999"
                multiline
            />

            <TouchableOpacity style={customStyles.confirmBtn} onPress={handleSubmitPaciente}>
                <Text style={customStyles.confirmBtnText}>Confirmar dados</Text>
            </TouchableOpacity>
        </View>
    );
};
export default Form;