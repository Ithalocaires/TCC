import React, { useState, useEffect } from 'react'; // Componentes obrigatórios para o funcionamento do React
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'; // Componentes nativos do React para o Front
import { useNavigation } from '@react-navigation/native'; // Navegação para outras telas
import { signInWithEmailAndPassword } from "firebase/auth"; //Autenticação Firebase
import { database, auth } from "../../config/firebase"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';

const LoginScreen = () => {
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    const handleLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Salva o token do usuário no AsyncStorage
            await AsyncStorage.setItem('@userToken', user.uid);
            // Redireciona para a Home ou outra tela
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Cadastro Paciente')}>
                <Text style={styles.link}>Não tem uma conta? Cadastre-se</Text>
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
    button: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderRadius: 20,
        width: '90%',
        backgroundColor: '#0071CF',
        marginVertical:'5%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    link: {
        color: '#007BFF',
        marginTop: 10,
    },
});

export default LoginScreen;
