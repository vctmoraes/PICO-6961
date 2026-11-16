// Regras do roteiro de viagem: dias, distribuição automática, custo e texto para compartilhar.
import { buscarDestino } from '../data/destinos';
import type { Atividade, DiaViagem, Viagem } from './storage';

export const MAX_DIAS = 60;

export const atividadeLabel: Record<Atividade, string> = {
  ski: 'Ski',
  viagem: 'Viagem',
  descanso: 'Descanso',
  passeio: 'Passeio'
};

/** Lista as datas de ida até volta (inclusive). Vazio se as datas são inválidas. */
export function datasEntre(ida: string, volta: string): string[] {
  if (!ida || !volta || volta < ida) return [];
  const out: string[] = [];
  const d = new Date(`${ida}T12:00:00Z`);
  const fim = new Date(`${volta}T12:00:00Z`);
  while (d <= fim && out.length < MAX_DIAS) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

/** Refaz a lista de dias quando as datas mudam. Mantém o que o usuário já escreveu nas datas que continuam. */
export function ajustarDias(v: Viagem): DiaViagem[] {
  const antigos = new Map(v.dias.map((d) => [d.data, d]));
  return datasEntre(v.ida, v.volta).map(
    (data) => antigos.get(data) ?? { data, destinoId: v.destinos[0] ?? null, atividade: 'ski', nota: '' }
  );
}

/**
 * Distribui os dias entre os destinos, na ordem da viagem.
 * Primeiro e último dia: viagem. Os dias do meio: ski, divididos o mais igual possível.
 * As notas do usuário ficam.
 */
export function distribuirDias(v: Viagem): DiaViagem[] {
  const dias = ajustarDias(v);
  const n = dias.length;
  const k = v.destinos.length;
  if (n === 0) return dias;
  if (k === 0) return dias.map((d) => ({ ...d, destinoId: null }));

  const meio = Math.max(0, n - 2);
  const base = Math.floor(meio / k);
  const extra = meio % k;
  const plano: { destinoId: string; atividade: Atividade }[] = [];
  v.destinos.forEach((id, i) => {
    for (let j = 0; j < base + (i < extra ? 1 : 0); j++) plano.push({ destinoId: id, atividade: 'ski' });
  });

  return dias.map((d, i) => {
    if (n >= 2 && i === 0) return { ...d, destinoId: v.destinos[0], atividade: 'viagem' };
    if (n >= 2 && i === n - 1) return { ...d, destinoId: v.destinos[k - 1], atividade: 'viagem' };
    const p = plano[n >= 2 ? i - 1 : i] ?? { destinoId: v.destinos[0], atividade: 'ski' as Atividade };
    return { ...d, ...p };
  });
}

export interface Custo {
  /** Soma dos passes com preço conhecido (em US$). */
  total: number;
  diasSki: number;
  /** Destinos com dia de ski e sem preço de referência. */
  semPreco: string[];
}

/** Custo estimado de passe: dias de ski em cada destino × pessoas × preço de referência. */
export function custoPasses(v: Viagem): Custo {
  let total = 0;
  let diasSki = 0;
  const semPreco = new Set<string>();
  for (const dia of v.dias) {
    if (dia.atividade !== 'ski' || !dia.destinoId) continue;
    diasSki++;
    const d = buscarDestino(dia.destinoId);
    if (!d) continue;
    if (d.passe.valor != null && d.passe.moeda === 'USD') total += d.passe.valor * Math.max(1, v.pessoas);
    else semPreco.add(d.nome);
  }
  return { total, diasSki, semPreco: [...semPreco] };
}

export function dataCurta(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }).replace('.', '');
}

/** Texto do roteiro para colar no WhatsApp ou no e-mail. */
export function textoDoRoteiro(v: Viagem): string {
  const linhas = [`🏔️ ${v.nome}`];
  if (v.ida && v.volta) linhas.push(`${dataCurta(v.ida)} a ${dataCurta(v.volta)} · ${v.dias.length} dias · ${v.pessoas} ${v.pessoas === 1 ? 'pessoa' : 'pessoas'}`);
  const nomes = v.destinos.map((id) => buscarDestino(id)?.nome).filter(Boolean);
  if (nomes.length) linhas.push(`Destinos: ${nomes.join(' → ')}`);
  if (v.dias.length) {
    linhas.push('', 'Dia a dia:');
    for (const d of v.dias) {
      const onde = d.destinoId ? buscarDestino(d.destinoId)?.nome : 'Em trânsito';
      linhas.push(`• ${dataCurta(d.data)} — ${onde} — ${atividadeLabel[d.atividade]}${d.nota ? ` (${d.nota})` : ''}`);
    }
  }
  if (v.notas.trim()) linhas.push('', `Notas: ${v.notas.trim()}`);
  linhas.push('', 'Feito no Pico Trip');
  return linhas.join('\n');
}
