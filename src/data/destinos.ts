// Conteúdo curado dos destinos do MVP (só ski/snowboard).
// O agente de IA de atualização deve editar SÓ este arquivo (ou o JSON que o substituir).
// Regra: todo dado tem fonte e data de verificação. Dado sem verificação aparece como "a confirmar".

export type Nivel = 'iniciante' | 'intermediario' | 'avancado';
export type Pais = 'Chile' | 'Argentina';

export interface Destino {
  id: string;
  nome: string;
  pais: Pais;
  regiao: string;
  /** Cidade-base para hospedagem e voo. */
  cidadeBase: string;
  lat: number;
  lon: number;
  /** Altitude da base e do topo, em metros. */
  altitudeBase: number;
  altitudeTopo: number;
  /** Nível principal do destino (badge do card). */
  nivel: Nivel;
  /** Percentual de pistas por nível (soma 100). */
  pistas: { iniciante: number; intermediario: number; avancado: number };
  kmPista: number;
  temporada: string;
  resumo: string;
  destaques: string[];
  comoChegar: string;
  passe: {
    /** Valor de referência do passe de 1 dia adulto, alta temporada. */
    valor: number;
    moeda: 'USD' | 'CLP' | 'ARS';
    /** null = valor não verificado em fonte oficial. */
    verificadoEm: string | null;
    urlOficial: string;
  };
  hospedagem: {
    resumo: string;
    /** Termo de busca usado no link de afiliado. */
    buscaReserva: string;
  };
  /** Frase curta que aparece no card do destino. */
  nota: string;
  /** Dicas práticas da aba "Dicas". */
  dicas: string[];
  /**
   * Foto do destino. null = sem foto com licença confirmada (o app mostra a ilustração).
   * Antes de pôr uma foto, confirme autor e licença. Ver docs/fotos-e-licencas.md.
   */
  foto?: { url: string; autor: string; licenca: string; fonte: string } | null;
  /** Cores da ilustração (substitui a foto até termos fotos com licença confirmada). */
  cor: [string, string];
}

export const destinos: Destino[] = [
  {
    id: 'valle-nevado',
    nome: 'Valle Nevado',
    pais: 'Chile',
    regiao: 'Três Vales, Santiago',
    cidadeBase: 'Santiago',
    lat: -33.357,
    lon: -70.249,
    altitudeBase: 2860,
    altitudeTopo: 3670,
    nivel: 'intermediario',
    pistas: { iniciante: 25, intermediario: 45, avancado: 30 },
    kmPista: 40,
    temporada: 'Meados de junho a final de setembro',
    resumo:
      'O resort mais procurado por brasileiros. Fica a cerca de 60 km de Santiago. Tem hotel na base e acesso aos Três Vales.',
    destaques: ['Ski in/ski out nos hotéis', 'Escola com instrutor que fala português', 'Bom para família'],
    comoChegar:
      'Voo até Santiago (SCL). Depois, transfer ou carro com corrente até o resort (cerca de 1h30). A estrada tem 60 curvas.',
    passe: { valor: 95, moeda: 'USD', verificadoEm: null, urlOficial: 'https://www.vallenevado.com' },
    hospedagem: {
      resumo: 'Hotéis do próprio resort na base. Opção mais barata: ficar em Santiago (Las Condes) e subir de transfer.',
      buscaReserva: 'Valle Nevado, Chile'
    },
    cor: ['#13394A', '#2F6F8A'],
    nota: 'Pistas largas e hotel na base',
    dicas: [
      "Reserve o transfer com antecedência. Na alta temporada, os lugares acabam.",
      "Leve corrente para o carro. A polícia exige corrente na subida quando neva.",
      "Passe o primeiro dia mais leve. A base fica a quase 2.900 m de altitude.",
      "Compre o passe on-line. Em geral, o preço on-line é menor que na bilheteria."
    ]
  },
  {
    id: 'la-parva',
    nome: 'La Parva',
    pais: 'Chile',
    regiao: 'Três Vales, Santiago',
    cidadeBase: 'Santiago',
    lat: -33.331,
    lon: -70.291,
    altitudeBase: 2662,
    altitudeTopo: 3630,
    nivel: 'avancado',
    pistas: { iniciante: 15, intermediario: 40, avancado: 45 },
    kmPista: 40,
    temporada: 'Meados de junho a final de setembro',
    resumo:
      'Resort mais tranquilo dos Três Vales. Tem muito fora de pista e pistas longas. Bom para quem já tem experiência.',
    destaques: ['Fora de pista', 'Menos fila', 'Vista de Santiago'],
    comoChegar: 'Voo até Santiago (SCL). Transfer ou carro com corrente pela mesma estrada de Farellones (cerca de 1h15).',
    passe: { valor: 80, moeda: 'USD', verificadoEm: null, urlOficial: 'https://www.laparva.cl' },
    hospedagem: {
      resumo: 'Poucos apartamentos na base. A maioria das pessoas fica em Santiago ou em Farellones.',
      buscaReserva: 'Farellones, Chile'
    },
    cor: ['#1C2321', '#4A5A63'],
    nota: 'Fora de pista e pouca fila',
    dicas: [
      "Combine com Valle Nevado e El Colorado. Alguns passes cobrem os Três Vales.",
      "Contrate um guia para o fora de pista. Risco de avalanche existe.",
      "Leve lanche. Há poucos restaurantes na montanha."
    ]
  },
  {
    id: 'el-colorado',
    nome: 'El Colorado',
    pais: 'Chile',
    regiao: 'Três Vales, Santiago',
    cidadeBase: 'Santiago',
    lat: -33.35,
    lon: -70.288,
    altitudeBase: 2430,
    altitudeTopo: 3333,
    nivel: 'iniciante',
    pistas: { iniciante: 35, intermediario: 40, avancado: 25 },
    kmPista: 45,
    temporada: 'Meados de junho a final de setembro',
    resumo:
      'O resort mais perto de Santiago. Tem muitas pistas fáceis em Farellones. Bom para o primeiro dia de ski.',
    destaques: ['Mais perto de Santiago', 'Área de iniciante grande', 'Bom custo'],
    comoChegar: 'Voo até Santiago (SCL). Transfer ou carro com corrente até Farellones (cerca de 1h).',
    passe: { valor: 75, moeda: 'USD', verificadoEm: null, urlOficial: 'https://www.elcolorado.cl' },
    hospedagem: {
      resumo: 'Hotéis e apartamentos em Farellones, ou hotel em Santiago com transfer diário.',
      buscaReserva: 'Farellones, Chile'
    },
    cor: ['#92631B', '#D9A441'],
    nota: 'Mais perto de Santiago',
    dicas: [
      "Comece pela área de Farellones se for sua primeira vez.",
      "Saia cedo de Santiago. A estrada fica cheia no fim de semana.",
      "Alugue o equipamento em Santiago. Em geral, sai mais barato que na montanha."
    ]
  },
  {
    id: 'portillo',
    nome: 'Portillo',
    pais: 'Chile',
    regiao: 'Los Andes, fronteira com a Argentina',
    cidadeBase: 'Los Andes',
    lat: -32.835,
    lon: -70.13,
    altitudeBase: 2580,
    altitudeTopo: 3310,
    nivel: 'avancado',
    pistas: { iniciante: 15, intermediario: 35, avancado: 50 },
    kmPista: 35,
    temporada: 'Final de junho a final de setembro',
    resumo:
      'Resort clássico na beira da Laguna del Inca. Tem um hotel só e semanas fechadas. Pistas íngremes e famosas.',
    destaques: ['Laguna del Inca', 'Pacote semanal com tudo incluído', 'Pistas íngremes'],
    comoChegar: 'Voo até Santiago (SCL). Transfer de cerca de 2h30 pela estrada do Paso Los Libertadores.',
    passe: { valor: 90, moeda: 'USD', verificadoEm: null, urlOficial: 'https://www.skiportillo.com' },
    hospedagem: {
      resumo: 'Hotel Portillo e opções econômicas do resort (Octagon e Inca Lodge). Reserve pelo site oficial.',
      buscaReserva: 'Portillo, Chile'
    },
    cor: ['#9C3B30', '#D9480F'],
    nota: 'Pacote semanal com tudo incluído',
    dicas: [
      "Reserve a semana inteira cedo. O hotel tem poucos quartos.",
      "Confira a estrada antes de sair. O Paso Los Libertadores fecha com nevasca.",
      "Leve roupa para frio forte. O vento na Laguna del Inca é intenso."
    ]
  },
  {
    id: 'cerro-catedral',
    nome: 'Cerro Catedral',
    pais: 'Argentina',
    regiao: 'Bariloche, Patagônia',
    cidadeBase: 'Bariloche',
    lat: -41.168,
    lon: -71.44,
    altitudeBase: 1030,
    altitudeTopo: 2100,
    nivel: 'intermediario',
    pistas: { iniciante: 30, intermediario: 45, avancado: 25 },
    kmPista: 120,
    temporada: 'Meados de junho a início de outubro',
    resumo:
      'O maior centro de ski da América do Sul. Fica a 20 km de Bariloche. Combina ski com a cidade, o lago e a gastronomia.',
    destaques: ['Maior área esquiável da América do Sul', 'Cidade com muita opção', 'Voo direto do Brasil na temporada'],
    comoChegar: 'Voo até Bariloche (BRC). Depois, ônibus, transfer ou carro até a base (cerca de 30 min).',
    passe: { valor: 70, moeda: 'USD', verificadoEm: null, urlOficial: 'https://catedralaltapatagonia.com' },
    hospedagem: {
      resumo: 'Hotéis na Villa Catedral, na base. Mais opção e preço melhor no centro de Bariloche.',
      buscaReserva: 'San Carlos de Bariloche, Argentina'
    },
    cor: ['#1F6B44', '#4FA37A'],
    nota: 'Neve boa até setembro',
    dicas: [
      "Fique no centro ou no Km 18. Em geral, sai mais barato que perto da base.",
      "Alugue o equipamento na cidade. Em geral, sai mais barato que na montanha.",
      "Contrate um instrutor nos primeiros dias se for sua primeira vez na neve.",
      "Confira a condição da neve antes de comprar o passe. A neve muda muito durante a temporada."
    ]
  },
  {
    id: 'chapelco',
    nome: 'Chapelco',
    pais: 'Argentina',
    regiao: 'San Martín de los Andes, Patagônia',
    cidadeBase: 'San Martín de los Andes',
    lat: -40.255,
    lon: -71.2,
    altitudeBase: 1250,
    altitudeTopo: 1980,
    nivel: 'iniciante',
    pistas: { iniciante: 35, intermediario: 45, avancado: 20 },
    kmPista: 35,
    temporada: 'Meados de junho a final de setembro',
    resumo:
      'Resort com pistas no meio da floresta. A cidade de San Martín de los Andes é pequena e charmosa. Bom para família.',
    destaques: ['Pistas na floresta', 'Cidade charmosa', 'Menos movimento que Bariloche'],
    comoChegar: 'Voo até Chapelco (CPC), com conexão em Buenos Aires. Depois, transfer de cerca de 40 min.',
    passe: { valor: 60, moeda: 'USD', verificadoEm: null, urlOficial: 'https://www.chapelco.com' },
    hospedagem: {
      resumo: 'Hotéis e cabanas em San Martín de los Andes.',
      buscaReserva: 'San Martín de los Andes, Argentina'
    },
    cor: ['#13394A', '#1F6B44'],
    nota: 'Ótimo para quem está começando',
    dicas: [
      "Fique em San Martín de los Andes. A cidade tem boa comida e é tranquila.",
      "Combine a viagem com a Rota dos Sete Lagos até Bariloche.",
      "Leve corrente para o carro. A estrada até a base tem gelo de manhã."
    ]
  },
  {
    id: 'las-lenas',
    nome: 'Las Leñas',
    pais: 'Argentina',
    regiao: 'Malargüe, Mendoza',
    cidadeBase: 'Malargüe',
    lat: -35.15,
    lon: -70.083,
    altitudeBase: 2240,
    altitudeTopo: 3430,
    nivel: 'avancado',
    pistas: { iniciante: 20, intermediario: 35, avancado: 45 },
    kmPista: 65,
    temporada: 'Meados de junho a final de setembro',
    resumo:
      'Resort isolado e com muito fora de pista. Famoso entre esquiadores avançados. A neve costuma ser seca.',
    destaques: ['Fora de pista de nível mundial', 'Neve seca', 'Vila com hotéis no pé da pista'],
    comoChegar: 'Voo até Mendoza (MDZ) ou Malargüe (LGS). Depois, transfer (de 1h a 6h, conforme o aeroporto).',
    passe: { valor: 75, moeda: 'USD', verificadoEm: null, urlOficial: 'https://www.laslenas.com' },
    hospedagem: {
      resumo: 'Hotéis e apartamentos na vila do resort. Opção mais barata: Malargüe, a 70 km.',
      buscaReserva: 'Las Leñas, Argentina'
    },
    cor: ['#5B6660', '#92631B'],
    nota: 'Pó seco e pouca fila',
    dicas: [
      "Contrate um guia para o fora de pista. O terreno é técnico e tem risco de avalanche.",
      "Confira os voos para Malargüe. Os voos para Malargüe são poucos e mudam por temporada.",
      "Leve dinheiro em espécie. Na vila, nem todo lugar aceita cartão."
    ]
  },
  {
    id: 'cerro-castor',
    nome: 'Cerro Castor',
    pais: 'Argentina',
    regiao: 'Ushuaia, Terra do Fogo',
    cidadeBase: 'Ushuaia',
    lat: -54.72,
    lon: -68.0,
    altitudeBase: 195,
    altitudeTopo: 1057,
    nivel: 'iniciante',
    pistas: { iniciante: 40, intermediario: 40, avancado: 20 },
    kmPista: 40,
    temporada: 'Meados de junho a meados de outubro',
    resumo:
      'O centro de ski mais austral do mundo. A temporada é longa e a neve é boa por causa da latitude. Combina com passeio em Ushuaia.',
    destaques: ['Temporada longa', 'Neve até outubro', 'Passeios no Fim do Mundo'],
    comoChegar: 'Voo até Ushuaia (USH), com conexão em Buenos Aires. Depois, carro ou transfer de cerca de 30 min.',
    passe: { valor: 65, moeda: 'USD', verificadoEm: null, urlOficial: 'https://www.cerrocastor.com' },
    hospedagem: {
      resumo: 'Hotéis em Ushuaia. Poucas opções perto do resort.',
      buscaReserva: 'Ushuaia, Argentina'
    },
    cor: ['#2F6F8A', '#8FB8C9'],
    nota: 'Neve garantida perto de Ushuaia',
    dicas: [
      "Vá no fim da temporada. A neve costuma durar até outubro.",
      "Reserve um dia para passeio no Canal Beagle.",
      "Leve roupa para vento. O clima em Ushuaia muda rápido."
    ]
  }
];

export const nivelLabel: Record<Nivel, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado'
};

export function buscarDestino(id: string): Destino | undefined {
  return destinos.find((d) => d.id === id);
}
