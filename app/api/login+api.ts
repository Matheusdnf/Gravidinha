import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbGet, initDb } from '../../lib/db';

const JWT_SECRET = 'gravidinha_secret_key_123';

export async function POST(req: Request) {
  try {
    await initDb();
    
    const body = await req.json();
    const { email, senha } = body;

    if (!email || !senha) {
      return Response.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Formato de e-mail inválido' }, { status: 400 });
    }

    // Busca usuário
    const user = await dbGet('SELECT * FROM "user" WHERE Email = $1', [email]);
    if (!user) {
      return Response.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Checa senha
    const validPassword = await bcrypt.compare(senha, user.password);
    if (!validPassword) {
      return Response.json({ error: 'Senha incorreta' }, { status: 401 });
    }

    // Gera o token de acesso
    const token = jwt.sign({ id: user.id_user, email: user.email || user.Email }, JWT_SECRET, { expiresIn: '7d' });

    return Response.json(
      { message: 'Login realizado com sucesso', token, user: { id: user.id_user, nome: user.name, email: user.email || user.Email, celular: user.cellphone } },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
