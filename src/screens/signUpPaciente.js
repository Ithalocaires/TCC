import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native';  //Componentes para renderização do frontend
import { createUserWithEmailAndPassword } from 'firebase/auth';  //Busca a propriedade de autênticação no Firebase
import { doc, setDoc } from 'firebase/firestore';  //Busca as propriedades necessárias para adicionar elementos no Firestore
import { useNavigation } from '@react-navigation/native';  // Biblioteca que permite a navegação entre telas
import DateTimePicker from '@react-native-community/datetimepicker';  //Componente para escolher uma data
import { database, auth } from "../../config/firebase"  //Importe o acesso ao authenticator e o database do firebase
import { customStyles } from '../source/styles';
import TextInputMask from 'react-native-text-input-mask';

const SignUpPaciente = () => {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [cartaoSUS, setCartaoSUS] = useState('');
    const [dataNascimento, setDataNascimento] = useState(new Date());
    const [rg, setRg] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [senha, setSenha] = useState('');
    const navigation = useNavigation();

    const onChangeDate = (event, selectedDate) => {
        if (event.type === 'set') { // Verifica se o usuário selecionou uma data
            const currentDate = selectedDate || dataNascimento;
            //Iguala a data selecionada à data de nascimento do usuário
            setDataNascimento(currentDate);
        }
        setShowDatePicker(false); // Fecha o DateTimePicker após selecionar a data
    };

    //Altera o formato da data para ficar no padrão Brasileiro
    const formatDate = (date) => {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    };

    //Função para registrar usuários (Pacientes)
    const handleRegister = () => {
        if (!nome || !email || !cartaoSUS || !rg || !senha) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        if (senha.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        //Cria um usuário utilizando o email e a senha como autênticação
        createUserWithEmailAndPassword(auth, email, senha)
            //Vincula as credenciais ao usuário cadastrado
            .then((userCredential) => {
                const userId = userCredential.user.uid;
                //Armazena as informações de cada campo no banco "pacientes"
                setDoc(doc(database, 'pacientes', userId), {
                    nome,                                       // Nome
                    email,                                      // E-mail
                    cartaoSUS,                                  // Carteirinha SUS
                    dataNascimento,                             // Data de Nascimento
                    rg,                                         // RG
                }).then(() => {
                    //Caso o cadastro seja feito com sucesso ele irá informar o usuário que foi cadastrado e navegará para a tela de login novamente
                    console.log('Paciente cadastrado com sucesso!');
                    navigation.navigate('Login2');
                }).catch(error => {
                    // Caso aconteça algum erro irá informar ao usuário
                    console.error('Erro ao cadastrar paciente:', error);
                    alert('Erro ao cadastrar. Tente novamente.');
                });
            })
            .catch(error => {
                console.error('Erro ao criar conta:', error);
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        alert('Este e-mail já está em uso.');
                        break;
                    case 'auth/invalid-email':
                        alert('E-mail inválido.');
                        break;
                    case 'auth/weak-password':
                        alert('A senha é muito fraca.');
                        break;
                    default:
                        alert('Erro ao criar conta. Tente novamente.');
                }
            });
    };

    //Renderização do Frontend

    return (
        <View style={customStyles.container}>
            <Text style={customStyles.title}>Cadasto Paciente</Text>
            <TextInput
                style={customStyles.input}
                placeholder="Nome"
                value={nome}
                onChangeText={setNome}
                placeholderTextColor="#000"
            />
            <TextInput
                style={customStyles.input}
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholderTextColor="#000"
            />
            <TextInputMask
                style={customStyles.input}
                placeholder="Carteirinha SUS"
                value={cartaoSUS}
                onChangeText={(formatted, extracted) => setCartaoSUS(extracted)}
                placeholderTextColor="#000"
                mask={'[000] [0000] [0000] [0000]'}
            />
            <View style={customStyles.row}>
                <TouchableOpacity style={customStyles.datePicker} onPress={() => setShowDatePicker(true)}>
                    <Text style={customStyles.datePickerText}>{formatDate(dataNascimento)}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={dataNascimento}
                        mode="date"
                        display="default"
                        onChange={onChangeDate}
                        placeholderText='Data de Nascimento'
                    />
                )}
                <TextInputMask
                    style={customStyles.rgInput}
                    placeholder="RG"
                    value={rg}
                    onChangeText={(formatted, extracted) => setRg(extracted)}
                    mask={'[00].[000].[000]-[0]'}
                    placeholderTextColor="#000"
                />
            </View>
            <TextInput
                style={customStyles.input}
                placeholder="Senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                placeholderTextColor="#000"
            />
             <TouchableOpacity style={customStyles.buttonSubmit} onPress={handleRegister}>           
                <Text style={customStyles.textSubmit}> Cadastrar </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Cadastro Médico')}>
                <Text style={customStyles.link}>Deseja se cadastrar como Médico?</Text>
            </TouchableOpacity>
        </View>
    );
};

export default SignUpPaciente;
