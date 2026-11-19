// Consultor de equipamento: estilo + nível → tipo de ski ou prancha, tamanho de partida, pistas e destinos.
// Regras de tamanho e de características vêm de guias de fabricantes e lojas (fontes em src/data/equipamento.ts).
// São pontos de partida: o app sempre manda confirmar na loja, com a bota calçada.
import { destinos as todos, type Destino } from '../data/destinos';
import { estilos, type EstiloId, type Modalidade, type TagTerreno, rotuloTerreno } from '../data/equipamento';
import { terrenoPesquisado } from '../data/terreno';
import type { NivelViajante } from './storage';

export interface Consulta {
  modalidade: Modalidade | 'indeciso';
  nivel: NivelViajante;
  estilo: EstiloId;
  /** cm; opcional. Nunca é salvo. */
  altura?: number;
  /** kg; opcional. Nunca é salvo. */
  peso?: number;
  /** Número do calçado no Brasil; opcional. Nunca é salvo. */
  calcado?: number;
}

const novato = (n: NivelViajante) => n === 'nunca' || n === 'iniciante';

/** Estilos que fazem sentido para a modalidade e o nível. Quem está começando só vê "aprender". */
export function estilosPara(modalidade: Consulta['modalidade'], nivel: NivelViajante): EstiloId[] {
  if (novato(nivel) || modalidade === 'indeciso') return ['aprender'];
  return estilos.filter((e) => e.id !== 'aprender' && (modalidade === 'ski' ? e.ski : e.snowboard)).map((e) => e.id);
}

/** Corrige um estilo que não vale para a modalidade/nível (ex.: "bumps" no snowboard). */
export function estiloValido(c: Pick<Consulta, 'modalidade' | 'nivel' | 'estilo'>): EstiloId {
  const opcoes = estilosPara(c.modalidade, c.nivel);
  return opcoes.includes(c.estilo) ? c.estilo : opcoes.includes('all-mountain') ? 'all-mountain' : opcoes[0];
}

export type Faixa = [number, number];

const arred = (n: number) => Math.round(n);
const valido = (n: number | undefined, min: number, max: number): n is number => typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max;

// Ski: comprimento pela altura e pelo nível. Faixas calculadas a partir das tabelas da evo e da Christy Sports
// (alturas de 150 a 185 cm): iniciante do queixo ao nariz; intermediário do meio do rosto ao topo da cabeça;
// avançado e expert no topo da cabeça ou acima. Ver docs/consultoria-equipamento.md, regra R1.
const SKI_CM: Record<NivelViajante, Faixa> = {
  nunca: [-17, -12],
  iniciante: [-17, -12],
  intermediario: [-7, -2],
  avancado: [3, 7],
  expert: [3, 7]
};
// Estilo puxa para um lado da faixa: pista, mogul e park de rail mais curto; fora de pista mais longo.
const AJUSTE_SKI: Partial<Record<EstiloId, number>> = { pista: -2, bumps: -4, park: -2, freeride: 3 };

// Snowboard: o peso vem antes da altura (tabela da Jones). Ajuste do estilo em cm. Regra R3.
const SNOW_PESO: [number, Faixa][] = [
  [51, [140, 145]],
  [60, [144, 149]],
  [69, [148, 153]],
  [78, [152, 157]],
  [87, [156, 161]],
  [96, [160, 165]],
  [104, [164, 169]],
  [Infinity, [165, 170]]
];
const AJUSTE_SNOW: Partial<Record<EstiloId, number>> = { aprender: -2, park: -3, freeride: 3 };

export interface Tamanho {
  faixa: Faixa;
  /** Como explicar a faixa (ex.: "entre o queixo e o nariz"). */
  referencia: string;
  observacao?: string;
}

export function tamanhoSki(c: Consulta): Tamanho | null {
  if (!valido(c.altura, 120, 215)) return null;
  const [a, b] = SKI_CM[c.nivel];
  const ajuste = AJUSTE_SKI[c.estilo] ?? 0;
  const faixa: Faixa = [arred(c.altura + a + ajuste), arred(c.altura + b + ajuste)];
  const referencia = novato(c.nivel) ? 'do queixo ao nariz' : c.nivel === 'intermediario' ? 'do meio do rosto ao topo da cabeça' : 'no topo da cabeça ou um pouco acima';
  const obs: string[] = [];
  if (valido(c.peso, 30, 160)) {
    const imc = c.peso / (c.altura / 100) ** 2;
    if (imc >= 27) obs.push('Pelo seu peso, fique na parte de cima da faixa.');
    else if (imc < 19) obs.push('Pelo seu peso, a parte de baixo da faixa fica mais fácil.');
  }
  if (!novato(c.nivel)) obs.push('As tabelas femininas indicam ski alguns centímetros mais curto; há instrutoras que discordam e pedem pelo menos a altura do nariz.');
  return { faixa, referencia, observacao: obs.join(' ') || undefined };
}

export function tamanhoSnowboard(c: Consulta): Tamanho | null {
  const ajuste = AJUSTE_SNOW[c.estilo] ?? 0;
  if (valido(c.peso, 35, 160)) {
    const [, [a, b]] = SNOW_PESO.find(([max]) => c.peso! <= max)!;
    return {
      faixa: [a + ajuste, b + ajuste],
      referencia: 'pelo seu peso',
      observacao: 'Cada modelo tem uma faixa de peso indicada pela marca. Confira na tabela do modelo.'
    };
  }
  if (!valido(c.altura, 120, 215)) return null;
  const centro = c.altura * 0.88 + ajuste;
  return {
    faixa: [arred(centro - 3), arred(centro + 3)],
    referencia: 'do queixo ao nariz',
    observacao: 'A altura é só um ponto de partida. Informe o peso: na prancha, ele vale mais.'
  };
}

/**
 * Prancha wide (larga): pé grande arrasta a ponta da bota ou o calcanhar na neve na curva.
 * Regra R4 (Jones, evo): bota US 10 a 11 masculino, considerar wide; US 11,5 ou mais, wide.
 * Conversão aproximada do calçado brasileiro (masculino): BR 41 ≈ US 10; BR 43 ≈ US 11,5. Varia por marca.
 */
export function precisaPranchaLarga(calcado?: number): 'sim' | 'talvez' | 'nao' | null {
  if (!valido(calcado, 30, 52)) return null;
  if (calcado >= 43) return 'sim';
  if (calcado >= 41) return 'talvez';
  return 'nao';
}

// ───────── Terreno dos destinos ─────────

export interface IndicioTerreno {
  tag: TagTerreno;
  /** Frase curta para a tela. */
  texto: string;
  /** De onde veio: pesquisa com fonte oficial, texto curado do app ou percentual de pistas. */
  origem: 'pesquisa' | 'catalogo';
  fonte?: string;
}

const textoDe = (d: Destino) => `${d.resumo} ${d.destaques.join(' ')} ${d.nota} ${d.dicas.join(' ')}`.toLowerCase();

// Só expressões que descrevem o terreno da montanha, não a paisagem (ex.: "Parque Nacional" não é snowpark).
const PADROES: [TagTerreno, RegExp][] = [
  ['fora-de-pista', /fora de pista|freeride|off-?piste/],
  ['arvores', /pistas? (na|entre|pela) (floresta|árvores|mata)|entre árvores|fora de pista entre árvores|pistas na floresta/],
  ['snowpark', /snow ?park|terrain park|half ?pipe/],
  ['ingreme', /íngreme|couloir|corbet/],
  ['neve-seca', /neve seca|pó seco|neve .{0,20}seca e leve/],
  ['pistas-preparadas', /bem preparad|pistas largas/]
];

/** O que o app sabe do terreno do destino, sem inventar: pesquisa com fonte, texto curado e percentual de pistas. */
export function terrenoDoDestino(d: Destino): IndicioTerreno[] {
  const achados = new Map<TagTerreno, IndicioTerreno>();
  for (const p of terrenoPesquisado(d.id)) if (p.tag !== 'teleski' && p.tag !== 'sem-snowboard') achados.set(p.tag, { tag: p.tag, texto: p.texto, fonte: p.fonte, origem: 'pesquisa' });
  const t = textoDe(d);
  for (const [tag, re] of PADROES) if (!achados.has(tag) && re.test(t)) achados.set(tag, { tag, texto: rotuloTerreno[tag], origem: 'catalogo' });
  const pistas = d.pistas;
  if (pistas && !achados.has('area-iniciante') && pistas.iniciante >= 30) achados.set('area-iniciante', { tag: 'area-iniciante', texto: `${pistas.iniciante}% das pistas são fáceis`, origem: 'catalogo' });
  if (pistas && !achados.has('muito-avancado') && pistas.avancado >= 40) achados.set('muito-avancado', { tag: 'muito-avancado', texto: `${pistas.avancado}% das pistas são difíceis`, origem: 'catalogo' });
  if (pistas && !achados.has('pistas-azuis') && pistas.intermediario >= 40) achados.set('pistas-azuis', { tag: 'pistas-azuis', texto: `${pistas.intermediario}% das pistas são intermediárias`, origem: 'catalogo' });
  return [...achados.values()];
}

export const snowboardProibido = (d: Destino) => terrenoPesquisado(d.id).some((p) => p.tag === 'sem-snowboard') || /snowboard (é )?proibido/i.test(textoDe(d));

export interface SugestaoDestino {
  destino: Destino;
  pontos: number;
  motivos: IndicioTerreno[];
  atencao: string[];
}

const comCuradoria = (d: Destino) => d.fonteDados !== 'openskimap' || Boolean(d.revisadoEm);

/** Destinos revisados com o terreno do estilo escolhido. Ordena por terreno, depois pelo nível. */
export function destinosParaConsulta(c: Consulta, lista: Destino[] = todos, quantos = 4): SugestaoDestino[] {
  const estilo = estilos.find((e) => e.id === c.estilo) ?? estilos[0];
  const pesos = estilo.terreno;
  const snow = c.modalidade === 'snowboard';
  return lista
    .filter(comCuradoria)
    .filter((d) => !(snow && snowboardProibido(d)))
    .map((d) => {
      const indicios = terrenoDoDestino(d);
      const motivos = indicios.filter((i) => pesos[i.tag]).sort((a, b) => (pesos[b.tag] ?? 0) - (pesos[a.tag] ?? 0));
      let pontos = motivos.reduce((s, i) => s + (pesos[i.tag] ?? 0) * (i.origem === 'pesquisa' ? 1.2 : 1), 0);
      const atencao: string[] = [];
      // Nível: quem está começando precisa de área fácil; quem é forte precisa de terreno difícil.
      if (novato(c.nivel)) {
        if (d.nivel === 'iniciante') pontos += 3;
        if (d.nivel === 'avancado') { pontos -= 4; atencao.push('Montanha difícil para quem está começando'); }
      } else if (c.nivel === 'avancado' || c.nivel === 'expert') {
        if (d.nivel === 'avancado') pontos += 2;
        if (d.nivel === 'iniciante' && estilo.id !== 'park') { pontos -= 2; atencao.push('Pouco terreno difícil para o seu nível'); }
      } else if (d.nivel === 'intermediario') pontos += 1;
      if (snow && novato(c.nivel)) {
        const arrasto = terrenoPesquisado(d.id).find((p) => p.tag === 'teleski');
        if (arrasto) atencao.push('Tem teleférico de arrasto: no snowboard, ele cansa no começo');
      }
      if (estilo.id === 'freeride' && motivos.some((m) => m.tag === 'fora-de-pista')) atencao.push('Fora de pista: vá com guia e equipamento de avalanche');
      return { destino: d, pontos, motivos, atencao };
    })
    .filter((s) => s.motivos.length > 0 || novato(c.nivel))
    .sort((a, b) => b.pontos - a.pontos || b.motivos.length - a.motivos.length || a.destino.nome.localeCompare(b.destino.nome, 'pt-BR'))
    .slice(0, quantos);
}
