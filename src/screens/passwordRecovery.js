import React, {useState} from "react";
import {View, Text, TextInput, TouchableOpacity, Alert} from 'react-native'
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../config/firebase";
import { customStyles } from "../source/styles";


const PasswordRecovery = ({navigation}) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    // Função para enviar o e-mail para o usuário fazer a troca de senha
    const handlePasswordReset = async () => {
        if (!email) {
            Alert.alert('Erro', 'Por favor, insira seu e-mail.');
            return;
        }
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            Alert.alert(
                'E-mail enviado',
                'Um e-mail para redefinir sua senha foi enviado. Verifique sua caixa de entrada.'
            );
            setEmail('');
            navigation.goBack(); // Retorna à tela anterior
        } catch (error) {
            console.error('Erro ao enviar e-mail de redefinição:', error);
            Alert.alert('Erro', 'Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return(
        <View style={customStyles.loginContainer}>
            <Text style={customStyles.title}>Recuperação de Senha</Text>
            <TextInput
                style={customStyles.input}
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholderTextColor="#000"
            />

            <TouchableOpacity style={customStyles.buttonSubmit} onPress={handlePasswordReset}>
                <Text style={customStyles.buttonText}>Recuperar Senha</Text>
            </TouchableOpacity>
        </View>
    );
}

export default PasswordRecovery;