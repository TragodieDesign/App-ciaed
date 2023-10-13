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
    const token = process.env.BEARER_TOKEN;
    const url = 'https://api.mspbackups.com/api/Users';
    const { nome, sobrenome, email } = req.body;

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

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const response = await axios.post(url, dadosParaAPI, { headers });

    console.log(response.data);

    const getUsersResponse = await axios.get(url, { headers });

    if (getUsersResponse.status === 200) {
      const users = getUsersResponse.data;

      const emailExists = users.some(user => user.Email === email);

      if (emailExists) {
        res.status(200).json({ message: 'Este e-mail já foi cadastrado.', emailExists: true });
      } else {
        const postResponse = await axios.post(url, dadosParaAPI, { headers });

        console.log(postResponse.data);

        res.status(200).json({ message: 'Dados enviados com sucesso para a API.', emailExists: false });
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

