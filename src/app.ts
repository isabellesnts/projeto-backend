import express from 'express';
import cors from 'cors';
import { DatabaseModel } from './model/DatabaseModel.js';

const server = express();
const port = 3333;

server.use(cors());
server.use(express.json());

server.get('/', (req, res) => {
    res.json({ mensagem: 'Servidor funcionando!' });
});

new DatabaseModel().testeConexao().then((resbd) => {
    if (resbd) {
        server.listen(port, () => {
            console.log(`Servidor rodando em http://localhost:${port}`);
        });
    } else {
        console.log('Não foi possível conectar ao banco de dados');
    }
});