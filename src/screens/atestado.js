import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, Platform, PermissionsAndroid } from 'react-native';
import DatePicker from 'react-native-date-picker';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';

const AtestadoGenerator = ({ navigation }) => {
  const [nomePaciente, setNomePaciente] = useState('');
  const [periodoAfastado, setPeriodoAfastado] = useState('');
  const [nomeMedico, setNomeMedico] = useState('');
  const [crm, setCrm] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [reason, setReason] = useState('');

  

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

        <p>Eu, Dr. Fulano de Tal, CRM 123456, atesto que o(a) paciente:</p>

        <p><strong>Nome:</strong> ${nomePaciente}</p>
        <p><strong>Data de Nascimento:</strong> [Data de Nascimento]</p>
        <p><strong>CPF:</strong> [CPF do Paciente]</p>

        <p>Encontra-se sob meus cuidados médicos e deverá permanecer afastado de suas atividades laborais pelo período de:</p>

        <p><strong>${periodoAfastado} dias</strong>, a contar da presente data.</p>

        <p>Data de emissão: <strong>${startDate}</strong></p>

        <br/>
        <p>______________________________</p>
        <p>Assinatura do Médico</p>

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
      <View style={styles.container}>
        <Text style={styles.title}>Gerador de Atestado Médico</Text>

        <Text style={styles.label}>Nome do paciente:</Text>
        <TextInput
          style={styles.input}
          value={nomePaciente}
          onChangeText={setNomePaciente}  
        />

        <Text style={styles.label}>Nome do Medico:</Text>
        <TextInput
          style={styles.input}
          value={nomeMedico}
          onChangeText={setNomeMedico}  
        />

        <Text style={styles.label}>CRM:</Text>
        <TextInput
          style={styles.input}
          value={crm}
          onChangeText={setCrm}  
        />

        <Text style={styles.label}>Período de afastamento:</Text>
        <TextInput
          style={styles.input}
          value={periodoAfastado}
          onChangeText={setPeriodoAfastado}
          placeholder="Insira o período"
        />

        <Text style={styles.label}>Motivo do afastamento:</Text>
        <TextInput
          style={styles.input}
          value={reason}
          onChangeText={setReason}
          placeholder="Insira o motivo"
        />

        <Text style={styles.label}>Data da consulta:</Text>
        <DatePicker
          date={startDate}
          onDateChange={setStartDate}
          mode="date"
          locale="pt"
        />

        <Button title="Gerar Atestado" onPress={generateAtestado} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default AtestadoGenerator;
``
