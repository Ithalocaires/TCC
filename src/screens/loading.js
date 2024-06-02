import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Chat'); 
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  {/*Tela de loading não está funcionando devidamente*/}

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../source/Loading.json')}
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
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SplashScreen;