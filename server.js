const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
const port = 3000; // Porta do servidor
require('dotenv').config();
app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin:*");

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

    // Realiza a requisição GET à API para buscar os usuários
    const getUsersResponse = await axios.get(url, { headers });

    // Verifica se a resposta da requisição GET foi bem-sucedida
    if (getUsersResponse.status === 200) {
      const users = getUsersResponse.data;

      // Verifica se o e-mail já existe na lista de usuários
      const emailExists = users.some(user => user.Email === email);

      if (emailExists) {
        res.status(200).send('Este e-mail já foi cadastrado.');
      } else {
        // Se o e-mail não existe, continue com o envio para a API
        const postResponse = await axios.post(url, dadosParaAPI, { headers });

        // Manipule a resposta da API, se necessário
        console.log(postResponse.data);

        res.status(200).send('Dados enviados com sucesso para a API.');
      }
    } else {
      res.status(500).send('Erro ao buscar usuários na API.');
    }
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).send('Ocorreu um erro ao enviar os dados para a API.');
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

