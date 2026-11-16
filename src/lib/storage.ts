// Dados do usuário guardados no aparelho (localStorage).
// Na fase 2, os relatos vão para um servidor. A interface destas funções fica igual.

function ler<T>(chave: string, padrao: T): T {
  try {
    const v = localStorage.getItem(chave);
    return v ? (JSON.parse(v) as T) : padrao;
  } catch {
    return padrao;
  }
}

function gravar(chave: string, valor: unknown): void {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* modo privado ou armazenamento cheio: o app continua sem salvar */
  }
}

// A chave 'pt.roteiro' guardava a lista de destinos salvos da versão 0.1. A lista virou "Destinos salvos".
const K = {
  salvos: 'pt.roteiro',
  viagens: 'pt.viagens',
  checklist: 'pt.checklist',
  relatos: 'pt.relatos',
  nome: 'pt.nome',
  perfil: 'pt.perfil',
  visitados: 'pt.visitados',
  avisoPerfil: 'pt.avisoPerfil'
};

/** Destinos salvos (favoritos): o botão de marcador na tela do destino. */
export const salvos = {
  listar: (): string[] => ler(K.salvos, []),
  tem: (id: string) => salvos.listar().includes(id),
  alternar(id: string): boolean {
    const atual = salvos.listar();
    const tem = atual.includes(id);
    gravar(K.salvos, tem ? atual.filter((x) => x !== id) : [...atual, id]);
    return !tem;
  }
};

export type Atividade = 'ski' | 'viagem' | 'descanso' | 'passeio';

export interface DiaViagem {
  /** AAAA-MM-DD */
  data: string;
  /** Onde o grupo está neste dia. null = em trânsito ou sem destino. */
  destinoId: string | null;
  atividade: Atividade;
  nota: string;
}

/** Um roteiro de viagem montado pelo usuário. */
export interface Viagem {
  id: string;
  nome: string;
  /** AAAA-MM-DD ou vazio */
  ida: string;
  volta: string;
  pessoas: number;
  /** Destinos na ordem da viagem. */
  destinos: string[];
  dias: DiaViagem[];
  notas: string;
  criadaEm: string;
}

export const viagens = {
  listar: (): Viagem[] => ler<Viagem[]>(K.viagens, []),
  obter: (id: string): Viagem | undefined => viagens.listar().find((v) => v.id === id),
  salvar(v: Viagem): void {
    const lista = viagens.listar();
    const i = lista.findIndex((x) => x.id === v.id);
    if (i >= 0) lista[i] = v;
    else lista.unshift(v);
    gravar(K.viagens, lista);
  },
  criar(nome: string, destinoId?: string): Viagem {
    const v: Viagem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      nome: nome.trim() || 'Minha viagem',
      ida: '',
      volta: '',
      pessoas: 1,
      destinos: destinoId ? [destinoId] : [],
      dias: [],
      notas: '',
      criadaEm: new Date().toISOString()
    };
    viagens.salvar(v);
    return v;
  },
  excluir(id: string): void {
    gravar(K.viagens, viagens.listar().filter((v) => v.id !== id));
  },
  /** Adiciona o destino ao fim da viagem. Retorna false se o destino já estava na viagem. */
  adicionarDestino(id: string, destinoId: string): boolean {
    const v = viagens.obter(id);
    if (!v || v.destinos.includes(destinoId)) return false;
    viagens.salvar({ ...v, destinos: [...v.destinos, destinoId] });
    return true;
  }
};

export const checklistMarcados = {
  listar: (destinoId: string): string[] => ler<Record<string, string[]>>(K.checklist, {})[destinoId] ?? [],
  alternar(destinoId: string, item: string): string[] {
    const tudo = ler<Record<string, string[]>>(K.checklist, {});
    const atual = tudo[destinoId] ?? [];
    tudo[destinoId] = atual.includes(item) ? atual.filter((x) => x !== item) : [...atual, item];
    gravar(K.checklist, tudo);
    return tudo[destinoId];
  }
};

export interface Relato {
  destinoId: string;
  nome: string;
  nota: number;
  texto: string;
  data: string;
}

export const relatos = {
  listar: (destinoId: string): Relato[] => ler<Relato[]>(K.relatos, []).filter((r) => r.destinoId === destinoId),
  adicionar(r: Relato): void {
    gravar(K.relatos, [r, ...ler<Relato[]>(K.relatos, [])]);
  }
};

export const perfil = {
  nome: (): string => ler(K.nome, ''),
  salvarNome: (nome: string) => gravar(K.nome, nome.trim())
};

// ───────── Perfil do viajante (questionário) ─────────
// Regra da LGPD: só o que o app usa. Nada de número de documento.

export type Esporte = 'ski' | 'snowboard' | 'ambos' | 'indeciso';
export type NivelViajante = 'nunca' | 'iniciante' | 'intermediario' | 'avancado' | 'expert';
export type Grupo = 'sozinho' | 'casal' | 'amigos' | 'familia';
export type Estilo = 'economico' | 'conforto' | 'luxo';
export type Equipamento = 'aluga' | 'roupa' | 'tudo';
export type PasseTemporada = 'epic' | 'ikon' | 'nenhum';

export interface PerfilViajante {
  esporte?: Esporte;
  nivel?: NivelViajante;
  grupo?: Grupo;
  estilo?: Estilo;
  /** Código do aeroporto de saída no Brasil (ex.: GRU). */
  saida?: string;
  /** Meses em que quer viajar (1 a 12). */
  meses?: number[];
  passaporte?: boolean;
  vistoEua?: boolean;
  equipamento?: Equipamento;
  passe?: PasseTemporada;
  /** Data em que o usuário terminou o questionário. */
  concluidoEm?: string;
}

export const perfilViajante = {
  ler: (): PerfilViajante => ler<PerfilViajante>(K.perfil, {}),
  salvar: (p: PerfilViajante) => gravar(K.perfil, p),
  /** true quando o usuário respondeu pelo menos 1 pergunta. */
  temRespostas: (p: PerfilViajante = perfilViajante.ler()) => Object.entries(p).some(([k, v]) => k !== 'concluidoEm' && v !== undefined),
  avisoDispensado: (): boolean => ler(K.avisoPerfil, false),
  dispensarAviso: () => gravar(K.avisoPerfil, true)
};

// ───────── Passaporte de Picos: montanhas onde o usuário já esquiou ─────────

export interface Visita {
  id: string;
  /** Data em que o usuário marcou a visita. */
  em: string;
}

export const visitados = {
  listar: (): Visita[] => ler<Visita[]>(K.visitados, []),
  tem: (id: string) => visitados.listar().some((v) => v.id === id),
  alternar(id: string): boolean {
    const lista = visitados.listar();
    const tem = lista.some((v) => v.id === id);
    gravar(K.visitados, tem ? lista.filter((v) => v.id !== id) : [...lista, { id, em: new Date().toISOString() }]);
    return !tem;
  }
};

// ───────── Seus dados (LGPD): exportar e apagar ─────────

/** Todos os dados que o app guardou neste aparelho, num objeto só. */
export function exportarDados(): Record<string, unknown> {
  const dados: Record<string, unknown> = { exportadoEm: new Date().toISOString(), app: 'PICO 6961' };
  for (const [nome, chave] of Object.entries(K)) dados[nome] = ler<unknown>(chave, null);
  return dados;
}

/** Apaga tudo o que o app guardou neste aparelho (perfil, roteiros, checklist, relatos, visitas). */
export function apagarTodosOsDados(): void {
  try {
    for (const chave of Object.values(K)) localStorage.removeItem(chave);
    localStorage.removeItem('pt.cotacao');
  } catch {
    /* sem armazenamento: nada para apagar */
  }
}
