import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, Platform, PermissionsAndroid} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { TextInputMask } from 'react-native-masked-text'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { customStyles } from '../source/styles';


const AtestadoGenerator = ({ navigation }) => {
  const [nomePaciente, setNomePaciente] = useState('');
  const [periodoAfastado, setPeriodoAfastado] = useState('');
  const [nomeMedico, setNomeMedico] = useState('');
  const [crm, setCrm] = useState('');
  const [diaConsul, setDiaConsul] = useState('');
  const [reason, setReason] = useState('');
  const [nascipaciente, setNasciPaciente ] = useState('');
  const [cpf, setCpf ] = useState('');

  const generateAtestado = async () => {
    if (!reason || !nomePaciente || !periodoAfastado) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }


    let options = {
      html: `
        <div style="text-align: center;">
        <h2>Clínica de Saúde Exemplar</h2>
        <p>Rua Exemplo, 123 - Cidade - Estado</p>
        <p>Telefone: (11) 1234-5678</p>
        <hr/>
      </div>

      <div style="padding: 20px;">
        <h3>Atestado Médico</h3>

        <p>Eu, Dr. ${nomeMedico}, CRM ${crm}, atesto que o(a) paciente:</p>

        <p><strong>Nome:</strong> ${nomePaciente}</p>
        <p><strong>Data de Nascimento:</strong> ${nascipaciente}</p>
        <p><strong>CPF:</strong> ${cpf}</p>

        <p>Encontra-se sob meus cuidados médicos e deverá permanecer afastado de suas atividades laborais pelo período de:</p>

        <p><strong>${periodoAfastado} dias</strong>, a contar da presente data.</p>

        <p>Data de emissão: <strong>${diaConsul}</strong></p>

        <br/>
        <p>______________________________</p>
        <div>  
          <p style=" margin: 0px;">Assinatura do Médico</p>
          <p style=" margin: 0px;">Nome do medico:<strong>${nomeMedico}</strong></p>
          <p style=" margin: 0px;">CRM:<strong>${crm}</strong></p>
        </div>

        <br/>
        <!-- Botão estilizado com um link -->
        <a href="mailto:clinica@exemplo.com" style="
          display: inline-block;
          padding: 10px 20px;
          font-size: 16px;
          color: white;
          background-color: #007bff;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        ">Entrar em Contato</a>
      </div>
      `,
      fileName: 'atestado_medico',
      directory: 'Documents',
    };

    try {
      let file = await RNHTMLtoPDF.convert(options);
      
      // Usando react-native-share para permitir ao usuário escolher onde salvar o arquivo
      const shareOptions = {
        title: 'Compartilhar Atestado',
        url: `file://${file.filePath}`, // Caminho para o arquivo gerado
        type: 'application/pdf',
      };

      Share.open(shareOptions)
        .then((res) => console.log(res))
        .catch((err) => {
          err && console.log(err);
        });
      
    } catch (error) {
      Alert.alert('Erro', 'Houve um erro ao gerar o PDF.');
      console.error(error);
    }
  };

  return (
    <ScrollView>
      <View style={customStyles.container}>
        <Text style={customStyles.title}>Gerador de Atestado Médico</Text>

        <Text style={customStyles.label}>Nome do paciente:</Text>
        <TextInput
          style={customStyles.input}
          value={nomePaciente}
          onChangeText={setNomePaciente}
          placeholder="Insira o nome do paciente"  
        />

        <Text style={customStyles.label}>CPF:</Text>
        <TextInputMask
          type={'cpf'}
          style={customStyles.input}
          value={cpf}
          onChangeText={setCpf}
          placeholder="Insira o CPF do paciente"
        />

        <Text style={customStyles.label}>Data de nascimento:</Text>
        <TextInputMask
          type={'datetime'}
          options={{
            format: 'DD/MM/YYYY'
          }}
          style={customStyles.input}
          value={nascipaciente}
          onChangeText={setNasciPaciente}
          placeholder="Insira a Data do nascimento do paciente"
        />

        <Text style={customStyles.label}>Nome do Medico:</Text>
        <TextInput
          style={customStyles.input}
          value={nomeMedico}
          onChangeText={setNomeMedico}
          placeholder="Insira o nome do medico" 
        />

        <Text style={customStyles.label}>CRM:</Text>
        <TextInputMask
          type={'custom'}
          options={{
            mask: '999999-9'
          }}
          style={customStyles.input}
          value={crm}
          onChangeText={setCrm}
          keyboardType="numeric"
          placeholder="Insira o CRM do medico"   
        />

        <Text style={customStyles.label}>Período de afastamento:</Text>
        <TextInput
          style={customStyles.input}
          value={periodoAfastado}
          onChangeText={setPeriodoAfastado}
          keyboardType="numeric"
          placeholder="Insira o período"
        />

        <Text style={customStyles.label}>Motivo do afastamento:</Text>
        <TextInput
          style={customStyles.input}
          value={reason}
          onChangeText={setReason}
          placeholder="Insira o motivo"
        />

        <Text style={customStyles.label}>Data da consulta:</Text>
        <TextInputMask
          type={'datetime'}
          options={{
            format: 'DD/MM/YYYY'
          }}
          style={customStyles.input}
          value={diaConsul}
          onChangeText={setDiaConsul}
          placeholder="Insira a data da consulta"
        />

        <TouchableOpacity style={customStyles.buttonSubmit} onPress={generateAtestado}>
          <Text style={customStyles.textSubmit}> Gerar Atestado </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AtestadoGenerator;
``
