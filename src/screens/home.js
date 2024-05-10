import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons';


const HomeScreen = () => {
    return(
        <View style= {Styles.header}>
            <Text style={Styles.headerTextBlue}>
                 Você não está logado.
            </Text>
            <Text style={Styles.headerText}>
                Entre com Gov.br e acesse todos os serviços do SUS Digital.
            </Text>
            <TouchableOpacity style={Styles.loginBtn}>
                <Text style={Styles.loginBtnText}>Entrar com Gov.br</Text>
            </TouchableOpacity>

            <View style={Styles.body}>
                <Text>Ações</Text>
                <Ionicons name="newspaper-outline" size={30}  color= '#fff'/>
                <Text></Text>
            </View>
        </View>
    );
}

const Styles = StyleSheet.create({
    header:{
        flex: 1, 
        backgroundColor: 'white', 
        padding: 16,
        alignItems: 'center',
    },
    headerTextBlue:{
        fontSize: 22,  
        marginBottom: 16,
        marginTop: 20,
        color: '#53affa',
        alignItems: 'center',
        marginTop: 200,
    },
    headerText:{
        fontSize: 16, 
        fontWeight: 'bold', 
        marginBottom: 50,
        alignItems: 'center',
        width: 260,
    },
    loginBtn:{
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderRadius: 20,
        width: 300,
        backgroundColor: '#0071D1',
    },
    loginBtnText:{
        color: 'white', 
        fontWeight: 'bold'
    },
    body:{
        backgroundColor: '#007bff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginTop: 130,
        width: '110%',
        flex: 1,
    },
})

export default HomeScreen;