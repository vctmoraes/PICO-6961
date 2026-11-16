// Conteúdo curado dos destinos do MVP (só ski/snowboard).
// O agente de IA de atualização deve editar SÓ este arquivo (ou o JSON que o substituir).
// Regra: todo dado tem fonte e data de verificação. Dado sem verificação aparece como "a confirmar".

export type Nivel = 'iniciante' | 'intermediario' | 'avancado';
import { destinosEua } from './eua';

export type Pais = 'Chile' | 'Argentina' | 'Estados Unidos';


export interface Destino {
  id: string;
  nome: string;
  pais: Pais;
  regiao: string;
  /** Cidade-base para hospedagem e voo. */
  cidadeBase: string;
  /**
   * Data em que alguém conferiu altitude, pistas e temporada em fonte oficial.
   * Vazio = dado de referência, ainda em conferência (o app mostra um aviso).
   */
  verificadoEm?: string;
  lat: number;
  lon: number;
  /** Altitude da base e do topo, em metros. */
  altitudeBase: number;
  altitudeTopo: number;
  /** Nível principal do destino (badge do card). */
  nivel: Nivel;
  /** Percentual de pistas por nível (soma 100). Sem fonte, deixe vazio: o app esconde o gráfico. */
  pistas?: { iniciante: number; intermediario: number; avancado: number };
  /** Km de pista. Sem fonte, deixe vazio. */
  kmPista?: number;
  temporada: string;
  resumo: string;
  destaques: string[];
  comoChegar: string;
  passe: {
    /** Valor de referência do passe de 1 dia adulto, alta temporada. null = sem valor: o app mostra "Consultar". */
    valor: number | null;
    moeda: 'USD' | 'CLP' | 'ARS';
    /** null = valor não verificado em fonte oficial. */
    verificadoEm: string | null;
    /** Site oficial do resort. null = site não confirmado: o app esconde o botão "Comprar passe". */
    urlOficial: string | null;
  };
  hospedagem: {
    resumo: string;
    /** Termo de busca usado no link de afiliado. */
    buscaReserva: string;
  };
  /**
   * Páginas oficiais do resort com câmera ao vivo e boletim da montanha (pistas, teleféricos, neve).
   * Só ponha link de site oficial. Sem página oficial, deixe o campo vazio: o app esconde o botão.
   */
  montanha?: {
    cameras?: string;
    boletim?: string;
    /** null = link não testado. */
    verificadoEm: string | null;
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
  /** Código do aeroporto de chegada mais usado (para a busca de voo). */
  aeroporto?: string;
  /** Passe de temporada que vale neste resort (EUA). */
  rede?: 'Epic Pass' | 'Ikon Pass';
  /** Texto sobre o preço do passe quando o preço é dinâmico (sem valor fixo). */
  passeInfo?: string;
  /** Data em que a equipe revisou o texto de um destino importado (AAAA-MM-DD). */
  revisadoEm?: string;
  /** 'openskimap' = destino importado da base aberta (dados do OpenStreetMap). Vazio = conteúdo curado à mão. */
  fonteDados?: 'openskimap';
  /** Cores da ilustração (substitui a foto até termos fotos com licença confirmada). */
  cor: [string, string];
}

const curados: Destino[] = [
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
    montanha: { boletim: 'https://vallenevado.com/en/mountain-report', verificadoEm: null },
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
    montanha: {
      cameras: 'https://www.skiportillo.com/en/webcams/',
      boletim: 'https://skiportillo.com/en/mountain/portillo-snow-forecast-conditions/',
      verificadoEm: null
    },
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
    montanha: { boletim: 'https://www.cerrochapelco.com.ar/parte-diario', verificadoEm: null },
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
  },
  // ───────── Chile: novos (dados de referência, ainda em conferência) ─────────
  {
    id: 'lagunillas',
    nome: 'Lagunillas',
    pais: 'Chile',
    regiao: 'Cajón del Maipo, Santiago',
    cidadeBase: 'San José de Maipo',
    lat: -33.605,
    lon: -70.27,
    altitudeBase: 2130,
    altitudeTopo: 2580,
    nivel: 'intermediario',
    temporada: 'Junho a setembro, conforme a neve',
    resumo:
      'Centro de ski do Club Andino de Chile, sem fins comerciais. Fica a cerca de 67 km de Santiago. Tem 13 pistas e ski noturno.',
    destaques: ['Ambiente de clube, sem multidão', 'Ski noturno', 'Opção mais barata perto de Santiago'],
    comoChegar: 'Voo até Santiago (SCL). Depois, carro ou transfer pelo Cajón del Maipo, passando por San José de Maipo (cerca de 2h).',
    passe: { valor: null, moeda: 'USD', verificadoEm: null, urlOficial: null },
    hospedagem: {
      resumo: 'Refúgios do clube na montanha e pousadas em San José de Maipo.',
      buscaReserva: 'San José de Maipo, Chile'
    },
    cor: ['#13394A', '#5B6660'],
    nota: 'Clube andino perto de Santiago',
    dicas: [
      'Leve corrente para o carro. A estrada final é de terra e tem gelo.',
      'Confira a abertura antes de sair. O centro depende muito da neve natural.',
      'Combine com um dia nas termas do Cajón del Maipo.'
    ]
  },
  {
    id: 'chapa-verde',
    nome: 'Chapa Verde',
    pais: 'Chile',
    regiao: "O'Higgins, perto de Rancagua",
    cidadeBase: 'Rancagua',
    lat: -34.17,
    lon: -70.36,
    altitudeBase: 2370,
    altitudeTopo: 2870,
    nivel: 'intermediario',
    temporada: 'Junho a setembro',
    resumo:
      'Centro de ski em terreno da Codelco, perto da mina El Teniente. Fica a cerca de 60 km de Rancagua e 145 km de Santiago.',
    destaques: ['Menos movimento que os Três Vales', 'Bom para fim de semana saindo de Santiago'],
    comoChegar:
      'Voo até Santiago (SCL). Depois, carro ou ônibus até Rancagua. A estrada passa por área da mina: confira no site do centro como subir.',
    passe: { valor: null, moeda: 'USD', verificadoEm: null, urlOficial: null },
    hospedagem: {
      resumo: 'Não há hotel na montanha. Fique em Rancagua ou em Santiago.',
      buscaReserva: 'Rancagua, Chile'
    },
    cor: ['#1F6B44', '#5B6660'],
    nota: 'Alternativa tranquila ao sul de Santiago',
    dicas: [
      'Confira a regra de acesso antes de ir. A estrada é de uso da mina.',
      'Saia cedo. O centro fica longe de Santiago.'
    ]
  },
  {
    id: 'nevados-de-chillan',
    nome: 'Nevados de Chillán',
    pais: 'Chile',
    regiao: 'Ñuble, Cordilheira dos Andes',
    cidadeBase: 'Chillán',
    lat: -36.905,
    lon: -71.41,
    altitudeBase: 1600,
    altitudeTopo: 2700,
    nivel: 'intermediario',
    kmPista: 35,
    temporada: 'Meados de junho a início de outubro',
    resumo:
      'Resort grande no vulcão Chillán, com termas e muito fora de pista entre bosques. Fica a 82 km da cidade de Chillán.',
    destaques: ['Termas na base', 'Fora de pista entre árvores', 'Uma das pistas mais longas da América do Sul'],
    comoChegar:
      'Voo até Concepción (CCP) ou Santiago (SCL). De Santiago, ônibus ou carro até Chillán (cerca de 4h30). Depois, 1h30 até a montanha.',
    passe: { valor: null, moeda: 'USD', verificadoEm: null, urlOficial: 'https://www.nevadosdechillan.com' },
    hospedagem: {
      resumo: 'Hotéis do resort na base e cabanas no Valle Las Trancas, a poucos km.',
      buscaReserva: 'Las Trancas, Chile'
    },
    cor: ['#2F6F8A', '#1F6B44'],
    nota: 'Ski com termas e bosque',
    dicas: [
      'Fique no Valle Las Trancas. Em geral, sai mais barato que a base.',
      'Confira o boletim antes de ir. A atividade do vulcão já atrasou a abertura de temporadas.',
      'Leve roupa de banho para as termas.'
    ]
  },
  {
    id: 'antuco',
    nome: 'Antuco',
    pais: 'Chile',
    regiao: 'Biobío, Parque Nacional Laguna del Laja',
    cidadeBase: 'Los Ángeles',
    lat: -37.41,
    lon: -71.37,
    altitudeBase: 1400,
    altitudeTopo: 1850,
    nivel: 'iniciante',
    kmPista: 9,
    temporada: 'Julho a setembro, conforme a neve',
    resumo: 'Centro pequeno no vulcão Antuco, dentro de um parque nacional. Tem poucas pistas, a maioria fácil.',
    destaques: ['Paisagem do vulcão e da Laguna del Laja', 'Preço mais baixo', 'Bom para começar'],
    comoChegar: 'Voo até Concepción (CCP). Depois, carro até Los Ángeles e mais cerca de 1h30 até o parque.',
    passe: { valor: null, moeda: 'USD', verificadoEm: null, urlOficial: null },
    hospedagem: {
      resumo: 'Poucos refúgios perto do centro. A maioria fica em Los Ángeles ou em Antuco.',
      buscaReserva: 'Los Ángeles, Chile'
    },
    cor: ['#5B6660', '#2F6F8A'],
    nota: 'Pequeno e barato, num parque nacional',
    dicas: [
      'Confira a abertura antes de sair. O centro depende muito da neve natural.',
      'Leve corrente. A estrada do parque tem gelo.'
    ]
  },
  {
    id: 'corralco',
    nome: 'Corralco',
    pais: 'Chile',
    regiao: 'Araucanía, vulcão Lonquimay',
    cidadeBase: 'Curacautín',
    lat: -38.39,
    lon: -71.58,
    altitudeBase: 1550,
    altitudeTopo: 2400,
    nivel: 'intermediario',
    kmPista: 29,
    temporada: 'Meados de junho a início de outubro',
    resumo:
      'Resort no vulcão Lonquimay, cercado por floresta de araucárias. Tem hotel na base e muito terreno para fora de pista.',
    destaques: ['Florestas de araucária', 'Fora de pista no vulcão', 'Hotel na base'],
    comoChegar: 'Voo até Temuco (ZCO). Depois, carro ou transfer até Curacautín e a montanha (cerca de 2h).',
    passe: { valor: null, moeda: 'USD', verificadoEm: null, urlOficial: 'https://www.corralco.com' },
    hospedagem: {
      resumo: 'Hotel do resort na base. Opções mais baratas em Curacautín e Malalcahuello.',
      buscaReserva: 'Malalcahuello, Chile'
    },
    cor: ['#1F6B44', '#13394A'],
    nota: 'Vulcão e araucárias',
    dicas: [
      'Fique em Malalcahuello. A vila tem termas e cabanas.',
      'Contrate um guia para subir ao cume do vulcão.',
      'Leve corrente para o carro.'
    ]
  },
  {
    id: 'las-araucarias',
    nome: 'Las Araucarias',
    pais: 'Chile',
    regiao: 'Araucanía, vulcão Llaima',
    cidadeBase: 'Temuco',
    lat: -38.7,
    lon: -71.73,
    altitudeBase: 1550,
    altitudeTopo: 1950,
    nivel: 'iniciante',
    temporada: 'Julho a setembro, conforme a neve',
    resumo: 'Centro pequeno no vulcão Llaima, no Parque Nacional Conguillío. Bom para família e para o primeiro contato com a neve.',
    destaques: ['Parque Nacional Conguillío', 'Bom para família', 'Pouco movimento'],
    comoChegar: 'Voo até Temuco (ZCO). Depois, carro até Cherquenco e a subida ao parque (cerca de 1h30).',
    passe: { valor: null, moeda: 'USD', verificadoEm: null, urlOficial: null },
    hospedagem: {
      resumo: 'Refúgio na montanha e cabanas na região de Cherquenco e Melipeuco.',
      buscaReserva: 'Melipeuco, Chile'
    },
    cor: ['#13394A', '#1F6B44'],
    nota: 'Família e floresta no Conguillío',
    dicas: ['Confira a abertura antes de sair. O centro depende muito da neve natural.', 'Leve corrente para o carro.']
  },
  {
    id: 'ski-pucon',
    nome: 'Ski Pucón',
    pais: 'Chile',
    regiao: 'Araucanía, vulcão Villarrica',
    cidadeBase: 'Pucón',
    lat: -39.38,
    lon: -71.95,
    altitudeBase: 1550,
    altitudeTopo: 2440,
    nivel: 'avancado',
    pistas: { iniciante: 20, intermediario: 30, avancado: 50 },
    temporada: 'Julho a setembro, conforme a neve e o vulcão',
    resumo:
      'Ski na encosta do vulcão Villarrica, um dos vulcões mais ativos do Chile. A cidade de Pucón tem muito passeio, termas e lagos.',
    destaques: ['Ski num vulcão ativo', 'Cidade turística com muita opção', 'Vista do lago Villarrica'],
    comoChegar: 'Voo até Temuco (ZCO) ou Pucón (ZPC, na temporada). Depois, carro até a base (cerca de 30 min de Pucón).',
    passe: { valor: null, moeda: 'USD', verificadoEm: null, urlOficial: null },
    hospedagem: {
      resumo: 'Hotéis e cabanas em Pucón e Villarrica.',
      buscaReserva: 'Pucón, Chile'
    },
    cor: ['#9C3B30', '#13394A'],
    nota: 'Ski no vulcão Villarrica',
    dicas: [
      'Confira o alerta do vulcão antes de ir. O acesso fecha quando o alerta sobe.',
      'O vento no vulcão fecha os teleféricos com frequência. Tenha um plano B (termas).',
      'Confira se o centro está aberto na temporada. A operação muda de ano para ano.'
    ]
  },
  {
    id: 'antillanca',
    nome: 'Antillanca',
    pais: 'Chile',
    regiao: 'Los Lagos, Parque Nacional Puyehue',
    cidadeBase: 'Osorno',
    lat: -40.775,
    lon: -72.2,
    altitudeBase: 1040,
    altitudeTopo: 1540,
    nivel: 'intermediario',
    temporada: 'Julho a setembro',
    resumo:
      'Centro de ski do Club Andino de Osorno, no vulcão Casablanca. Fica a 98 km de Osorno, dentro do Parque Nacional Puyehue.',
    destaques: ['Parque Nacional Puyehue', 'Hotel na montanha', 'Termas de Puyehue no caminho'],
    comoChegar: 'Voo até Osorno (ZOS) ou Puerto Montt (PMC). Depois, carro pela rota 215 até o parque (cerca de 1h30 de Osorno).',
    passe: { valor: null, moeda: 'USD', verificadoEm: null, urlOficial: 'https://www.antillanca.cl' },
    hospedagem: {
      resumo: 'Hotel do centro na montanha. Mais opção nas termas de Puyehue e em Osorno.',
      buscaReserva: 'Puyehue, Chile'
    },
    cor: ['#2F6F8A', '#5B6660'],
    nota: 'Vulcão, floresta e termas',
    dicas: ['Combine com um dia nas termas de Puyehue.', 'Leve corrente. A subida tem gelo.']
  },
  {
    id: 'volcan-osorno',
    nome: 'Volcán Osorno',
    pais: 'Chile',
    regiao: 'Los Lagos, lago Llanquihue',
    cidadeBase: 'Puerto Varas',
    lat: -41.12,
    lon: -72.52,
    altitudeBase: 1200,
    altitudeTopo: 1760,
    nivel: 'intermediario',
    temporada: 'Julho a setembro, conforme a neve',
    resumo: 'Ski no vulcão Osorno, com vista para o lago Llanquihue. Fica perto de Puerto Varas, cidade turística da região dos lagos.',
    destaques: ['Vista do lago Llanquihue', 'Perto de Puerto Varas', 'Combina com passeio na região dos lagos'],
    comoChegar: 'Voo até Puerto Montt (PMC). Depois, carro até Puerto Varas e Ensenada (cerca de 1h30 até a base).',
    passe: { valor: null, moeda: 'USD', verificadoEm: null, urlOficial: null },
    hospedagem: {
      resumo: 'Hotéis em Puerto Varas e cabanas em Ensenada, no pé do vulcão.',
      buscaReserva: 'Puerto Varas, Chile'
    },
    cor: ['#13394A', '#8FB8C9'],
    nota: 'Vulcão com vista para o lago',
    dicas: [
      'O vento fecha os teleféricos com frequência. Confira o boletim de manhã.',
      'Reserve um dia para os Saltos del Petrohué.'
    ]
  },
  {
    id: 'el-fraile',
    nome: 'El Fraile',
    pais: 'Chile',
    regiao: 'Aysén, Patagônia chilena',
    cidadeBase: 'Coyhaique',
    lat: -45.68,
    lon: -71.95,
    altitudeBase: 1100,
    altitudeTopo: 1450,
    nivel: 'iniciante',
    temporada: 'Julho a setembro, conforme a neve',
    resumo: 'Centro pequeno no meio da floresta nativa, a 29 km de Coyhaique. Tem 2 teleféricos e 5 pistas.',
    destaques: ['Pistas na floresta nativa', 'Patagônia chilena', 'Pouco movimento'],
    comoChegar: 'Voo até Balmaceda (BBA). Depois, carro até Coyhaique e a montanha (cerca de 1h30).',
    passe: { valor: null, moeda: 'USD', verificadoEm: null, urlOficial: 'https://www.skielfraile.com' },
    hospedagem: {
      resumo: 'Hotéis e cabanas em Coyhaique.',
      buscaReserva: 'Coyhaique, Chile'
    },
    cor: ['#1F6B44', '#4FA37A'],
    nota: 'Floresta nativa na Patagônia',
    dicas: ['Confira a abertura antes de sair. O centro depende muito da neve natural.', 'Combine com passeio pela Carretera Austral.']
  },
  {
    id: 'cerro-mirador',
    nome: 'Cerro Mirador',
    pais: 'Chile',
    regiao: 'Magalhães, Punta Arenas',
    cidadeBase: 'Punta Arenas',
    lat: -53.13,
    lon: -71.03,
    altitudeBase: 380,
    altitudeTopo: 600,
    nivel: 'iniciante',
    temporada: 'Julho a setembro, conforme a neve',
    resumo:
      'Centro muito pequeno ao lado de Punta Arenas, com vista para o Estreito de Magalhães. Bom para combinar com uma viagem pela Patagônia.',
    destaques: ['Vista do Estreito de Magalhães', 'Perto da cidade', 'Bom para começar'],
    comoChegar: 'Voo até Punta Arenas (PUQ). Depois, carro ou táxi até o centro (cerca de 20 min).',
    passe: { valor: null, moeda: 'USD', verificadoEm: null, urlOficial: null },
    hospedagem: {
      resumo: 'Hotéis em Punta Arenas.',
      buscaReserva: 'Punta Arenas, Chile'
    },
    cor: ['#2F6F8A', '#13394A'],
    nota: 'Ski com vista para o Estreito',
    dicas: ['Leve roupa para vento forte.', 'Combine com a viagem a Torres del Paine (fora da temporada de ski, em geral).']
  },
  // ───────── Argentina: novos (dados de referência, ainda em conferência) ─────────
  {
    id: 'cerro-bayo',
    nome: 'Cerro Bayo',
    pais: 'Argentina',
    regiao: 'Villa La Angostura, Neuquén',
    cidadeBase: 'Villa La Angostura',
    lat: -40.75,
    lon: -71.6,
    altitudeBase: 1050,
    altitudeTopo: 1780,
    nivel: 'intermediario',
    temporada: 'Meados de junho a final de setembro',
    resumo:
      'Resort "boutique" com vista para o lago Nahuel Huapi. Fica a 9 km de Villa La Angostura, uma das vilas mais bonitas da Patagônia.',
    destaques: ['Vista do lago Nahuel Huapi', 'Vila charmosa', 'Área de iniciante no alto, com mais neve'],
    comoChegar: 'Voo até Bariloche (BRC). Depois, carro ou transfer até Villa La Angostura (cerca de 1h30).',
    passe: { valor: null, moeda: 'ARS', verificadoEm: null, urlOficial: 'https://www.cerrobayo.com.ar' },
    hospedagem: {
      resumo: 'Hotéis, pousadas e cabanas em Villa La Angostura.',
      buscaReserva: 'Villa La Angostura, Argentina'
    },
    cor: ['#13394A', '#D9A441'],
    nota: 'Pequeno, bonito e com vista do lago',
    dicas: [
      'Combine com Cerro Catedral. Bariloche fica perto.',
      'A área de iniciante fica no alto. Pegue o teleférico até lá.',
      'Reserve hospedagem cedo. A vila tem poucos hotéis.'
    ]
  },
  {
    id: 'cerro-perito-moreno',
    nome: 'Cerro Perito Moreno',
    pais: 'Argentina',
    regiao: 'El Bolsón, Río Negro',
    cidadeBase: 'El Bolsón',
    lat: -41.86,
    lon: -71.62,
    altitudeBase: 1000,
    altitudeTopo: 1450,
    nivel: 'iniciante',
    kmPista: 25,
    temporada: 'Final de junho a setembro, conforme a neve',
    resumo: 'Centro familiar perto de El Bolsón, a cerca de 120 km de Bariloche. Tem 9 meios de elevação e neve artificial.',
    destaques: ['Bom para família', 'Preço mais baixo que Bariloche', 'Cidade com cultura alternativa e cerveja artesanal'],
    comoChegar: 'Voo até Bariloche (BRC). Depois, carro ou ônibus até El Bolsón (cerca de 2h) e mais 25 km até o centro.',
    passe: { valor: null, moeda: 'ARS', verificadoEm: null, urlOficial: null },
    hospedagem: {
      resumo: 'Cabanas e pousadas em El Bolsón.',
      buscaReserva: 'El Bolsón, Argentina'
    },
    cor: ['#1F6B44', '#92631B'],
    nota: 'Familiar, perto de El Bolsón',
    dicas: ['Visite a feira de artesanato de El Bolsón.', 'Leve corrente. A estrada até o centro tem gelo.']
  },
  {
    id: 'la-hoya',
    nome: 'La Hoya',
    pais: 'Argentina',
    regiao: 'Esquel, Chubut',
    cidadeBase: 'Esquel',
    lat: -42.83,
    lon: -71.27,
    altitudeBase: 1350,
    altitudeTopo: 2050,
    nivel: 'intermediario',
    temporada: 'Meados de junho a outubro',
    resumo: 'Centro de ski a 13 km de Esquel, com temporada longa e neve seca. Tem bom fora de pista e preço mais baixo que Bariloche.',
    destaques: ['Temporada longa, até outubro', 'Neve seca', 'Pouca fila'],
    comoChegar: 'Voo até Esquel (EQS), com conexão em Buenos Aires. Depois, carro ou transfer até o centro (cerca de 20 min).',
    passe: { valor: null, moeda: 'ARS', verificadoEm: null, urlOficial: null },
    hospedagem: {
      resumo: 'Hotéis e cabanas em Esquel.',
      buscaReserva: 'Esquel, Argentina'
    },
    cor: ['#2F6F8A', '#1F6B44'],
    nota: 'Neve seca até outubro',
    dicas: ['Ande no trem La Trochita, em Esquel.', 'Visite o Parque Nacional Los Alerces.']
  },
  {
    id: 'caviahue',
    nome: 'Caviahue',
    pais: 'Argentina',
    regiao: 'Neuquén, vulcão Copahue',
    cidadeBase: 'Caviahue',
    lat: -37.86,
    lon: -71.05,
    altitudeBase: 1650,
    altitudeTopo: 2045,
    nivel: 'iniciante',
    temporada: 'Julho a setembro',
    resumo:
      'Centro de ski no pé do vulcão Copahue, ao lado do lago Caviahue. A vila tem termas e araucárias. Bom para família.',
    destaques: ['Termas de Copahue', 'Araucárias na neve', 'Neve artificial com canhões novos'],
    comoChegar: 'Voo até Neuquén (NQN). Depois, carro ou ônibus até Caviahue (cerca de 5h).',
    passe: { valor: null, moeda: 'ARS', verificadoEm: null, urlOficial: 'https://www.caviahue.com' },
    hospedagem: {
      resumo: 'Hotéis e cabanas na vila de Caviahue.',
      buscaReserva: 'Caviahue, Argentina'
    },
    cor: ['#5B6660', '#1F6B44'],
    nota: 'Vulcão, termas e família',
    dicas: ['Confira o alerta do vulcão Copahue antes de ir.', 'Leve roupa de banho para as termas.']
  },
  {
    id: 'batea-mahuida',
    nome: 'Batea Mahuida',
    pais: 'Argentina',
    regiao: 'Villa Pehuenia, Neuquén',
    cidadeBase: 'Villa Pehuenia',
    lat: -38.84,
    lon: -71.13,
    altitudeBase: 1600,
    altitudeTopo: 1900,
    nivel: 'iniciante',
    temporada: 'Julho a setembro, conforme a neve',
    resumo:
      'Parque de neve administrado pela comunidade mapuche Puel. Tem pista para iniciante e vista da cratera e de vulcões do Chile.',
    destaques: ['Administrado pela comunidade mapuche', 'Vista de vários vulcões', 'Trenó e passeio na neve'],
    comoChegar: 'Voo até Neuquén (NQN). Depois, carro até Villa Pehuenia (cerca de 4h30) e mais 10 km até o parque.',
    passe: { valor: null, moeda: 'ARS', verificadoEm: null, urlOficial: 'https://www.cerrobateamahuida.com.ar' },
    hospedagem: {
      resumo: 'Cabanas e pousadas em Villa Pehuenia, à beira do lago Aluminé.',
      buscaReserva: 'Villa Pehuenia, Argentina'
    },
    cor: ['#92631B', '#13394A'],
    nota: 'Parque de neve mapuche',
    dicas: ['Bom para o primeiro dia na neve.', 'Respeite as regras da comunidade no parque.']
  },
  {
    id: 'lago-hermoso',
    nome: 'Lago Hermoso',
    pais: 'Argentina',
    regiao: 'Rota dos Sete Lagos, Neuquén',
    cidadeBase: 'San Martín de los Andes',
    lat: -40.37,
    lon: -71.52,
    altitudeBase: 1150,
    altitudeTopo: 1500,
    nivel: 'iniciante',
    temporada: 'Julho a setembro, conforme a neve',
    resumo: 'Centro pequeno na Rota dos Sete Lagos, com 9 pistas. Bom para família e para combinar com Chapelco.',
    destaques: ['Rota dos Sete Lagos', 'Bom para família', 'Pouco movimento'],
    comoChegar: 'Voo até Chapelco (CPC) ou Bariloche (BRC). Depois, carro pela Rota dos Sete Lagos (cerca de 1h de San Martín de los Andes).',
    passe: { valor: null, moeda: 'ARS', verificadoEm: null, urlOficial: null },
    hospedagem: {
      resumo: 'Hospedagem no próprio centro e em San Martín de los Andes.',
      buscaReserva: 'San Martín de los Andes, Argentina'
    },
    cor: ['#2F6F8A', '#4FA37A'],
    nota: 'Pequeno, na Rota dos Sete Lagos',
    dicas: ['Confira a estrada antes de sair. A Rota dos Sete Lagos tem trecho de terra e gelo.']
  },
  {
    id: 'los-puquios',
    nome: 'Los Puquios',
    pais: 'Argentina',
    regiao: 'Alta montanha, Mendoza',
    cidadeBase: 'Uspallata',
    lat: -32.82,
    lon: -69.92,
    altitudeBase: 2600,
    altitudeTopo: 2800,
    nivel: 'iniciante',
    temporada: 'Junho a setembro',
    resumo:
      'Centro familiar pequeno na estrada para o Chile, perto de Penitentes. Tem pista de trenó, escola de ski e neve artificial.',
    destaques: ['Bom para criança e família', 'Pista de trenó', 'Neve artificial'],
    comoChegar: 'Voo até Mendoza (MDZ). Depois, carro pela rota 7 até a alta montanha (cerca de 3h).',
    passe: { valor: null, moeda: 'ARS', verificadoEm: null, urlOficial: null },
    hospedagem: {
      resumo: 'Hotéis em Uspallata ou em Mendoza, com bate e volta.',
      buscaReserva: 'Uspallata, Argentina'
    },
    cor: ['#92631B', '#D9A441'],
    nota: 'Família e trenó em Mendoza',
    dicas: [
      'Confira a rota 7 antes de sair. A estrada fecha com nevasca.',
      'Combine com a visita à Ponte do Inca e ao mirante do Aconcágua.'
    ]
  },
  {
    id: 'cerro-martial',
    nome: 'Cerro Martial',
    pais: 'Argentina',
    regiao: 'Ushuaia, Terra do Fogo',
    cidadeBase: 'Ushuaia',
    lat: -54.78,
    lon: -68.4,
    altitudeBase: 300,
    altitudeTopo: 1000,
    nivel: 'iniciante',
    temporada: 'Julho a setembro, conforme a neve',
    resumo:
      'Centro de montanha urbano, aos pés do glaciar Martial, a poucos km do centro de Ushuaia. Ganhou um teleférico quádruplo novo em 2026.',
    destaques: ['Glaciar Martial', 'Perto do centro de Ushuaia', 'Teleférico novo em 2026'],
    comoChegar: 'Voo até Ushuaia (USH). Depois, táxi até a base do Cerro Martial (cerca de 15 min).',
    passe: { valor: null, moeda: 'ARS', verificadoEm: null, urlOficial: null },
    hospedagem: {
      resumo: 'Hotéis em Ushuaia. Alguns ficam na própria encosta do Martial.',
      buscaReserva: 'Ushuaia, Argentina'
    },
    cor: ['#8FB8C9', '#13394A'],
    nota: 'Glaciar ao lado da cidade',
    dicas: ['Combine com Cerro Castor, a 26 km.', 'Leve roupa para vento. O clima em Ushuaia muda rápido.']
  }
];

// Aeroporto de chegada de cada destino curado (o mesmo do texto "Como chegar").
const aeroportoDe: Record<string, string> = {
  'valle-nevado': 'SCL', 'la-parva': 'SCL', 'el-colorado': 'SCL', portillo: 'SCL', lagunillas: 'SCL', 'chapa-verde': 'SCL',
  'nevados-de-chillan': 'CCP', antuco: 'CCP', corralco: 'ZCO', 'las-araucarias': 'ZCO', 'ski-pucon': 'ZCO', antillanca: 'ZOS',
  'volcan-osorno': 'PMC', 'el-fraile': 'BBA', 'cerro-mirador': 'PUQ', 'cerro-catedral': 'BRC', 'cerro-bayo': 'BRC',
  'cerro-perito-moreno': 'BRC', chapelco: 'CPC', 'lago-hermoso': 'CPC', 'las-lenas': 'MDZ', 'los-puquios': 'MDZ',
  caviahue: 'NQN', 'batea-mahuida': 'NQN', 'la-hoya': 'EQS', 'cerro-castor': 'USH', 'cerro-martial': 'USH'
};

/** Todos os destinos: curados (Chile e Argentina) + importados (Estados Unidos). */
export const destinos: Destino[] = [...curados.map((d) => ({ ...d, aeroporto: d.aeroporto ?? aeroportoDe[d.id] })), ...destinosEua];

/** Países com pelo menos 1 destino, na ordem dos filtros e das listas. */
export const paises: Pais[] = (['Chile', 'Argentina', 'Estados Unidos'] as Pais[]).filter((p) => destinos.some((d) => d.pais === p));

export const nivelLabel: Record<Nivel, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado'
};

export function buscarDestino(id: string): Destino | undefined {
  return destinos.find((d) => d.id === id);
}

/**
 * Grupos para as listas de escolha (<optgroup>): Chile, Argentina e, nos EUA, um grupo por estado.
 * `incluir` filtra os destinos (ex.: tirar os que já estão no roteiro).
 */
export function gruposDeDestinos(incluir: (d: Destino) => boolean = () => true): { rotulo: string; itens: Destino[] }[] {
  const grupos = new Map<string, Destino[]>();
  for (const d of destinos) {
    if (!incluir(d)) continue;
    const rotulo = d.pais === 'Estados Unidos' ? `EUA · ${d.regiao.split(', ').pop()}` : d.pais;
    grupos.set(rotulo, [...(grupos.get(rotulo) ?? []), d]);
  }
  const ordem = (r: string) => (r === 'Chile' ? 0 : r === 'Argentina' ? 1 : 2);
  return [...grupos.entries()]
    .sort(([a], [b]) => ordem(a) - ordem(b) || a.localeCompare(b, 'pt-BR'))
    .map(([rotulo, itens]) => ({ rotulo, itens: [...itens].sort((x, y) => x.nome.localeCompare(y.nome)) }));
}
