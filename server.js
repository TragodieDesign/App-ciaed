const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000; // Porta do servidor
require('dotenv').config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/rota-de-processamento', async (req, res) => {
  try {
    const token = process.env.BEARER_TOKEN; // Use a variável de ambiente

    const url = 'https://api.mspbackups.com/api/Users';

    // Você pode incluir parâmetros de consulta no URL, se necessário
    const queryParams = {
      parametro1: 'valor1',
      parametro2: 'valor2'
    };

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const response = await axios.get(url, { params: queryParams, headers });

    const dadosDaAPI = response.data; // Dados da API

    console.log(dadosDaAPI); // Imprime os dados no console do servidor

    res.status(200).json({
      message: 'Conexão com a API bem-sucedida.',
      data: dadosDaAPI // Envia os dados como parte da resposta HTTP
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).send('Ocorreu um erro ao conectar à API.');
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

