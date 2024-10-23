import React, { useState } from 'react'; // Componentes obrigatórios para o funcionamento do React
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'; // Componentes nativos do React para o Front
import { useNavigation } from '@react-navigation/native'; // Navegação para outras telas
import { signInWithEmailAndPassword } from "firebase/auth"; //Autenticação Firebase
import { database, auth } from "../../config/firebase"

const LoginScreen = () => {
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password); // Faz a autenticação dos campos "email" e "password" no banco de dados

            navigation.navigate('Home'); // Nevega para a tela seguinte
        } catch (error) {
            console.error("Erro ao fazer login: ", error); 
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
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 8,
        width: '90%',
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
});

export default LoginScreen;
