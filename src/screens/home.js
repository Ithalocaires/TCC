import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, database } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { customStyles } from '../source/styles';

const HomeScreen = () => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null); 
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

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
            // Primeiramente, tenta buscar o usuário na coleção de médicos
            let userDoc = await getDoc(doc(database, 'medicos', userId));

            if (userDoc.exists()) {
                // Se o usuário for encontrado na coleção de médicos, ele é um médico
                setUser({
                    nome: userDoc.data().nome,
                    email: userDoc.data().email,
                    rg: userDoc.data().rg,
                    CRM: userDoc.data().CRM,
                    userId
                });
                setUserRole('medico');  // Define o role como 'medico'
            } else {
                // Se não encontrado como médico, tenta na coleção de pacientes
                userDoc = await getDoc(doc(database, 'pacientes', userId));

                if (userDoc.exists()) {
                    // Se o usuário for encontrado na coleção de pacientes, ele é um paciente
                    setUser({
                        nome: userDoc.data().nome,
                        email: userDoc.data().email,
                        rg: userDoc.data().rg,
                        cartaoSUS: userDoc.data().cartaoSUS,
                        userId
                    });
                    setUserRole('paciente');  // Define o role como 'paciente'
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

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            alert('Erro ao sair. Tente novamente.');
        }
    };
    
    if (loading) {
        return (
            <View style={customStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={customStyles.loadingContainer}>
                <Text style={customStyles.loadingText}>Carregando informações do perfil...</Text>
            </View>
        );
    }

    return (
        <View style={customStyles.homeContainer}>
            <Text style={customStyles.homeTitle}>Perfil do Usuário</Text>
            <View style={customStyles.profileInfo}>
                <Text style={customStyles.homeText}>Nome: {user.nome || "Nome não disponível"}</Text>
                <Text style={customStyles.homeText}>Email: {user.email}</Text>
                <Text style={customStyles.homeText}>RG: {user.rg}</Text>
                {user.CRM && <Text style={customStyles.homeText}>CRM: {user.CRM}</Text>}
                {user.cartaoSUS && <Text style={customStyles.homeText}>Cartão SUS: {user.cartaoSUS}</Text>}
                <Text style={customStyles.homeText}>Tipo de Usuário: {user.CRM ? "Médico" : "Paciente"}</Text>
            </View>

            <TouchableOpacity style={customStyles.homeLogoutButton} onPress={handleLogout}>
                <Text style={customStyles.homeLogoutButtonText}>Logout</Text>
            </TouchableOpacity>

            <View style={customStyles.homeBody}>
                <Text style={customStyles.homeBodyText}> Ações </Text>

                {/* Primeira Linha de botões */}
                <View style={customStyles.homeBtnContainer}>

                    {/* Botão 1 */}
                    <TouchableOpacity style={customStyles.homeBodyBtn} onPress={() => navigation.navigate('HistoricoAtestados', { userId: user.userId })}>
                        <Icon name="newspaper-outline" size={25} color="#003770" backgroundColor="white" borderRadius={20}
                            style={{ borderRadius: 8, padding: 12, paddingHorizontal: 10 }} />
                        <Text style={customStyles.homeBodyBtnText}>Conteúdos</Text>
                    </TouchableOpacity>

                    {/* Botão 2 */}
                    <TouchableOpacity style={customStyles.homeBodyBtn}>
                        <Icon2 name="hospital-o" size={25} color="#003770" backgroundColor="white" borderRadius={20}
                            style={{ borderRadius: 8, padding: 11, width: 45, paddingHorizontal: 13 }} />
                        <Text style={customStyles.homeBodyBtnText2}>Rede de Saúde</Text>
                    </TouchableOpacity>

                    {/* Botão 3 */}
                    <TouchableOpacity style={customStyles.homeBodyBtn}>
                        <Icon2 name="qrcode" size={25} color="#003770" backgroundColor="white" borderRadius={20}
                            style={{ borderRadius: 8, padding: 11, width: 45, paddingHorizontal: 12 }} />
                        <Text style={customStyles.homeBodyBtnText2}>Valida Cartão</Text>
                    </TouchableOpacity>

                    {/* Botão 4 */}
                    <TouchableOpacity style={customStyles.homeBodyBtn}>
                        <Icon2 name="calendar" size={25} color="#003770" backgroundColor="white" borderRadius={20}
                            style={{ borderRadius: 8, padding: 11, width: 45, paddingHorizontal: 11 }} />
                        <Text style={customStyles.homeBodyBtnText2}>Atestados</Text>
                    </TouchableOpacity>
                </View>

                {/* Segunda Linha de botões */}
                <View style={customStyles.homeBtnContainer}>

                    {/* Botão 5 */}
                    <TouchableOpacity style={customStyles.homeBodyBtn}>
                        <Icon name="chatbubble-ellipses-outline" size={25} color="#003770" backgroundColor="white" borderRadius={20}
                            style={{ borderRadius: 8, padding: 10 }} />
                        <Text style={customStyles.homeBodyBtnText2}>Fale com meu SUS digital</Text>
                    </TouchableOpacity>

                    {/* Botão 6 */}
                    <TouchableOpacity style={customStyles.homeBodyBtn}>
                        <Icon2 name="hospital-o" size={25} color="#003770" backgroundColor="white" borderRadius={20}
                            style={{ borderRadius: 8, padding: 11, width: 45, paddingHorizontal: 12 }} />
                        <Text style={customStyles.homeBodyBtnText2}>Sobre o SUS</Text>
                    </TouchableOpacity>

                    {/* Botão 7 */}
                    <TouchableOpacity style={customStyles.homeBodyBtn}>
                        <Icon name="information-circle-outline" size={35} color="#003770" backgroundColor="white" borderRadius={20}
                            style={{ borderRadius: 8, paddingVertical: 6, width: 46, paddingHorizontal: 6 }} />
                        <Text style={customStyles.homeBodyBtnText2}>Termos de utilização</Text>
                    </TouchableOpacity>

                    {/* Botão 8 - Navegação condicional */}
                    <TouchableOpacity style={customStyles.homeBodyBtn} onPress={() => navigation.navigate(userRole === 'medico' ? 'WaitRoom' : 'Consulta', { userId: user.userId, userRole })}>
                        <Icon2 name="mobile-phone" size={35} color="#003770" backgroundColor="white" borderRadius={20}
                            style={{ borderRadius: 8, padding: 5, width: 45, paddingHorizontal: 15 }} />
                        <Text style={customStyles.homeBodyBtnText2}>Consulta pelo Celular</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default HomeScreen;
