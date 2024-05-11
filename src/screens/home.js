import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/FontAwesome';


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
                    <Text style={Styles.bodyText}> Ações </Text>
                    <View style={Styles.btnContainer}>
                        <TouchableOpacity style={Styles.bodyBtn}>
                            <Icon name="newspaper-outline" size={25}  color= '#003770' backgroundColor='white' borderRadius={20}
                                style={{borderRadius:8, padding:10,}}
                            />
                            <Text style={Styles.bodyBtnText}> Conteúdos </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.bodyBtn}>
                            <Icon2 name="hospital-o" size={25}  color= '#003770' backgroundColor='white' borderRadius={20}
                                style={{borderRadius:8, padding:11, width:45, paddingHorizontal: 12 }}/>
                            <Text style={Styles.bodyBtnText2}> Rede de Saúde </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.bodyBtn}>
                            <Icon2 name="hospital-o" size={25}  color= '#003770' backgroundColor='white' borderRadius={20}
                                style={{borderRadius:8, padding:11, width:45, paddingHorizontal: 12 }}/>
                            <Text style={Styles.bodyBtnText2}> Valida Cartão </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.bodyBtn}>
                            <Icon2 name="hospital-o" size={25}  color= '#003770' backgroundColor='white' borderRadius={20}
                                style={{borderRadius:8, padding:11, width:45, paddingHorizontal: 12 }}/>
                            <Text style={Styles.bodyBtnText2}> Cartilha de Vacinas </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={Styles.btnContainer}>
                        <TouchableOpacity style={Styles.bodyBtn}>
                            <Icon name="newspaper-outline" size={25}  color= '#003770' backgroundColor='white' borderRadius={20}
                                style={{borderRadius:8, padding:10,}}
                            />
                            <Text style={Styles.bodyBtnText}> Conteúdos </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.bodyBtn}>
                            <Icon2 name="hospital-o" size={25}  color= '#003770' backgroundColor='white' borderRadius={20}
                                style={{borderRadius:8, padding:11, width:45, paddingHorizontal: 12 }}/>
                            <Text style={Styles.bodyBtnText2}> Rede de Saúde </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.bodyBtn}>
                            <Icon2 name="hospital-o" size={25}  color= '#003770' backgroundColor='white' borderRadius={20}
                                style={{borderRadius:8, padding:11, width:45, paddingHorizontal: 12 }}/>
                            <Text style={Styles.bodyBtnText2}> Valida Cartão </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.bodyBtn}>
                            <Icon2 name="hospital-o" size={25}  color= '#003770' backgroundColor='white' borderRadius={20}
                                style={{borderRadius:8, padding:11, width:45, paddingHorizontal: 12 }}/>
                            <Text style={Styles.bodyBtnText2}> Cartilha de Vacinas </Text>
                        </TouchableOpacity>
                        
                    </View>
            </View>
        </View>
    );
}

const Styles = StyleSheet.create({
    header:{
        flex: 1, 
        backgroundColor: 'white', 
        padding: 15,
        alignItems: 'center',
    },
    headerTextBlue:{
        fontSize: 22,  
        marginBottom: 20,
        marginTop: 10,
        color: '#53affa',
        alignItems: 'center',
        marginTop: 200,
        fontWeight: 'bold', 
    },
    headerText:{
        fontSize: 16, 
        fontWeight: 'bold', 
        marginBottom: 50,
        alignItems: 'center',
        width: 260,
        color: 'black',
        textAlign:'center',
    },
    loginBtn:{
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderRadius: 20,
        width: 300,
        backgroundColor: '#0071CF',
    },
    loginBtnText:{
        color: 'white', 
        fontWeight: 'bold'
    },
    body:{
        backgroundColor: '#003770',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginTop: 90,
        width: '110%',
        flex: 1,
        marginBottom: -20,
    },
    bodyText:{
        fontSize:16,
        fontWeight:'bold',
        marginLeft:21,
        color:'white',
        textAlign:'justify',
    },
    bodyBtn:{
        alignItems: 'center',
        width: 70,
        marginLeft: 15,
        marginTop: 15,
        marginHorizontal: 5,
    },
    bodyBtnText:{
        marginTop: -5,
        color:'white',
        textAlign:'center',
    },
    bodyBtnText2:{
        marginTop: 12,
        color:'white',
        textAlign: 'center',
    },
    btnContainer:{
        height:120,
        flexDirection: 'row',
    },
})

export default HomeScreen;