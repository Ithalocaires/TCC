import React from 'react';
import { View, Button } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';

const MedicalCertificateWithButton = () => {
  
  const createPDF = async () => {
    const htmlContent = `
      <div style="text-align: center;">
        <h2>Clínica de Saúde Exemplar</h2>
        <p>Rua Exemplo, 123 - Cidade - Estado</p>
        <p>Telefone: (11) 1234-5678</p>
        <hr/>
      </div>

      <div style="padding: 20px;">
        <h3>Atestado Médico</h3>

        <p>Eu, Dr. Fulano de Tal, CRM 123456, atesto que o(a) paciente:</p>

        <p><strong>Nome:</strong> [Nome do Paciente]</p>
        <p><strong>Data de Nascimento:</strong> [Data de Nascimento]</p>
        <p><strong>CPF:</strong> [CPF do Paciente]</p>

        <p>Encontra-se sob meus cuidados médicos e deverá permanecer afastado de suas atividades laborais pelo período de:</p>

        <p><strong>[X] dias</strong>, a contar da presente data.</p>

        <p>Data de emissão: <strong>${new Date().toLocaleDateString()}</strong></p>

        <br/>
        <p>______________________________</p>
        <p>Assinatura do Médico</p>

        <br/>
        <!-- Botão estilizado com um link -->
        <a href="mailto:clinica@exemplo.com" style="
          display: inline-block;
          padding: 10px 20px;
          font-size: 16px;
          color: white;
          background-color: #007bff;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        ">Entrar em Contato</a>
      </div>
    `;

    try {
      const options = {
        html: htmlContent,
        fileName: 'atestado-medico',
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);

      // Compartilhar ou salvar o PDF
      await Share.open({
        url: `file://${file.filePath}`,
        title: 'Atestado Médico',
      });
      
      console.log(`PDF criado em: ${file.filePath}`);
    } catch (error) {
      console.error('Erro ao criar PDF', error);
    }
  };

  return (
    <View>
      <Button title="Gerar Atestado Médico" onPress={createPDF} />
    </View>
  );
};

export default MedicalCertificateWithButton;
