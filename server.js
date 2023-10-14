const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
const port = 3000; // Porta do servidor
require('dotenv').config();
const nodemailer = require('nodemailer');
app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
      'Content-Type': 'application/json',
    }; // Verifique se a empresa já existe
    const empresaExisteResponse = await axios.get(companiesUrl, { headers: empresaHeaders });
    if (empresaExisteResponse.status === 200) {
      const empresas = empresaExisteResponse.data;
      const empresaJaExiste = empresas.some(empresa => empresa.Name === `CIAED ${company}`);
    
      if (!empresaJaExiste) {
        // A empresa não existe, crie-a
        const empresaDados = {
          // ... (seu código para criar a empresa)
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
      }
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
      'Content-Type': 'application/json',
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
      // Enviar email de resposta
      const email = req.body.email; // Coleta o email do formulário
      const user = process.env.NODEMAILER_EMAIL; // Substitua pelo seu email
      const pass = process.env.NODEMAILER_PASSWORD; // Substitua pela sua senha

      const transporter = nodemailer.createTransport({
        host: process.env.NODEMAILER_HOST ,
        port: process.env.NODEMAILER_PORT,
        auth: {
          user: user,
          pass: pass,
        },
      });

      transporter.sendMail({
        from: user,
        to: email, // Use o email coletado anteriormente
        replyTo: 'teste@os.santacasasbc.org.br',
        subject: 'Cadastro bem-sucedido',
        html: `<!doctype html>
        <html>
  <body>
    <table cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td>
          <p style="font-family: Verdana;   font-size: 12px;   FONT-WEIGHT: normal;   COLOR: #242c3b;   TEXT-DECORATION: none">
            Olá, %USERNAME%. Seja bem-vindo(a)!</p>
          <p style="font-family: Verdana;   font-size: 12px;   FONT-WEIGHT: normal;   COLOR: #242c3b;   TEXT-DECORATION: none">
			Esta mensagem contém seu acesso gratuito ao <b>NubliSafety</b>, software de Backup em Nuvem da <b>Nublify</b>.</p>
<p style="font-family: Verdana;   font-size: 12px;   FONT-WEIGHT: normal;   COLOR: #242c3b;   TEXT-DECORATION: none">
Você terá acesso gratuíto a uma plataforma completa de backup on-line por 15 dias com 500GB de espaço!
</p>
        <p style="font-family: Verdana;   font-size: 12px;   FONT-WEIGHT: normal;   COLOR: #242c3b;   TEXT-DECORATION: none">
			Para acessar sua conta de backup online, utilize as informações abaixo:<br/><br/>
			Login: <b>%EMAIL%</b><br/>
			Password: <b>%PASSWORD%</b><br/><br>
			(Você pode alterar a senha no próprio produto, quando quiser).<br/></p>          
			
		<p style="font-family: Verdana;   font-size: 12px;   FONT-WEIGHT: normal;   COLOR: #242c3b;   TEXT-DECORATION: none">
            . Baixe a versão <a href="https://s3.amazonaws.com/cb_setups/MBS/12C51D41-8DC7-4C2F-90B1-5178391BB1E7/mac_Nublify_NublifyBackup_v4.1.2.258_20230612182722_12c51d41-8dc7-4c2f-90b1-5178391bb1e7.pkg">macOS</a> do produto. 4.1.2.258.
        </p>
		<p style="font-family: Verdana;   font-size: 12px;   FONT-WEIGHT: normal;   COLOR: #242c3b;   TEXT-DECORATION: none">
            . Baixe a versão <a href="https://s3.amazonaws.com/cb_setups/MBS/12C51D41-8DC7-4C2F-90B1-5178391BB1E7/Brands/D7E1D238-1914-4E16-A66E-677377A72154/NublifyNublifyBackup_v7.9.0.401_VMWARE_Setup.exe">Windows</a> do produto. 7.9.0.401.
        </p>
         
        <p style="font-family: Verdana;   font-size: 12px;   FONT-WEIGHT: normal;   COLOR: #242c3b;   TEXT-DECORATION: none">
            . Baixe a versão <a href="https://s3.amazonaws.com/cb_setups/MBS/12C51D41-8DC7-4C2F-90B1-5178391BB1E7/Brands/D7E1D238-1914-4E16-A66E-677377A72154/NublifyNublifyBackup_v7.9.0.401_VMWARE_Setup.exe">VMWare Virtual Machine</a> do produto. 7.9.0.401.
        </p>
        
        <p style="font-family: Verdana;   font-size: 12px;   FONT-WEIGHT: normal;   COLOR: #242c3b;   TEXT-DECORATION: none">
            . Baixe a versão <a href="https://s3.amazonaws.com/cb_setups/MBS/12C51D41-8DC7-4C2F-90B1-5178391BB1E7/rh6_Nublify_NublifyBackup_v4.1.4.709_20230912021639.rpm">Linux (RPM)</a> do produto. 4.1.4.709.
        </p>
        
        <p style="font-family: Verdana;   font-size: 12px;   FONT-WEIGHT: normal;   COLOR: #242c3b;   TEXT-DECORATION: none">
            . Baixe a versão <a href="https://s3.amazonaws.com/cb_setups/MBS/12C51D41-8DC7-4C2F-90B1-5178391BB1E7/ubuntu14_Nublify_NublifyBackup_v4.1.2.258_20230612195558.deb">Linux (DEB)</a> do produto. 4.1.2.258.
        </p>
        
        <p style="font-family: Verdana;   font-size: 12px;   FONT-WEIGHT: normal;   COLOR: #242c3b;   TEXT-DECORATION: none">
            Caso tenha dúvidas sobre a utilização do produto. Baixe o <a href="https://drive.google.com/file/d/1Sar2_Gag5CGFrlmASDHtKk_Zt9AXJgGl/view?usp=sharing" target="_blank">Manual do Usuário</a>.
        </p>

        <p style="font-family: Verdana;   font-size: 12px;   FONT-WEIGHT: normal;   COLOR: #242c3b;   TEXT-DECORATION: none">
		    Em caso de problemas com a solução, contate-nos pelo e-mail: <a style="font-family: Verdana; font-size: 12px; FONT-WEIGHT: normal; COLOR: #ef6b00; TEXT-DECORATION: underline" href="mailto:suporte@nublify.com.">suporte@nublify.com</a>.
		</p>
          <p style="font-family: Verdana;   font-size: 12px;   FONT-WEIGHT: normal;   COLOR: #242c3b;   TEXT-DECORATION: none">
			Se você recebeu esta mensagem por engano e/ou não quer utilizar a NubliSafety, desconsidere esse email.
		  </p>
          <p style="font-family: Verdana;   font-size: 12px;   FONT-WEIGHT: bold;   COLOR: #242c3b;   TEXT-DECORATION: none">
			Obrigado!, <br/>Time Nublify.
		  </p>
        </td>
      </tr>
    </table>
  </body>
</html>
        
        
        `
        
        
        
        ,
      })
        .then(info => {
          console.log('Email de resposta enviado:');
        })
        .catch(error => {
          console.error('Erro ao enviar email de resposta:', error);
        });

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

