import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import DatePicker from 'react-native-date-picker';

const AtestadoGenerator = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [showAtestado, setShowAtestado] = useState(false);

  const generateAtestado = () => {
    if (!reason) {
      Alert.alert("Erro", "Por favor, insira o motivo do atestado.");
      return;
    }

    // Exibe as informações no terminal
    console.log("Atestado Gerado:");
    console.log(`Motivo: ${reason}`);
    console.log(`Data de Início: ${startDate.toLocaleDateString('en-GB')}`);
    console.log(`Data de Término: ${endDate.toLocaleDateString('en-GB')}`);

    setShowAtestado(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerador de Atestado Médico</Text>

      <Text style={styles.label}>Data de Início:</Text>
      <DatePicker
        date={startDate}
        onDateChange={setStartDate}
        mode="date"
        locale="pt"
      />

      <Text style={styles.label}>Data de Término:</Text>
      <DatePicker
        date={endDate}
        onDateChange={setEndDate}
        mode="date"
        locale="pt"
      />

      <Text style={styles.label}>Motivo:</Text>
      <TextInput
        style={styles.input}
        placeholder="Insira o motivo"
        value={reason}
        onChangeText={setReason}
      />

      <Button title="Gerar Atestado" onPress={generateAtestado} />

      {showAtestado && (
        <View style={styles.atestadoContainer}>
          <Text style={styles.atestadoText}>Atestado Médico</Text>
          <Text>Motivo: {reason}</Text>
          <Text>Data de Início: {startDate.toLocaleDateString()}</Text>
          <Text>Data de Término: {endDate.toLocaleDateString()}</Text>
        </View>
      )}
    </View>
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
  atestadoContainer: {
    marginTop: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  atestadoText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default AtestadoGenerator;
