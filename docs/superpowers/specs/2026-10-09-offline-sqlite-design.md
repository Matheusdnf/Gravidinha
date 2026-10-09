# Offline-first com SQLite local e sincronização com o Supabase

Data: 2026-10-09

## Objetivo

O app deve funcionar sem internet: ler e gravar todos os dados da usuária (perfil, gestações, filhos, diário, consultas) num banco SQLite local e sincronizar com o Supabase quando houver conexão.

Sucesso = em modo avião a usuária abre o app, vê seus dados, cria/edita/finaliza gestação, registra diário e consultas, edita o perfil; ao voltar a conexão tudo aparece no Supabase sem ação manual.

## Decisões

- **Plataformas:** só Android/iOS. Web não é suportada pela camada offline.
- **Escopo offline:** tudo, exceto login e cadastro (continuam exigindo conexão).
- **Biblioteca:** `expo-sqlite` (nova dependência). Sem PowerSync, sem lib de detecção de rede.
- **Abordagem de sync:** flag `pendente` por linha + pull incremental por `updated_at` (não fila de operações).
- **Conflitos:** última gravação vence; se o servidor rejeitar uma linha por regra de negócio, o servidor vence.
- **Foto de perfil:** continua base64 na coluna `usuario.profile_image`, sincronizada com a linha. Mover para Storage fica fora deste escopo.

## Interface preservada

As telas acessam dados só via `lib/dados.ts`. As funções exportadas mantêm nomes, parâmetros e formatos de retorno (inclusive `filhos` aninhados em gestação e as mensagens de `Error`). Só a implementação muda: lê e grava no SQLite e dispara a sincronização. `entrar` e `cadastrar` continuam chamando o Supabase Auth e passam a fazer o pull inicial antes de retornar.

## Supabase (nova migration)

1. Em `usuario`, `gestacao`, `filho`, `diario`, `consulta`:
   - `updated_at timestamptz not null default now()`, mantida por trigger `before update` (`now()`).
   - `deleted_at timestamptz` (soft delete).
   - Índice em `updated_at` para o pull incremental.
2. Grants/RLS:
   - `update` liberado em `diario` (política "editar os próprios", mesmo critério de dono), necessário para o push e para o soft delete.
   - `filho` já tem update.
   - Delete físico em `consulta` deixa de ser usado pelo app; exclusão = `update` de `deleted_at`.
3. **Revisado após a revisão final:** o RLS de insert de `diario`/`consulta` deixa de exigir gestação ativa (migration `20261009130000_insert_em_gestacao_finalizada.sql`), só a dona. Motivo: consulta criada offline antes de finalizar a gestação na mesma sessão era recusada e perdida no push. A regra "não criar em gestação finalizada" fica só no app. Texto original a seguir.
   As regras continuam no servidor como última barreira: `uq_gestacao_ativa` (só considera linhas com `deleted_at is null` — o índice parcial passa a ser `where status = 'ativa' and deleted_at is null`) e o RLS "criar em gestação ativa".
   - Uma consulta/diário criado offline numa gestação que foi finalizada é barrado pelo RLS de insert (`42501`). Tratado como rejeição (ver abaixo).
4. O RPC `criar_gestacao` deixa de ser chamado (permanece no banco; remoção opcional depois).

## SQLite local (`lib/db.ts`)

- Abre `gravidinha.db` e cria as tabelas na primeira execução (`PRAGMA user_version` para versão do esquema).
- Mesmas 5 tabelas e colunas do Supabase, com tipos SQLite (datas como texto ISO, booleanos 0/1) + `pendente INTEGER NOT NULL DEFAULT 0`.
- Tabela `meta (chave TEXT PRIMARY KEY, valor TEXT)` guarda o cursor do pull (`ultimo_pull`) e o `id_user` dono do banco.
- UUIDs gerados no app com `randomUUID()` do `expo-crypto` (nova dependência).
- `updated_at` local é gravado com o horário do aparelho apenas para ordenação local; o valor do servidor substitui no pull.
- Leituras filtram `deleted_at IS NULL`.

## Regras de negócio no app (`lib/dados.ts`)

Checadas localmente antes de gravar, com as mesmas mensagens de hoje:
- Criar gestação com outra ativa → "Você já possui uma gestação ativa. Finalize-a antes de criar uma nova."
- Reativar/atualizar para ativa havendo outra ativa → "Você já possui uma gestação ativa."
- Criar diário/consulta em gestação finalizada → mensagens atuais de `BLOQUEADO_RLS`.
- Validações de nome/celular de `atualizarUsuario` continuam iguais.
- Criar gestação grava gestação + filhos numa transação SQLite (substitui a atomicidade do RPC).

## Sincronização (`lib/sync.ts`)

`sincronizar(): Promise<void>` — um único ciclo em andamento por vez (chamadas concorrentes reutilizam a promise em curso).

**Push**, na ordem `usuario` → `gestacao` → `filho`, `diario`, `consulta`, linha a linha:
- Para cada linha com `pendente = 1`: `update` pela chave primária (sem `pendente`, sem `updated_at`; o servidor define). Se nenhuma linha for afetada, `insert`. Não usa `upsert`: o Postgres aplica a checagem de RLS de insert também no `ON CONFLICT`, o que barraria editar/excluir consulta de gestação finalizada, e `usuario` não tem grant de insert.
- Sucesso → `pendente = 0`, só se a linha não foi alterada de novo durante o envio (compara o `updated_at` local lido antes do envio).
- Rejeição por regra (`23505`, `42501`, `23503`, `23514`): descarta a versão local (busca a do servidor; se não existir, apaga localmente) e registra um aviso.
- Erro de rede/auth: interrompe o ciclo; as linhas continuam pendentes.
- `ponytail:` 1–2 requisições por linha pendente; suficiente para o volume de uma usuária. Agrupar em lote se o volume crescer.

**Pull**, na mesma ordem de tabelas:
- `select * where updated_at > ultimo_pull` (o RLS já restringe à usuária), paginado.
- Para cada linha: aplica (insert ou replace) só se a linha local não estiver `pendente = 1`. Essa decisão fica numa função pura `deveAplicar(local, remota)` testável.
- Cursor por tabela (`meta` chave `ultimo_pull:<tabela>`) = maior `updated_at` recebido daquela tabela.
- `ponytail:` cursor por `updated_at` pode perder uma linha cuja transação commitou depois com `now()` anterior; aceitável para uma usuária com poucos aparelhos. Se aparecer, puxar com margem (`ultimo_pull - 1 min`).

**Gatilhos:**
- Após `entrar`/`cadastrar`: pull completo (cursor vazio), aguardado antes de retornar.
- `AppState` → `active` (mesmo listener de `lib/supabase.ts`).
- Após cada gravação em `lib/dados.ts`: `sincronizar()` sem `await`, erros só logados.

**Avisos de rejeição:** `sync.ts` expõe a lista de avisos do último ciclo; o `_layout` mostra um `Alert` quando houver ("Uma alteração feita offline não pôde ser salva: …").

**Telas abertas:** `sync.ts` emite um evento quando o pull aplica alguma linha. Hook `useDadosAtualizados(recarregar)` (em `lib/sync.ts`) assina o evento; cada tela que lista dados chama o hook com sua função de recarga.

## Login, logout e sessão (`state/auth.tsx`, `lib/dados.ts`)

- Login de outra conta no mesmo aparelho: se `meta.id_user` ≠ usuária logada, apaga o banco local antes do pull inicial.
- Logout: tenta `sincronizar()`; se ainda houver linhas pendentes, pede confirmação ("X alterações ainda não foram enviadas e serão perdidas. Sair mesmo assim?"). Confirmado → apaga dados locais e `meta`, depois `supabase.auth.signOut()`.
- Sessão expirada offline: o app segue usando o banco local (comportamento atual de `auth.tsx`); o push falha por auth até a renovação do token.
- `buscarUsuario` lê do SQLite; o e-mail continua vindo da sessão salva.

## Fora de escopo

- Suporte web offline.
- Foto de perfil no Supabase Storage.
- Resolução de conflito campo a campo.
- Indicador visual de "pendente de sincronização" por item.

## Testes

- `lib/sync.test.ts` (ou `.mjs`) com `node --test`, cobrindo `deveAplicar`: linha nova, linha local pendente, linha local sincronizada, remota com `deleted_at`.
- Roteiro manual no emulador Android:
  1. Login online → dados aparecem.
  2. Modo avião → criar consulta, criar diário, excluir consulta, editar perfil, finalizar gestação e criar nova.
  3. Fechar e reabrir o app offline → tudo continua lá.
  4. Desligar modo avião → voltar ao app → conferir as tabelas no Supabase (`updated_at`, `deleted_at`).
  5. Conflito: com o aparelho offline, criar gestação ativa; criar outra ativa direto no Supabase; reconectar → aviso exibido, servidor vence.
  6. Logout offline com pendências → confirmação aparece; login de outra conta → não vê dados da anterior.
