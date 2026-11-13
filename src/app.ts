import express from 'express';
import cors from 'cors';
import { DatabaseModel } from './model/DatabaseModel.js';

const server = express();
const port = Number(process.env.PORT ?? 3333);
const database = new DatabaseModel();

server.use(cors());
server.use(express.json());

const verificarId = (req: express.Request, res: express.Response): number | null => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ erro: 'ID inválido.' });
        return null;
    }

    return id;
};

server.get('/', async (_req, res) => {
    const conectado = await database.testeConexao();

    res.json({
        mensagem: 'Servidor funcionando!',
        banco: conectado ? 'conectado' : 'desconectado'
    });
});

server.get('/autores', async (_req, res) => {
    try {
        const autores = await database.listarAutores();
        res.json(autores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao listar autores.' });
    }
});

server.get('/autores/:id', async (req, res) => {
    const id = verificarId(req, res);
    if (id === null) return;

    try {
        const autor = await database.buscarAutor(id);

        if (!autor) {
            res.status(404).json({ erro: 'Autor não encontrado.' });
            return;
        }

        res.json(autor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar autor.' });
    }
});

server.post('/autores', async (req, res) => {
    try {
        const { nome, nacionalidade } = req.body;

        if (!nome || typeof nome !== 'string') {
            res.status(400).json({ erro: 'Nome do autor é obrigatório.' });
            return;
        }

        const autor = await database.criarAutor({ nome, nacionalidade });
        res.status(201).json(autor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao criar autor.' });
    }
});

server.put('/autores/:id', async (req, res) => {
    const id = verificarId(req, res);
    if (id === null) return;

    try {
        const autorAtualizado = await database.atualizarAutor(id, req.body);

        if (!autorAtualizado) {
            res.status(404).json({ erro: 'Autor não encontrado.' });
            return;
        }

        res.json(autorAtualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao atualizar autor.' });
    }
});

server.delete('/autores/:id', async (req, res) => {
    const id = verificarId(req, res);
    if (id === null) return;

    try {
        const removido = await database.excluirAutor(id);

        if (!removido) {
            res.status(404).json({ erro: 'Autor não encontrado.' });
            return;
        }

        res.json({ mensagem: 'Autor removido com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao remover autor.' });
    }
});

server.get('/livros', async (_req, res) => {
    try {
        const livros = await database.listarLivros();
        res.json(livros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao listar livros.' });
    }
});

server.get('/livros/:id', async (req, res) => {
    const id = verificarId(req, res);
    if (id === null) return;

    try {
        const livro = await database.buscarLivro(id);

        if (!livro) {
            res.status(404).json({ erro: 'Livro não encontrado.' });
            return;
        }

        res.json(livro);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar livro.' });
    }
});

server.post('/livros', async (req, res) => {
    try {
        const { titulo, ano_publicacao, genero, quantidade, id_autor } = req.body;

        if (!titulo || typeof titulo !== 'string') {
            res.status(400).json({ erro: 'Título do livro é obrigatório.' });
            return;
        }

        if (!id_autor || !Number.isInteger(Number(id_autor))) {
            res.status(400).json({ erro: 'ID do autor é obrigatório.' });
            return;
        }

        const livro = await database.criarLivro({
            titulo,
            ano_publicacao: ano_publicacao ?? null,
            genero: genero ?? null,
            quantidade: quantidade ?? 1,
            id_autor: Number(id_autor)
        });

        res.status(201).json(livro);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao criar livro.' });
    }
});

server.put('/livros/:id', async (req, res) => {
    const id = verificarId(req, res);
    if (id === null) return;

    try {
        const livroAtualizado = await database.atualizarLivro(id, req.body);

        if (!livroAtualizado) {
            res.status(404).json({ erro: 'Livro não encontrado.' });
            return;
        }

        res.json(livroAtualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao atualizar livro.' });
    }
});

server.delete('/livros/:id', async (req, res) => {
    const id = verificarId(req, res);
    if (id === null) return;

    try {
        const removido = await database.excluirLivro(id);

        if (!removido) {
            res.status(404).json({ erro: 'Livro não encontrado.' });
            return;
        }

        res.json({ mensagem: 'Livro removido com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao remover livro.' });
    }
});

server.get('/leitores', async (_req, res) => {
    try {
        const leitores = await database.listarLeitores();
        res.json(leitores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao listar leitores.' });
    }
});

server.get('/leitores/:id', async (req, res) => {
    const id = verificarId(req, res);
    if (id === null) return;

    try {
        const leitor = await database.buscarLeitor(id);

        if (!leitor) {
            res.status(404).json({ erro: 'Leitor não encontrado.' });
            return;
        }

        res.json(leitor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar leitor.' });
    }
});

server.post('/leitores', async (req, res) => {
    try {
        const { nome, email, telefone } = req.body;

        if (!nome || typeof nome !== 'string') {
            res.status(400).json({ erro: 'Nome do leitor é obrigatório.' });
            return;
        }

        if (!email || typeof email !== 'string') {
            res.status(400).json({ erro: 'E-mail do leitor é obrigatório.' });
            return;
        }

        const leitor = await database.criarLeitor({ nome, email, telefone });
        res.status(201).json(leitor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao criar leitor.' });
    }
});

server.put('/leitores/:id', async (req, res) => {
    const id = verificarId(req, res);
    if (id === null) return;

    try {
        const leitorAtualizado = await database.atualizarLeitor(id, req.body);

        if (!leitorAtualizado) {
            res.status(404).json({ erro: 'Leitor não encontrado.' });
            return;
        }

        res.json(leitorAtualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao atualizar leitor.' });
    }
});

server.delete('/leitores/:id', async (req, res) => {
    const id = verificarId(req, res);
    if (id === null) return;

    try {
        const removido = await database.excluirLeitor(id);

        if (!removido) {
            res.status(404).json({ erro: 'Leitor não encontrado.' });
            return;
        }

        res.json({ mensagem: 'Leitor removido com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao remover leitor.' });
    }
});

server.get('/emprestimos', async (_req, res) => {
    try {
        const emprestimos = await database.listarEmprestimos();
        res.json(emprestimos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao listar empréstimos.' });
    }
});

server.get('/emprestimos/:id', async (req, res) => {
    const id = verificarId(req, res);
    if (id === null) return;

    try {
        const emprestimo = await database.buscarEmprestimo(id);

        if (!emprestimo) {
            res.status(404).json({ erro: 'Empréstimo não encontrado.' });
            return;
        }

        res.json(emprestimo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar empréstimo.' });
    }
});

server.post('/emprestimos', async (req, res) => {
    try {
        const { id_livro, id_leitor, data_emprestimo, data_devolucao } = req.body;

        if (!id_livro || !Number.isInteger(Number(id_livro))) {
            res.status(400).json({ erro: 'ID do livro é obrigatório.' });
            return;
        }

        if (!id_leitor || !Number.isInteger(Number(id_leitor))) {
            res.status(400).json({ erro: 'ID do leitor é obrigatório.' });
            return;
        }

        const emprestimo = await database.criarEmprestimo({
            id_livro: Number(id_livro),
            id_leitor: Number(id_leitor),
            data_emprestimo,
            data_devolucao: data_devolucao ?? null
        });

        res.status(201).json(emprestimo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao registrar empréstimo.' });
    }
});

server.put('/emprestimos/:id', async (req, res) => {
    const id = verificarId(req, res);
    if (id === null) return;

    try {
        const emprestimoAtualizado = await database.atualizarEmprestimo(id, req.body);

        if (!emprestimoAtualizado) {
            res.status(404).json({ erro: 'Empréstimo não encontrado.' });
            return;
        }

        res.json(emprestimoAtualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao atualizar empréstimo.' });
    }
});

server.delete('/emprestimos/:id', async (req, res) => {
    const id = verificarId(req, res);
    if (id === null) return;

    try {
        const removido = await database.excluirEmprestimo(id);

        if (!removido) {
            res.status(404).json({ erro: 'Empréstimo não encontrado.' });
            return;
        }

        res.json({ mensagem: 'Empréstimo removido com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao remover empréstimo.' });
    }
});

database.testeConexao().then((resbd) => {
    if (resbd) {
        server.listen(port, () => {
            console.log(`Servidor rodando em http://localhost:${port}`);
        });
    } else {
        console.log('Não foi possível conectar ao banco de dados');
    }
});