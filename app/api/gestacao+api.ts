import { dbRun, dbGet, initDb } from '../../lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    await initDb();
    
    const body = await req.json();
    const { 
      id_user, 
      primeiraGestacao, 
      qtdBebes, 
      semanas, 
      dpp, 
      bebes,
      nomeGestacao
    } = body;

    if (!id_user) {
      return Response.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    // Verifica se já existe uma gestação ativa
    const activeResult = await dbRun('SELECT id_gestacao FROM gestacao WHERE id_user = $1 AND status = $2', [id_user, 'ativa']);
    if (activeResult.rows && activeResult.rows.length > 0) {
      return Response.json({ error: 'Você já possui uma gestação ativa. Finalize-a antes de criar uma nova.' }, { status: 400 });
    }

    const id_gestacao = crypto.randomUUID();
    const data_inicio = new Date().toISOString().split('T')[0]; // Dia atual
    const nome = nomeGestacao && nomeGestacao.trim() !== '' ? nomeGestacao.trim() : 'Minha Gestação';

    // Formatar DPP de "dd / mm / aaaa" para "yyyy-mm-dd", se existir
    let dppFormatado = null;
    if (dpp && dpp.trim() !== '') {
      const parts = dpp.replace(/\s/g, '').split('/');
      if (parts.length === 3) {
        dppFormatado = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    const aindaNaoDecidiuNomeGeral = bebes && Array.isArray(bebes) 
      ? bebes.some((b: any) => b.aindaNaoDecidiuNome) 
      : false;

    // Insere no banco
    const result = await dbRun(
      `INSERT INTO gestacao (
        id_gestacao, 
        id_user, 
        data_inicio, 
        nome, 
        primeira_gestacao, 
        qtd_bebes, 
        semanas, 
        dpp, 
        nomes_bebes, 
        ainda_nao_decidiu_nome
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id_gestacao`,
      [
        id_gestacao, 
        id_user, 
        data_inicio, 
        nome, 
        primeiraGestacao, 
        qtdBebes, 
        semanas, 
        dppFormatado, 
        null, // nomes_bebes mantido nulo pois agora usamos a tabela filho
        aindaNaoDecidiuNomeGeral
      ]
    );

    // Inserindo na tabela filho
    if (bebes && Array.isArray(bebes)) {
      for (let i = 0; i < bebes.length; i++) {
        const bebe = bebes[i];
        const id_filho = crypto.randomUUID();
        const nomeFilho = (bebe.aindaNaoDecidiuNome || !bebe.nome || bebe.nome.trim() === '') 
           ? `Bebê ${i + 1}` 
           : bebe.nome.trim();
           
        const sexo = bebe.sexo || 'nao_informado';

        await dbRun(
          `INSERT INTO filho (id_filho, id_gestacao, nome, sexo) VALUES ($1, $2, $3, $4)`,
          [id_filho, id_gestacao, nomeFilho, sexo]
        );
      }
    }

    return Response.json(
      { message: 'Gestação cadastrada com sucesso', id_gestacao: result.rows[0].id_gestacao },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await initDb();
    const url = new URL(req.url);
    const id_user = url.searchParams.get('id_user');
    
    if (!id_user) {
      return Response.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    const result = await dbRun(
      'SELECT * FROM gestacao WHERE id_user = $1 ORDER BY data_inicio DESC',
      [id_user]
    );

    const gestacoes = result.rows;

    for (let gestacao of gestacoes) {
      const filhosRes = await dbRun('SELECT * FROM filho WHERE id_gestacao = $1', [gestacao.id_gestacao]);
      gestacao.filhos = filhosRes.rows;
    }

    return Response.json(gestacoes, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await initDb();
    const body = await req.json();
    const { id_gestacao, nome, semanas, dpp, filhos, status } = body;

    if (!id_gestacao) {
      return Response.json({ error: 'ID da gestação é obrigatório' }, { status: 400 });
    }

    // Formatar DPP de "dd / mm / aaaa" para "yyyy-mm-dd", se existir e contiver barras
    let dppFormatado = dpp;
    if (dpp && dpp.includes('/')) {
      const parts = dpp.replace(/\s/g, '').split('/');
      if (parts.length === 3) {
        dppFormatado = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    // Atualiza a gestação
    await dbRun(
      'UPDATE gestacao SET nome = $1, semanas = $2, dpp = $3, status = COALESCE($4, status) WHERE id_gestacao = $5',
      [nome, semanas, dppFormatado, status, id_gestacao]
    );

    // Atualiza os filhos
    if (filhos && Array.isArray(filhos)) {
      for (let filho of filhos) {
        if (filho.id_filho) {
          await dbRun(
            'UPDATE filho SET nome = $1, sexo = $2 WHERE id_filho = $3',
            [filho.nome, filho.sexo || 'nao_informado', filho.id_filho]
          );
        }
      }
    }

    return Response.json({ message: 'Gestação atualizada com sucesso' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
