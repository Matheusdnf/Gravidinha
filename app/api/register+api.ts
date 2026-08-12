import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbGet, dbRun, initDb } from '../../lib/db';
import crypto from 'crypto';

const JWT_SECRET = 'gravidinha_secret_key_123';

export async function POST(req: Request) {
  try {
    await initDb();
    
    const body = await req.json();
    const { nome, email, senha, celular } = body;

    if (!nome || !email || !senha || !celular) {
      return Response.json({ error: 'Nome, email, senha e celular são obrigatórios' }, { status: 400 });
    }

    if (nome.trim().length < 3) {
      return Response.json({ error: 'O nome deve ter no mínimo 3 caracteres' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Formato de e-mail inválido' }, { status: 400 });
    }

    if (senha.length < 8) {
      return Response.json({ error: 'A senha deve ter no mínimo 8 caracteres' }, { status: 400 });
    }

    const celularNumeros = celular.replace(/\D/g, '');
    if (celularNumeros.length < 10 || celularNumeros.length > 11) {
      return Response.json({ error: 'Número de celular inválido' }, { status: 400 });
    }

    // Verifica se já existe
    const existingUser = await dbGet('SELECT * FROM "user" WHERE Email = $1', [email]);
    if (existingUser) {
      return Response.json({ error: 'Este e-mail já está em uso' }, { status: 400 });
    }

    // Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);

    // Gera UUID e parse do celular
    const id_user = crypto.randomUUID();
    const cellphone = parseInt(celularNumeros);

    // Insere no banco
    const result = await dbRun(
      'INSERT INTO "user" (id_user, name, cellphone, Email, password) VALUES ($1, $2, $3, $4, $5) RETURNING id_user',
      [id_user, nome, cellphone, email, hashedPassword]
    );

    const insertedId = result.rows[0].id_user;

    // Gera o token de acesso
    const token = jwt.sign({ id: insertedId, email }, JWT_SECRET, { expiresIn: '7d' });

    return Response.json(
      { message: 'Usuário cadastrado', token, user: { id: insertedId, nome, email, celular: cellphone.toString() } },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
