const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
const port = 3000; // Porta do servidor
require('dotenv').config();
app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://www.nublify.com/ciaed");
  res.header("Access-Control-Allow-Methods", "POST");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/rota-de-processamento', async (req, res) => {
  try {
    const token = process.env.BEARER_TOKEN; // Use a variável de ambiente
    const url = 'https://api.mspbackups.com/api/Users';

    // Captura os dados do formulário do WordPress
    const { nome, sobrenome, email, telefone } = req.body;

    // Verifica se o e-mail já existe na API
    const emailExists = await checkEmailExists(email);

    if (emailExists) {
      res.status(400).send('O e-mail já existe na API.');
      return;
    }

    // Estrutura dos dados para a API
    const dadosParaAPI = {
      "Email": email,
      "FirstName": nome,
      "LastName": sobrenome,
      "NotificationEmails": [email],
      "Company": "CIAED",
      "Enabled": true,
      "Password": "cadastrociaed123",
      "DestinationList": [
        {
          "AccountID": "string",
          "Destination": "string",
          "PackageID": 0
        }
      ],
      "SendEmailInstruction": true,
      "LicenseManagmentMode": 0
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

// Função para verificar se o e-mail já existe na API
async function checkEmailExists(email) {
  try {
    const url = 'https://api.mspbackups.com/api/Users';
    const response = await axios.get(url);

    // Verifique se o e-mail já existe na resposta da API
    const users = response.data;
    return users.some(user => user.Email === email);
  } catch (error) {
    console.error('Erro ao verificar e-mail:', error);
    return false; // Em caso de erro, assumimos que o e-mail não existe
  }
}

