// Ponte sem servidor: o roteiro vai inteiro dentro do link (#importar-<dados>), e quem abre salva uma cópia.
import type { Atividade, Viagem } from './storage';

const atividades: Atividade[] = ['ski', 'viagem', 'descanso', 'passeio'];

interface Pacote {
  v: 1;
  n: string;
  i: string;
  o: string;
  p: number;
  d: string[];
  /** [data, índice do destino ou -1, índice da atividade, nota] */
  x: [string, number, number, string][];
  t: string;
}

function paraBase64Url(texto: string): string {
  const bytes = new TextEncoder().encode(texto);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function deBase64Url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function codificarViagem(v: Viagem): string {
  const pacote: Pacote = {
    v: 1,
    n: v.nome,
    i: v.ida,
    o: v.volta,
    p: v.pessoas,
    d: v.destinos,
    x: v.dias.map((d) => [d.data, d.destinoId ? v.destinos.indexOf(d.destinoId) : -1, atividades.indexOf(d.atividade), d.nota]),
    t: v.notas
  };
  return paraBase64Url(JSON.stringify(pacote));
}

/** Lê o roteiro de um link. Retorna null se o link estiver quebrado. */
export function decodificarViagem(dados: string): Omit<Viagem, 'id' | 'criadaEm'> | null {
  try {
    const p = JSON.parse(deBase64Url(dados)) as Pacote;
    if (p.v !== 1 || !Array.isArray(p.d)) return null;
    return {
      nome: String(p.n ?? 'Roteiro').slice(0, 60),
      ida: p.i ?? '',
      volta: p.o ?? '',
      pessoas: Math.min(30, Math.max(1, Number(p.p) || 1)),
      destinos: p.d.map(String),
      dias: (p.x ?? []).map(([data, i, a, nota]) => ({
        data,
        destinoId: i >= 0 ? p.d[i] ?? null : null,
        atividade: atividades[a] ?? 'ski',
        nota: String(nota ?? '').slice(0, 120)
      })),
      notas: String(p.t ?? '').slice(0, 2000)
    };
  } catch {
    return null;
  }
}

/** Endereço do app com o roteiro dentro. */
export function linkDoRoteiro(v: Viagem): string {
  return `${window.location.origin}${window.location.pathname}#importar-${codificarViagem(v)}`;
}

/** Abre o WhatsApp com o texto pronto (o usuário escolhe o grupo ou o contato). */
export function linkWhatsApp(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}
