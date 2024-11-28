import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, database } from "../../config/firebase";
import { customStyles } from '../source/styles';
import TextInputMask from 'react-native-text-input-mask';

const SignUpPaciente = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cartaoSUS, setCartaoSUS] = useState('');
  const [dataNascimento, setDataNascimento] = useState(new Date());
  const [rg, setRg] = useState('');
  const [cpf, setCpf] = useState(''); // Adicionado CPF
  const [celular, setCelular] = useState(''); // Adicionado Celular
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

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  //Função que cuida do registro do usuário
  const handleRegister = () => {
    // Verifica se todos os campos foram preenchidos
    if (!nome || !email || !cartaoSUS || !rg || !cpf || !celular || !senha) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    // Faz a verificação se a senha tem menos de 6 caracteres, se tiver menos informar ao usuário
    if (senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    // Método do firebase responsável por fazer o cadastro do médico, sendo os métodos para login o email e senha
    createUserWithEmailAndPassword(auth, email, senha)
      .then((userCredential) => {
        const userId = userCredential.user.uid;
        // Seleciona a coleção "Pacientes"
        setDoc(doc(database, 'pacientes', userId), {
          // Armazena os dados cadastrados
          nome,
          email,
          cartaoSUS,
          dataNascimento,
          rg,
          cpf,
          celular,
        }).then(() => {
          // Retorna uma alert positivo se o paciente for cadastrado com sucesso
          console.log('Paciente cadastrado com sucesso!');
          alert('Paciente cadastrado com sucesso!');
          // Retorna o usuário a página Login
          navigation.replace('Login2');
        }).catch((error) => {
          console.error('Erro ao cadastrar Paciente:', error);
          alert('Erro ao cadastrar. Tente novamente.');
        });
      })
      .catch((error) => {
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

  // Renderização do Front end
  // O componente KeyboardAbvoidingView serve para o teclado do celular não tapar os elementos da tela
  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={customStyles.signUpContainer}>
                <Text style={customStyles.title}>Cadastro Paciente</Text>
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
                    mask={'[000] [0000] [0000] [0000]'}  // Máscara para Carteirinha SUS
                    keyboardType="default"
                    placeholderTextColor="#000"
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
                    />
                    )}
                    <TextInputMask
                    style={customStyles.rgInput}
                    placeholder="RG"
                    value={rg}
                    onChangeText={(formatted, extracted) => setRg(extracted)}
                    mask={'[00].[000].[000]-[0]'} // Máscara para RG
                    placeholderTextColor="#000"
                    />
                </View>
                <TextInputMask
                    style={customStyles.input}
                    placeholder="CPF"
                    value={cpf}
                    onChangeText={(formatted, extracted) => setCpf(extracted)}
                    mask={'[000].[000].[000]-[00]'} // Máscara para CPF
                    keyboardType="number-pad"
                    placeholderTextColor="#000"
                />
                <TextInputMask
                    style={customStyles.input}
                    placeholder="Celular"
                    value={celular}
                    onChangeText={(formatted, extracted) => setCelular(extracted)}
                    mask={'([00]) [00000]-[0000]'} // Máscara para celular
                    keyboardType="phone-pad"
                    placeholderTextColor="#000"
                />
                <TextInput
                    style={customStyles.input}
                    placeholder="Senha"
                    value={senha}
                    onChangeText={setSenha}
                    secureTextEntry
                    placeholderTextColor="#000"
                />
                <TouchableOpacity style={customStyles.buttonSubmit} onPress={handleRegister}>
                    <Text style={customStyles.textSubmit}>Cadastrar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Cadastro Médico')}>
                    <Text style={customStyles.link}>Deseja se cadastrar como Médico?</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpPaciente;
