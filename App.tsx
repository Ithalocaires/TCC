import React from 'react';
import HomeScreen from './src/screens/home';
import Form from './src/screens/form'; 
import ChatScreen from './src/screens/chat';
import SplashScreen from './src/screens/loading';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler'


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
      </Stack.Navigator>
    </NavigationContainer>
  )
};

export default App;
