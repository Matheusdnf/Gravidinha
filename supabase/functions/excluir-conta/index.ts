// Exclui a conta de quem chama (direito de exclusão da LGPD; exigido pela Google Play).
// O app só tem a chave publicável e não pode apagar usuários do Auth; aqui a chave de serviço
// (variável padrão das Edge Functions, nunca vai para o app) apaga:
//   - a foto de perfil no Storage (avatars/{id}/avatar);
//   - o usuário do Auth — usuario, gestacao, filho, diario, consulta, trilha e jornada caem junto
//     pelos "on delete cascade" das migrations.
// Só apaga a própria conta: o id vem do token da sessão, nunca do corpo da requisição.
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const resposta = (status: number, corpo: Record<string, unknown>) =>
  new Response(JSON.stringify(corpo), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return resposta(405, { erro: "Método não permitido" });

  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return resposta(401, { erro: "Sessão ausente" });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return resposta(401, { erro: "Sessão inválida" });
  const id = data.user.id;

  // Foto primeiro: sem o usuário, ninguém mais acharia o arquivo. Falha aqui não impede a exclusão.
  const { error: erroFoto } = await admin.storage.from("avatars").remove([`${id}/avatar`]);
  if (erroFoto) console.error("Falha ao remover a foto", id, erroFoto);

  const { error: erroExclusao } = await admin.auth.admin.deleteUser(id);
  if (erroExclusao) {
    console.error("Falha ao excluir usuário", id, erroExclusao);
    return resposta(500, { erro: "Não foi possível excluir a conta" });
  }
  return resposta(200, { ok: true });
});
