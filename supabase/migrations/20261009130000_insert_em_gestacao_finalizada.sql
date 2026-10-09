-- Modo offline: a usuária pode criar uma consulta/diário e depois finalizar a gestação, tudo sem internet.
-- Na sincronização a gestação pode chegar finalizada antes desses registros, e a regra
-- "só cria em gestação ativa" os recusaria (perda de dados). A regra passa a valer só no app
-- (lib/dados.ts, checada no momento da criação); o banco continua garantindo a dona.

drop policy "diario: criar em gestação ativa" on diario;
create policy "diario: criar nas próprias gestações" on diario for insert to authenticated
  with check (id_gestacao in (select id_gestacao from gestacao where id_user = (select auth.uid())));

drop policy "consulta: criar em gestação ativa" on consulta;
create policy "consulta: criar nas próprias gestações" on consulta for insert to authenticated
  with check (id_gestacao in (select id_gestacao from gestacao where id_user = (select auth.uid())));
