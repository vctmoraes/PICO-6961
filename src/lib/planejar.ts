// "Monte minha viagem": sugere roteiros prontos a partir das datas, do orçamento e do perfil.
// Só sugere destinos com conteúdo revisado (curados), para não indicar área pequena sem informação.
import { destinos, type Destino, type Pais } from '../data/destinos';
import { hemisferioDe, lotacaoNasDatas } from '../data/lotacao';
import { combinar, mesesDeTemporada } from './combina';
import { custoDoDia } from './custo';
import type { Cotacoes } from './moeda';
import type { PerfilViajante } from './storage';
import { datasEntre } from './viagem';

export interface PedidoViagem {
  ida: string;
  volta: string;
  pessoas: number;
  /** Teto por pessoa para a montanha (passe + aluguel), em reais. 0 = sem limite. */
  orcamentoPessoa: number;
  pais: Pais | '';
  quantosDestinos: 1 | 2;
}

export interface Plano {
  destinos: Destino[];
  nota: number;
  motivos: string[];
  atencao: string[];
  /** Custo de montanha por pessoa (passe + aluguel), em reais, para todos os dias de ski. */
  custoPessoa?: [number, number];
  custoParcial: boolean;
  diasSki: number;
  lotacao: string[];
}

export interface Resultado {
  planos: Plano[];
  /** Por que alguns destinos ficaram de fora (para explicar ao usuário). */
  avisos: string[];
}

const curado = (d: Destino) => d.fonteDados !== 'openskimap' || !!d.revisadoEm;

export function planejar(pedido: PedidoViagem, perfil: PerfilViajante, cot: Cotacoes | null): Resultado {
  const dias = datasEntre(pedido.ida, pedido.volta);
  if (!dias.length) return { planos: [], avisos: ['Escolha a data de ida e a de volta.'] };
  const diasSki = Math.max(1, dias.length - 2);
  const meses = [...new Set(dias.map((d) => Number(d.slice(5, 7))))];
  const p: PerfilViajante = { ...perfil, meses };
  const avisos: string[] = [];

  let candidatos = destinos.filter(curado);
  if (pedido.pais) candidatos = candidatos.filter((d) => d.pais === pedido.pais);
  if (perfil.vistoEua === false || perfil.passaporte === false) {
    const antes = candidatos.length;
    candidatos = candidatos.filter((d) => d.pais !== 'Estados Unidos');
    if (antes !== candidatos.length) avisos.push('Tirei os destinos dos EUA: o seu perfil diz que você ainda não tem passaporte ou visto americano.');
  }
  const naEpoca = candidatos.filter((d) => meses.some((m) => mesesDeTemporada(d).includes(m)));
  if (!naEpoca.length) return { planos: [], avisos: [...avisos, 'Nenhum destino tem temporada de neve nessas datas. No Chile e na Argentina, a temporada vai de junho a setembro. Nos EUA, de dezembro a março.'] };

  const avaliado = naEpoca.map((d) => {
    const c = combinar(d, p);
    const dia = custoDoDia(d, perfil, cot);
    const custo = dia.total ? ([dia.total[0] * diasSki, dia.total[1] * diasSki] as [number, number]) : undefined;
    const lot = lotacaoNasDatas(pedido.ida, pedido.volta, hemisferioDe(d.lat)).map((l) => l.nome);
    // Preferência pequena para destino com custo conhecido: o usuário recebe a informação completa.
    return { d, c, custo, parcial: dia.parcial, lot, nota: c.nota - (lot.length ? 3 : 0) + (custo && !dia.parcial ? 3 : 0) };
  });

  const dentro = pedido.orcamentoPessoa
    ? avaliado.filter((a) => !a.custo || a.custo[0] <= pedido.orcamentoPessoa)
    : avaliado;
  if (pedido.orcamentoPessoa && dentro.length < avaliado.length) avisos.push('Tirei os destinos com custo de montanha acima do seu orçamento.');

  const ordenar = <T extends { nota: number; custo?: [number, number] }>(l: T[]) =>
    [...l].sort((a, b) => b.nota - a.nota || (a.custo?.[0] ?? Infinity) - (b.custo?.[0] ?? Infinity));

  if (pedido.quantosDestinos === 1) {
    return {
      avisos,
      planos: ordenar(dentro)
        .slice(0, 3)
        .map((a) => ({
          destinos: [a.d],
          nota: Math.max(0, a.nota),
          motivos: a.c.aFavor.slice(0, 3),
          atencao: a.c.atencao,
          custoPessoa: a.custo,
          custoParcial: a.parcial || !a.custo,
          diasSki,
          lotacao: a.lot
        }))
    };
  }

  // 2 destinos: pares que chegam pelo mesmo aeroporto (ex.: Valle Nevado + La Parva, Bariloche + Cerro Bayo).
  const top = ordenar(dentro).slice(0, 12);
  const pares: Plano[] = [];
  for (let i = 0; i < top.length; i++) {
    for (let j = i + 1; j < top.length; j++) {
      const a = top[i], b = top[j];
      if (!a.d.aeroporto || a.d.aeroporto !== b.d.aeroporto) continue;
      const custo = a.custo && b.custo ? ([(a.custo[0] + b.custo[0]) / 2, (a.custo[1] + b.custo[1]) / 2] as [number, number]) : undefined;
      pares.push({
        destinos: [a.d, b.d],
        nota: Math.max(0, Math.round((a.nota + b.nota) / 2)),
        motivos: [...new Set([...a.c.aFavor, ...b.c.aFavor])].slice(0, 3),
        atencao: [...new Set([...a.c.atencao, ...b.c.atencao])],
        custoPessoa: custo,
        custoParcial: a.parcial || b.parcial || !custo,
        diasSki,
        lotacao: [...new Set([...a.lot, ...b.lot])]
      });
    }
  }
  if (!pares.length) avisos.push('Não achei 2 destinos perto um do outro com essas opções. Veja as sugestões de 1 destino.');
  return { avisos, planos: pares.sort((x, y) => y.nota - x.nota).slice(0, 3) };
}
