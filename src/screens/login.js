import React, { useState, useEffect } from 'react'; // Componentes obrigatórios para o funcionamento do React
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'; // Componentes nativos do React para o Front
import { useNavigation } from '@react-navigation/native'; // Navegação para outras telas
import { signInWithEmailAndPassword } from "firebase/auth"; //Autenticação Firebase
import { auth } from "../../config/firebase"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { customStyles } from '../source/styles';

const LoginScreen = () => {
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    const handleLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const userId = user.uid; // Obtenha o userId
    
            // Salva o token do usuário no AsyncStorage
            await AsyncStorage.setItem('@userToken', userId);
            
            // Redireciona para a Home ou tela de cadastro com o userId como parâmetro
            navigation.navigate('Home', { userId });
    
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={customStyles.container}>
            <Text style={customStyles.title}>Login</Text>
            <TextInput
                style={customStyles.input}
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholderTextColor="#000"
            />
            <TextInput
                style={customStyles.input}
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#000"
            />
            <TouchableOpacity style={customStyles.buttonSubmit} onPress={handleLogin}>
                <Text style={customStyles.buttonText}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Cadastro Paciente')}>
                <Text style={customStyles.link}>Não tem uma conta? Cadastre-se</Text>
            </TouchableOpacity>
        </View>
    );
};

export default LoginScreen;
