import { dbGet, dbRun } from '../../lib/db';
import crypto from 'crypto';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id_user = url.searchParams.get('id_user');

    if (!id_user) return Response.json({ error: 'id_user não fornecido' }, { status: 400 });

    const result = await dbRun(`
      SELECT d.* 
      FROM diario d
      JOIN gestacao g ON d.id_gestacao = g.id_gestacao
      WHERE g.id_user = $1 
      ORDER BY d.data DESC
    `, [id_user]);
    
    return Response.json({ diarios: result.rows });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_user, data, reacao, descricao } = body;

    if (!id_user || !data || !reacao || !descricao) {
      return Response.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    }

    const id_diario = crypto.randomUUID();

    let isoDate = data;
    if (data.includes('/')) {
        const [day, month, year] = data.split('/');
        isoDate = `${year}-${month}-${day}`;
    }

    // Obter o id_gestacao mais recente do usuário
    const gestacao = await dbGet('SELECT id_gestacao FROM gestacao WHERE id_user = $1 ORDER BY data_inicio DESC LIMIT 1', [id_user]);
    
    if (!gestacao) {
      return Response.json({ error: 'Nenhuma gestação encontrada para este usuário' }, { status: 400 });
    }

    await dbRun(
      'INSERT INTO diario (id_diario, id_gestacao, data, reacao, descricao) VALUES ($1, $2, $3, $4, $5)',
      [id_diario, gestacao.id_gestacao, isoDate, reacao, descricao]
    );

    return Response.json({ message: 'Registro no diário salvo', id_diario });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Erro interno' }, { status: 500 });
  }
}
