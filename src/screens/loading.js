import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Simula o carregamento por 5 segundos
    const timer = setTimeout(() => {
      navigation.replace('NextScreen'); 
    }, 5000);

    return () => clearTimeout(timer); // Limpa o timer ao desmontar o componente
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../source/Loading.json')} // Substitua pelo caminho do seu arquivo de animação
        autoPlay
        loop
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SplashScreen;