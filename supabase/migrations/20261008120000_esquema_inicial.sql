-- Esquema do Gravidinha no Supabase.
-- O app fala direto com o banco (supabase-js); quem garante que cada usuária
-- só vê e altera os próprios dados são as políticas de RLS abaixo.

-- 1. Perfil da pessoa gestante (e-mail e senha ficam no Supabase Auth, em auth.users)
create table usuario (
  id_user uuid primary key references auth.users (id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  cellphone bigint not null check (cellphone between 1000000000 and 99999999999), -- 10 ou 11 dígitos
  data_nascimento date not null,
  profile_image text -- data URI base64 da foto de perfil
);

-- 2. Gestação (o centro de tudo). Um usuário pode ter várias ao longo da vida.
create table gestacao (
  id_gestacao uuid primary key default gen_random_uuid(),
  id_user uuid not null default auth.uid() references usuario (id_user) on delete cascade,
  data_inicio date,
  nome text, -- Ex: "Primeira Viagem", "Gêmeos 2026"
  primeira_gestacao boolean,
  qtd_bebes text,
  semanas integer,
  dpp date,
  ainda_nao_decidiu_nome boolean,
  status text not null default 'ativa' check (status in ('ativa', 'finalizada')),
  data_finalizacao date -- Preenchida ao finalizar; a contagem de semanas para nesta data
);

-- 3. Filhos (gêmeos = dois registros na mesma gestação)
create table filho (
  id_filho uuid primary key default gen_random_uuid(),
  id_gestacao uuid not null references gestacao (id_gestacao) on delete cascade,
  nome text,
  sexo text not null default 'nao_informado'
);

-- 4. Diário da gestação
create table diario (
  id_diario uuid primary key default gen_random_uuid(),
  id_gestacao uuid not null references gestacao (id_gestacao) on delete cascade,
  data date not null,
  hora varchar(5),
  reacao text not null,
  descricao text not null
);

-- 5. Consultas médicas e ultrassons da gestação
create table consulta (
  id_consulta uuid primary key default gen_random_uuid(),
  id_gestacao uuid not null references gestacao (id_gestacao) on delete cascade,
  data date not null,
  horario time not null,
  local text not null,
  descricao text not null,
  medico text
);

-- Índices nas chaves estrangeiras (toda listagem e toda política de RLS filtra por elas)
create index idx_gestacao_user on gestacao (id_user);
create index idx_filho_gestacao on filho (id_gestacao);
create index idx_diario_gestacao on diario (id_gestacao);
create index idx_consulta_gestacao on consulta (id_gestacao);

-- No máximo uma gestação ativa por usuário (garantido pelo banco, sem corrida)
create unique index uq_gestacao_ativa on gestacao (id_user) where status = 'ativa';

-- ---------------------------------------------------------------------------
-- Perfil criado automaticamente no cadastro (supabase.auth.signUp com options.data)
-- ---------------------------------------------------------------------------
create function public.criar_usuario_no_cadastro()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.usuario (id_user, name, cellphone, data_nascimento)
  values (
    new.id,
    btrim(new.raw_user_meta_data ->> 'name'),
    (new.raw_user_meta_data ->> 'cellphone')::bigint,
    (new.raw_user_meta_data ->> 'data_nascimento')::date
  );
  return new;
end;
$$;

-- Só o trigger usa; ninguém chama via API
revoke execute on function public.criar_usuario_no_cadastro() from public, anon, authenticated;

create trigger ao_criar_usuario_auth
  after insert on auth.users
  for each row execute function public.criar_usuario_no_cadastro();

-- ---------------------------------------------------------------------------
-- Cria gestação + filhos numa única transação (ou grava tudo ou nada).
-- security invoker: roda com as permissões e o RLS de quem chama.
-- ---------------------------------------------------------------------------
create function public.criar_gestacao(
  p_nome text,
  p_data_inicio date,
  p_primeira_gestacao boolean,
  p_qtd_bebes text,
  p_semanas integer,
  p_dpp date,
  p_ainda_nao_decidiu_nome boolean,
  p_filhos jsonb -- [{ "nome": "...", "sexo": "..." }]
)
returns uuid
language plpgsql
security invoker set search_path = ''
as $$
declare
  v_id uuid;
begin
  insert into public.gestacao (data_inicio, nome, primeira_gestacao, qtd_bebes, semanas, dpp, ainda_nao_decidiu_nome)
  values (p_data_inicio, p_nome, p_primeira_gestacao, p_qtd_bebes, p_semanas, p_dpp, p_ainda_nao_decidiu_nome)
  returning id_gestacao into v_id;

  insert into public.filho (id_gestacao, nome, sexo)
  select v_id, f ->> 'nome', coalesce(f ->> 'sexo', 'nao_informado')
  from jsonb_array_elements(coalesce(p_filhos, '[]'::jsonb)) as f;

  return v_id;
end;
$$;

revoke execute on function public.criar_gestacao from public, anon;
grant execute on function public.criar_gestacao to authenticated;

-- ---------------------------------------------------------------------------
-- RLS: cada usuária só enxerga e altera os próprios dados
-- ---------------------------------------------------------------------------
alter table usuario enable row level security;
alter table gestacao enable row level security;
alter table filho enable row level security;
alter table diario enable row level security;
alter table consulta enable row level security;

-- Visitante não logado não acessa nada; logado só o que as políticas liberam
revoke all on usuario, gestacao, filho, diario, consulta from anon;
grant select, update on usuario to authenticated;
grant select, insert, update on gestacao, filho to authenticated;
grant select, insert on diario to authenticated;
grant select, insert, update, delete on consulta to authenticated;

-- usuario (a linha é criada pelo trigger, por isso não há política de insert)
create policy "usuario: ler o próprio" on usuario for select to authenticated
  using ((select auth.uid()) = id_user);
create policy "usuario: editar o próprio" on usuario for update to authenticated
  using ((select auth.uid()) = id_user)
  with check ((select auth.uid()) = id_user);

-- gestacao
create policy "gestacao: ler as próprias" on gestacao for select to authenticated
  using ((select auth.uid()) = id_user);
create policy "gestacao: criar para si" on gestacao for insert to authenticated
  with check ((select auth.uid()) = id_user);
create policy "gestacao: editar as próprias" on gestacao for update to authenticated
  using ((select auth.uid()) = id_user)
  with check ((select auth.uid()) = id_user);

-- filho (dono via gestação)
create policy "filho: ler os próprios" on filho for select to authenticated
  using (id_gestacao in (select id_gestacao from gestacao where id_user = (select auth.uid())));
create policy "filho: criar nas próprias gestações" on filho for insert to authenticated
  with check (id_gestacao in (select id_gestacao from gestacao where id_user = (select auth.uid())));
create policy "filho: editar os próprios" on filho for update to authenticated
  using (id_gestacao in (select id_gestacao from gestacao where id_user = (select auth.uid())))
  with check (id_gestacao in (select id_gestacao from gestacao where id_user = (select auth.uid())));

-- diario (só entra registro novo em gestação ainda ativa)
create policy "diario: ler os próprios" on diario for select to authenticated
  using (id_gestacao in (select id_gestacao from gestacao where id_user = (select auth.uid())));
create policy "diario: criar em gestação ativa" on diario for insert to authenticated
  with check (id_gestacao in (select id_gestacao from gestacao where id_user = (select auth.uid()) and status = 'ativa'));

-- consulta (só agenda nova em gestação ainda ativa)
create policy "consulta: ler as próprias" on consulta for select to authenticated
  using (id_gestacao in (select id_gestacao from gestacao where id_user = (select auth.uid())));
create policy "consulta: criar em gestação ativa" on consulta for insert to authenticated
  with check (id_gestacao in (select id_gestacao from gestacao where id_user = (select auth.uid()) and status = 'ativa'));
create policy "consulta: editar as próprias" on consulta for update to authenticated
  using (id_gestacao in (select id_gestacao from gestacao where id_user = (select auth.uid())))
  with check (id_gestacao in (select id_gestacao from gestacao where id_user = (select auth.uid())));
create policy "consulta: excluir as próprias" on consulta for delete to authenticated
  using (id_gestacao in (select id_gestacao from gestacao where id_user = (select auth.uid())));
