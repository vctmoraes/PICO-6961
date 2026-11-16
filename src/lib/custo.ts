// "Quanto custa 1 dia na montanha": passe + aluguel de equipamento + aluguel de roupa, por pessoa.
// Respeita o perfil: quem tem tudo não vê aluguel; quem tem a roupa vê só o equipamento; snowboard usa a faixa de prancha.
import type { Destino } from '../data/destinos';
import type { Faixa } from '../data/aluguel';
import { formatarReal, paraReal, type Cotacoes, type Moeda } from './moeda';
import type { PerfilViajante, Viagem } from './storage';

const simbolo: Record<Moeda, string> = { USD: 'US$', CLP: 'CLP', ARS: 'AR$' };

export function formatarFaixa(f: Faixa, moeda: Moeda): string {
  const n = (x: number) => x.toLocaleString('pt-BR');
  return f.min === f.max ? `${simbolo[moeda]} ${n(f.min)}` : `${simbolo[moeda]} ${n(f.min)}–${n(f.max)}`;
}

export interface LinhaCusto {
  rotulo: string;
  /** Texto na moeda original, "Dinâmico" ou "Consultar". */
  valor: string;
  /** Faixa em reais, quando há valor e cotação. */
  real?: [number, number];
  /** true = a linha não tem número (Dinâmico ou Consultar). */
  semValor?: boolean;
}

export interface CustoDia {
  linhas: LinhaCusto[];
  /** Soma em reais das linhas com número. Sem cotação: undefined. */
  total?: [number, number];
  /** Alguma linha ficou sem número: o total é parcial. */
  parcial: boolean;
}

/** Quais aluguéis entram, pelo perfil. Sem resposta, o app mostra tudo. */
export function aluguelDoPerfil(p: PerfilViajante) {
  return { equipamento: p.equipamento !== 'tudo', roupa: p.equipamento === undefined || p.equipamento === 'aluga' };
}

function rotuloEquipamento(p: PerfilViajante): string {
  if (p.esporte === 'snowboard') return 'Aluguel de prancha e bota';
  if (p.esporte === 'ski') return 'Aluguel de ski, bota e bastão';
  return 'Aluguel de equipamento (ski ou snowboard)';
}

function faixaEquipamento(d: Destino, p: PerfilViajante): Faixa | undefined {
  return p.esporte === 'snowboard' && d.aluguel?.snowboard ? d.aluguel.snowboard : d.aluguel?.equipamento;
}

function linhaFaixa(rotulo: string, f: Faixa | undefined, moeda: Moeda | undefined, cot: Cotacoes | null): LinhaCusto {
  if (!f || !moeda) return { rotulo, valor: 'Consultar', semValor: true };
  const a = paraReal(f.min, moeda, cot);
  const b = paraReal(f.max, moeda, cot);
  return { rotulo, valor: formatarFaixa(f, moeda), real: a != null && b != null ? [a, b] : undefined };
}

export function custoDoDia(d: Destino, p: PerfilViajante, cot: Cotacoes | null): CustoDia {
  const linhas: LinhaCusto[] = [];

  // Passe
  if (d.passe.valor != null) linhas.push(linhaFaixa('Passe do dia', { min: d.passe.valor, max: d.passe.valor }, d.passe.moeda, cot));
  else linhas.push({ rotulo: 'Passe do dia', valor: d.passeInfo ? 'Dinâmico' : 'Consultar', semValor: true });

  const quer = aluguelDoPerfil(p);
  if (quer.equipamento) linhas.push(linhaFaixa(rotuloEquipamento(p), faixaEquipamento(d, p), d.aluguel?.moeda, cot));
  if (quer.roupa) linhas.push(linhaFaixa('Aluguel de roupa (jaqueta e calça)', d.aluguel?.roupa, d.aluguel?.moeda, cot));

  const parcial = linhas.some((l) => l.semValor);
  const comReal = linhas.filter((l) => l.real);
  const todasComCotacao = linhas.every((l) => l.semValor || l.real);
  const total: [number, number] | undefined =
    cot && comReal.length && todasComCotacao ? [comReal.reduce((s, l) => s + l.real![0], 0), comReal.reduce((s, l) => s + l.real![1], 0)] : undefined;
  return { linhas, total, parcial };
}

export interface CustoMontanha {
  /** Total em reais do grupo (passe + aluguel do perfil), só com valores conhecidos. */
  total?: [number, number];
  diasSki: number;
  /** Destinos com algum valor faltando (fora da soma). */
  incompletos: string[];
}

/** Custo de montanha do roteiro: cada dia de ski × pessoas × (passe + aluguel do perfil), em reais. */
export function custoMontanha(v: Viagem, buscar: (id: string) => Destino | undefined, p: PerfilViajante, cot: Cotacoes | null): CustoMontanha {
  if (!cot) return { diasSki: v.dias.filter((x) => x.atividade === 'ski' && x.destinoId).length, incompletos: [] };
  let min = 0;
  let max = 0;
  let dias = 0;
  const incompletos = new Set<string>();
  for (const dia of v.dias) {
    if (dia.atividade !== 'ski' || !dia.destinoId) continue;
    const d = buscar(dia.destinoId);
    if (!d) continue;
    dias++;
    const c = custoDoDia(d, p, cot);
    if (c.parcial) incompletos.add(d.nome);
    for (const l of c.linhas) if (l.real) {
      min += l.real[0];
      max += l.real[1];
    }
  }
  const pessoas = Math.max(1, v.pessoas);
  return { total: dias ? [min * pessoas, max * pessoas] : undefined, diasSki: dias, incompletos: [...incompletos] };
}

export { formatarReal };
