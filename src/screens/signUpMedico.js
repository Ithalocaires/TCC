import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native';  //Componentes para renderização do frontend
import { createUserWithEmailAndPassword } from 'firebase/auth';  //Busca a propriedade de autênticação no Firebase
import { doc, setDoc } from 'firebase/firestore';  //Busca as propriedades necessárias para adicionar elementos no Firestore
import { useNavigation } from '@react-navigation/native';  // Biblioteca que permite a navegação entre telas
import DateTimePicker from '@react-native-community/datetimepicker';  //Componente para escolher uma data
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

    //Função para registrar usuários (Méidico)
    const handleRegister = () => {
        //Cria um usuário utilizando o email e a senha como autênticação
        createUserWithEmailAndPassword(auth, email, senha)
            //Vincula as credenciais ao usuário cadastrado
            .then((userCredential) => {
                //Armazena as informações de cada campo no banco "pacientes"
                const userId = userCredential.user.uid;
                setDoc(doc(database, 'medicos', userId), {
                    nome,
                    email,
                    CRM,
                    dataNascimento,
                    rg,
                }).then(() => {
                     //Caso o cadastro seja feito com sucesso ele irá informar o usuário que foi cadastrado e navegará para a tela de login novamente
                    console.log('Médico cadastrado com sucesso!');
                    navigation.navigate('Login');
                }).catch(error => {
                    // Caso aconteça algum erro irá informar ao usuário
                    console.error('Erro ao cadastrar Médico:', error);
                    alert('Erro ao cadastrar. Tente novamente.');
                });
            })
            .catch(error => {
                // Caso aconteça algum erro irá informar ao usuário
                console.error('Erro ao criar conta:', error);
                alert('Erro ao criar conta. Tente novamente.');
            });
    };

    //Renderização do Frontend

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
                <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
                            <Text style={styles.datePickerText}>{formatDate(dataNascimento)}</Text>
                        </TouchableOpacity>
                        {showDatePicker && (
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
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 20,  
        marginBottom: 20,
        marginTop: 10,
        color: '#53affa',
        alignItems: 'center',
        marginTop: 25,
        fontWeight: 'bold', 
        textAlign: 'center',
    },
    input: {
        width: '90%',
        padding: 10,
        marginVertical: 10,
        borderWidth: 1,
        borderRadius: 15,
        borderColor: '#ccc',
    },
    datePicker:{
        padding: 10,
        marginVertical: 10,
        borderWidth: 1,
        borderRadius: 15,
        borderColor: '#ccc',
        
    },
    rgInput: {
        width: '50%',
        padding: 10,
        marginVertical: 10,
        borderWidth: 1,
        borderRadius: 15,
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
        borderRadius: 8,
        alignItems: 'center',
        borderRadius: 20,
        width: '90%',
        backgroundColor: '#0071CF',
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
