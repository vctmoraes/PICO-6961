// Condição de neve e tempo em tempo real, pela API Open-Meteo (grátis, sem chave).
// Licença dos dados: CC BY 4.0. O app mostra o crédito "Dados: Open-Meteo.com".
// Documentação: https://open-meteo.com/en/docs
import type { Destino } from '../data/destinos';

export interface Ponto {
  temperatura: number;
  sensacao: number;
  vento: number;
  codigo: number;
  /** Neve no solo, em cm (estimativa do modelo meteorológico). */
  neveNoSoloCm: number | null;
}

export interface DiaPrevisao {
  data: string;
  neveCm: number;
  min: number;
  max: number;
  codigo: number;
}

export interface Clima {
  base: Ponto;
  topo: Ponto;
  neve24hCm: number;
  previsao: DiaPrevisao[];
  atualizadoEm: string;
  /** true = dado de exemplo (só na pré-visualização, quando a API não responde). */
  exemplo?: boolean;
}

const CACHE_MIN = 30;
const memoria = new Map<string, { em: number; dado: Clima }>();

interface RespostaOpenMeteo {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  hourly: { time: string[]; snow_depth: (number | null)[]; snowfall: (number | null)[] };
  daily: {
    time: string[];
    snowfall_sum: number[];
    temperature_2m_min: number[];
    temperature_2m_max: number[];
    weather_code: number[];
  };
}

function ponto(r: RespostaOpenMeteo): Ponto {
  const i = indiceHoraAtual(r.hourly.time, r.current.time);
  const neve = r.hourly.snow_depth[i];
  return {
    temperatura: r.current.temperature_2m,
    sensacao: r.current.apparent_temperature,
    vento: r.current.wind_speed_10m,
    codigo: r.current.weather_code,
    neveNoSoloCm: neve == null ? null : Math.round(neve * 100)
  };
}

function indiceHoraAtual(horas: string[], agora: string): number {
  const alvo = agora.slice(0, 13); // "AAAA-MM-DDTHH"
  const i = horas.findIndex((h) => h.startsWith(alvo));
  return i >= 0 ? i : 0;
}

export async function buscarClima(d: Destino): Promise<Clima> {
  const cache = memoria.get(d.id);
  if (cache && Date.now() - cache.em < CACHE_MIN * 60_000) return cache.dado;

  // Dois pontos na mesma chamada: base e topo da montanha.
  const p = new URLSearchParams({
    latitude: `${d.lat},${d.lat}`,
    longitude: `${d.lon},${d.lon}`,
    elevation: `${d.altitudeBase},${d.altitudeTopo}`,
    current: 'temperature_2m,apparent_temperature,wind_speed_10m,weather_code',
    hourly: 'snow_depth,snowfall',
    daily: 'snowfall_sum,temperature_2m_min,temperature_2m_max,weather_code',
    past_days: '1',
    forecast_days: '5',
    timezone: 'auto'
  });
  let rb: RespostaOpenMeteo, rt: RespostaOpenMeteo;
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${p}`);
    if (!res.ok) throw new Error(`Open-Meteo respondeu ${res.status}`);
    [rb, rt] = (await res.json()) as [RespostaOpenMeteo, RespostaOpenMeteo];
  } catch (e) {
    // A pré-visualização no claude.ai bloqueia chamadas externas. Só nela, mostramos um exemplo.
    if (import.meta.env.MODE === 'preview') return climaExemplo();
    throw e;
  }

  // Neve das últimas 24 horas no topo (soma da neve por hora).
  const iAgora = indiceHoraAtual(rt.hourly.time, rt.current.time);
  const neve24h = rt.hourly.snowfall
    .slice(Math.max(0, iAgora - 23), iAgora + 1)
    .reduce<number>((s, v) => s + (v ?? 0), 0);

  // past_days=1 põe o dia de ontem na posição 0. A previsão começa hoje.
  const previsao = rt.daily.time.slice(1).map((data, k) => ({
    data,
    neveCm: Math.round(rt.daily.snowfall_sum[k + 1] ?? 0),
    min: Math.round(rt.daily.temperature_2m_min[k + 1]),
    max: Math.round(rt.daily.temperature_2m_max[k + 1]),
    codigo: rt.daily.weather_code[k + 1]
  }));

  const dado: Clima = {
    base: ponto(rb),
    topo: ponto(rt),
    neve24hCm: Math.round(neve24h),
    previsao,
    atualizadoEm: new Date().toISOString()
  };
  memoria.set(d.id, { em: Date.now(), dado });
  return dado;
}

/** Texto do código de tempo da OMM (WMO), usado pela Open-Meteo. */
export function descricaoTempo(codigo: number): string {
  if (codigo === 0) return 'Céu limpo';
  if (codigo <= 2) return 'Poucas nuvens';
  if (codigo === 3) return 'Nublado';
  if (codigo === 45 || codigo === 48) return 'Neblina';
  if (codigo >= 51 && codigo <= 57) return 'Garoa';
  if ((codigo >= 61 && codigo <= 67) || (codigo >= 80 && codigo <= 82)) return 'Chuva';
  if (codigo >= 71 && codigo <= 77) return 'Neve';
  if (codigo === 85 || codigo === 86) return 'Pancada de neve';
  if (codigo >= 95) return 'Tempestade';
  return 'Tempo variável';
}

/** Resumo de uma linha para o card do destino. */
export function resumoCondicao(c: Clima): string {
  if (c.neve24hCm >= 5) return `${c.neve24hCm} cm de neve nova em 24h`;
  const proxNeve = c.previsao.find((d) => d.neveCm >= 5);
  if (proxNeve) return `Previsão: ${proxNeve.neveCm} cm de neve em ${diaCurto(proxNeve.data)}`;
  return `${descricaoTempo(c.topo.codigo)} · ${Math.round(c.topo.temperatura)}°C no topo`;
}

export function diaCurto(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }).replace('.', '');
}

/** Dado fixo de exemplo, só para a pré-visualização. Nunca usar no app publicado. */
function climaExemplo(): Clima {
  const hoje = new Date();
  const dia = (k: number) => new Date(hoje.getTime() + k * 86400e3).toISOString().slice(0, 10);
  const p: Ponto = { temperatura: -6, sensacao: -12, vento: 25, codigo: 73, neveNoSoloCm: 110 };
  return {
    base: { ...p, temperatura: -1, sensacao: -5, vento: 12, neveNoSoloCm: 60 },
    topo: p,
    neve24hCm: 8,
    previsao: [6, 0, 0, 12, 3].map((neveCm, k) => ({ data: dia(k), neveCm, min: -9 + k, max: -2 + k, codigo: neveCm ? 73 : 1 })),
    atualizadoEm: hoje.toISOString(),
    exemplo: true
  };
}
