// Valor médio de referência do aluguel por dia (adulto), por destino.
// Regra: só faixa com fonte e data. Sem fonte, o destino fica sem aluguel e o app mostra "Consultar".
// O agente de atualização confere estes valores 1 vez por temporada.

export interface Faixa {
  min: number;
  max: number;
}

export interface Aluguel {
  moeda: 'USD' | 'CLP' | 'ARS';
  /** Pacote básico: ski + bota + bastão (ou prancha + bota), 1 dia, adulto. */
  equipamento?: Faixa;
  /** Prancha + bota, quando a fonte separa o snowboard. */
  snowboard?: Faixa;
  /** Roupa de neve: jaqueta + calça (alguns pacotes incluem luva e bota de neve). */
  roupa?: Faixa;
  /** Onde a faixa vale (ex.: "Lojas em Santiago, antes de subir"). */
  onde: string;
  dica?: string;
  /** Mês da fonte (AAAA-MM). */
  verificadoEm: string;
  fontes: { nome: string; url: string }[];
  /** 'baixa' = fonte sem data confirmada ou estimativa genérica. O app mostra um aviso. */
  confianca?: 'baixa';
}

const santiago: Aluguel = {
  moeda: 'CLP',
  equipamento: { min: 25000, max: 34000 },
  roupa: { min: 20000, max: 35000 },
  onde: 'Lojas em Santiago e na estrada para Farellones',
  dica: 'Alugue em Santiago na véspera: em geral, sai mais barato que na montanha. Alguns cartões de crédito dão desconto no aluguel do resort.',
  verificadoEm: '2026-08',
  fontes: [
    { nome: 'Tuki – comparativo de aluguel em Santiago (2026)', url: 'https://tuki.cl/guias/comparativa-arriendo-ski-santiago-precios-2026' },
    { nome: 'El Mostrador – custo de ir à neve (jul/2026)', url: 'https://www.elmostrador.cl/datos-utiles/2026/07/27/iras-a-la-nieve-este-fin-de-semana-el-gasto-oculto-que-pocos-calculan-antes-de-subir-desde-santiago/' },
    { nome: 'Interpatagonia – aluguel no Valle Nevado', url: 'https://www.interpatagonia.com/vallenevado/alquiler_i.html' }
  ]
};

const coloradoUtahRoupa: Faixa = { min: 40, max: 75 };
const fonteRoupaEua = { nome: 'Lojas de aluguel no Colorado e em Utah (2025/26)', url: 'https://www.evo.com/locations/salt-lake-city/services/ski-snowboard-rentals' };

export const aluguelPorDestino: Record<string, Aluguel> = {
  // ───── Chile ─────
  'valle-nevado': santiago,
  'la-parva': santiago,
  'el-colorado': santiago,
  lagunillas: { ...santiago, onde: 'Lojas em Santiago, antes de subir' },
  'nevados-de-chillan': {
    moeda: 'CLP',
    equipamento: { min: 35000, max: 35000 },
    onde: 'Aluguel do resort',
    dica: 'O resort cobra também um cartão recarregável (cerca de CLP 6.000).',
    verificadoEm: '2025-06',
    fontes: [{ nome: 'Radio Concierto – centros de ski mais econômicos (jun/2025)', url: 'https://www.concierto.cl/2025/06/para-disfrutar-de-la-nieve-al-mejor-precio-estos-son-los-centros-de-ski-chilenos-mas-economicos/' }]
  },
  corralco: {
    moeda: 'CLP',
    equipamento: { min: 48000, max: 48000 },
    onde: 'Aluguel do resort (equipamento básico)',
    dica: 'O resort cobra também um cartão (cerca de CLP 5.000).',
    verificadoEm: '2025-06',
    fontes: [{ nome: 'Radio Concierto – centros de ski mais econômicos (jun/2025)', url: 'https://www.concierto.cl/2025/06/para-disfrutar-de-la-nieve-al-mejor-precio-estos-son-los-centros-de-ski-chilenos-mas-economicos/' }]
  },
  'ski-pucon': {
    moeda: 'CLP',
    equipamento: { min: 15000, max: 22000 },
    snowboard: { min: 20000, max: 20000 },
    onde: 'Lojas na cidade de Pucón',
    dica: 'Alugue em Pucón: as lojas da cidade cobram bem menos que a montanha.',
    verificadoEm: '2025-11',
    fontes: [
      { nome: 'Huechuntu – aluguel em Pucón', url: 'https://huechuntu.cl/pucon-rental-ski/' },
      { nome: 'Aguaventura – aluguel em Pucón', url: 'https://aguaventura.com/arriendo' }
    ]
  },
  antillanca: {
    moeda: 'CLP',
    equipamento: { min: 42000, max: 42000 },
    onde: 'Loja do resort, na base',
    verificadoEm: '2025-11',
    fontes: [{ nome: 'Antillanca – aluguel de equipamento (site oficial)', url: 'https://antillanca.cl/ski-y-montana/arriendo-de-equipo/' }],
    confianca: 'baixa'
  },

  // ───── Argentina ─────
  'cerro-catedral': {
    moeda: 'ARS',
    equipamento: { min: 30000, max: 66500 },
    roupa: { min: 24000, max: 45000 },
    onde: 'Lojas no centro de Bariloche e na base do Cerro Catedral',
    dica: 'No centro de Bariloche, o pacote econômico sai mais barato. Perto da pista, o preço sobe.',
    verificadoEm: '2026-05',
    fontes: [
      { nome: 'Ámbito – quanto custa esquiar em Bariloche em 2026', url: 'https://www.ambito.com/economia/cuanto-sale-esquiar-bariloche-2026-precios-del-ascenso-ropa-y-equipo-n6285348' },
      { nome: 'Bajo Cero Bariloche – tarifas 2026', url: 'https://bajocerobariloche.com.ar/tarifas-2026/' }
    ]
  },
  'cerro-castor': {
    moeda: 'ARS',
    equipamento: { min: 56000, max: 56000 },
    onde: 'Aluguel do resort (tarifa oficial 2026)',
    dica: 'Para 2 ou 3 dias, o resort cobra menos por dia.',
    verificadoEm: '2026-06',
    fontes: [{ nome: 'Cerro Castor – tarifas de aluguel 2026 (site oficial)', url: 'https://www.cerrocastor.com/es_ar/rental-tarifas.html' }]
  },
  'las-lenas': {
    moeda: 'ARS',
    equipamento: { min: 42800, max: 56800 },
    onde: 'Aluguel no resort, com compra antecipada',
    verificadoEm: '2026-06',
    fontes: [{ nome: 'Skiala – tarifas de Las Leñas', url: 'https://skiala.com/en/destino/las-lenas/tarifas-de-servicios/' }],
    confianca: 'baixa'
  },
  chapelco: {
    moeda: 'ARS',
    equipamento: { min: 37500, max: 48750 },
    onde: 'Loja de aluguel para Chapelco',
    verificadoEm: '2026-06',
    fontes: [{ nome: 'Snowmatch – aluguel em Chapelco', url: 'https://snowmatch.pro/pt/rental/cerro-chapelco/' }],
    confianca: 'baixa'
  },

  // ───── Estados Unidos ─────
  'park-city-mountain-resort-ut': {
    moeda: 'USD',
    equipamento: { min: 35, max: 75 },
    roupa: coloradoUtahRoupa,
    onde: 'Lojas na cidade de Park City (retirada na loja)',
    dica: 'Reserve on-line: em geral, sai mais barato que no balcão. Com entrega no hotel, o preço sobe.',
    verificadoEm: '2025-11',
    fontes: [{ nome: 'Park City Sport – preços de aluguel 2025/26', url: 'https://parkcitysport.com/how-much-do-park-city-ski-rentals-cost-pricing-guide/' }, fonteRoupaEua]
  },
  'breckenridge-ski-resort-co': {
    moeda: 'USD',
    equipamento: { min: 34, max: 77 },
    roupa: coloradoUtahRoupa,
    onde: 'Lojas na cidade de Breckenridge',
    dica: 'Reserve on-line: muitas lojas cobram de 25% a 33% menos que no balcão.',
    verificadoEm: '2025-11',
    fontes: [
      { nome: 'Trip Outside – aluguel em Breckenridge', url: 'https://tripoutside.com/browse/location:us:co:breckenridge/activity:winter-sports:downhill-skiing/adventure-type:rental' },
      { nome: 'Breckenridge Ski & Sport – serviços', url: 'https://www.breckenridgeskiandsport.com/services/' },
      fonteRoupaEua
    ]
  },
  'vail-co': {
    moeda: 'USD',
    equipamento: { min: 70, max: 100 },
    roupa: coloradoUtahRoupa,
    onde: 'Lojas em Vail',
    dica: 'Lojas fora da vila (Avon, Edwards) costumam cobrar menos.',
    verificadoEm: '2026-09',
    fontes: [
      { nome: 'Unofficial Networks – quanto custa esquiar em 2026', url: 'https://unofficialnetworks.com/2026/09/10/how-expensive-is-skiing-2026/' },
      { nome: 'Powder – resorts mais caros dos EUA', url: 'https://www.powder.com/ski-resorts/most-expensive-ski-resorts' },
      fonteRoupaEua
    ],
    confianca: 'baixa'
  }
};

const aspen: Aluguel = {
  moeda: 'USD',
  equipamento: { min: 95, max: 95 },
  roupa: coloradoUtahRoupa,
  onde: 'Lojas em Aspen e Snowmass',
  verificadoEm: '2026-09',
  fontes: [{ nome: 'Powder – resorts mais caros dos EUA', url: 'https://www.powder.com/ski-resorts/most-expensive-ski-resorts' }, fonteRoupaEua],
  confianca: 'baixa'
};
aluguelPorDestino['aspen-snowmass-co'] = aspen;
aluguelPorDestino['aspen-mountain-co'] = aspen;
