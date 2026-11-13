import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export class DatabaseModel {
    private _config: pg.PoolConfig;
    private _pool: pg.Pool;

    constructor() {
        this._config = {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: Number(process.env.DB_PORT ?? 5432),
            max: 10,
            idleTimeoutMillis: 10000
        };

        this._pool = new pg.Pool(this._config);
    }

    public async testeConexao(): Promise<boolean> {
        try {
            const client = await this._pool.connect();
            await client.query('SELECT 1');
            client.release();
            console.log('Database connected!');
            return true;
        } catch (error) {
            console.log('Error to connect database X(');
            console.log(error);
            return false;
        }
    }

    private async query<T extends pg.QueryResultRow>(sql: string, params: unknown[] = []): Promise<T[]> {
        const client = await this._pool.connect();

        try {
            const result = await client.query<T>(sql, params);
            return result.rows;
        } finally {
            client.release();
        }
    }

    private async queryOne<T extends pg.QueryResultRow>(sql: string, params: unknown[] = []): Promise<T | null> {
        const rows = await this.query<T>(sql, params);
        return rows[0] ?? null;
    }

    public async listarAutores(): Promise<any[]> {
        return this.query<any>('SELECT * FROM autores ORDER BY id_autor ASC');
    }

    public async buscarAutor(id: number): Promise<any | null> {
        return this.queryOne<any>('SELECT * FROM autores WHERE id_autor = $1', [id]);
    }

    public async criarAutor(dados: { nome: string; nacionalidade?: string | null }): Promise<any | null> {
        const { nome, nacionalidade } = dados;
        return this.queryOne<any>(
            'INSERT INTO autores (nome, nacionalidade) VALUES ($1, $2) RETURNING *',
            [nome, nacionalidade ?? null]
        );
    }

    public async atualizarAutor(id: number, dados: { nome?: string; nacionalidade?: string | null }): Promise<any | null> {
        const { nome, nacionalidade } = dados;
        return this.queryOne<any>(
            `UPDATE autores
             SET nome = COALESCE($1, nome),
                 nacionalidade = COALESCE($2, nacionalidade)
             WHERE id_autor = $3
             RETURNING *`,
            [nome ?? null, nacionalidade ?? null, id]
        );
    }

    public async excluirAutor(id: number): Promise<boolean> {
        const result = await this.query<any>('DELETE FROM autores WHERE id_autor = $1 RETURNING id_autor', [id]);
        return result.length > 0;
    }

    public async listarLivros(): Promise<any[]> {
        return this.query<any>(`
            SELECT l.*, a.nome AS nome_autor
            FROM livros l
            INNER JOIN autores a ON a.id_autor = l.id_autor
            ORDER BY l.id_livro ASC
        `);
    }

    public async buscarLivro(id: number): Promise<any | null> {
        return this.queryOne<any>(`
            SELECT l.*, a.nome AS nome_autor
            FROM livros l
            INNER JOIN autores a ON a.id_autor = l.id_autor
            WHERE l.id_livro = $1
        `, [id]);
    }

    public async criarLivro(dados: { titulo: string; ano_publicacao?: number | null; genero?: string | null; quantidade?: number; id_autor: number }): Promise<any | null> {
        const { titulo, ano_publicacao, genero, quantidade, id_autor } = dados;
        return this.queryOne<any>(
            `INSERT INTO livros (titulo, ano_publicacao, genero, quantidade, id_autor)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [titulo, ano_publicacao ?? null, genero ?? null, quantidade ?? 1, id_autor]
        );
    }

    public async atualizarLivro(id: number, dados: { titulo?: string; ano_publicacao?: number | null; genero?: string | null; quantidade?: number; id_autor?: number }): Promise<any | null> {
        const { titulo, ano_publicacao, genero, quantidade, id_autor } = dados;
        return this.queryOne<any>(
            `UPDATE livros
             SET titulo = COALESCE($1, titulo),
                 ano_publicacao = COALESCE($2, ano_publicacao),
                 genero = COALESCE($3, genero),
                 quantidade = COALESCE($4, quantidade),
                 id_autor = COALESCE($5, id_autor)
             WHERE id_livro = $6
             RETURNING *`,
            [titulo ?? null, ano_publicacao ?? null, genero ?? null, quantidade ?? null, id_autor ?? null, id]
        );
    }

    public async excluirLivro(id: number): Promise<boolean> {
        const result = await this.query<any>('DELETE FROM livros WHERE id_livro = $1 RETURNING id_livro', [id]);
        return result.length > 0;
    }

    public async listarLeitores(): Promise<any[]> {
        return this.query<any>('SELECT * FROM leitores ORDER BY id_leitor ASC');
    }

    public async buscarLeitor(id: number): Promise<any | null> {
        return this.queryOne<any>('SELECT * FROM leitores WHERE id_leitor = $1', [id]);
    }

    public async criarLeitor(dados: { nome: string; email: string; telefone?: string | null }): Promise<any | null> {
        const { nome, email, telefone } = dados;
        return this.queryOne<any>(
            'INSERT INTO leitores (nome, email, telefone) VALUES ($1, $2, $3) RETURNING *',
            [nome, email, telefone ?? null]
        );
    }

    public async atualizarLeitor(id: number, dados: { nome?: string; email?: string; telefone?: string | null }): Promise<any | null> {
        const { nome, email, telefone } = dados;
        return this.queryOne<any>(
            `UPDATE leitores
             SET nome = COALESCE($1, nome),
                 email = COALESCE($2, email),
                 telefone = COALESCE($3, telefone)
             WHERE id_leitor = $4
             RETURNING *`,
            [nome ?? null, email ?? null, telefone ?? null, id]
        );
    }

    public async excluirLeitor(id: number): Promise<boolean> {
        const result = await this.query<any>('DELETE FROM leitores WHERE id_leitor = $1 RETURNING id_leitor', [id]);
        return result.length > 0;
    }

    public async listarEmprestimos(): Promise<any[]> {
        return this.query<any>(`
            SELECT e.*, l.titulo AS titulo_livro, le.nome AS nome_leitor
            FROM emprestimos e
            INNER JOIN livros l ON l.id_livro = e.id_livro
            INNER JOIN leitores le ON le.id_leitor = e.id_leitor
            ORDER BY e.id_emprestimo ASC
        `);
    }

    public async buscarEmprestimo(id: number): Promise<any | null> {
        return this.queryOne<any>(`
            SELECT e.*, l.titulo AS titulo_livro, le.nome AS nome_leitor
            FROM emprestimos e
            INNER JOIN livros l ON l.id_livro = e.id_livro
            INNER JOIN leitores le ON le.id_leitor = e.id_leitor
            WHERE e.id_emprestimo = $1
        `, [id]);
    }

    public async criarEmprestimo(dados: { id_livro: number; id_leitor: number; data_emprestimo?: string; data_devolucao?: string | null }): Promise<any | null> {
        const { id_livro, id_leitor, data_emprestimo, data_devolucao } = dados;
        return this.queryOne<any>(
            `INSERT INTO emprestimos (id_livro, id_leitor, data_emprestimo, data_devolucao)
             VALUES ($1, $2, COALESCE($3, CURRENT_DATE), $4)
             RETURNING *`,
            [id_livro, id_leitor, data_emprestimo ?? null, data_devolucao ?? null]
        );
    }

    public async atualizarEmprestimo(id: number, dados: { id_livro?: number; id_leitor?: number; data_emprestimo?: string; data_devolucao?: string | null }): Promise<any | null> {
        const { id_livro, id_leitor, data_emprestimo, data_devolucao } = dados;
        return this.queryOne<any>(
            `UPDATE emprestimos
             SET id_livro = COALESCE($1, id_livro),
                 id_leitor = COALESCE($2, id_leitor),
                 data_emprestimo = COALESCE($3, data_emprestimo),
                 data_devolucao = COALESCE($4, data_devolucao)
             WHERE id_emprestimo = $5
             RETURNING *`,
            [id_livro ?? null, id_leitor ?? null, data_emprestimo ?? null, data_devolucao ?? null, id]
        );
    }

    public async excluirEmprestimo(id: number): Promise<boolean> {
        const result = await this.query<any>('DELETE FROM emprestimos WHERE id_emprestimo = $1 RETURNING id_emprestimo', [id]);
        return result.length > 0;
    }

    public get pool() {
        return this._pool;
    }
}