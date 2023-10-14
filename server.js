const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
const port = 3000; // Porta do servidor
require('dotenv').config();
const nodemailer = require ('nodemailer');
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
    const usersUrl = 'https://api.mspbackups.com/api/Users';
    const companiesUrl = 'https://api.mspbackups.com/api/Companies';
    const { nome, sobrenome, email, company } = req.body;

    // 1. Crie a empresa
    const empresaHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    const empresaDados = {
      "Name": `CIAED ${company}`,
      "StorageLimit": 536870912000,
      "LicenseSettings": 0,
      "Destinations": [
        {
          "DestinationId": "33b3f17f-5b96-4870-b108-0314d8032e7e"
        }
      ]
    };
    const empresaResponse = await axios.post(companiesUrl, empresaDados, { headers: empresaHeaders });

    if (empresaResponse.status !== 200) {
      res.status(500).send('Erro ao criar a empresa.');
      return;
    }

    // 2. Verifique se o e-mail já existe
    const getUsersResponse = await axios.get(usersUrl, { headers: empresaHeaders });
    if (getUsersResponse.status !== 200) {
      res.status(500).send('Erro ao buscar usuários na API.');
      return;
    }

    const users = getUsersResponse.data;
    const emailExists = users.some(user => user.Email === email);

    if (emailExists) {
      res.status(200).json({ message: 'Este e-mail já foi cadastrado.', emailExists: true });
      return;
    }

    // 3. Crie o novo usuário
    const usuarioHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    const dadosParaAPI = {
      "Email": email,
      "FirstName": nome,
      "LastName": sobrenome,
      "NotificationEmails": [email],
      "Company": `CIAED ${company}`,
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
    const postResponse = await axios.post(usersUrl, dadosParaAPI, { headers: usuarioHeaders });

    if (postResponse.status === 200) {
      res.status(200).json({ message: 'Dados enviados com sucesso para a API.', emailExists: false });
    } else {
      res.status(500).send('Erro ao criar o novo usuário.');
    }
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).send('Ocorreu um erro ao processar os dados.');
  }
});


app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

const user = "teste@os.santacasasbc.org.br"
const pass= "$4g37hOOmB5"

app.get('/send', (req, res)=>{
  const transporter=nodemailer.createTransport({
    host: "artemis.tdnx.net" ,
    port: 465,
    auth: {user:user ,pass:pass}
  })
  transporter.sendMail({
    from:user,
    to:"brunomachado7501@proton.me",
    replyTo:"teste@os.santacasasbc.org.br",
    subject:"teste",
    text:"Teste bem-sucedido"
  }).then(info =>{
    res.send(info)
  }).catch(error=>{
    res.send(error)
  })
})



