# Offline-first com SQLite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O app lê e grava tudo num SQLite local e sincroniza com o Supabase quando há conexão.

**Architecture:** `lib/db.ts` abre o SQLite e descreve as tabelas; `lib/sync.ts` faz push (linhas `pendente = 1`, update-ou-insert) e pull (por `updated_at`, cursor por tabela); `lib/dados.ts` mantém as mesmas exportações, mas lê/grava no SQLite e dispara `sincronizar()`. Uma migration no Supabase adiciona `updated_at`/`deleted_at`.

**Tech Stack:** Expo SDK 56, React Native 0.85, `expo-sqlite`, `expo-crypto`, `@supabase/supabase-js` 2.117, Node 22 (`node --test`).

**Spec:** `docs/superpowers/specs/2026-10-09-offline-sqlite-design.md`

## Global Constraints

- Só Android/iOS; web não é suportada pela camada offline.
- Login e cadastro continuam exigindo conexão.
- Exportações de `lib/dados.ts` mantêm nomes, parâmetros, formatos de retorno e mensagens de erro atuais.
- Novas dependências: só `expo-sqlite` e `expo-crypto`, instaladas com `npx expo install`.
- Push linha a linha: `update` pela PK; 0 linhas afetadas → `insert`. Nunca `upsert`.
- Nunca enviar `pendente` nem `updated_at` ao Supabase.
- Códigos de rejeição por regra: `23505`, `42501`, `23503`, `23514`.
- Mensagem de logout com pendências: "X alterações ainda não foram enviadas e serão perdidas. Sair mesmo assim?"
- Aviso de rejeição: "Uma alteração feita offline não pôde ser salva: …"
- Comentários e nomes em português, no estilo de `lib/dados.ts`.

## Review Focus

1. Usuária que já usava o app atualiza a versão: banco local vazio com `user` no AsyncStorage → o app precisa puxar tudo na abertura, não mostrar telas vazias para sempre (Task 5, passo de verificação 2).
2. Horário de consulta: o servidor devolve `"14:30:00"` e o formulário grava `"14:30"` → gravar localmente já como `HH:MM:SS` para que listas e notificações não mudem depois do pull (Task 4, teste do `normalizarHorario`).
3. Edição feita enquanto um push está em andamento não pode ser marcada como sincronizada (Task 2, teste `deveLimparPendente`; uso na Task 3).
4. Linha local pendente não pode ser sobrescrita pelo pull (Task 2, teste `deveAplicar`).
5. Token revogado (`SIGNED_OUT` vindo do Supabase) precisa apagar o banco local, igual ao logout manual (Task 5).

---

## File Structure

- Create `supabase/migrations/20261009120000_offline_sync.sql`: `updated_at`, `deleted_at`, trigger, grant/policy de update em `diario`, índice parcial.
- Create `lib/db.ts`: abre o SQLite, cria o esquema, descreve as tabelas (`TABELAS`), conversões de booleanos, helpers `agora()` e `novoId()`.
- Create `lib/syncRegras.ts`: funções puras sem imports (`deveAplicar`, `deveLimparPendente`, `normalizarHorario`), testáveis em Node.
- Create `lib/syncRegras.test.mjs`: testes `node --test`.
- Create `lib/sync.ts`: `sincronizar`, `prepararBancoLocal`, `limparBancoLocal`, `contarPendentes`, eventos e `useDadosAtualizados`.
- Modify `lib/dados.ts`: implementação sobre SQLite.
- Modify `state/auth.tsx`: sincronização na abertura, logout com confirmação, limpeza no `SIGNED_OUT`.
- Modify `app/_layout.tsx`: alerta de avisos de rejeição.
- Modify telas: `app/(tabs)/index.tsx`, `app/(tabs)/perfil.tsx`, `app/consultas/index.tsx`, `app/diario/index.tsx`, `app/dados-gravidez/index.tsx`, `app/desenvolvimento/lista.tsx` (uma chamada de `useDadosAtualizados` cada).
- Modify `package.json`: script `"test": "node --experimental-strip-types --test lib/*.test.mjs"`.

---

### Task 1: Migration no Supabase

**Files:**
- Create: `supabase/migrations/20261009120000_offline_sync.sql`

**Interfaces:**
- Produces: colunas `updated_at timestamptz not null default now()` e `deleted_at timestamptz` em `usuario`, `gestacao`, `filho`, `diario`, `consulta`; `updated_at` atualizado por trigger em todo `update`.

- [ ] **Step 1: Escrever a migration**

Conteúdo, para as 5 tabelas:
- `alter table <t> add column updated_at timestamptz not null default now(), add column deleted_at timestamptz;`
- `create index idx_<t>_updated_at on <t> (updated_at);`
- Uma função `public.tocar_updated_at()` (`returns trigger`, `language plpgsql`, `set search_path = ''`, corpo `new.updated_at := now(); return new;`) e `create trigger tocar_updated_at before update on <t> for each row execute function public.tocar_updated_at();`
- `grant update on diario to authenticated;` + `create policy "diario: editar os próprios" on diario for update to authenticated using (...) with check (...)` com o mesmo critério de dono de `"diario: ler os próprios"`.
- `drop index uq_gestacao_ativa; create unique index uq_gestacao_ativa on gestacao (id_user) where status = 'ativa' and deleted_at is null;`

- [ ] **Step 2: Aplicar no projeto `nzpzilzautwgfjfclbba`**

Usar `mcp__supabase-gravidinha__apply_migration` com name `offline_sync` e o conteúdo do arquivo.

- [ ] **Step 3: Verificar**

`mcp__supabase-gravidinha__execute_sql`:
```sql
select table_name, column_name from information_schema.columns
where table_schema='public' and column_name in ('updated_at','deleted_at') order by 1,2;
```
Expected: 10 linhas (2 por tabela). Depois `mcp__supabase-gravidinha__get_advisors` (security): nenhum aviso novo sobre as tabelas ou a função.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20261009120000_offline_sync.sql
git commit -m "feat(db): colunas de sincronização offline no Supabase"
```

---

### Task 2: SQLite local e regras puras

**Files:**
- Create: `lib/db.ts`, `lib/syncRegras.ts`, `lib/syncRegras.test.mjs`
- Modify: `package.json` (deps + script `test`)

**Interfaces:**
- Produces (`lib/db.ts`):
  - `db: SQLiteDatabase` (de `openDatabaseSync('gravidinha.db')`); o esquema é criado na importação (`PRAGMA user_version` 0 → cria tudo e marca 1).
  - `type Tabela = { nome: 'usuario'|'gestacao'|'filho'|'diario'|'consulta'; pk: string; colunas: string[]; booleanas: string[] }`
  - `TABELAS: Tabela[]` na ordem de push: usuario, gestacao, filho, diario, consulta. `colunas` = colunas do Supabase (incluindo `updated_at`, `deleted_at`), sem `pendente`. `booleanas` de `gestacao` = `['primeira_gestacao','ainda_nao_decidiu_nome']`.
  - `paraLocal(t: Tabela, linha: Record<string, any>): Record<string, any>` (boolean → 0/1) e `paraRemoto(t, linha)` (0/1 → boolean, remove `pendente` e `updated_at`).
  - `agora(): string` (ISO UTC), `novoId(): string` (`Crypto.randomUUID()`).
  - Tabela `meta (chave TEXT PRIMARY KEY, valor TEXT)`; `lerMeta(chave): string | null`, `gravarMeta(chave, valor)` (síncronos via `getFirstSync`/`runSync`).
- Produces (`lib/syncRegras.ts`, sem imports):
  - `deveAplicar(local: { pendente: number } | null): boolean`: `false` só se a linha local existe com `pendente = 1`.
  - `deveLimparPendente(updatedAtLidoAntes: string, updatedAtAtual: string | null): boolean`: `true` só se forem iguais.
  - `normalizarHorario(h: string): string`: `"9:05"` → `"09:05:00"`, `"14:30"` → `"14:30:00"`, `"14:30:00"` inalterado.

- [ ] **Step 1: Instalar dependências**

Run: `npx expo install expo-sqlite expo-crypto`
Expected: as duas aparecem em `package.json` com versões do SDK 56.

- [ ] **Step 2: Escrever os testes que falham** (`lib/syncRegras.test.mjs`)

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deveAplicar, deveLimparPendente, normalizarHorario } from './syncRegras.ts';

test('deveAplicar', () => {
  assert.equal(deveAplicar(null), true);              // linha nova
  assert.equal(deveAplicar({ pendente: 0 }), true);   // local sincronizada
  assert.equal(deveAplicar({ pendente: 1 }), false);  // local pendente vence até o push
});

test('deveLimparPendente', () => {
  assert.equal(deveLimparPendente('2026-10-09T10:00:00.000Z', '2026-10-09T10:00:00.000Z'), true);
  assert.equal(deveLimparPendente('2026-10-09T10:00:00.000Z', '2026-10-09T10:00:05.000Z'), false); // editada durante o envio
  assert.equal(deveLimparPendente('2026-10-09T10:00:00.000Z', null), false);
});

test('normalizarHorario', () => {
  assert.equal(normalizarHorario('14:30'), '14:30:00');
  assert.equal(normalizarHorario('9:05'), '09:05:00');
  assert.equal(normalizarHorario('14:30:00'), '14:30:00');
});
```

Script em `package.json`: `"test": "node --experimental-strip-types --test lib/*.test.mjs"`.

- [ ] **Step 3: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL (módulo `./syncRegras.ts` não encontrado).

- [ ] **Step 4: Implementar `lib/syncRegras.ts`** com as três assinaturas acima.

- [ ] **Step 5: Rodar e ver passar**

Run: `npm test`
Expected: 3 testes passando.

- [ ] **Step 6: Implementar `lib/db.ts`**

`CREATE TABLE IF NOT EXISTS` para as 5 tabelas espelhando `supabase/migrations/20261008120000_esquema_inicial.sql` (uuid/date/time/timestamptz → TEXT, bigint/integer → INTEGER, boolean → INTEGER), cada uma com `pendente INTEGER NOT NULL DEFAULT 0`, `updated_at TEXT`, `deleted_at TEXT`. Sem foreign keys locais (a ordem de chegada do pull não é garantida entre tabelas).

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit`
Expected: nenhum erro novo em `lib/db.ts` e `lib/syncRegras.ts`. Os erros que já existiam antes não contam; comparar com `git stash` se houver dúvida.

- [ ] **Step 8: Commit**

```bash
git add lib/db.ts lib/syncRegras.ts lib/syncRegras.test.mjs package.json package-lock.json
git commit -m "feat(offline): banco SQLite local e regras de sincronização"
```

---

### Task 3: Sincronização (`lib/sync.ts`)

**Files:**
- Create: `lib/sync.ts`

**Interfaces:**
- Consumes: `db`, `TABELAS`, `paraLocal`, `paraRemoto`, `lerMeta`, `gravarMeta` (Task 2); `deveAplicar`, `deveLimparPendente` (Task 2); `supabase` de `lib/supabase.ts`.
- Produces:
  - `sincronizar(): Promise<void>`: reutiliza a promise em curso se já houver um ciclo; nunca rejeita (erros só `console.error`).
  - `prepararBancoLocal(id_user: string): Promise<void>`: se `lerMeta('id_user')` existir e for diferente, chama `limparBancoLocal()`; grava `id_user`; `await sincronizar()`.
  - `limparBancoLocal(): Promise<void>`: `DELETE` de todas as tabelas e de `meta`.
  - `contarPendentes(): number`: soma de `pendente = 1` em todas as tabelas.
  - `aoAtualizar(cb: () => void): () => void`: inscreve no evento "pull aplicou linhas"; retorna função de cancelamento.
  - `aoAvisar(cb: (avisos: string[]) => void): () => void`: inscreve nos avisos de rejeição de cada ciclo (só chamado se houver avisos).
  - `useDadosAtualizados(recarregar: () => void): void`: hook; `useEffect(() => aoAtualizar(recarregar), [recarregar])`. Usar a ref da última função para não reinscrever a cada render.
  - `marcarAlterado()`: chama `sincronizar()` sem `await`. É o que `lib/dados.ts` chama após cada gravação.
  - Listener próprio de `AppState` (`'active'` → `sincronizar()`), registrado só se `Platform.OS !== 'web'`.

- [ ] **Step 1: Implementar o push**

Para cada `t` de `TABELAS`, para cada linha `pendente = 1`:
1. Guardar `updated_at` local lido.
2. `supabase.from(t.nome).update(paraRemoto(t, linha)).eq(t.pk, id).select(t.pk)`; se `data.length === 0` → `insert(paraRemoto(t, linha))`.
3. Sucesso → `UPDATE ... SET pendente = 0 WHERE pk = ? ` somente se `deveLimparPendente(lido, atual)`.
4. Erro com `code` em `['23505','42501','23503','23514']` → buscar a linha no Supabase (`maybeSingle`); existe → gravar local com `pendente = 0`; não existe → `DELETE` local. Adicionar aviso: `` `${t.nome}: ${error.message}` ``.
5. Qualquer outro erro → interromper o ciclo (sem pull).

- [ ] **Step 2: Implementar o pull**

Para cada `t`: `cursor = lerMeta('ultimo_pull:' + t.nome)`; página de 1000 em `order('updated_at')`, `.gt('updated_at', cursor)` se houver cursor, `.range(...)` até a página vir incompleta. Para cada linha remota: buscar local por PK; se `deveAplicar(local)` → `INSERT OR REPLACE` com `paraLocal` e `pendente = 0`. Gravar o cursor com o maior `updated_at` recebido. Se alguma linha foi aplicada no ciclo → emitir `aoAtualizar`. Ao final do ciclo, se houver avisos → emitir `aoAvisar`.

Comentário `ponytail:` no cursor, copiado da spec.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: nenhum erro novo em `lib/sync.ts`.

- [ ] **Step 4: Commit**

```bash
git add lib/sync.ts
git commit -m "feat(offline): sincronização push/pull com o Supabase"
```

---

### Task 4: `lib/dados.ts` sobre o SQLite

**Files:**
- Modify: `lib/dados.ts` (arquivo inteiro, exceto o bloco de desenvolvimento do bebê, que muda só em `gestacaoParaSemana`)

**Interfaces:**
- Consumes: `db`, `agora`, `novoId`, `paraLocal`, `TABELAS` (Task 2); `normalizarHorario` (Task 2); `prepararBancoLocal`, `marcarAlterado` (Task 3).
- Produces: as mesmas exportações de hoje, com as mesmas assinaturas.

Regras de implementação:
- Toda leitura filtra `deleted_at IS NULL`; booleanos de `gestacao` voltam como `boolean`.
- Toda gravação define `updated_at = agora()`, `pendente = 1` e termina com `marcarAlterado()`.
- `entrar`/`cadastrar`: depois do Auth, `await prepararBancoLocal(session.user.id)` e então `usuarioDaSessao()` lendo do SQLite. Se o pull falhar e a linha `usuario` não existir localmente → `Error('Ocorreu um erro ao fazer login.')`.
- `buscarUsuario`: `SELECT` local de `usuario` por `meuId()`; e-mail da sessão.
- `listarGestacoes`: ordem `data_inicio DESC`; `filhos` = filhos não excluídos da gestação, ordem `nome`.
- `criarGestacao`: se existir gestação `status = 'ativa'` não excluída → `Error('Você já possui uma gestação ativa. Finalize-a antes de criar uma nova.')`. Senão, em `db.withTransactionAsync`, inserir gestação (`id_gestacao = novoId()`, `id_user = await meuId()`, `status = 'ativa'`, mesmos valores que hoje vão ao RPC) e filhos (`id_filho = novoId()`). Retornar como em `listarGestacoes`.
- `atualizarGestacao`: se `d.status === 'ativa'` e houver outra ativa → `Error('Você já possui uma gestação ativa.')`. Gestação inexistente → `Error('Gestação não encontrada')`. Filhos como hoje.
- `criarConsulta` / `criarDiario`: gestação com `status = 'finalizada'` → mensagens atuais do mapa `BLOQUEADO_RLS`. `horario` passa por `normalizarHorario`.
- `atualizarConsulta`: `horario` normalizado; 0 linhas → `Error('Consulta não encontrada')`.
- `excluirConsulta`: `UPDATE SET deleted_at = agora()`; 0 linhas → `Error('Consulta não encontrada')`.
- Remover `checar`, os códigos `DUPLICADO`/`BLOQUEADO_RLS` e a chamada do RPC, que não são mais usados.

- [ ] **Step 1: Reescrever `lib/dados.ts`** seguindo as regras acima.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: nenhum erro novo em `lib/dados.ts` nem nas telas que o importam.

- [ ] **Step 3: Rodar os testes puros**

Run: `npm test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add lib/dados.ts
git commit -m "feat(offline): camada de dados lê e grava no SQLite local"
```

---

### Task 5: Integração com auth, layout e telas + verificação no emulador

**Files:**
- Modify: `state/auth.tsx`, `app/_layout.tsx`, `app/(tabs)/index.tsx`, `app/(tabs)/perfil.tsx`, `app/consultas/index.tsx`, `app/diario/index.tsx`, `app/dados-gravidez/index.tsx`, `app/desenvolvimento/lista.tsx`, `types/auth.ts`

**Interfaces:**
- Consumes: `prepararBancoLocal`, `sincronizar`, `limparBancoLocal`, `contarPendentes`, `aoAvisar`, `useDadosAtualizados` (Task 3).

- [ ] **Step 1: `state/auth.tsx`**
  - Em `loadData`, ao restaurar `user` com sessão: `prepararBancoLocal(sessao.user.id)` **sem await** (não bloqueia a abertura; telas recarregam pelo evento).
  - `signOut(): Promise<void>`: `await sincronizar()`; `n = contarPendentes()`; se `n > 0`, perguntar com `Alert.alert` (embrulhado em Promise; botões "Cancelar" e "Sair") a mensagem `` `${n} alterações ainda não foram enviadas e serão perdidas. Sair mesmo assim?` ``; cancelou → retorna sem sair. Senão `await limparBancoLocal()`, depois o fluxo atual.
  - No `SIGNED_OUT` do `onAuthStateChange`: também `limparBancoLocal()`.
  - `types/auth.ts`: `signOut: () => Promise<void>`.

- [ ] **Step 2: `app/_layout.tsx`**

Em `RootLayoutNav`, um `useEffect` com `aoAvisar((avisos) => Alert.alert('Atenção', 'Uma alteração feita offline não pôde ser salva: ' + avisos.join('\n')))`, retornando o cancelamento.

- [ ] **Step 3: Telas**

Em cada tela listada, chamar `useDadosAtualizados(<função que já recarrega a lista>)`. Onde a carga está inline num `useEffect`, extrair para uma função `carregar` (com `useCallback`) e usá-la nos dois lugares. Em `index.tsx`, recarregar `listarGestacoes` e as consultas.

- [ ] **Step 4: Typecheck e testes**

Run: `npx tsc --noEmit` e `npm test`
Expected: nenhum erro novo; testes passam.

- [ ] **Step 5: Verificação no emulador Android** (`npx expo run:android` ou Expo Go)

Roteiro da spec, seção "Testes", passos 1–6, mais:
2. Usuária já logada antes desta versão: abrir o app → dados aparecem sozinhos após o pull, sem relogar.

Conferir no Supabase com `execute_sql` após o passo 4 do roteiro (`select id_consulta, deleted_at, updated_at from consulta order by updated_at desc limit 5`).

Expected: todos os passos com o resultado descrito na spec. Anotar qualquer divergência antes de corrigir.

- [ ] **Step 6: Commit**

```bash
git add state/auth.tsx types/auth.ts app/_layout.tsx "app/(tabs)/index.tsx" "app/(tabs)/perfil.tsx" app/consultas/index.tsx app/diario/index.tsx app/dados-gravidez/index.tsx app/desenvolvimento/lista.tsx
git commit -m "feat(offline): sincronização no login/logout e recarga das telas"
```
