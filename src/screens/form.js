import React, {useState} from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, TextInput, Alert } from 'react-native'

const Form = ({navigation}) => {
        const [nome, setNome] = useState('');
        const [carteirinhaSus, setCarteirinhaSus] = useState('');
        const [observacoes, setObservacoes] = useState('');
        const handleCarteirinhaSusChange =  (text) => {
            {/*Remove qualquer caractere que não seja número*/}
            const cleanedText = text.replace(/[^0-9]/g, '');

             {/*Formata o texto com espaços*/}
            const formattedText = cleanedText.replace(/(\d{2})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');

            setCarteirinhaSus(formattedText);
        };
        
      
        const handleSubmit = () => {
            if (!nome.trim() || !carteirinhaSus.trim() || !observacoes.trim()) {
                Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
                return;
              }

          // Lógica para enviar os dados do formulário
          console.log('Dados enviados:');
          console.log('Nome:', nome);
          console.log('Carteirinha SUS:', carteirinhaSus);
          console.log('Observações:', observacoes);
          navigation.navigate('Consulta')
        };


    return (
        <View style={Styles.formView}>
            <Text style={Styles.formTextBlue}>Por favor insira os dados abaixo para continuar com a consulta</Text>
            <TextInput
            style={Styles.formInput}
            placeholder="Digite seu nome"
            value={nome}
            onChangeText={setNome}
            color='black'
            placeholderTextColor="#999"
            marginTop={70}
            />
            <TextInput
            style={Styles.formInput}
            placeholder="Digite o número da carteirinha SUS"
            value={carteirinhaSus}
            onChangeText={handleCarteirinhaSusChange}
            color='black'
            placeholderTextColor="#999"
            keyboardType="numeric"
            />
            <Text style={Styles.textInfo}>Insira neste campo informações, como sintomas e a quanto tempo está se sentindo dessa forma</Text>
            <TextInput
            style={Styles.formInputObs}
            placeholder="Digite suas observações"
            value={observacoes}
            onChangeText={setObservacoes}
            color='black'
            placeholderTextColor="#999"
            multiline
            />
            <TouchableOpacity style={Styles.confirmBtn} onPress={handleSubmit}>
                <Text style={Styles.confirmBtnText}>Entrar com Gov.br</Text>
            </TouchableOpacity>
        </View>
    )
}


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
        borderRadius: 4,
        padding: 8,
        marginBottom: 16,
        marginTop: 25,
        width: 300,
    },
    formInputObs: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 8,
        marginBottom: 16,
        textAlignVertical: 'top', // Alinha o texto na parte superior
        marginTop: 30,
        height: 120,
        width: 300,
    },
    textInfo: {
        fontSize: 12,
        color: 'red',
        textAlign: 'center',
        width: 300,
        marginTop: 30,
    },
    confirmBtn:{
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderRadius: 20,
        width: 300,
        backgroundColor: '#0071CF',
        marginTop: 20,
    },
    confirmBtnText:{
        color: 'white', 
        fontWeight: 'bold'
    },
})

export default Form;