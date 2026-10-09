-- Verifica as regras do banco que a sincronização offline usa (RLS, triggers, gestação ativa única).
-- Roda no SQL Editor do Supabase (ou via MCP execute_sql). Cria duas contas de teste dentro de uma
-- transação e desfaz TUDO no final: o resultado sempre aparece como erro.
--   "REGRAS OK (rollback): ..."  → tudo certo
--   "FALHOU: ..."                → a regra descrita não se comportou como o app espera
do $$
declare
  ana uuid := gen_random_uuid();
  bia uuid := gen_random_uuid();
  g_a uuid := gen_random_uuid();
  g_b uuid := gen_random_uuid();
  c_a uuid := gen_random_uuid();
  d_a uuid := gen_random_uuid();
  n int;
  ok int := 0;
begin
  -- Contas de teste (o trigger do cadastro cria as linhas em usuario)
  insert into auth.users (id, email, raw_user_meta_data) values
    (ana, 'ana@teste.local', '{"name":"Ana","cellphone":"11999999999","data_nascimento":"1995-01-01"}'),
    (bia, 'bia@teste.local', '{"name":"Bia","cellphone":"11988888888","data_nascimento":"1996-01-01"}');

  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', ana, 'role', 'authenticated')::text, true);

  -- 1. Push da gestação: insert com id gerado no app
  insert into gestacao (id_gestacao, id_user, nome, status, data_inicio) values (g_a, ana, 'A', 'ativa', current_date);
  ok := ok + 1;

  -- 2. Segunda gestação ativa é recusada (23505 → app descarta a local e avisa)
  begin
    insert into gestacao (id_gestacao, id_user, nome, status) values (g_b, ana, 'B', 'ativa');
    raise exception 'FALHOU: segunda gestação ativa foi aceita';
  exception when unique_violation then ok := ok + 1;
  end;

  -- 3. Consulta e diário criados na gestação ativa
  insert into consulta (id_consulta, id_gestacao, data, horario, local, descricao)
    values (c_a, g_a, current_date, '09:30:00', 'Clínica', 'Pré-natal');
  insert into diario (id_diario, id_gestacao, data, hora, reacao, descricao)
    values (d_a, g_a, current_date, '10:00', 'feliz', 'Primeiro registro');
  ok := ok + 1;

  -- 4. Update toca updated_at (é o cursor do pull). now() é fixo dentro da transação, então
  -- o teste tenta gravar um valor antigo: o trigger tem que trocá-lo pelo horário do servidor.
  update consulta set descricao = 'Pré-natal (remarcado)', updated_at = '2000-01-01' where id_consulta = c_a;
  if (select updated_at from consulta where id_consulta = c_a) <> now() then
    raise exception 'FALHOU: trigger não atualizou updated_at da consulta';
  end if;
  ok := ok + 1;

  -- 5. Finalizar a gestação
  update gestacao set status = 'finalizada', data_finalizacao = current_date where id_gestacao = g_a;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FALHOU: finalizar gestação afetou % linhas', n; end if;
  ok := ok + 1;

  -- 6. Registro feito offline antes da finalização chega depois dela: precisa ser aceito
  begin
    insert into consulta (id_gestacao, data, horario, local, descricao) values (g_a, current_date, '11:00:00', 'X', 'Offline');
    insert into diario (id_gestacao, data, reacao, descricao) values (g_a, current_date, 'calma', 'Offline');
    ok := ok + 1;
  exception when insufficient_privilege then
    raise exception 'FALHOU: insert em gestação finalizada da própria usuária foi barrado pelo RLS';
  end;

  -- 7. Editar e excluir (soft delete) em gestação finalizada
  update consulta set deleted_at = now() where id_consulta = c_a;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FALHOU: soft delete de consulta afetou % linhas', n; end if;
  update diario set deleted_at = now() where id_diario = d_a;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FALHOU: update de diário afetou % linhas (falta grant/policy?)', n; end if;
  ok := ok + 1;

  -- 8. Depois de finalizar, nova gestação ativa é aceita
  insert into gestacao (id_gestacao, id_user, nome, status) values (g_b, ana, 'B', 'ativa');
  ok := ok + 1;

  -- 9. Gestação ativa excluída (deleted_at) não bloqueia outra ativa
  update gestacao set deleted_at = now() where id_gestacao = g_b;
  insert into gestacao (id_user, nome, status) values (ana, 'C', 'ativa');
  ok := ok + 1;

  -- 10. usuario não aceita insert (o push do perfil é sempre update)
  begin
    insert into usuario (id_user, name, cellphone, data_nascimento) values (gen_random_uuid(), 'X', 11977777777, '2000-01-01');
    raise exception 'FALHOU: insert em usuario foi aceito';
  exception when insufficient_privilege then ok := ok + 1;
  end;

  -- 11. Outra conta não vê nem altera os dados da Ana
  perform set_config('request.jwt.claims', json_build_object('sub', bia, 'role', 'authenticated')::text, true);
  if exists (select 1 from gestacao where id_user = ana) or exists (select 1 from consulta where id_gestacao = g_a) then
    raise exception 'FALHOU: Bia enxerga dados da Ana';
  end if;
  update consulta set descricao = 'invadido' where id_gestacao = g_a;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FALHOU: Bia alterou % consultas da Ana', n; end if;
  begin
    insert into consulta (id_gestacao, data, horario, local, descricao) values (g_a, current_date, '12:00:00', 'X', 'invasão');
    raise exception 'FALHOU: Bia inseriu consulta na gestação da Ana';
  exception when insufficient_privilege then ok := ok + 1;
  end;

  raise exception 'REGRAS OK (rollback): % verificações', ok;
end $$;
