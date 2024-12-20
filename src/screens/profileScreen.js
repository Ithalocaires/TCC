import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Ícones
import { auth, database } from '../../config/firebase'; // Configuração do Firebase
import { signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const ProfileScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [email, setEmail] = useState(auth.currentUser?.email || '');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  //Função para buscar os dados do usuário que está autenticado
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          // Começa fazendo a verificação do usuário, verificando se ele é um médico
          const userRef = doc(database, 'medicos', currentUser.uid);
          // O await getDoc significa que o App irá esperar uma resposta da busca anterior para prosseguir
          const userSnap = await getDoc(userRef);
          // Se o usuário existir na coleção médicos o userData será setado como médico
          if (userSnap.exists()) {
            setUserData({ ...userSnap.data(), type: 'medico' });
          } else {
            // Verifica se o usuário é paciente
            const patientRef = doc(database, 'pacientes', currentUser.uid);
            // O await getDoc significa que o App irá esperar uma resposta da busca anterior para prosseguir
            const patientSnap = await getDoc(patientRef);

            // Se o usuário existir na coleção pacientes o userData será setado como paciente
            if (patientSnap.exists()) {
              setUserData({ ...patientSnap.data(), type: 'paciente' });
            } else {
              console.error('Usuário não encontrado no Firestore.');
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Função para alterar a senha
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }
    // Verifica se a nova senha vate com a senha de confirmação
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Erro', 'A nova senha e a confirmação não coincidem.');
      return;
    }
    // Caso a senha atual for preenchida corretamente o App fará uma requisição ao servidor para alterar a senha do usuário
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível alterar a senha. Verifique sua senha atual.');
    }
  };
 
  // Função que cuida do lougou do usuário
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

// Renderização do Front end
// O componente KeyboardAbvoidingView serve para o teclado do celular não tapar os elementos da tela
  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Perfil</Text>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Icon name="logout" size={24} color="#FF3D00" />
                    </TouchableOpacity>
            </View>

            {/* Dados do usuário */}
            <View style={styles.userInfo}>
                <Text style={styles.label}>Nome:</Text>
                <Text style={styles.value}>{userData.nome}</Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{auth.currentUser.email}</Text>
            </View>
            <View style={styles.userInfo}>
            <Text style={styles.label}>
                {userData.type === 'medico' ? 'CRM' : 'Carteirinha SUS'}:
                  </Text>
                  <Text style={styles.value}>
                      {userData.type === 'medico' ? userData.CRM : userData.cartaoSUS}
                  </Text>
              </View>
            <View style={styles.userInfo}>
                <Text style={styles.label}>Telefone:</Text>
                <Text style={styles.value}>{userData.celular}</Text>
            </View>


            {/* Alterar senha */}
            <View style={styles.section}>
                <Text style={styles.subtitle}>Alterar Senha</Text>
                <TextInput
                style={styles.input}
                placeholder="Senha atual"
                secureTextEntry
                value={currentPassword}
                placeholderTextColor="#000" 
                onChangeText={setCurrentPassword}
                />
                <TextInput
                style={styles.input}
                placeholder="Nova senha"
                secureTextEntry
                value={newPassword}
                placeholderTextColor="#000" 
                onChangeText={setNewPassword}
                />
                <TextInput
                style={styles.input}
                placeholder="Confirmar nova senha"
                secureTextEntry
                value={confirmNewPassword}
                placeholderTextColor="#000" 
                onChangeText={setConfirmNewPassword}
                />
                <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
                <Text style={styles.buttonText}>Alterar Senha</Text>
                </TouchableOpacity>
            </View>
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#53affa',
  },
  logoutButton: {
    padding: 5,
  },
  userInfo: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#555',
  },
  section: {
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color:'#53affa',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    color:'#000',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
