// Modo demonstração: mesma interface do modo real, com tudo salvo só neste aparelho.
// Serve para ver e testar as telas antes de ligar o Supabase. Não cria pessoas nem mensagens falsas.
import type { Viagem } from '../storage';
import type { BackendGrupos, Enquete, Grupo, Mensagem, Mudanca, Usuario } from './tipos';

const CHAVE = 'pt.gruposDemo';
const EU = 'voce';

interface Dados {
  logado: boolean;
  nome: string;
  idadeOk: boolean;
  grupos: Grupo[];
  mensagens: Mensagem[];
  roteiros: Record<string, { viagem: Viagem; atualizadoEm: string }>;
  enquetes: Enquete[];
  bloqueados: string[];
  listaEspera?: { peca: string; tamanho?: string; em: string }[];
}

const vazio = (): Dados => ({ logado: false, nome: '', idadeOk: false, grupos: [], mensagens: [], roteiros: {}, enquetes: [], bloqueados: [] });

function ler(): Dados {
  try {
    return { ...vazio(), ...(JSON.parse(localStorage.getItem(CHAVE) ?? 'null') ?? {}) };
  } catch {
    return vazio();
  }
}

function gravar(d: Dados) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(d));
  } catch {
    /* sem armazenamento */
  }
}

const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const codigo = () => Math.random().toString(36).slice(2, 10).toUpperCase();

export function criarBackendDemo(): BackendGrupos {
  const ouvintesLogin = new Set<() => void>();
  const ouvintes = new Map<string, Set<(m: Mudanca) => void>>();
  const avisar = (grupoId: string, m: Mudanca) => ouvintes.get(grupoId)?.forEach((cb) => setTimeout(() => cb(m), 0));
  const mudar = (f: (d: Dados) => void) => {
    const d = ler();
    f(d);
    gravar(d);
    return d;
  };

  return {
    modo: 'demo',
    async usuario(): Promise<Usuario | null> {
      const d = ler();
      return d.logado ? { id: EU, email: 'demonstracao@pico6961', nome: d.nome, idadeOk: d.idadeOk } : null;
    },
    aoMudarLogin(cb) {
      ouvintesLogin.add(cb);
      return () => ouvintesLogin.delete(cb);
    },
    async entrarComEmail() {
      mudar((d) => (d.logado = true));
      ouvintesLogin.forEach((cb) => cb());
    },
    async completarCadastro(nome, idadeOk) {
      mudar((d) => {
        d.nome = nome.trim();
        d.idadeOk = idadeOk;
      });
      ouvintesLogin.forEach((cb) => cb());
    },
    async sair() {
      mudar((d) => (d.logado = false));
      ouvintesLogin.forEach((cb) => cb());
    },
    async meusGrupos() {
      return ler().grupos;
    },
    async criarGrupo(nome) {
      const g: Grupo = { id: novoId(), nome: nome.trim(), codigo: codigo(), criadoPor: EU, criadoEm: new Date().toISOString() };
      mudar((d) => d.grupos.unshift(g));
      return g;
    },
    async entrarNoGrupo(c) {
      const g = ler().grupos.find((x) => x.codigo === c.trim().toUpperCase());
      if (!g) throw new Error('Código de convite não encontrado. No modo demonstração, só os grupos deste aparelho existem.');
      return g;
    },
    async sairDoGrupo(grupoId) {
      mudar((d) => {
        d.grupos = d.grupos.filter((g) => g.id !== grupoId);
        d.mensagens = d.mensagens.filter((m) => m.grupoId !== grupoId);
        d.enquetes = d.enquetes.filter((e) => e.grupoId !== grupoId);
        delete d.roteiros[grupoId];
      });
    },
    async grupo(id) {
      return ler().grupos.find((g) => g.id === id) ?? null;
    },
    async membros() {
      const d = ler();
      return [{ usuarioId: EU, nome: d.nome || 'Você', papel: 'dono' as const }];
    },
    async mensagens(grupoId) {
      return ler().mensagens.filter((m) => m.grupoId === grupoId);
    },
    async enviar(grupoId, m) {
      mudar((d) => d.mensagens.push({ id: novoId(), grupoId, autorId: EU, autorNome: d.nome || 'Você', ...m, criadoEm: new Date().toISOString() }));
      avisar(grupoId, 'mensagens');
    },
    async apagarMensagem(id) {
      let g = '';
      mudar((d) => {
        g = d.mensagens.find((m) => m.id === id)?.grupoId ?? '';
        d.mensagens = d.mensagens.filter((m) => m.id !== id);
      });
      if (g) avisar(g, 'mensagens');
    },
    async roteiro(grupoId) {
      const r = ler().roteiros[grupoId];
      return r ? { viagem: r.viagem, atualizadoPor: ler().nome || 'Você', atualizadoEm: r.atualizadoEm } : { viagem: null };
    },
    async salvarRoteiro(grupoId, v) {
      mudar((d) => (d.roteiros[grupoId] = { viagem: v, atualizadoEm: new Date().toISOString() }));
      avisar(grupoId, 'roteiro');
    },
    async enquetes(grupoId) {
      return ler().enquetes.filter((e) => e.grupoId === grupoId);
    },
    async criarEnquete(grupoId, pergunta, opcoes) {
      const e: Enquete = { id: novoId(), grupoId, pergunta, opcoes, criadaPor: EU, criadaEm: new Date().toISOString(), votos: {} };
      mudar((d) => d.enquetes.unshift(e));
      avisar(grupoId, 'enquetes');
      return e;
    },
    async votar(enqueteId, opcao) {
      let g = '';
      mudar((d) => {
        const e = d.enquetes.find((x) => x.id === enqueteId);
        if (e) {
          e.votos[EU] = opcao;
          g = e.grupoId;
        }
      });
      if (g) avisar(g, 'enquetes');
    },
    async denunciar() {
      /* No modo demonstração, não há moderação. */
    },
    async bloquear(usuarioId) {
      mudar((d) => d.bloqueados.push(usuarioId));
    },
    async desbloquear(usuarioId) {
      mudar((d) => (d.bloqueados = d.bloqueados.filter((x) => x !== usuarioId)));
    },
    async bloqueados() {
      return ler().bloqueados;
    },
    ouvir(grupoId, cb) {
      if (!ouvintes.has(grupoId)) ouvintes.set(grupoId, new Set());
      ouvintes.get(grupoId)!.add(cb);
      return () => ouvintes.get(grupoId)?.delete(cb);
    },
    async entrarNaListaDeEspera({ peca, tamanho }) {
      // Modo demonstração: guarda só a peça e o tamanho, sem o e-mail.
      mudar((d) => (d.listaEspera = [...(d.listaEspera ?? []), { peca, tamanho, em: new Date().toISOString() }]));
    },
    async apagarConta() {
      gravar(vazio());
      ouvintesLogin.forEach((cb) => cb());
    }
  };
}
