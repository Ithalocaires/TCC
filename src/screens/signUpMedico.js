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

const SignUpMedico = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [CRM, setCRM] = useState('');
  const [dataNascimento, setDataNascimento] = useState(new Date());
  const [rg, setRg] = useState('');
  const [cpf, setCpf] = useState(''); // Adicionado CPF
  const [celular, setCelular] = useState(''); // Adicionado Celular
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [senha, setSenha] = useState('');
  const navigation = useNavigation();

  const onChangeDate = (event, selectedDate) => {
    if (event.type === 'set') {
      const currentDate = selectedDate || dataNascimento;
      setDataNascimento(currentDate);
    }
    setShowDatePicker(false);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const handleRegister = () => {
    if (!nome || !email || !CRM || !rg || !cpf || !celular || !senha) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    if (senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    createUserWithEmailAndPassword(auth, email, senha)
      .then((userCredential) => {
        const userId = userCredential.user.uid;
        setDoc(doc(database, 'medicos', userId), {
          nome,
          email,
          CRM,
          dataNascimento,
          rg,
          cpf,
          celular,
        }).then(() => {
          console.log('Médico cadastrado com sucesso!');
          navigation.replace('Login2');
        }).catch((error) => {
          console.error('Erro ao cadastrar médico:', error);
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

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={customStyles.signUpContainer}>
                <Text style={customStyles.title}>Cadastro Médico</Text>
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
                    placeholder="CRM"
                    value={CRM}
                    onChangeText={(formatted, extracted) => setCRM(extracted)}
                    mask={'[00000]-[AA]'}
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
                    mask={'[00].[000].[000]-[0]'}
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
                <TouchableOpacity onPress={() => navigation.navigate('Cadastro Paciente')}>
                    <Text style={customStyles.link}>Deseja se cadastrar como Paciente?</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpMedico;
