const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
const port = 3000; // Porta do servidor
require('dotenv').config();
app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://www.nublify.com/ciaed");
  res.header("Access-Control-Allow-Methods", "POST, GET"); // Adicione o método GET
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.urlencoded({ extended: true });
app.use(express.json());

app.post('/rota-de-processamento', async (req, res) => {
  try {
    const token = process.env.BEARER_TOKEN;
    const url = 'https://api.mspbackups.com/api/Users';

    const { nome, sobrenome, email } = req.body;

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

app.get('/verificar-email', async (req, res) => {
  try {
    // Recupera o e-mail da query string
    const email = req.query.email;

    // Faça a solicitação GET para a API da MSPBackups
    const url = 'https://api.mspbackups.com/api/Users';
    const response = await axios.get(url);

    // Verifique se o e-mail existe na resposta da API
    const emailExiste = response.data.some(user => user.Email === email);

    // Imprima o resultado no console
    console.log(`E-mail ${email} existe na API: ${emailExiste}`);

    // Envie uma resposta adequada para o cliente
    res.status(200).json({ emailExiste });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).send('Ocorreu um erro ao verificar o e-mail.');
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

