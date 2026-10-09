// Acesso a dados do app, direto no Supabase (substitui as antigas rotas app/api).
// Não filtra por usuário aqui: o RLS do banco só devolve/aceita linhas da usuária logada.
// Toda função lança Error com mensagem pronta para exibir em Alert.
import { supabase } from './supabase';
import { calcularSemanaAtual, hojeISO, paraISO } from './gestacao';
import sintDb from '../sint_db.json';
import { User } from '../types/auth';

// Códigos do Postgres que viram mensagem específica
const DUPLICADO = '23505'; // uq_gestacao_ativa
const BLOQUEADO_RLS = '42501'; // insert em gestação finalizada

function checar<T>(
  { data, error }: { data: T; error: { code?: string } | null },
  mensagem: string,
  porCodigo: Record<string, string> = {},
): NonNullable<T> {
  if (error) {
    console.error(error);
    throw new Error(porCodigo[error.code ?? ''] ?? mensagem);
  }
  return data as NonNullable<T>;
}

async function meuId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error('Sessão expirada. Entre novamente.');
  return data.session.user.id;
}

// ---------------------------------------------------------------------------
// Conta
// ---------------------------------------------------------------------------

export async function buscarUsuario(): Promise<User & { profile_image: string | null }> {
  const { data } = await supabase.auth.getSession();
  const u = checar(await supabase.from('usuario').select('*').single(), 'Erro ao carregar o perfil.');
  return {
    id: u.id_user,
    nome: u.name,
    email: data.session?.user.email ?? '',
    celular: String(u.cellphone),
    profile_image: u.profile_image,
  };
}

// Usuário da sessão, sem a foto (o base64 não deve ir para o cache do AsyncStorage)
async function usuarioDaSessao(): Promise<User> {
  const { profile_image, ...user } = await buscarUsuario();
  return user;
}

export async function entrar(email: string, senha: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha });
  if (error) {
    // Mesma mensagem para e-mail inexistente e senha errada, para não revelar quais e-mails existem
    if (error.code === 'invalid_credentials') throw new Error('E-mail ou senha incorretos');
    if (error.code === 'email_not_confirmed') throw new Error('Confirme seu e-mail antes de entrar.');
    console.error(error);
    throw new Error('Ocorreu um erro ao fazer login.');
  }
  return usuarioDaSessao();
}

// dataNascimento em "aaaa-mm-dd". O perfil (tabela usuario) é criado por trigger a partir de options.data.
export async function cadastrar(d: { nome: string; email: string; senha: string; celular: string; dataNascimento: string }) {
  const { data, error } = await supabase.auth.signUp({
    email: d.email.trim().toLowerCase(),
    password: d.senha,
    options: {
      data: { name: d.nome.trim(), cellphone: d.celular.replace(/\D/g, ''), data_nascimento: d.dataNascimento },
    },
  });
  if (error) {
    if (error.code === 'user_already_exists' || error.code === 'email_exists') throw new Error('Este e-mail já está em uso');
    if (error.code === 'weak_password') throw new Error('Senha fraca. Use no mínimo 8 caracteres.');
    console.error(error);
    throw new Error('Erro ao realizar o cadastro do usuário.');
  }
  // Sem sessão = o projeto exige confirmação de e-mail (Auth > Providers > Email > Confirm email)
  if (!data.session) throw new Error('Cadastro criado. Confirme seu e-mail e depois entre no app.');
  return usuarioDaSessao();
}

// Atualização parcial: só altera os campos enviados (a foto vai sozinha, sem reenviar o resto)
export async function atualizarUsuario(d: { nome?: string; celular?: string; profile_image?: string }) {
  const patch: Record<string, unknown> = {};
  if (d.nome !== undefined) {
    if (d.nome.trim() === '') throw new Error('O nome não pode ficar vazio');
    patch.name = d.nome.trim();
  }
  if (d.celular !== undefined) {
    const celular = d.celular.replace(/\D/g, '');
    if (celular.length < 10 || celular.length > 11) throw new Error('Número de celular inválido');
    patch.cellphone = Number(celular);
  }
  if (d.profile_image !== undefined) patch.profile_image = d.profile_image;

  checar(await supabase.from('usuario').update(patch).eq('id_user', await meuId()), 'Erro ao atualizar dados.');
}

// ---------------------------------------------------------------------------
// Gestação
// ---------------------------------------------------------------------------

const GESTACAO_COM_FILHOS = '*, filhos:filho(*)';

export async function listarGestacoes() {
  return checar(
    await supabase
      .from('gestacao')
      .select(GESTACAO_COM_FILHOS)
      .order('data_inicio', { ascending: false })
      .order('nome', { referencedTable: 'filhos' }),
    'Erro ao carregar os dados da gestação.',
  );
}

export async function criarGestacao(d: {
  nomeGestacao?: string;
  semanas: number;
  dpp?: string | null;
  primeiraGestacao: boolean;
  qtdBebes?: string;
  bebes?: { nome?: string; sexo?: string; aindaNaoDecidiuNome?: boolean }[];
}) {
  const bebes = d.bebes ?? [];
  const id = checar(
    await supabase.rpc('criar_gestacao', {
      p_nome: d.nomeGestacao?.trim() || 'Minha Gestação',
      p_data_inicio: hojeISO(),
      p_primeira_gestacao: d.primeiraGestacao,
      p_qtd_bebes: d.qtdBebes ?? null,
      p_semanas: d.semanas,
      p_dpp: paraISO(d.dpp),
      p_ainda_nao_decidiu_nome: bebes.some((b) => b.aindaNaoDecidiuNome),
      p_filhos: bebes.map((b, i) => ({
        nome: b.aindaNaoDecidiuNome || !b.nome?.trim() ? `Bebê ${i + 1}` : b.nome.trim(),
        sexo: b.sexo || 'nao_informado',
      })),
    }),
    'Não foi possível salvar os dados da gestação.',
    { [DUPLICADO]: 'Você já possui uma gestação ativa. Finalize-a antes de criar uma nova.' },
  );

  // Devolve a gestação completa (semanas, data_inicio, filhos...) para virar a selecionada
  return checar(
    await supabase.from('gestacao').select(GESTACAO_COM_FILHOS).eq('id_gestacao', id).single(),
    'Não foi possível carregar a gestação criada.',
  );
}

export async function atualizarGestacao(d: {
  id_gestacao: string;
  nome: string;
  semanas: number;
  dpp?: string | null;
  status?: string;
  filhos?: { id_filho?: string; nome?: string; sexo?: string }[];
}) {
  const patch: Record<string, unknown> = { nome: d.nome, semanas: d.semanas, dpp: paraISO(d.dpp) };
  if (d.status) {
    patch.status = d.status;
    // Registra a data de finalização (dia local, igual a data_inicio)
    if (d.status === 'finalizada') patch.data_finalizacao = hojeISO();
  }

  const atualizadas = checar(
    await supabase.from('gestacao').update(patch).eq('id_gestacao', d.id_gestacao).select('id_gestacao'),
    'Não foi possível atualizar.',
    { [DUPLICADO]: 'Você já possui uma gestação ativa.' },
  );
  if (atualizadas.length === 0) throw new Error('Gestação não encontrada');

  for (const filho of d.filhos ?? []) {
    if (!filho.id_filho) continue;
    checar(
      await supabase
        .from('filho')
        .update({ nome: filho.nome, sexo: filho.sexo || 'nao_informado' })
        .eq('id_filho', filho.id_filho)
        .eq('id_gestacao', d.id_gestacao),
      'Não foi possível atualizar os filhos.',
    );
  }
}

// ---------------------------------------------------------------------------
// Consultas
// ---------------------------------------------------------------------------

type ConsultaForm = { data: string; consulta: string; horario: string; local: string; medico?: string };

const consultaParaLinha = (c: ConsultaForm) => ({
  data: paraISO(c.data),
  descricao: c.consulta,
  horario: c.horario,
  local: c.local,
  medico: c.medico || null,
});

export async function listarConsultas(id_gestacao: string) {
  return checar(
    await supabase.from('consulta').select('*').eq('id_gestacao', id_gestacao).order('data').order('horario'),
    'Erro ao carregar as consultas.',
  );
}

export async function criarConsulta(id_gestacao: string | undefined, c: ConsultaForm) {
  if (!id_gestacao) throw new Error('Nenhuma gestação selecionada.');
  checar(
    await supabase.from('consulta').insert({ id_gestacao, ...consultaParaLinha(c) }),
    'Não foi possível agendar a consulta.',
    { [BLOQUEADO_RLS]: 'Gestação finalizada. Não é possível adicionar novas consultas.' },
  );
}

export async function atualizarConsulta(id_consulta: string, c: ConsultaForm) {
  const linhas = checar(
    await supabase.from('consulta').update(consultaParaLinha(c)).eq('id_consulta', id_consulta).select('id_consulta'),
    'Não foi possível atualizar.',
  );
  if (linhas.length === 0) throw new Error('Consulta não encontrada');
}

export async function excluirConsulta(id_consulta: string) {
  const linhas = checar(
    await supabase.from('consulta').delete().eq('id_consulta', id_consulta).select('id_consulta'),
    'Não foi possível excluir.',
  );
  if (linhas.length === 0) throw new Error('Consulta não encontrada');
}

// ---------------------------------------------------------------------------
// Diário
// ---------------------------------------------------------------------------

export async function listarDiario(id_gestacao: string) {
  return checar(
    await supabase
      .from('diario')
      .select('*')
      .eq('id_gestacao', id_gestacao)
      .order('data', { ascending: false })
      .order('hora', { ascending: false, nullsFirst: false }),
    'Erro ao carregar o diário.',
  );
}

export async function criarDiario(d: { id_gestacao?: string; data: string; hora?: string; reacao: string; descricao: string }) {
  if (!d.id_gestacao) throw new Error('Nenhuma gestação selecionada.');
  checar(
    await supabase.from('diario').insert({ ...d, data: paraISO(d.data), hora: d.hora || null }),
    'Não foi possível salvar.',
    { [BLOQUEADO_RLS]: 'Gestação finalizada. Não é possível adicionar novos registros.' },
  );
}

// ---------------------------------------------------------------------------
// Desenvolvimento do bebê (conteúdo estático em sint_db.json, semanas 1 a 40)
// ---------------------------------------------------------------------------

const limitarSemana = (s: number) => Math.min(40, Math.max(1, s));

// A gestação informada ou, sem id, a ativa da usuária (null se não houver)
async function gestacaoParaSemana(id_gestacao?: string): Promise<{
  semanas: number;
  data_inicio: string;
  data_finalizacao: string | null;
  status: string;
} | null> {
  const q = supabase.from('gestacao').select('semanas, data_inicio, data_finalizacao, status');
  return checar(
    await (id_gestacao ? q.eq('id_gestacao', id_gestacao) : q.eq('status', 'ativa')).maybeSingle(),
    'Erro ao carregar a gestação.',
  );
}

export async function buscarDesenvolvimento(semana?: number, id_gestacao?: string) {
  let semanaAtual = semana;
  if (!semanaAtual) {
    const g = await gestacaoParaSemana(id_gestacao);
    if (g) semanaAtual = calcularSemanaAtual(g.semanas, g.data_inicio, g.data_finalizacao);
  }
  if (!semanaAtual) return null;

  semanaAtual = limitarSemana(semanaAtual);
  const dados = sintDb.find((s) => s.semana === semanaAtual);
  return dados ? { semana_atual: semanaAtual, dados } : null;
}

export async function listarSemanas(id_gestacao?: string) {
  const g = await gestacaoParaSemana(id_gestacao);
  const semanaAtual = limitarSemana(g ? calcularSemanaAtual(g.semanas, g.data_inicio, g.data_finalizacao) : 1);

  return {
    semana_atual: semanaAtual,
    lista: sintDb.map((s) => ({
      semana: s.semana,
      comparacao: s.comparacao,
      tamanho_aproximado: s.tamanho_aproximado,
      url_imagem: s.url_imagem,
      bloqueada: s.semana > semanaAtual,
    })),
    finalizada: g?.status === 'finalizada',
  };
}
