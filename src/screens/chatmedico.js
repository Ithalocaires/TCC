import React, { useCallback, useEffect, useState } from "react";
import { View, Modal, StyleSheet, TextInput, TouchableOpacity, Text, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { GiftedChat } from 'react-native-gifted-chat';
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
// import DateTimePicker from '@react-native-community/datetimepicker';  // Importa o DateTimePicker
import { database } from "../../config/firebase";
import Icon from 'react-native-vector-icons/FontAwesome'; // Ícones

export default function ChatScreenMedico() {
    const [messages, setMessages] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalAtestadoVisible, setModalAtestadoVisible] = useState(false);
    const navigation = useNavigation();
    const route = useRoute();
    const { sessionId, name } = route.params;
    const [nome, setNome] = useState('');
    const [cartaoSUS, setCartaoSUS] = useState('');
    const [dataInicio, setDataInicio] = useState(new Date());
    const [dataFim, setDataFim] = useState(new Date());
    const [causaAtestado, setCausaAtestado] = useState('');
    const [showInicioPicker, setShowInicioPicker] = useState(false);
    const [showFimPicker, setShowFimPicker] = useState(false);

    const toggleModal = () => setModalVisible(!modalVisible);
    const toggleModalAtestado = () => setModalAtestadoVisible(!modalAtestadoVisible);

    const onChangeInicio = (event, selectedDate) => {
        if (event.type === "set") {
            const currentDate = selectedDate || dataInicio;
            setDataInicio(currentDate);
        }
        setShowInicioPicker(false);
    };
    
    const onChangeFim = (event, selectedDate) => {
        if (event.type === "set") {
            const currentDate = selectedDate || dataFim;
            setDataFim(currentDate);
        }
        setShowFimPicker(false);
    };

    useEffect(() => {
        const getMessages = () => {
            const values = query(
                collection(database, `chatSessions/${sessionId}/messages`), 
                orderBy('createdAt', 'desc')
            );
            
            const unsubscribe = onSnapshot(values, (snapshot) => {
                setMessages(
                    snapshot.docs.map(doc => ({
                        _id: doc.data()._id,
                        createdAt: doc.data().createdAt.toDate(),
                        text: doc.data().text,
                        user: doc.data().user,
                    }))
                );
            });
    
            return unsubscribe; // Retorna a função de limpeza para remover o ouvinte
        };
    
        getMessages();
    }, [sessionId]);

    const mensagemEnviada = useCallback((messages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
        const { _id, createdAt, text, user } = messages[0];

        addDoc(collection(database, `chatSessions/${sessionId}/messages`), {
            _id,
            createdAt,
            text,
            user,
        });
    }, [sessionId]);

    const handleSubmit = () => {
        console.log(`Nome: ${nome}, Cartão SUS: ${cartaoSUS}`);
        setModalVisible(false);
    };

    const handleSubmitAtestado = () => {
        console.log(`Data inicio: ${dataInicio}, Data final: ${dataFim}, Descrição do atestado: ${causaAtestado}`);
        setModalAtestadoVisible(false);
    };

    const handleLogout = () => {
        Alert.alert(
            "Sair",
            "Você tem certeza que deseja sair?",
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Sim",
                    onPress: () => navigation.navigate("Home"), // Substitua "Home" pelo nome da sua página principal
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <GiftedChat
                messages={messages}
                onSend={msg => mensagemEnviada(msg)}
                user={{
                    _id: sessionId,  // Certifique-se que seja um identificador único
                    name: nome,      // Opcional, pode incluir um campo de nome
                }}
            />

            {/* Rodapé com botões */}
            <View style={styles.footer}>
                <TouchableOpacity onPress={toggleModalAtestado} style={styles.atestadoButton}>
                    <Icon name="plus" size={20} color="white" />
                    <Text style={styles.atestadoButtonText}>Gerar Atestado</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={toggleModal} style={styles.receitaButton}>
                    <Icon name="file-text-o" size={20} color="white" />
                    <Text style={styles.receitaButtonText}>Receita</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutButtonText}>Finalizar</Text>
                </TouchableOpacity>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={toggleModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Preencha o Formulário</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Digite seu nome"
                            value={nome}
                            onChangeText={setNome}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Digite o número da carteirinha SUS"
                            value={cartaoSUS}
                            onChangeText={setCartaoSUS}
                            keyboardType="numeric"
                        />

                        <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                            <Text style={styles.buttonText}>Enviar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal para o atestado */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalAtestadoVisible}
                onRequestClose={toggleModalAtestado}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Gerar Atestado</Text>

                        {/* Seleção de Data de Início */}
                        <TouchableOpacity onPress={() => setShowInicioPicker(true)} style={styles.dateButton}>
                            <Text style={styles.dateButtonText}>Selecione a Data de Início</Text>
                        </TouchableOpacity>
                        {showInicioPicker && (
                            <DateTimePicker
                                value={dataInicio}
                                mode="date"
                                display="default"
                                onChange={onChangeInicio}
                            />
                        )}
                        <Text>Data de Início: {dataInicio.toLocaleDateString()}</Text>

                        {/* Seleção de Data de Fim */}
                        <TouchableOpacity onPress={() => setShowFimPicker(true)} style={styles.dateButton}>
                            <Text style={styles.dateButtonText}>Selecione a Data de Fim</Text>
                        </TouchableOpacity>
                        {showFimPicker && (
                            <DateTimePicker
                                value={dataFim}
                                mode="date"
                                display="default"
                                onChange={onChangeFim}
                            />
                        )}
                        <Text>Data de Fim: {dataFim.toLocaleDateString()}</Text>

                        {/* Campo para a Causa do Atestado */}
                        <TextInput
                            style={styles.input}
                            placeholder="Causa do Atestado"
                            value={causaAtestado}
                            onChangeText={setCausaAtestado}
                            multiline={true}  // Permite múltiplas linhas
                        />

                        <TouchableOpacity onPress={toggleModalAtestado} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Fechar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleSubmitAtestado} style={styles.button}>
                            <Text style={styles.buttonText}>Enviar</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    headerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    headerText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#0071CF',
        padding: 10,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
        marginBottom: 15,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    closeButton: {
        marginTop: 15,
    },
    closeButtonText: {
        color: 'red',
    },
    footer: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    atestadoButton: {
        backgroundColor: '#0071CF',
        padding: 10,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    atestadoButtonText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 5,
    },
    receitaButton: {
        backgroundColor: '#0071CF',
        padding: 10,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    receitaButtonText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 5,
    },
    logoutButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
    },
    logoutButtonText: {
        color: 'white',
        fontSize: 16,
    },
    dateButton: {
        backgroundColor: '#0071CF',  // Cor de fundo
        paddingVertical: 12,  // Espaçamento vertical
        paddingHorizontal: 20,  // Espaçamento horizontal
        borderRadius: 25,  // Borda arredondada
        alignItems: 'center',  // Centraliza o texto
        justifyContent: 'center',
        shadowColor: '#000',  // Cor da sombra
        shadowOffset: { width: 0, height: 2 },  // Posição da sombra
        shadowOpacity: 0.2,  // Opacidade da sombra
        shadowRadius: 3,  // Tamanho da sombra
        elevation: 3,  // Para sombra em Android
        marginVertical: 10,  // Margem vertical para espaçamento entre botões
    },
    dateButtonText: {
        color: 'white',  // Cor do texto
        fontSize: 16,  // Tamanho do texto
        fontWeight: 'bold',  // Peso da fonte
        letterSpacing: 0.5,  // Espaçamento entre letras
    },
    signatureContainer: {
        marginVertical: 20,
        alignItems: 'center',
    },
    signature: {
        width: 150,
        height: 50,
    },
});
