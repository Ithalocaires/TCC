import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { doc, getDoc } from "firebase/firestore";
import { database } from "../../config/firebase";
import { customStyles } from '../source/styles';

const Form = ({ navigation, route }) => {
    const [name, setName] = useState('');
    const [susCard, setSusCard] = useState('');
    const [obs, setObservacoes] = useState('');

    const { userId } = route.params;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userDoc = await getDoc(doc(database, 'pacientes', userId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setName(userData.name || '');
                    setSusCard(userData.susCard || '');
                } else {
                    Alert.alert('Erro', 'Dados do usuário não encontrados.');
                }
            } catch (error) {
                console.error('Erro ao buscar dados do usuário:', error);
            }
        };

        fetchUserData();
    }, [userId]);

    const handleSubmitPaciente = async () => {
        if (!obs.trim()) {
            Alert.alert('Atenção', 'Por favor, preencha o campo de observações.');
            return;
        }

        try {
            await setDoc(doc(database, 'waitRoom', userId), {
                name,
                susCard,
                obs,
                chatActive: false,
                createdAt: new Date()
            });
            navigation.navigate('WaitRoom', { userRole: 'paciente', name, susCard, obs, userId });
        } catch (error) {
            console.error('Erro ao adicionar paciente:', error);
        }
    };

    return (
        <View style={customStyles.formView}>
            <Text style={customStyles.formTextBlue}>Por favor, insira os dados abaixo para continuar com a consulta</Text>

            <TextInput
                style={customStyles.formInput}
                placeholder="Nome"
                value={name}
                editable={false}
                color='black'
                placeholderTextColor="#999"
                marginTop={70}
            />

            <TextInput
                style={customStyles.formInput}
                placeholder="Número da carteirinha SUS"
                value={susCard}
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