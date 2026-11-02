// Regras de validação dos campos do app. Cada função devolve a mensagem de erro, ou null se o valor é válido.
// Usadas nas telas (aviso ao digitar/salvar) e em lib/dados.ts (barreira de toda gravação).
// Os mesmos limites estão em supabase/migrations/20261024120000_validacao_campos.sql — mantenha os dois juntos.
import { idade } from './formato';

export const LIMITES = {
  nomePessoa: { min: 3, max: 100 },
  nomeGestacao: 60,
  nomeBebe: 60,
  email: 254,
  senha: { min: 8, max: 72 }, // 72: o bcrypt do Supabase Auth ignora o que passar disso
  semanas: { min: 1, max: 42 },
  consulta: 200,
  local: 120,
  medico: 100,
  diario: 2000,
  idade: { min: 10, max: 100 },
};

const SEXOS = ['masculino', 'feminino', 'nao_informado'];
const QTD_BEBES = ['um', 'gemeos_univitelinos', 'gemeos_bivitelinos', 'multiplos'];
const REACOES = ['1', '2', '3', '4', '5', '6']; // ids de constants/humores.ts

const tam = (s: string, min: number, max: number) => s.length >= min && s.length <= max;

/** "dd/mm/aaaa" ou "aaaa-mm-dd" → Date no fuso local; null se não for uma data que existe no calendário. */
export function lerData(texto: string): Date | null {
  const t = texto.replace(/\s/g, '');
  let d: number, m: number, a: number;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(t)) [d, m, a] = t.split('/').map(Number);
  else if (/^\d{4}-\d{2}-\d{2}/.test(t)) [a, m, d] = t.slice(0, 10).split('-').map(Number);
  else return null;
  const data = new Date(a, m - 1, d);
  // 31/02 viraria 03/03: só vale se o dia voltar igual
  return data.getFullYear() === a && data.getMonth() === m - 1 && data.getDate() === d ? data : null;
}

const inicioDoDia = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function validarNomePessoa(nome: string): string | null {
  const n = nome.trim();
  const { min, max } = LIMITES.nomePessoa;
  if (!n) return 'Informe o nome.';
  if (!tam(n, min, max)) return `O nome deve ter de ${min} a ${max} caracteres.`;
  if (/\d/.test(n)) return 'O nome não pode ter números.';
  return null;
}

export function validarEmail(email: string): string | null {
  const e = email.trim();
  if (!e) return 'Informe o e-mail.';
  if (e.length > LIMITES.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return 'Insira um e-mail válido.';
  return null;
}

export function validarCelular(celular: string): string | null {
  const c = celular.replace(/\D/g, '');
  if (!c) return 'Informe o celular.';
  if (c.length < 10 || c.length > 11) return 'Insira um celular válido, com DDD.';
  if (Number(c.slice(0, 2)) < 11) return 'DDD inválido.';
  if (c.length === 11 && c[2] !== '9') return 'Celular com 11 dígitos deve começar com 9 depois do DDD.';
  return null;
}

export function validarSenha(senha: string): string | null {
  const { min, max } = LIMITES.senha;
  if (senha.length < min) return `A senha deve ter no mínimo ${min} caracteres.`;
  if (senha.length > max) return `A senha deve ter no máximo ${max} caracteres.`;
  return null;
}

export function validarDataNascimento(texto: string, hoje = new Date()): string | null {
  if (!texto.trim()) return 'Informe a data de nascimento.';
  const d = lerData(texto);
  if (!d) return 'Data de nascimento inválida. Use dd/mm/aaaa.';
  if (d > inicioDoDia(hoje)) return 'A data de nascimento não pode ser no futuro.';
  const anos = idade(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`, hoje);
  if (anos < LIMITES.idade.min || anos > LIMITES.idade.max) return 'Data de nascimento fora do esperado.';
  return null;
}

// Vazia é permitida (a DPP é opcional); preenchida precisa existir e estar perto da gestação
export function validarDpp(texto: string | null | undefined, hoje = new Date()): string | null {
  if (!texto || !texto.trim()) return null;
  const d = lerData(texto);
  if (!d) return 'Data inválida. Use dd/mm/aaaa.';
  const h = inicioDoDia(hoje);
  if (d < new Date(h.getFullYear() - 1, h.getMonth(), h.getDate()) || d > new Date(h.getFullYear() + 1, h.getMonth(), h.getDate()))
    return 'A data provável do parto deve estar dentro de um ano a partir de hoje.';
  return null;
}

export function validarSemanas(semanas: unknown): string | null {
  const { min, max } = LIMITES.semanas;
  if (!Number.isInteger(semanas) || (semanas as number) < min || (semanas as number) > max)
    return `As semanas devem ser um número de ${min} a ${max}.`;
  return null;
}

export function validarNomeGestacao(nome?: string | null): string | null {
  return (nome ?? '').trim().length > LIMITES.nomeGestacao ? `O nome da gestação aceita até ${LIMITES.nomeGestacao} caracteres.` : null;
}

// obrigatorio: o nome só é exigido quando a usuária não marcou "ainda não decidi"
export function validarNomeBebe(nome: string | undefined, obrigatorio: boolean): string | null {
  const n = (nome ?? '').trim();
  if (!n) return obrigatorio ? 'Por favor, insira o nome do bebê.' : null;
  return n.length > LIMITES.nomeBebe ? `O nome do bebê aceita até ${LIMITES.nomeBebe} caracteres.` : null;
}

export function validarSexo(sexo?: string | null): string | null {
  return !sexo || SEXOS.includes(sexo) ? null : 'Sexo do bebê inválido.';
}

export function validarQtdBebes(qtd?: string | null): string | null {
  return !qtd || QTD_BEBES.includes(qtd) ? null : 'Quantidade de bebês inválida.';
}

function validarHora(hora: string): string | null {
  return /^([01]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(hora.trim()) ? null : 'Horário inválido. Use hh:mm.';
}

export function validarRegistroDiario(d: { reacao: string; descricao: string; hora?: string | null }): string | null {
  if (!REACOES.includes(d.reacao)) return 'Escolha como você está se sentindo.';
  const t = d.descricao.trim();
  if (!t) return 'Escreva algo no registro.';
  if (t.length > LIMITES.diario) return `O registro aceita até ${LIMITES.diario} caracteres.`;
  return d.hora ? validarHora(d.hora) : null;
}

export function validarConsulta(c: { consulta: string; data: string; horario: string; local: string; medico?: string | null }): string | null {
  const tipo = c.consulta.trim();
  if (!tipo) return 'Preencha o tipo de consulta.';
  if (tipo.length > LIMITES.consulta) return `O tipo de consulta aceita até ${LIMITES.consulta} caracteres.`;
  if (!c.data.trim()) return 'Preencha a data.';
  if (!lerData(c.data)) return 'Data inválida. Use dd/mm/aaaa.';
  const h = validarHora(c.horario);
  if (h) return h;
  if (c.local.trim().length > LIMITES.local) return `O local aceita até ${LIMITES.local} caracteres.`;
  if ((c.medico ?? '').trim().length > LIMITES.medico) return `O nome do médico aceita até ${LIMITES.medico} caracteres.`;
  return null;
}
