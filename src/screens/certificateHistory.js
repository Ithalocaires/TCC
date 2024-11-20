import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { database } from '../../config/firebase';
import { customStyles } from '../source/styles';
import Share from 'react-native-share';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

const HistoricoAtestados = ({ route }) => {
  const { cpf } = route.params; // Recebe o CPF do paciente
  const [atestados, setAtestados] = useState([]);

  useEffect(() => {
    const fetchAtestados = async () => {
      try {
        // Obtém referência à coleção "atestados" e faz a consulta
        const atestadosRef = collection(database, 'atestados');
        const atestadosQuery = query(
          atestadosRef,
          where('cpf', '==', cpf),
          orderBy('timestamp', 'desc')
        );

        const snapshot = await getDocs(atestadosQuery);

        // Mapeia os documentos para um array de objetos
        const atestadosList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAtestados(atestadosList);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar o histórico.');
        console.error(error);
      }
    };

    fetchAtestados();
  }, [cpf]);

  const handleShare = async (filePath) => {
    try {
      await Share.open({
        title: 'Compartilhar Atestado',
        url: `file://${filePath}`,
        type: 'application/pdf',
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={customStyles.container}>
      <Text style={customStyles.title}>Histórico de Atestados</Text>

      <FlatList
        data={atestados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={customStyles.card}>
            <Text style={customStyles.text}><Text style={customStyles.bold}>Paciente:</Text> {item.nomePaciente}</Text>
            <Text style={customStyles.text}><Text style={customStyles.bold}>Período:</Text> {item.periodoAfastado} dias</Text>
            <Text style={customStyles.text}><Text style={customStyles.bold}>Motivo:</Text> {item.motivo}</Text>
            <Text style={customStyles.text}><Text style={customStyles.bold}>Data:</Text> {item.dataConsulta}</Text>
            <TouchableOpacity
              style={customStyles.button}
              onPress={() => handleShare(item.filePath)}>
              <Text style={customStyles.buttonText}>Abrir/Compartilhar PDF</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default HistoricoAtestados;