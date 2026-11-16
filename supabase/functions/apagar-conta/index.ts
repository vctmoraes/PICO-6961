// Função do Supabase (Edge Function) que apaga a conta de quem pede: dados do app e login.
// Publicar: supabase functions deploy apagar-conta
// A chave "service_role" fica só no servidor do Supabase (variável SUPABASE_SERVICE_ROLE_KEY). Nunca no app.
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const url = Deno.env.get('SUPABASE_URL')!;
  const jwt = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');

  // 1. Confere quem pede, com o login da própria pessoa.
  const comoUsuario = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: `Bearer ${jwt}` } } });
  const { data, error } = await comoUsuario.auth.getUser(jwt);
  if (error || !data.user) return new Response(JSON.stringify({ erro: 'Login inválido' }), { status: 401, headers: cors });

  // 2. Apaga os dados do app (mensagens, votos, grupos, perfil).
  const r = await comoUsuario.rpc('apagar_meus_dados');
  if (r.error) return new Response(JSON.stringify({ erro: r.error.message }), { status: 500, headers: cors });

  // 3. Apaga o login.
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const del = await admin.auth.admin.deleteUser(data.user.id);
  if (del.error) return new Response(JSON.stringify({ erro: del.error.message }), { status: 500, headers: cors });

  return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, 'Content-Type': 'application/json' } });
});
