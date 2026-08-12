import { dbGet, dbRun } from '../../lib/db';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) return Response.json({ error: 'ID não fornecido' }, { status: 400 });

    const user = await dbGet('SELECT * FROM "user" WHERE id_user = $1', [id]);
    if (!user) return Response.json({ error: 'Usuário não encontrado' }, { status: 404 });

    return Response.json({ 
      id: user.id_user, 
      nome: user.name, 
      email: user.email || user.Email, 
      celular: user.cellphone 
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, nome, celular } = body;

    if (!id || !nome || !celular) {
      return Response.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    }

    const celularLimpo = celular ? celular.replace(/\D/g, '') : '';
    const cellphone = celularLimpo ? parseInt(celularLimpo) : 0;

    await dbRun(
      'UPDATE "user" SET name = $1, cellphone = $2 WHERE id_user = $3',
      [nome, cellphone, id]
    );

    return Response.json({ message: 'Atualizado com sucesso' });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Erro interno' }, { status: 500 });
  }
}
