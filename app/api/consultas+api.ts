import { dbGet, dbRun } from '../../lib/db';
import crypto from 'crypto';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id_user = url.searchParams.get('id_user');

    if (!id_user) return Response.json({ error: 'id_user não fornecido' }, { status: 400 });

    const result = await dbRun(`
      SELECT c.* 
      FROM consulta c
      JOIN gestacao g ON c.id_gestacao = g.id_gestacao
      WHERE g.id_user = $1 
      ORDER BY c.data ASC, c.horario ASC
    `, [id_user]);
    
    return Response.json({ consultas: result.rows });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_user, data, consulta, horario, local } = body;

    if (!id_user || !data || !consulta || !horario || !local) {
      return Response.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    }

    const id_consulta = crypto.randomUUID();
    
    // Convert dd/mm/yyyy to yyyy-mm-dd if needed, or assume data is correctly formatted
    // Assuming frontend will pass yyyy-mm-dd or we parse it
    // Wait, the DB column is DATE. If frontend sends 'dd/mm/yyyy', we need to convert.
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
      'INSERT INTO consulta (id_consulta, id_gestacao, data, descricao, horario, local) VALUES ($1, $2, $3, $4, $5, $6)',
      [id_consulta, gestacao.id_gestacao, isoDate, consulta, horario, local]
    );

    return Response.json({ message: 'Consulta agendada', id_consulta });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Erro interno' }, { status: 500 });
  }
}
