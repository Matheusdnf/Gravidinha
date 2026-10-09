// Modo offline de ponta a ponta no app: lib/dados.ts + lib/sync.ts rodando de verdade sobre
// SQLite (node:sqlite) contra um Supabase em memória (testes/fakes.mjs). Rodar com: npm test
import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import AsyncStorage, { servidor } from './testes/fakes.mjs';
import * as dados from './dados.ts';
import { aoAtualizar, aoAvisar, contarPendentes, limparBancoLocal, prepararBancoLocal, sincronizar } from './sync.ts';
import { db } from './db.ts';

let ana;

beforeEach(async () => {
  await limparBancoLocal();
  await AsyncStorage.clear();
  servidor.resetar();
  ana = servidor.criarConta('ana@x.com', 'Ana');
  servidor.logar(ana, 'ana@x.com');
});

const offline = () => {
  servidor.online = false;
};
const online = async () => {
  servidor.online = true;
  await sincronizar();
};

async function comGestacaoAtiva() {
  await prepararBancoLocal(ana);
  const g = await dados.criarGestacao({ semanas: 10, primeiraGestacao: true, bebes: [{ nome: 'Lia', sexo: 'feminino' }] });
  await sincronizar();
  return g;
}

const consulta = (descricao, horario = '9:30') => ({ data: '20/10/2026', consulta: descricao, horario, local: 'Clínica' });

test('consulta criada offline fica pendente e sobe ao reconectar', async () => {
  const g = await comGestacaoAtiva();
  offline();
  await dados.criarConsulta(g.id_gestacao, consulta('Ultrassom'));

  assert.equal(contarPendentes(), 1);
  assert.equal(servidor.linhas('consulta').length, 0);
  assert.equal((await dados.listarConsultas(g.id_gestacao))[0].descricao, 'Ultrassom'); // já aparece offline

  await online();
  assert.equal(contarPendentes(), 0);
  const [c] = servidor.linhas('consulta');
  assert.equal(c.descricao, 'Ultrassom');
  assert.equal(c.data, '2026-10-20');
  assert.equal(c.horario, '09:30:00');
});

test('gestação criada com bebês chega inteira ao servidor', async () => {
  const g = await comGestacaoAtiva();
  assert.equal(servidor.linha('gestacao', g.id_gestacao).status, 'ativa');
  assert.equal(servidor.linha('gestacao', g.id_gestacao).primeira_gestacao, true);
  assert.deepEqual(servidor.linhas('filho').map((f) => f.nome), ['Lia']);
  assert.equal(g.filhos.length, 1);
});

test('excluir consulta offline vira deleted_at no servidor', async () => {
  const g = await comGestacaoAtiva();
  await dados.criarConsulta(g.id_gestacao, consulta('Pré-natal'));
  await sincronizar();
  const [c] = servidor.linhas('consulta');

  offline();
  await dados.excluirConsulta(c.id_consulta);
  assert.deepEqual(await dados.listarConsultas(g.id_gestacao), []);

  await online();
  assert.ok(servidor.linha('consulta', c.id_consulta).deleted_at);
});

test('edição feita em outro aparelho chega pelo pull e avisa as telas', async () => {
  const g = await comGestacaoAtiva();
  await dados.criarConsulta(g.id_gestacao, consulta('Pré-natal'));
  await sincronizar();
  const [c] = servidor.linhas('consulta');

  let recargas = 0;
  const parar = aoAtualizar(() => recargas++);
  servidor.editarDireto('consulta', c.id_consulta, { descricao: 'Pré-natal (remarcado)' });
  await sincronizar();
  await sincronizar(); // nada novo: não recarrega de novo
  parar();

  assert.equal((await dados.listarConsultas(g.id_gestacao))[0].descricao, 'Pré-natal (remarcado)');
  assert.equal(recargas, 1);
});

test('o eco do próprio envio não recarrega as telas', async () => {
  const g = await comGestacaoAtiva();
  let recargas = 0;
  const parar = aoAtualizar(() => recargas++);
  await dados.criarConsulta(g.id_gestacao, consulta('Pré-natal'));
  await sincronizar();
  parar();
  assert.equal(recargas, 0);
});

test('consulta criada offline antes de finalizar a gestação não se perde', async () => {
  const a = await comGestacaoAtiva();
  offline();
  await dados.criarConsulta(a.id_gestacao, consulta('Última consulta'));
  await dados.atualizarGestacao({ id_gestacao: a.id_gestacao, nome: a.nome, semanas: a.semanas, status: 'finalizada' });
  await new Promise((r) => setTimeout(r, 5)); // horários locais distintos: a ordem do envio importa
  const b = await dados.criarGestacao({ semanas: 4, primeiraGestacao: false });

  let avisos = [];
  const parar = aoAvisar((x) => (avisos = x));
  await online();
  parar();

  assert.deepEqual(avisos, []);
  assert.equal(contarPendentes(), 0);
  assert.equal(servidor.linha('gestacao', a.id_gestacao).status, 'finalizada');
  assert.equal(servidor.linha('gestacao', b.id_gestacao).status, 'ativa');
  assert.deepEqual(servidor.linhas('consulta').map((c) => c.descricao), ['Última consulta']);
});

test('pull não sobrescreve edição local ainda não enviada', async () => {
  const g = await comGestacaoAtiva();
  await dados.criarConsulta(g.id_gestacao, consulta('Original'));
  await sincronizar();
  const [c] = servidor.linhas('consulta');

  servidor.falharEscrita = true; // o envio falha, mas o pull roda
  await dados.atualizarConsulta(c.id_consulta, consulta('Editada aqui'));
  servidor.editarDireto('consulta', c.id_consulta, { descricao: 'Editada no tablet' });
  await sincronizar();

  assert.equal((await dados.listarConsultas(g.id_gestacao))[0].descricao, 'Editada aqui');
  assert.equal(contarPendentes(), 1);

  servidor.falharEscrita = false;
  await sincronizar();
  assert.equal(servidor.linha('consulta', c.id_consulta).descricao, 'Editada aqui'); // última gravação vence
});

test('erro em uma linha não trava o envio das outras', async () => {
  const g = await comGestacaoAtiva();
  offline();
  await dados.criarConsulta(g.id_gestacao, consulta('Com problema', '08:00'));
  await dados.criarConsulta(g.id_gestacao, consulta('Normal', '10:00'));
  const [ruim] = await dados.listarConsultas(g.id_gestacao);
  servidor.erroPara.add(ruim.id_consulta);

  await online();
  assert.deepEqual(servidor.linhas('consulta').map((c) => c.descricao), ['Normal']);
  assert.equal(contarPendentes(), 1); // a com problema continua guardada para tentar de novo
});

test('gestação ativa criada em outro aparelho vence a criada offline', async () => {
  await prepararBancoLocal(ana);
  offline();
  await dados.criarGestacao({ semanas: 8, primeiraGestacao: true });
  servidor.inserirDireto('gestacao', {
    id_gestacao: 'g-tablet', id_user: ana, nome: 'Do tablet', status: 'ativa', data_inicio: '2026-10-01', semanas: 5,
  });

  let avisos = [];
  const parar = aoAvisar((x) => (avisos = x));
  await online();
  parar();

  assert.equal(avisos.length, 1);
  assert.match(avisos[0], /já existe uma gestação ativa/);
  assert.deepEqual((await dados.listarGestacoes()).map((g) => g.id_gestacao), ['g-tablet']);
  assert.equal(contarPendentes(), 0);
});

test('regra local: não cria consulta em gestação finalizada nem segunda gestação ativa', async () => {
  const g = await comGestacaoAtiva();
  await assert.rejects(dados.criarGestacao({ semanas: 1, primeiraGestacao: false }), /já possui uma gestação ativa/);
  await dados.atualizarGestacao({ id_gestacao: g.id_gestacao, nome: g.nome, semanas: g.semanas, status: 'finalizada' });
  await assert.rejects(dados.criarConsulta(g.id_gestacao, consulta('X')), /Gestação finalizada/);
  await assert.rejects(
    dados.criarDiario({ id_gestacao: g.id_gestacao, data: '20/10/2026', reacao: 'feliz', descricao: 'X' }),
    /Gestação finalizada/,
  );
});

test('outra conta no mesmo aparelho não vê os dados da anterior', async () => {
  await comGestacaoAtiva();
  await limparBancoLocal(); // logout
  // Sync atrasado regravou uma linha da Ana depois da limpeza
  await db.runAsync("INSERT INTO gestacao (id_gestacao, id_user, nome, status) VALUES ('velha', ?, 'Da Ana', 'ativa')", ana);

  const bia = servidor.criarConta('bia@x.com', 'Bia');
  const user = await dados.entrar('bia@x.com', 'qualquer');

  assert.equal(user.id, bia);
  assert.equal(user.nome, 'Bia');
  assert.deepEqual(await dados.listarGestacoes(), []);
});

test('token vencido sem internet: o app continua lendo e gravando', async () => {
  await comGestacaoAtiva();
  await AsyncStorage.setItem('gravidinha_user', JSON.stringify({ id: ana, nome: 'Ana', email: 'ana@x.com' }));
  offline();
  servidor.sessao = null; // getSession() vem vazio quando a renovação falha offline

  await dados.atualizarUsuario({ nome: 'Ana Maria' });
  const u = await dados.buscarUsuario();
  assert.equal(u.nome, 'Ana Maria');
  assert.equal(u.email, 'ana@x.com');

  servidor.logar(ana, 'ana@x.com'); // voltou a internet e renovou o token
  await online();
  assert.equal(servidor.linha('usuario', ana).name, 'Ana Maria');
});
