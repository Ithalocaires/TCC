import React from 'react';
import HomeScreen from './src/screens/home';
import Form from './src/screens/form'; 
import ChatScreen from './src/screens/chat';
import SplashScreen from './src/screens/loading';
import ChatScreenMedico from './src/screens/chatmedico';
import WaitRoom from './src/screens/waitRoom';
import LoginScreen from './src/screens/login';
import SignUpPaciente from './src/screens/signUpPaciente';
import SignUpMedico from './src/screens/signUpMedico';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler';


const Stack = createStackNavigator();

const App = () => {
  return(
    <NavigationContainer>
      {/*Navegação entre telas*/}
      <Stack.Navigator initialRouteName='Home' screenOptions={{
        headerStyle: {
          backgroundColor: '#003770',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
        {/*Tela Home*/}
        <Stack.Screen name="Home" component={HomeScreen} options={{title: ''}}/>

        {/*Tela formulário*/}
        <Stack.Screen name="Consulta" component={Form} options={{title: 'Formulário'}}/>

        {/*Tela loading*/}
        <Stack.Screen name="Loading" component={SplashScreen} options={{title: ''}} />

        {/*Tela Consulta*/}
        <Stack.Screen name="Chat" component={ChatScreen} options={{title: ''}} />

        {/*Tela Consulta Médico*/}
        <Stack.Screen name="ChatMedico" component={ChatScreenMedico} options={{title: ''}} />

        {/*Tela de espera dos pacientes*/}
        <Stack.Screen name="WaitRoom" component={WaitRoom} options={{title: ''}} />

        {/*Tela de Login*/}
        <Stack.Screen name="Login" component={LoginScreen} options={{title: ''}} />

        {/*Tela de Cadastro Paciente*/}
        <Stack.Screen name="Cadastro Paciente" component={SignUpPaciente} options={{title: ''}} />

        {/*Tela de Cadastro Médico*/}
        <Stack.Screen name="Cadastro Médico" component={SignUpMedico} options={{title: ''}} />
      </Stack.Navigator>
    </NavigationContainer>
  )
};

export default App;

