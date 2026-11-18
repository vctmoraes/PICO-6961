// Sugestões de um destino revisado por vez, pela temporada típica e pelo perfil.
import { destinos, type Destino, type Pais } from '../data/destinos';
import { hemisferioDe, lotacaoNasDatas } from '../data/lotacao';
import { combinar, mesesDeTemporada } from './combina';
import { custoDoDia } from './custo';
import type { Cotacoes } from './moeda';
import type { NivelViajante, PerfilViajante } from './storage';
import { datasEntre, MAX_DIAS } from './viagem';

export interface PedidoViagem {
  ida: string;
  volta: string;
  pessoas: number;
  /** Teto por pessoa para passe e aluguel, em reais. 0 = sem teto. */
  orcamentoPessoa: number;
  pais: Pais | '';
  nivel?: NivelViajante | '';
}

type FaixaReal = [number, number];
export type Orcamento = 'dentro' | 'pode-passar' | 'incompleto' | 'fora' | 'sem-teto';

export interface Sugestao {
  destino: Destino;
  motivos: string[];
  atencao: string[];
}

export interface Plano extends Sugestao {
  /** Passe e aluguel por pessoa, para os dias de ski; pode ser subtotal. */
  custoPessoa?: FaixaReal;
  orcamento: Orcamento;
  semPreco: string[];
  semCotacao: boolean;
  diasSki: number;
  lotacao: string[];
}

interface Resultado<T> {
  planos: T[];
  avisos: string[];
}

export function classificarOrcamento(custo: FaixaReal | undefined, incompleto: boolean, teto: number): Orcamento {
  if (!teto) return 'sem-teto';
  // Mesmo um subtotal conhecido pode ser suficiente para descartar um destino.
  if (custo && custo[0] > teto) return 'fora';
  if (!custo || incompleto) return 'incompleto';
  return custo[1] > teto ? 'pode-passar' : 'dentro';
}

const mesLongo = new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' });

function sugerir(meses: number[], pais: Pais | '', perfil: PerfilViajante) {
  const periodo = meses.map((m) => mesLongo.format(Date.UTC(2024, m - 1, 1))).join(', ');
  const avisos: string[] = [];
  const avaliados = destinos
    .filter((d) => (d.fonteDados !== 'openskimap' || !!d.revisadoEm) && (!pais || d.pais === pais))
    .filter((d) => {
      const temporada = mesesDeTemporada(d);
      return meses.every((m) => temporada.includes(m));
    })
    .filter((d) => {
      if (d.pais !== 'Estados Unidos' || (perfil.vistoEua !== false && perfil.passaporte !== false)) return true;
      if (!avisos.length) avisos.push('As opções nos EUA não aparecem porque seu perfil indica que falta passaporte ou visto americano.');
      return false;
    })
    .map((destino) => {
      const { nota, aFavor, atencao } = combinar(destino, { ...perfil, meses });
      const motivos = aFavor.filter((m) => !m.startsWith('Temporada de neve') && m !== 'Opção mais em conta');
      return { sugestao: { destino, motivos: [`Temporada típica: ${periodo}`, ...motivos.slice(0, 2)], atencao }, nota };
    });
  if (!avaliados.length && !avisos.length) avisos.push('Nenhum destino revisado está na temporada típica durante todo o período escolhido. Tente mudar o período ou o país.');
  return { avaliados, avisos };
}

export function explorarMes(mes: number, pais: Pais | '', perfil: PerfilViajante): Resultado<Sugestao> {
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) return { planos: [], avisos: ['Escolha um mês para explorar.'] };
  const { avaliados, avisos } = sugerir([mes], pais, perfil);
  return { avisos, planos: avaliados.sort((a, b) => b.nota - a.nota).slice(0, 3).map((a) => a.sugestao) };
}

const prioridade: Record<Orcamento, number> = { dentro: 0, 'sem-teto': 0, 'pode-passar': 1, incompleto: 2, fora: 3 };

export function planejar(pedido: PedidoViagem, perfil: PerfilViajante, cot: Cotacoes | null): Resultado<Plano> {
  const dias = datasEntre(pedido.ida, pedido.volta);
  if (!dias.length || dias[0] !== pedido.ida) return { planos: [], avisos: ['Escolha datas válidas de ida e volta.'] };
  if (dias.at(-1) !== pedido.volta) return { planos: [], avisos: [dias.length === MAX_DIAS ? `O roteiro pode ter até ${MAX_DIAS} dias.` : 'Escolha datas válidas de ida e volta.'] };
  // Assim como no roteiro salvo, a ida e a volta são dias de viagem.
  const ski = dias.slice(1, -1);
  if (!ski.length) return { planos: [], avisos: ['Escolha pelo menos 3 dias: ida, um dia de ski e volta.'] };
  const meses = [...new Set(ski.map((d) => Number(d.slice(5, 7))))];
  const nivel = pedido.nivel === '' ? undefined : pedido.nivel ?? perfil.nivel;
  const { avaliados, avisos } = sugerir(meses, pedido.pais, { ...perfil, nivel });
  const calculados = avaliados.map(({ sugestao, nota }) => {
    const { destino } = sugestao;
    const { linhas } = custoDoDia(destino, perfil, cot);
    const semPreco = linhas.filter((l) => l.semValor).map((l) => l.rotulo);
    const faixas = linhas.flatMap((l) => l.real?.every(Number.isFinite) ? [l.real] : []);
    const semCotacao = faixas.length < linhas.length - semPreco.length;
    const custoDia = faixas.reduce<FaixaReal>((acc, [min, max]) => [acc[0] + min, acc[1] + max], [0, 0]);
    const custoPessoa: FaixaReal | undefined = faixas.length ? [custoDia[0] * ski.length, custoDia[1] * ski.length] : undefined;
    const lotacao = lotacaoNasDatas(ski[0], ski[ski.length - 1], hemisferioDe(destino.lat)).map((l) => l.nome);
    const orcamento = classificarOrcamento(custoPessoa, semPreco.length > 0 || semCotacao, pedido.orcamentoPessoa);
    const plano: Plano = { ...sugestao, semPreco, semCotacao, custoPessoa, orcamento, diasSki: ski.length, lotacao };
    return { plano, nota: nota - (lotacao.length ? 3 : 0) };
  });
  const elegiveis = calculados.filter(({ plano }) => plano.orcamento !== 'fora');
  if (elegiveis.length < calculados.length) {
    avisos.push(elegiveis.length
      ? 'Alguns destinos ficaram de fora porque até o mínimo conhecido passa do teto.'
      : 'O mínimo conhecido de todas as opções passa do teto. Experimente aumentar o teto ou reduzir os dias de ski.');
  }
  return {
    avisos,
    planos: elegiveis
      .sort((a, b) => prioridade[a.plano.orcamento] - prioridade[b.plano.orcamento]
        || b.nota - a.nota
        || Number(!!(a.plano.semPreco.length || a.plano.semCotacao)) - Number(!!(b.plano.semPreco.length || b.plano.semCotacao))
        || (a.plano.custoPessoa?.[0] ?? Infinity) - (b.plano.custoPessoa?.[0] ?? Infinity))
      .slice(0, 3).map(({ plano }) => plano)
  };
}
