import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { database } from '../../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { customStyles } from '../source/styles';


const AtestadoGenerator = ({ route, navigation }) => {
  const { paciente, medico } = route.params; // Dados do paciente e médico recebidos do ChatScreen
  const [nomePaciente, setNomePaciente] = useState('');
  const [carteirinhaSUS, setCarteirinhaSUS] = useState('');
  const [periodoAfastado, setPeriodoAfastado] = useState('');
  const [nomeMedico, setNomeMedico] = useState('');
  const [crm, setCrm] = useState('');
  const [diaConsul, setDiaConsul] = useState('');
  const [reason, setReason] = useState('');
  const [nascipaciente, setNasciPaciente] = useState('');

  useEffect(() => {
    if (paciente && medico) {
      setNomePaciente(paciente.nome || '');
      setCarteirinhaSUS(paciente.carteirinhaSUS || '');
      setNasciPaciente(paciente.dataNascimento || '');
      setNomeMedico(medico.nome || '');
      setCrm(medico.crm || '');
    }
  }, [paciente, medico]);

  const generateAtestado = async () => {
    if (!reason || !nomePaciente || !periodoAfastado || !carteirinhaSUS) {
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
          <p><strong>Carteirinha SUS:</strong> ${carteirinhaSUS}</p>
  
          <p>Encontra-se sob meus cuidados médicos e deverá permanecer afastado de suas atividades laborais pelo período de:</p>
          <p><strong>${periodoAfastado} dias</strong>, a contar da presente data.</p>
  
          <p>Data de emissão: <strong>${diaConsul}</strong></p>
          <br/>
          <p>______________________________</p>
          <div>
            <p style="margin: 0px;">Assinatura do Médico</p>
            <p style="margin: 0px;">Nome do médico:<strong>${nomeMedico}</strong></p>
            <p style="margin: 0px;">CRM:<strong>${crm}</strong></p>
          </div>
        </div>
      `,
      fileName: 'atestado_medico',
      directory: 'Documents',
    };

    try {
      let file = await RNHTMLtoPDF.convert(options);

      // Salvar no Firestore
      const atestadoData = {
        nomePaciente,
        carteirinhaSUS,
        periodoAfastado,
        motivo: reason,
        nomeMedico,
        crm,
        dataNascimento: nascipaciente,
        dataConsulta: diaConsul,
        filePath: file.filePath, // Caminho do arquivo gerado
        timestamp: new Date(), // Adiciona um timestamp para ordenação
      };

      // Adicionando o documento no Firestore
      const atestadosCollection = collection(database, 'atestados');
      await addDoc(atestadosCollection, atestadoData);

      Alert.alert('Sucesso', 'Atestado gerado e salvo no histórico!');
      // Compartilhar o PDF gerado
      const shareOptions = {
        title: 'Compartilhar Atestado',
        url: `file://${file.filePath}`,
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

        <Text style={customStyles.label}>Carteirinha SUS:</Text>
        <TextInput
          style={customStyles.input}
          value={carteirinhaSUS}
          onChangeText={setCarteirinhaSUS}
          placeholder="Insira a carteirinha SUS"
        />

        <Text style={customStyles.label}>Data de nascimento:</Text>
        <TextInput
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
          placeholder="Insira o nome do médico" 
        />

        <Text style={customStyles.label}>CRM:</Text>
        <TextInput
          style={customStyles.input}
          value={crm}
          onChangeText={setCrm}
          keyboardType="numeric"
          placeholder="Insira o CRM do médico"   
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
        <TextInput
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
