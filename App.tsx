import React, { useEffect, useState } from 'react';
import HomeScreen from './src/screens/home';
import Form from './src/screens/form'; 
import ChatScreen from './src/screens/chat';
import SplashScreen from './src/screens/loading';
import WaitRoom from './src/screens/waitRoom';
import LoginScreen from './src/screens/login';
import SignUpPaciente from './src/screens/signUpPaciente';
import SignUpMedico from './src/screens/signUpMedico';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import { auth } from './config/firebase'; // Firebase Authentication import
import { onAuthStateChanged } from 'firebase/auth';
import 'react-native-gesture-handler';
import { User } from 'firebase/auth';



const Stack = createStackNavigator();

const App = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Verifica o estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            // Usuário está logado
            setUser(user);
        } else {
            // Usuário não está logado
            setUser(null);
        }
        setLoading(false);
    });

    // Cleanup ao desmontar
    return () => unsubscribe();
}, []);

if (loading) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
    );
}

  return(
    <NavigationContainer>
      {/*Navegação entre telas*/}
      <Stack.Navigator   screenOptions={{
        headerStyle: {
          backgroundColor: '#003770',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
         {user ? (
                    // Se o usuário estiver logado, navega para a Home
                    <Stack.Screen name="Home" component={HomeScreen} options={{title: ''}} />
                ) : (
                    // Se o usuário não estiver logado, navega para a tela de Login
                    <Stack.Screen name="Login" component={LoginScreen} options={{title: ''}}/>
                )}

        {/*Tela formulário*/}
        <Stack.Screen name="Consulta" component={Form} options={{title: 'Formulário'}}/>

        {/*Tela loading*/}
        <Stack.Screen name="Loading" component={SplashScreen} options={{title: ''}} />

        {/*Tela Consulta*/}
        <Stack.Screen name="Chat" component={ChatScreen} options={{title: ''}} />

        {/*Tela de espera dos pacientes*/}
        <Stack.Screen name="WaitRoom" component={WaitRoom} options={{title: ''}} />

        {/*Tela de Cadastro Paciente*/}
        <Stack.Screen name="Cadastro Paciente" component={SignUpPaciente} options={{title: ''}} />

        {/*Tela de Cadastro Médico*/}
        <Stack.Screen name="Cadastro Médico" component={SignUpMedico} options={{title: ''}} />
      </Stack.Navigator>
    </NavigationContainer>
  )
};

export default App;

