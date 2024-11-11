import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, database } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = ({ user, route }) => {
    const userId = route?.params?.userId;
    const navigation = useNavigation();

    if (!user) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Carregando informações do perfil...</Text>
            </View>
        );
    }

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigation.navigate('Consulta', { userId }); 
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
            console.error('Erro ao fazer logout:', error);
        }
    };

    if (!user) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Carregando informações do perfil...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Perfil do Usuário</Text>
            <View style={styles.profileInfo}>
                <Text style={styles.text}>Nome: {user.nome || "Nome não disponível"}</Text>
                <Text style={styles.text}>Email: {user.email}</Text>
                <Text style={styles.text}>RG: {user.rg}</Text>
                {user.CRM && <Text style={styles.text}>CRM: {user.CRM}</Text>}
                {user.cartaoSUS && <Text style={styles.text}>Cartão SUS: {user.cartaoSUS}</Text>}
                <Text style={styles.text}>Tipo de Usuário: {user.CRM ? "Médico" : "Paciente"}</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
            <View style={styles.body}>
                    <Text style={styles.bodyText}> Ações </Text>

                    {/*Primeira Linha de botões */}
                    <View style={styles.btnContainer}>

                        {/*Botão 1 */}
                        <TouchableOpacity style={styles.bodyBtn}>
                            <Icon name="newspaper-outline" size={25}  color= '#003770' backgroundColor='white' borderRadius={20}
                                style={{borderRadius:8, padding:12, paddingHorizontal: 10}}/>
                            <Text style={styles.bodyBtnText}> Conteúdos </Text>
                        </TouchableOpacity>

                        {/*Botão 2 */}
                        <TouchableOpacity style={styles.bodyBtn}>
                            <Icon2 name="hospital-o" size={25}  color= '#003770' backgroundColor='white' borderRadius={20}
                                style={{borderRadius:8, padding:11, width:45, paddingHorizontal: 13 }}/>
                            <Text style={styles.bodyBtnText2}> Rede de Saúde </Text>
                        </TouchableOpacity>

                        {/*Botão 3 */}
                        <TouchableOpacity style={styles.bodyBtn}>
                            <Icon2 name="qrcode" size={25}  color= '#003770' backgroundColor='white' borderRadius={20}
                                style={{borderRadius:8, padding:11, width:45, paddingHorizontal: 12 }}/>
                            <Text style={styles.bodyBtnText2}> Valida Cartão </Text>
                        </TouchableOpacity>

                        {/*Botão 4 */}
                        <TouchableOpacity style={styles.bodyBtn} onPress={() => navigation.navigate('Atestado')}>
                            <Icon2 name="calendar" size={25}  color= '#003770' backgroundColor='white' borderRadius={20}
                                style={{borderRadius:8, padding:11, width:45, paddingHorizontal: 11 }}/>
                            <Text style={styles.bodyBtnText2}> Atestados </Text>
                        </TouchableOpacity>
                    </View>

                    {/*Segunda Linha de botões */}
                    <View style={styles.btnContainer}>

                        {/*Botão 5 */}
                        <TouchableOpacity style={styles.bodyBtn}>
                            <Icon name="chatbubble-ellipses-outline" size={25}  color= '#003770' backgroundColor='white' borderRadius={20}
                                style={{borderRadius:8, padding:10,}}/>
                            <Text style={styles.bodyBtnText2}> Fale com meu SUS digital </Text>
                        </TouchableOpacity>

                        {/*Botão 6 */}
                        <TouchableOpacity style={styles.bodyBtn}>
                            <Icon2 name="hospital-o" size={25}  color= '#003770' backgroundColor='white' borderRadius={20}
                               style={{borderRadius:8, padding:11, width:45, paddingHorizontal: 12 }}/>
                            <Text style={styles.bodyBtnText2}> Sobre o SUS </Text>
                        </TouchableOpacity>

                        {/*Botão 7 */}
                        <TouchableOpacity style={styles.bodyBtn}>
                            <Icon name="information-circle-outline" size={35}  color= '#003770' backgroundColor='white' borderRadius={20}
                                style={{borderRadius:8, paddingVertical:6, width:46, paddingHorizontal: 6 }}/>
                            <Text style={styles.bodyBtnText2}> Termos de utilização </Text>
                        </TouchableOpacity>
                        
                        {/*Botão 8 */}
                        <TouchableOpacity style={styles.bodyBtn} onPress={() => navigation.navigate('Consulta',{ userId })}>
                            <Icon2 name="mobile-phone" size={35}  color= '#003770' backgroundColor='white' borderRadius={20}
                                style={{borderRadius:8, padding:5, width:45, paddingHorizontal: 15 }}/>
                            <Text style={styles.bodyBtnText2}> Consulta pelo Celular </Text>
                        </TouchableOpacity>
                    </View>
            </View>
        </View>
        
    );
};

const HomeScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                await fetchUserData(currentUser.uid);
            } else {
                console.log("Nenhum usuário autenticado");
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const fetchUserData = async (userId) => {
        try {
            let userDoc = await getDoc(doc(database, 'medicos', userId));
            
            if (userDoc.exists()) {
                setUser({
                    nome: userDoc.data().nome,
                    email: userDoc.data().email,
                    rg: userDoc.data().rg,
                    CRM: userDoc.data().CRM,
                });
            } else {
                userDoc = await getDoc(doc(database, 'pacientes', userId));
                
                if (userDoc.exists()) {
                    setUser({
                        nome: userDoc.data().nome,
                        email: userDoc.data().email,
                        rg: userDoc.data().rg,
                        cartaoSUS: userDoc.data().cartaoSUS,
                    });
                } else {
                    console.log("Usuário não encontrado em nenhuma coleção");
                }
            }
        } catch (error) {
            console.error("Erro ao buscar dados do usuário:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
            
        );
    }

    return (
        <View style={styles.container}>
            <ProfileScreen user={user}/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        width:'100%'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        marginVertical: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    profileInfo: {
        marginVertical: 20,
    },
    text: {
        fontSize: 18,
        marginVertical: 5,
    },
    logoutButton: {
        backgroundColor: '#ff4d4d',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    logoutButtonText: {
        color: 'white',
        fontSize: 18,
    },
    navigationButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    navigationButtonText: {
        color: 'white',
        fontSize: 18,
    },
    body:{
        backgroundColor: '#003770',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: '0%',
        marginTop: "30%",
        width: '130%',
        flex: 1,    
        marginBottom: -40,
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
});

export default HomeScreen;
