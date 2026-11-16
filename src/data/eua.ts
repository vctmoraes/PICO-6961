// Destinos dos Estados Unidos, gerados de src/data/eua.json (importado do OpenSkiMap pelo script scripts/importar-openskimap.mjs).
// Dados: © colaboradores do OpenStreetMap, licença ODbL. Texto gerado: só fatos que a base traz. Sem dica nem preço inventado.
import type { Destino, Nivel } from './destinos';
import base from './eua.json';
import { curadoriaEua } from './eua-curados';

interface AreaEua {
  id: string;
  nome: string;
  estado: string | null;
  localidade: string | null;
  lat: number;
  lon: number;
  min: number;
  max: number;
  km: { i: number; m: number; a: number; total: number };
  teleferico: number;
  site: string | null;
}

export const estadosEua: Record<string, string> = {
  AK: 'Alasca', AL: 'Alabama', AR: 'Arkansas', AZ: 'Arizona', CA: 'Califórnia', CO: 'Colorado', CT: 'Connecticut',
  DE: 'Delaware', FL: 'Flórida', GA: 'Geórgia', HI: 'Havaí', IA: 'Iowa', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Luisiana', MA: 'Massachusetts', MD: 'Maryland', ME: 'Maine', MI: 'Michigan',
  MN: 'Minnesota', MO: 'Missouri', MS: 'Mississippi', MT: 'Montana', NC: 'Carolina do Norte', ND: 'Dakota do Norte',
  NE: 'Nebraska', NH: 'Nova Hampshire', NJ: 'Nova Jersey', NM: 'Novo México', NV: 'Nevada', NY: 'Nova York', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pensilvânia', RI: 'Rhode Island', SC: 'Carolina do Sul', SD: 'Dakota do Sul',
  TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VA: 'Virgínia', VT: 'Vermont', WA: 'Washington', WI: 'Wisconsin',
  WV: 'Virgínia Ocidental', WY: 'Wyoming'
};

// Aeroportos que atendem as regiões de ski (coordenada aproximada). Alguns só têm voo na temporada.
const aeroportos: [string, string, number, number][] = [
  ['Denver', 'DEN', 39.86, -104.67], ['Eagle/Vail', 'EGE', 39.64, -106.92], ['Aspen', 'ASE', 39.22, -106.87],
  ['Hayden/Steamboat', 'HDN', 40.48, -107.22], ['Montrose/Telluride', 'MTJ', 38.51, -107.89], ['Gunnison/Crested Butte', 'GUC', 38.53, -106.93],
  ['Salt Lake City', 'SLC', 40.79, -111.98], ['Jackson Hole', 'JAC', 43.61, -110.74], ['Bozeman', 'BZN', 45.78, -111.15],
  ['Kalispell/Whitefish', 'FCA', 48.31, -114.26], ['Sun Valley/Hailey', 'SUN', 43.5, -114.3], ['Boise', 'BOI', 43.56, -116.22],
  ['Reno-Tahoe', 'RNO', 39.5, -119.77], ['Sacramento', 'SMF', 38.7, -121.59], ['Bishop', 'BIH', 37.37, -118.36],
  ['Los Angeles', 'LAX', 33.94, -118.41], ['São Francisco', 'SFO', 37.62, -122.38], ['Seattle', 'SEA', 47.45, -122.31],
  ['Portland (Oregon)', 'PDX', 45.59, -122.6], ['Redmond/Mt. Bachelor', 'RDM', 44.25, -121.15], ['Spokane', 'GEG', 47.62, -117.53],
  ['Albuquerque', 'ABQ', 35.04, -106.61], ['Phoenix', 'PHX', 33.43, -112.01], ['Minneapolis', 'MSP', 44.88, -93.22],
  ['Detroit', 'DTW', 42.21, -83.35], ['Chicago', 'ORD', 41.97, -87.91], ['Burlington', 'BTV', 44.47, -73.15],
  ['Boston', 'BOS', 42.36, -71.01], ['Albany', 'ALB', 42.75, -73.8], ['Nova York', 'JFK', 40.64, -73.78],
  ['Portland (Maine)', 'PWM', 43.65, -70.31], ['Pittsburgh', 'PIT', 40.49, -80.23], ['Washington', 'IAD', 38.95, -77.46],
  ['Charlotte', 'CLT', 35.21, -80.94], ['Anchorage', 'ANC', 61.17, -149.99]
];

function distanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const r = (x: number) => (x * Math.PI) / 180;
  const a = Math.sin(r(lat2 - lat1) / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lon2 - lon1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

function aeroportoMaisPerto(lat: number, lon: number) {
  return aeroportos
    .map(([nome, codigo, la, lo]) => ({ nome, codigo, km: distanciaKm(lat, lon, la, lo) }))
    .sort((x, y) => x.km - y.km)[0];
}

const cores: [string, string][] = [
  ['#13394A', '#2F6F8A'], ['#1F6B44', '#4FA37A'], ['#2F6F8A', '#8FB8C9'], ['#5B6660', '#2F6F8A'], ['#13394A', '#1F6B44'], ['#92631B', '#D9A441']
];

function nivelPorPistas(km: AreaEua['km']): Nivel {
  const soma = km.i + km.m + km.a;
  if (soma <= 0) return 'intermediario';
  if (km.a / soma >= 0.4) return 'avancado';
  if (km.i / soma >= 0.4) return 'iniciante';
  return 'intermediario';
}

function paraDestino(a: AreaEua, i: number): Destino {
  const estado = a.estado ? estadosEua[a.estado] ?? a.estado : 'Estados Unidos';
  const soma = a.km.i + a.km.m + a.km.a;
  const pct = (x: number) => Math.round((x / soma) * 100);
  const aero = aeroportoMaisPerto(a.lat, a.lon);
  const partes = [
    a.km.total >= 1 ? `cerca de ${Math.round(a.km.total)} km de pista` : null,
    a.teleferico ? `${a.teleferico} ${a.teleferico === 1 ? 'teleférico' : 'teleféricos'}` : null
  ].filter(Boolean);

  return {
    id: a.id,
    nome: a.nome,
    pais: 'Estados Unidos',
    regiao: a.localidade ? `${a.localidade}, ${estado}` : estado,
    cidadeBase: a.localidade ?? estado,
    lat: a.lat,
    lon: a.lon,
    altitudeBase: a.min,
    altitudeTopo: a.max,
    nivel: nivelPorPistas(a.km),
    pistas: soma > 0 ? { iniciante: pct(a.km.i), intermediario: pct(a.km.m), avancado: 100 - pct(a.km.i) - pct(a.km.m) } : undefined,
    kmPista: a.km.total >= 1 ? Math.round(a.km.total) : undefined,
    temporada: 'Em geral, de dezembro a março (confira as datas no site oficial)',
    resumo: `Área de ski nos Estados Unidos (${estado}).${partes.length ? ` Tem ${partes.join(' e ')}.` : ''} Altitude de ${a.min.toLocaleString('pt-BR')} m a ${a.max.toLocaleString('pt-BR')} m.`,
    destaques: [],
    comoChegar: `Aeroporto mais perto da nossa lista: ${aero.nome} (${aero.codigo}), a cerca de ${Math.round(aero.km / 10) * 10} km em linha reta. Alguns aeroportos regionais só têm voo na temporada. Confira os voos e a estrada antes de viajar.`,
    passe: { valor: null, moeda: 'USD', verificadoEm: null, urlOficial: a.site },
    hospedagem: {
      resumo: `Procure hotel perto de ${a.nome} ou em ${a.localidade ?? 'uma cidade próxima'}.`,
      buscaReserva: `${a.localidade ?? a.nome}, ${estado}, Estados Unidos`
    },
    nota: partes.length ? partes.join(' · ') : estado,
    dicas: [],
    cor: cores[i % cores.length],
    fonteDados: 'openskimap'
  };
}

/** Destino gerado + texto da curadoria (quando existe). Altitude, pistas e site continuam da base. */
function comCuradoria(d: Destino): Destino {
  const c = curadoriaEua[d.id];
  return c ? { ...d, ...c } : d;
}

export const destinosEua: Destino[] = (base.areas as AreaEua[]).map(paraDestino).map(comCuradoria);
export const infoBaseEua = { fonte: base.fonte, licenca: base.licenca, geradoEm: base.geradoEm, total: base.total };
