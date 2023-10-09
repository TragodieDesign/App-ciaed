const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000; // Porta do servidor
require('dotenv').config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/rota-de-processamento', async (req, res) => {
  try {
    const token = process.env.BEARER_TOKEN; // Use a variável de ambiente
    const url = 'https://api.mspbackups.com/api/Users';

    // Captura os dados do formulário do WordPress
    const { nome, sobrenome, email } = req.body;

    // Estrutura dos dados para a API
    const dadosParaAPI = {
      Email: email,
      FirstName: nome,
      LastName: sobrenome,
      NotificationEmails: [email],
      Company: 'CIAED',
      Enabled: true,
      Password: 'cadastrociaed123',
      DestinationList: [
        {
          AccountID: 'string',
          Destination: 'string',
          PackageID: 0
        }
      ],
      SendEmailInstruction: true,
      LicenseManagmentMode: 0
    };

    // Configuração dos cabeçalhos com autenticação Bearer
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Solicitação POST para a API
    const response = await axios.post(url, dadosParaAPI, { headers });

    // Manipule a resposta da API, se necessário
    console.log(response.data);

    res.status(200).send('Dados enviados com sucesso para a API.');
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).send('Ocorreu um erro ao enviar os dados para a API.');
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

