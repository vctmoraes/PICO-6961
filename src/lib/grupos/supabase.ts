// Modo real: Supabase (login por e-mail com link mágico, banco Postgres com regras por grupo e tempo real).
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Viagem } from '../storage';
import type { BackendGrupos, Cartao, Enquete, Grupo, Membro, Mensagem, Mudanca, Usuario } from './tipos';

interface LinhaGrupo {
  id: string;
  nome: string;
  codigo: string;
  criado_por: string | null;
  criado_em: string;
}

const grupoDe = (g: LinhaGrupo): Grupo => ({ id: g.id, nome: g.nome, codigo: g.codigo, criadoPor: g.criado_por, criadoEm: g.criado_em });

function erro(e: { message: string } | null): void {
  if (e) throw new Error(e.message);
}

export function criarBackendSupabase(url: string, chaveAnon: string): BackendGrupos {
  const sb: SupabaseClient = createClient(url, chaveAnon, {
    auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true, storageKey: 'pt.sessao' }
  });

  // Depois do link mágico, o endereço volta com ?code=. O cliente troca o código pela sessão; aqui limpamos o endereço.
  sb.auth.onAuthStateChange((ev) => {
    if (ev === 'SIGNED_IN' && window.location.search.includes('code=')) {
      history.replaceState(null, '', window.location.pathname + window.location.hash);
    }
  });

  const uid = async () => (await sb.auth.getSession()).data.session?.user.id ?? null;

  const nomes = async (ids: string[]) => {
    const unicos = [...new Set(ids.filter(Boolean))];
    if (!unicos.length) return new Map<string, string>();
    const { data } = await sb.from('perfis').select('id, nome').in('id', unicos);
    return new Map((data ?? []).map((p: { id: string; nome: string }) => [p.id, p.nome]));
  };

  return {
    modo: 'supabase',

    async usuario(): Promise<Usuario | null> {
      const s = (await sb.auth.getSession()).data.session;
      if (!s) return null;
      const { data } = await sb.from('perfis').select('nome, idade_ok').eq('id', s.user.id).maybeSingle();
      return { id: s.user.id, email: s.user.email, nome: data?.nome ?? '', idadeOk: !!data?.idade_ok };
    },

    aoMudarLogin(cb) {
      const { data } = sb.auth.onAuthStateChange(() => cb());
      return () => data.subscription.unsubscribe();
    },

    async entrarComEmail(email) {
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}${window.location.pathname}${window.location.hash}` }
      });
      erro(error);
    },

    async completarCadastro(nome, idadeOk) {
      const id = await uid();
      if (!id) throw new Error('Faça login de novo.');
      const { error } = await sb.from('perfis').upsert({ id, nome: nome.trim(), idade_ok: idadeOk });
      erro(error);
    },

    async sair() {
      await sb.auth.signOut();
    },

    async meusGrupos() {
      const { data, error } = await sb.from('grupos').select('*').order('criado_em', { ascending: false });
      erro(error);
      return (data ?? []).map(grupoDe);
    },

    async criarGrupo(nome) {
      const { data, error } = await sb.rpc('criar_grupo', { nome_grupo: nome });
      erro(error);
      return grupoDe(data as LinhaGrupo);
    },

    async entrarNoGrupo(codigo) {
      const { data, error } = await sb.rpc('entrar_no_grupo', { codigo_convite: codigo });
      erro(error);
      return grupoDe(data as LinhaGrupo);
    },

    async sairDoGrupo(grupoId) {
      const id = await uid();
      const { error } = await sb.from('membros').delete().eq('grupo_id', grupoId).eq('usuario_id', id!);
      erro(error);
    },

    async grupo(id) {
      const { data } = await sb.from('grupos').select('*').eq('id', id).maybeSingle();
      return data ? grupoDe(data as LinhaGrupo) : null;
    },

    async membros(grupoId): Promise<Membro[]> {
      const { data, error } = await sb.from('membros').select('usuario_id, papel').eq('grupo_id', grupoId);
      erro(error);
      const linhas = (data ?? []) as { usuario_id: string; papel: 'dono' | 'membro' }[];
      const n = await nomes(linhas.map((l) => l.usuario_id));
      return linhas.map((l) => ({ usuarioId: l.usuario_id, papel: l.papel, nome: n.get(l.usuario_id) ?? 'Pessoa' }));
    },

    async mensagens(grupoId): Promise<Mensagem[]> {
      const { data, error } = await sb
        .from('mensagens')
        .select('id, grupo_id, autor_id, texto, cartao, criado_em')
        .eq('grupo_id', grupoId)
        .order('criado_em', { ascending: true })
        .limit(300);
      erro(error);
      const linhas = (data ?? []) as { id: string; grupo_id: string; autor_id: string | null; texto: string | null; cartao: Cartao | null; criado_em: string }[];
      const n = await nomes(linhas.map((l) => l.autor_id ?? ''));
      return linhas.map((l) => ({
        id: l.id,
        grupoId: l.grupo_id,
        autorId: l.autor_id,
        autorNome: l.autor_id ? n.get(l.autor_id) ?? 'Pessoa' : 'Conta apagada',
        texto: l.texto ?? undefined,
        cartao: l.cartao ?? undefined,
        criadoEm: l.criado_em
      }));
    },

    async enviar(grupoId, m) {
      const id = await uid();
      const { error } = await sb.from('mensagens').insert({ grupo_id: grupoId, autor_id: id, texto: m.texto ?? null, cartao: m.cartao ?? null });
      erro(error);
    },

    async apagarMensagem(id) {
      const { error } = await sb.from('mensagens').delete().eq('id', id);
      erro(error);
    },

    async roteiro(grupoId) {
      const { data } = await sb.from('roteiros_grupo').select('dados, atualizado_por, atualizado_em').eq('grupo_id', grupoId).maybeSingle();
      if (!data) return { viagem: null };
      const n = await nomes([data.atualizado_por ?? '']);
      return { viagem: data.dados as Viagem, atualizadoPor: data.atualizado_por ? n.get(data.atualizado_por) ?? null : null, atualizadoEm: data.atualizado_em };
    },

    async salvarRoteiro(grupoId, v) {
      const id = await uid();
      const { error } = await sb.from('roteiros_grupo').upsert({ grupo_id: grupoId, dados: v, atualizado_por: id, atualizado_em: new Date().toISOString() });
      erro(error);
    },

    async enquetes(grupoId): Promise<Enquete[]> {
      const { data, error } = await sb.from('enquetes').select('*').eq('grupo_id', grupoId).order('criada_em', { ascending: false });
      erro(error);
      const lista = (data ?? []) as { id: string; grupo_id: string; pergunta: string; opcoes: string[]; criada_por: string | null; criada_em: string }[];
      if (!lista.length) return [];
      const { data: votos } = await sb.from('votos').select('enquete_id, usuario_id, opcao').in('enquete_id', lista.map((e) => e.id));
      return lista.map((e) => ({
        id: e.id,
        grupoId: e.grupo_id,
        pergunta: e.pergunta,
        opcoes: e.opcoes,
        criadaPor: e.criada_por,
        criadaEm: e.criada_em,
        votos: Object.fromEntries(((votos ?? []) as { enquete_id: string; usuario_id: string; opcao: number }[]).filter((v) => v.enquete_id === e.id).map((v) => [v.usuario_id, v.opcao]))
      }));
    },

    async criarEnquete(grupoId, pergunta, opcoes) {
      const id = await uid();
      const { data, error } = await sb.from('enquetes').insert({ grupo_id: grupoId, pergunta, opcoes, criada_por: id }).select('*').single();
      erro(error);
      return { id: data.id, grupoId, pergunta, opcoes, criadaPor: id, criadaEm: data.criada_em, votos: {} };
    },

    async votar(enqueteId, opcao) {
      const id = await uid();
      const { error } = await sb.from('votos').upsert({ enquete_id: enqueteId, usuario_id: id, opcao });
      erro(error);
    },

    async denunciar(mensagemId, motivo) {
      const { error } = await sb.rpc('denunciar_mensagem', { msg: mensagemId, motivo_denuncia: motivo });
      erro(error);
    },

    async bloquear(usuarioId) {
      const id = await uid();
      const { error } = await sb.from('bloqueios').upsert({ usuario_id: id, bloqueado_id: usuarioId });
      erro(error);
    },

    async desbloquear(usuarioId) {
      const id = await uid();
      const { error } = await sb.from('bloqueios').delete().eq('usuario_id', id!).eq('bloqueado_id', usuarioId);
      erro(error);
    },

    async bloqueados() {
      const { data } = await sb.from('bloqueios').select('bloqueado_id');
      return ((data ?? []) as { bloqueado_id: string }[]).map((b) => b.bloqueado_id);
    },

    ouvir(grupoId, cb: (m: Mudanca) => void) {
      const canal = sb
        .channel(`grupo-${grupoId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'mensagens', filter: `grupo_id=eq.${grupoId}` }, () => cb('mensagens'))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'roteiros_grupo', filter: `grupo_id=eq.${grupoId}` }, () => cb('roteiro'))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'enquetes', filter: `grupo_id=eq.${grupoId}` }, () => cb('enquetes'))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'votos' }, () => cb('enquetes'))
        .subscribe();
      return () => {
        sb.removeChannel(canal);
      };
    },

    async apagarConta() {
      const { error } = await sb.functions.invoke('apagar-conta');
      if (error) {
        // Sem a função publicada: apaga ao menos os dados do app.
        const r = await sb.rpc('apagar_meus_dados');
        erro(r.error);
      }
      await sb.auth.signOut();
    }
  };
}
