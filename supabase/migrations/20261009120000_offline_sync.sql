-- Suporte à sincronização com o banco SQLite local do app (modo offline).
-- updated_at: o app puxa só o que mudou desde a última sincronização.
-- deleted_at: exclusão vira marcação, para que o outro lado saiba que a linha sumiu.

alter table usuario  add column updated_at timestamptz not null default now(), add column deleted_at timestamptz;
alter table gestacao add column updated_at timestamptz not null default now(), add column deleted_at timestamptz;
alter table filho    add column updated_at timestamptz not null default now(), add column deleted_at timestamptz;
alter table diario   add column updated_at timestamptz not null default now(), add column deleted_at timestamptz;
alter table consulta add column updated_at timestamptz not null default now(), add column deleted_at timestamptz;

create index idx_usuario_updated_at  on usuario (updated_at);
create index idx_gestacao_updated_at on gestacao (updated_at);
create index idx_filho_updated_at    on filho (updated_at);
create index idx_diario_updated_at   on diario (updated_at);
create index idx_consulta_updated_at on consulta (updated_at);

-- O horário vem sempre do servidor (o relógio do celular não é confiável)
create function public.tocar_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function public.tocar_updated_at() from public, anon, authenticated;

create trigger tocar_updated_at before update on usuario  for each row execute function public.tocar_updated_at();
create trigger tocar_updated_at before update on gestacao for each row execute function public.tocar_updated_at();
create trigger tocar_updated_at before update on filho    for each row execute function public.tocar_updated_at();
create trigger tocar_updated_at before update on diario   for each row execute function public.tocar_updated_at();
create trigger tocar_updated_at before update on consulta for each row execute function public.tocar_updated_at();

-- O envio do app atualiza linhas de diário que já existem (e marca deleted_at)
grant update on diario to authenticated;
create policy "diario: editar os próprios" on diario for update to authenticated
  using (id_gestacao in (select id_gestacao from gestacao where id_user = (select auth.uid())))
  with check (id_gestacao in (select id_gestacao from gestacao where id_user = (select auth.uid())));

-- Gestação excluída não conta como ativa
drop index uq_gestacao_ativa;
create unique index uq_gestacao_ativa on gestacao (id_user) where status = 'ativa' and deleted_at is null;
