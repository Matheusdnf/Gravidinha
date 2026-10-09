-- rls_auto_enable() é a função do event trigger ensure_rls (criado pelo Supabase junto com o projeto).
-- Event trigger não depende de EXECUTE, então dá para fechá-la na API sem mudar o comportamento.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
