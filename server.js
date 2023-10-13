const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
const port = 3000; // Porta do servidor
require('dotenv').config();
app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://www.nublify.com/ciaed');
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
          PackageID: 0,
        },
      ],
      SendEmailInstruction: true,
      LicenseManagmentMode: 0,
    };

    // Configuração dos cabeçalhos com autenticação Bearer
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Aqui você pode fazer a verificação do e-mail via fetch
    const verificarEmail = await axios.get(
      `https://seuservidor/verificar-email?email=${email}`
    );

    if (verificarEmail.data.emailJaExiste) {
      // E-mail já existe, retorne uma mensagem apropriada ao formulário
      res.status(400).send('O e-mail fornecido já existe.');
    } else {
      // E-mail não existe, então você pode enviar os dados à API
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

app.get('/verificar-email', async (req, res) => {
  try {
    const token = process.env.BEARER_TOKEN; // Use a variável de ambiente
    const email = req.query.email;
    const url = `https://api.mspbackups.com/api/Users?Email=${email}`;

    // Aqui você faz a solicitação GET para verificar se o e-mail já existe na API

    const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });

    // Verifique a resposta e determine se o e-mail já existe
    const emailJaExiste = response.data.length > 0;

    // Retorne a resposta como JSON
    res.json({ emailJaExiste });
  } catch (error) {
    console.error('Erro na verificação de e-mail:', error);
    res.status(500).json({ emailJaExiste: false }); // Considere que o e-mail não existe em caso de erro
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
