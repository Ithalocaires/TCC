import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native';
import {createUserWithEmailAndPassword } from 'firebase/auth';
import {doc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, database } from "../../config/firebase";

const SignUpMedico = () => {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [CRM, setCRM] = useState('');
    const [dataNascimento, setDataNascimento] = useState(new Date());
    const [rg, setRg] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [senha, setSenha] = useState('');
    const navigation = useNavigation();

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || dataNascimento;
        setShowDatePicker(false);
        setDataNascimento(currentDate);
    };

    const handleRegister = () => {
        createUserWithEmailAndPassword(auth, email, senha)
            .then((userCredential) => {
                const userId = userCredential.user.uid;
                setDoc(doc(database, 'medicos', userId), {
                    nome,
                    email,
                    cartaoSUS: CRM,
                    dataNascimento,
                    rg,
                }).then(() => {
                    console.log('Médico cadastrado com sucesso!');
                    navigation.navigate('Login');
                }).catch(error => {
                    console.error('Erro ao cadastrar Médico:', error);
                    alert('Erro ao cadastrar. Tente novamente.');
                });
            })
            .catch(error => {
                console.error('Erro ao criar conta:', error);
                alert('Erro ao criar conta. Tente novamente.');
            });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cadasto Médico</Text>
            <TextInput
                style={styles.input}
                placeholder="Nome"
                value={nome}
                onChangeText={setNome}
            />
            <TextInput
                style={styles.input}
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="CRM"
                value={CRM}
                onChangeText={setCRM}
            />
            <View style={styles.row}>
                <TouchableOpacity onPress={() => setShow(true)}>
                    <TextInput
                        style={styles.datePicker}
                        placeholder="Data de Nascimento"
                        value={dataNascimento.toLocaleDateString()}
                        editable={false}
                    />
                </TouchableOpacity>
                {show && (
                    <DateTimePicker
                        value={dataNascimento}
                        mode="date"
                        display="default"
                        onChange={onChangeDate}
                    />
                )}
                <TextInput
                    style={styles.rgInput}
                    placeholder="RG"
                    value={rg}
                    onChangeText={setRg}
                />
            </View>
            <TextInput
                style={styles.input}
                placeholder="Senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
            />
             <TouchableOpacity style={styles.buttonSubmit} onPress={handleRegister}>           
                <Text style={styles.textSubmit}> Cadastrar </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Cadastro Paciente')}>
                <Text style={styles.link}>Deseja se cadastrar como Paciente?</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        marginBottom: 16,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
    },
    input: {
        width: '90%',
        padding: 10,
        marginVertical: 10,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: '#ccc',
    },
    datePicker:{
        padding: 10,
        marginVertical: 10,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: '#ccc',
        
    },
    rgInput: {
        width: '50%',
        padding: 10,
        marginVertical: 10,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: '#ccc',
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    link: {
        color: '#007BFF',
        marginTop: 10,
    },
    buttonSubmit: {
        padding: 12,
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 8,
        width: '90%',
        alignItems: 'center',
        marginVertical: 10,
    },
    textSubmit: {  
        color: 'white', 
        fontWeight: 'bold'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
    },
    link: {
        color: '#007BFF',
        marginTop: 10,
    },
});

export default SignUpMedico;
