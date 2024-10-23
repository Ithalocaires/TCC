import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import DatePicker from 'react-native-date-picker';

const AtestadoGenerator = ({ navigation }) => {
  const [nomePaciente, setNomePaciente] = useState('');
  const [periodoAfastado, setPeriodoAfastado] = useState('');
  const [nomeMedico, setNomeMedico] = useState('');
  const [crm, setCrm] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [reason, setReason] = useState('');

  const generateAtestado = () => {
    if (!reason || !nomePaciente || !periodoAfastado) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    // Navegar para a página do resultado e passar os dados como parâmetros
    navigation.navigate('pdf-atestado', {
      nomePaciente,
      periodoAfastado,
      nomeMedico,
      crm,
      startDate: startDate.toLocaleDateString("pt-BR"),
      reason,
    });
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
