// Interface única dos grupos. O modo real usa o Supabase; o modo demonstração guarda tudo no aparelho.
import type { Viagem } from '../storage';

export interface Usuario {
  id: string;
  email?: string;
  /** Vazio = a pessoa ainda não completou o cadastro (nome e idade). */
  nome: string;
  idadeOk: boolean;
}

export interface Grupo {
  id: string;
  nome: string;
  codigo: string;
  criadoPor: string | null;
  criadoEm: string;
}

export interface Membro {
  usuarioId: string;
  nome: string;
  papel: 'dono' | 'membro';
}

export type Cartao =
  | { tipo: 'destino'; id: string }
  | { tipo: 'comparacao'; ids: string[] }
  | { tipo: 'enquete'; id: string; pergunta?: string }
  | { tipo: 'roteiro' };

export interface Mensagem {
  id: string;
  grupoId: string;
  autorId: string | null;
  autorNome: string;
  texto?: string;
  cartao?: Cartao;
  criadoEm: string;
}

export interface Enquete {
  id: string;
  grupoId: string;
  pergunta: string;
  opcoes: string[];
  criadaPor: string | null;
  criadaEm: string;
  /** usuário → índice da opção */
  votos: Record<string, number>;
}

export interface RoteiroGrupo {
  viagem: Viagem | null;
  atualizadoPor?: string | null;
  atualizadoEm?: string;
}

export type Mudanca = 'mensagens' | 'roteiro' | 'enquetes';

export type PecaLoja = 'bone' | 'camiseta' | 'moletom' | 'gorro';

export interface BackendGrupos {
  modo: 'supabase' | 'demo';
  usuario(): Promise<Usuario | null>;
  aoMudarLogin(cb: () => void): () => void;
  entrarComEmail(email: string): Promise<void>;
  completarCadastro(nome: string, idadeOk: boolean): Promise<void>;
  sair(): Promise<void>;
  meusGrupos(): Promise<Grupo[]>;
  criarGrupo(nome: string): Promise<Grupo>;
  entrarNoGrupo(codigo: string): Promise<Grupo>;
  sairDoGrupo(grupoId: string): Promise<void>;
  grupo(id: string): Promise<Grupo | null>;
  membros(grupoId: string): Promise<Membro[]>;
  mensagens(grupoId: string): Promise<Mensagem[]>;
  enviar(grupoId: string, m: { texto?: string; cartao?: Cartao }): Promise<void>;
  apagarMensagem(id: string): Promise<void>;
  roteiro(grupoId: string): Promise<RoteiroGrupo>;
  salvarRoteiro(grupoId: string, v: Viagem): Promise<void>;
  enquetes(grupoId: string): Promise<Enquete[]>;
  criarEnquete(grupoId: string, pergunta: string, opcoes: string[]): Promise<Enquete>;
  votar(enqueteId: string, opcao: number): Promise<void>;
  denunciar(mensagemId: string, motivo: string): Promise<void>;
  bloquear(usuarioId: string): Promise<void>;
  desbloquear(usuarioId: string): Promise<void>;
  bloqueados(): Promise<string[]>;
  /** Avisa quando algo muda no grupo (tempo real). Retorna a função que para de ouvir. */
  ouvir(grupoId: string, cb: (m: Mudanca) => void): () => void;
  /** Lista de espera da loja PICO 6961. */
  entrarNaListaDeEspera(dados: { email: string; peca: PecaLoja; tamanho?: string }): Promise<void>;
  /** Apaga a conta e os dados do servidor (LGPD). */
  apagarConta(): Promise<void>;
}
