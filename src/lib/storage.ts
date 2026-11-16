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

const K = { roteiro: 'pt.roteiro', checklist: 'pt.checklist', relatos: 'pt.relatos', nome: 'pt.nome' };

export const roteiro = {
  listar: (): string[] => ler(K.roteiro, []),
  tem: (id: string) => roteiro.listar().includes(id),
  alternar(id: string): boolean {
    const atual = roteiro.listar();
    const tem = atual.includes(id);
    gravar(K.roteiro, tem ? atual.filter((x) => x !== id) : [...atual, id]);
    return !tem;
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
