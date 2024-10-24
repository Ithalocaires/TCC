import React, {useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native'
import { addDoc, collection, query, where, getDocs, updateDoc, doc, setDoc } from "firebase/firestore";
import { database } from "../../config/firebase";


const Form = ({ navigation } , userRole) => { // userRole pode ser 'medico' ou 'paciente'
    const [name, setName] = useState('');
    const [susCard, setSusCard] = useState('');
    const [obs, setObservacoes] = useState('');

    // Função para evitar a entrada de caracteres que não sejam números
    const handleSusCardChange = (text) => {
        const cleanedText = text.replace(/[^0-9]/g, '').replace(/\s+/g, '');
        setSusCard(cleanedText);
    };  

    // Função para gerar um ID único baseado na carterinha SUS do paciente
    const gerarIdUsuario = (susCard) => {
        let hash = 0;
        for (let i = 0; i < susCard.length; i++) {
            const char = susCard.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0; // Converte para 32 bits
        }
        return hash.toString();
    };

    const handleSubmitMedico = async () => {
        navigation.navigate('WaitRoom', {userRole: 'medico'});
    };

    const handleSubmitPaciente = async () => {
        if (!name.trim() || !susCard.trim() || !obs.trim()) {
            Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
            return;
        }

        const userId = gerarIdUsuario(susCard);
        console.log('ID do usuário gerado:', userId); // Log do ID do usuário

        // Adiciona o paciente à sala de espera
        try {
            await setDoc(doc(database, 'waitRoom', userId), {
                name,
                susCard,
                obs,
                chatActive: false,
                createdAt: new Date() 
            });
            console.log('Paciente adicionado à sala de espera'); // Log da adição do paciente
        } catch (error) {
            console.error('Erro ao adicionar paciente:', error);
        }

        // Redireciona o paciente para a sala de espera
        navigation.navigate('WaitRoom', { userRole: 'paciente', name, susCard, obs, userId });
    };

    // Adiciona o userRole ao usuário para prosseguir com o uso do App normalmente
    const handleSubmit = () => {
        if (userRole === 'medico') {
            handleSubmitMedico();
        } else {
            handleSubmitPaciente();
        }
    };
        const validaCarteirinha = () => {
            let numeroSUS = susCard; // número da carteirinha do SUS
        
            // Verifica se o número possui 15 dígitos
            if (numeroSUS.length !== 15 || isNaN(numeroSUS)) {
                Alert.alert('Atenção', 'Número de identificação inválido. Deve conter 15 dígitos numéricos.');
                return false;
            }
        
            // Função para validar usando módulo 11
            const validaCNS = (numero) => {
                let soma = 0;
                let peso = 15;
        
                for (let i = 0; i < 14; i++) {
                    soma += parseInt(numero[i]) * peso;
                    peso--;
                }
        
                let resto = soma % 11;
                let digitoVerificador = resto === 0 || resto === 1 ? 0 : 11 - resto;
        
                return digitoVerificador === parseInt(numero[14]);
            };
        
            // Verifica se o número do SUS passa na validação de módulo 11
            if (!validaCNS(numeroSUS)) {
                Alert.alert('Atenção', 'Número de identificação inválido. Falha na verificação do dígito.');
                return false;
            }
        
            return true;
        };

    


    return (
        <View style={Styles.formView}>
            <Text style={Styles.formTextBlue}>Por favor insira os dados abaixo para continuar com a consulta</Text>

            <TextInput
            style={Styles.formInput}
            placeholder="Digite seu nome"
            value={name}
            onChangeText={setName}
            color='black'
            placeholderTextColor="#999"
            marginTop={70}
            />

            <TextInput
            style={Styles.formInput}
            placeholder="Digite o número da carteirinha SUS"
            value={susCard}
            onChangeText={handleSusCardChange}
            color='black'
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={15} 
            />

            <Text style={Styles.textInfo}>Insira neste campo informações, como sintomas e a quanto tempo está se sentindo dessa forma</Text>

            <TextInput
            style={Styles.formInputObs}
            placeholder="Digite suas observações"
            value={obs}
            onChangeText={setObservacoes}
            color='black'
            placeholderTextColor="#999"
            multiline
            />

            <TouchableOpacity style={Styles.confirmBtn} onPress={handleSubmit}>
                <Text style={Styles.confirmBtnText}>Confirmar dados</Text>
            </TouchableOpacity>

            <TouchableOpacity style={Styles.confirmBtn} onPress={handleSubmitMedico}>
                <Text style={Styles.confirmBtnText}>Acessar sala de espera</Text>
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
        borderRadius: 15,
        padding: 8,
        marginBottom: 16,
        marginTop: 25,
        width: '90%',
    },
    formInputObs: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 15,
        padding: 8,
        marginBottom: 16,
        textAlignVertical: 'top',
        marginTop: 30,
        height: 120,
        width: '90%',
    },
    textInfo: {
        fontSize: 12,
        color: 'red',
        textAlign: 'center',
        width: '90%',
        marginTop: 30,
    },
    confirmBtn:{
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderRadius: 20,
        width: '90%',
        backgroundColor: '#0071CF',
        marginVertical: 10,
    },
    confirmBtnText:{
        color: 'white', 
        fontWeight: 'bold'
    },
})

export default Form;