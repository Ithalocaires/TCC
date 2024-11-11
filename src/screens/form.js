import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { doc, getDoc } from "firebase/firestore";
import { database } from "../../config/firebase";

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
        <View style={Styles.formView}>
            <Text style={Styles.formTextBlue}>Por favor, insira os dados abaixo para continuar com a consulta</Text>

            <TextInput
                style={Styles.formInput}
                placeholder="Nome"
                value={name}
                editable={false}
                color='black'
                placeholderTextColor="#999"
                marginTop={70}
            />

            <TextInput
                style={Styles.formInput}
                placeholder="Número da carteirinha SUS"
                value={susCard}
                editable={false}
                color='black'
                placeholderTextColor="#999"
                keyboardType="numeric"
            />

            <Text style={Styles.textInfo}>Insira suas observações, como sintomas e a quanto tempo está se sentindo dessa forma</Text>

            <TextInput
                style={Styles.formInputObs}
                placeholder="Digite suas observações"
                value={obs}
                onChangeText={setObservacoes}
                color='black'
                placeholderTextColor="#999"
                multiline
            />

            <TouchableOpacity style={Styles.confirmBtn} onPress={handleSubmitPaciente}>
                <Text style={Styles.confirmBtnText}>Confirmar dados</Text>
            </TouchableOpacity>
        </View>
    );
};

const Styles = StyleSheet.create({
    formView:{
        flex: 1, 
        backgroundColor: 'white', 
        padding: 15,
        alignItems: 'center',
    },
    formTextBlue:{
        fontSize: 20,  
        marginBottom: 20,
        marginTop: 10,
        color: '#53affa',
        alignItems: 'center',
        marginTop: 25,
        fontWeight: 'bold', 
        textAlign: 'center',
    },
    formInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 15,
        padding: 8,
        marginBottom: 16,
        marginTop: 25,
        width: '90%',
    },
    formInputObs: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 15,
        padding: 8,
        marginBottom: 16,
        textAlignVertical: 'top',
        marginTop: 30,
        height: 120,
        width: '90%',
    },
    textInfo: {
        fontSize: 12,
        color: 'red',
        textAlign: 'center',
        width: '90%',
        marginTop: 30,
    },
    confirmBtn:{
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderRadius: 20,
        width: '90%',
        backgroundColor: '#0071CF',
        marginVertical: 10,
    },
    confirmBtnText:{
        color: 'white', 
        fontWeight: 'bold'
    },
})

export default Form;