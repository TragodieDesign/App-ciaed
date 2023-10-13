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

app.get('/verificar-email', async (req, res) => {
  try {
    const email = req.query.email;

    // Faça a solicitação GET à API do MSP Backups para verificar o e-mail
    const verificarEmail = await axios.get(
      `https://api.mspbackups.com/api/Users?filter=Email eq '${email}'`
    );

    if (verificarEmail.data.length > 0) {
      // O e-mail já existe na API do MSP Backups
      // Retorne uma resposta informando no formato JSON
      res.status(200).json({ emailJaExiste: true });
    } else {
      // O e-mail não existe na API do MSP Backups
      // Retorne uma resposta informando no formato JSON
      res.status(200).json({ emailJaExiste: false });
    }
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).send('Ocorreu um erro ao verificar o e-mail.');
  }
});

app.post('/rota-de-processamento', async (req, res) => {
  try {
    // Aqui você pode acessar os dados do formulário
    const { nome, sobrenome, email } = req.body;

    // Antes de enviar para a API do MSP Backups, verifique o e-mail
    const verificarEmailResponse = await axios.get(
      `https://ciaed-rota-de-processamento.onrender.com/rota-de-processamento/verificar-email?email=${email}`
    );

    if (verificarEmailResponse.data.emailJaExiste) {
      // O e-mail já existe, você pode lidar com isso aqui
      res.status(200).send('O e-mail fornecido já existe.');
    } else {
      // O e-mail não existe, prossiga com o envio para a API do MSP Backups
      const token = process.env.BEARER_TOKEN; // Use a variável de ambiente
      const url = 'https://api.mspbackups.com/api/Users';

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

      // Solicitação POST para a API do MSP Backups
      const response = await axios.post(url, dadosParaAPI, { headers });

      // Manipule a resposta da API, se necessário
      console.log(response.data);

      res.status(200).send('Dados enviados com sucesso para a API.');
    }
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).send('Ocorreu um erro ao enviar os dados para a API.');
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

