import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/FontAwesome';


const HomeScreen = ({navigation}) => {
    return(
        
        <View style= {Styles.header}>

                {/*Header*/}
                <Text style={Styles.headerTextBlue}>
                    Você não está logado.
                </Text>
                <Text style={Styles.headerText}>
                    Faça login para prosseguir.
                </Text>

                {/*Botão Login */}
                <TouchableOpacity style={Styles.loginBtn} onPress={() => navigation.navigate('Login')}>
                    <Text style={Styles.loginBtnText}>Login</Text>
                </TouchableOpacity>

                {/*Container azul na parte inferior */}
                <View style={Styles.body}>
                    <Text style={Styles.bodyText}> Ações </Text>

                    {/*Primeira Linha de botões */}
                    <View style={Styles.btnContainer}>

                        {/*Botão 1 */}
                        <TouchableOpacity style={Styles.bodyBtn}>
                            <Icon name="newspaper-outline" size={25}  color= '#003770' backgroundColor='white' borderRadius={20}
                                style={{borderRadius:8, padding:12, paddingHorizontal: 10}}/>
                            <Text style={Styles.bodyBtnText}> Conteúdos </Text>
                        </TouchableOpacity>

                        {/*Botão 2 */}
                        <TouchableOpacity style={Styles.bodyBtn}>
                            <Icon2 name="hospital-o" size={25}  color= '#003770' backgroundColor='white' borderRadius={20}
                                style={{borderRadius:8, padding:11, width:45, paddingHorizontal: 13 }}/>
                            <Text style={Styles.bodyBtnText2}> Rede de Saúde </Text>
                        </TouchableOpacity>

                        {/*Botão 3 */}
                        <TouchableOpacity style={Styles.bodyBtn}>
                            <Icon2 name="qrcode" size={25}  color= '#003770' backgroundColor='white' borderRadius={20}
                                style={{borderRadius:8, padding:11, width:45, paddingHorizontal: 12 }}/>
                            <Text style={Styles.bodyBtnText2}> Valida Cartão </Text>
                        </TouchableOpacity>

                        {/*Botão 4 */}
                        <TouchableOpacity style={Styles.bodyBtn}>
                            <Icon2 name="calendar" size={25}  color= '#003770' backgroundColor='white' borderRadius={20}
                                style={{borderRadius:8, padding:11, width:45, paddingHorizontal: 11 }}/>
                            <Text style={Styles.bodyBtnText2}> Cartilha de Vacinas </Text>
                        </TouchableOpacity>
                    </View>

                    {/*Segunda Linha de botões */}
                    <View style={Styles.btnContainer}>

                        {/*Botão 5 */}
                        <TouchableOpacity style={Styles.bodyBtn}>
                            <Icon name="chatbubble-ellipses-outline" size={25}  color= '#003770' backgroundColor='white' borderRadius={20}
                                style={{borderRadius:8, padding:10,}}/>
                            <Text style={Styles.bodyBtnText2}> Fale com meu SUS digital </Text>
                        </TouchableOpacity>

                        {/*Botão 6 */}
                        <TouchableOpacity style={Styles.bodyBtn}>
                            <Icon2 name="hospital-o" size={25}  color= '#003770' backgroundColor='white' borderRadius={20}
                               style={{borderRadius:8, padding:11, width:45, paddingHorizontal: 12 }}/>
                            <Text style={Styles.bodyBtnText2}> Sobre o SUS </Text>
                        </TouchableOpacity>

                        {/*Botão 7 */}
                        <TouchableOpacity style={Styles.bodyBtn}>
                            <Icon name="information-circle-outline" size={35}  color= '#003770' backgroundColor='white' borderRadius={20}
                                style={{borderRadius:8, paddingVertical:6, width:46, paddingHorizontal: 6 }}/>
                            <Text style={Styles.bodyBtnText2}> Termos de utilização </Text>
                        </TouchableOpacity>
                        
                        {/*Botão 8 */}
                        <TouchableOpacity style={Styles.bodyBtn} onPress={() => navigation.navigate('Consulta')}>
                            <Icon2 name="mobile-phone" size={35}  color= '#003770' backgroundColor='white' borderRadius={20}
                                style={{borderRadius:8, padding:5, width:45, paddingHorizontal: 15 }}/>
                            <Text style={Styles.bodyBtnText2}> Consulta pelo Celular </Text>
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
        color: '#53affa',
        alignItems: 'center',
        marginTop: 150,
        fontWeight: 'bold', 
        textAlign: 'center',
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
        width: '80%',
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
        paddingHorizontal: '0%',
        marginTop: 70,
        width: '110%',
        flex: 1,
    },
    bodyText:{
        fontSize:16,
        fontWeight:'bold',
        marginBottom:10,
        marginLeft:'5%',
        color:'white',
        textAlign:'justify',
    },
    bodyBtn:{
        alignItems: 'center',
        width: 72,
        marginLeft: '6%',
        marginTop: '5%',

    },
    bodyBtnText:{
        marginTop: '10%',
        color:'white',
        textAlign:'center',
    },
    bodyBtnText2:{
        marginTop: '10%',
        color:'white',
        textAlign: 'center',
    },
    btnContainer:{
        height:'40%',
        flexDirection: 'row',
    },
})

export default HomeScreen;