// Conhecimento do consultor de equipamento: estilos de ski e snowboard, o que cada estilo pede do equipamento
// e do terreno. Regras de bolso, não promessa: todo texto manda confirmar na loja.
// Fontes: lista FONTES no fim do arquivo. Cada estilo aponta as fontes que sustentam o texto.

export type Modalidade = 'ski' | 'snowboard';
export type EstiloId = 'aprender' | 'pista' | 'all-mountain' | 'freeride' | 'park' | 'bumps';

export type TagTerreno =
  | 'area-iniciante'
  | 'pistas-preparadas'
  | 'pistas-azuis'
  | 'muito-avancado'
  | 'fora-de-pista'
  | 'arvores'
  | 'ingreme'
  | 'neve-seca'
  | 'snowpark'
  | 'mogul'
  | 'teleski'
  | 'sem-snowboard';

export const rotuloTerreno: Record<TagTerreno, string> = {
  'area-iniciante': 'Área para iniciante',
  'pistas-preparadas': 'Pistas preparadas',
  'pistas-azuis': 'Muitas pistas intermediárias',
  'muito-avancado': 'Muitas pistas difíceis',
  'fora-de-pista': 'Fora de pista',
  arvores: 'Pistas entre árvores',
  ingreme: 'Terreno íngreme',
  'neve-seca': 'Neve seca',
  snowpark: 'Snowpark',
  mogul: 'Pista de mogul',
  teleski: 'Teleférico de arrasto',
  'sem-snowboard': 'Snowboard proibido'
};

export interface Caracteristica {
  item: string;
  valor: string;
  porque: string;
}

export interface Equipamento {
  nome: string;
  caracteristicas: Caracteristica[];
  /** Frases prontas para pedir na loja de aluguel. */
  pedirNaLoja: string[];
}

export interface Estilo {
  id: EstiloId;
  rotulo: string;
  /** Como a pessoa anda na neve: frase curta, na voz do usuário. */
  detalhe: string;
  ski: Equipamento | null;
  snowboard: Equipamento | null;
  /** Onde esse estilo rende: cor de pista e tipo de terreno. */
  pistas: string[];
  /** Peso de cada tipo de terreno na sugestão de destinos. */
  terreno: Partial<Record<TagTerreno, number>>;
  fontes: number[];
}

export const estilos: Estilo[] = [
  {
    id: 'aprender',
    rotulo: 'Aprender e ganhar confiança',
    detalhe: 'Estou começando ou ainda desço com cuidado',
    ski: {
      nome: 'Ski de iniciante (pista)',
      caracteristicas: [
        { item: 'Comprimento', valor: 'Curto: do queixo ao nariz', porque: 'Ski curto vira com menos força e é mais fácil de controlar.' },
        { item: 'Largura no meio', valor: 'Estreito: cerca de 70 a 85 mm', porque: 'Ski estreito troca de borda rápido e segura na pista preparada.' },
        { item: 'Perfil', valor: 'Rocker na ponta e camber sob o pé', porque: 'A ponta levantada começa a curva sozinha e perdoa o erro.' },
        { item: 'Rigidez', valor: 'Macio', porque: 'Ski macio dobra com pouca velocidade e pouco peso.' }
      ],
      pedirNaLoja: ['Diga “iniciante” quando perguntarem o seu tipo de esquiador', 'Ski de iniciante, macio e curto (o pacote básico serve)', 'Bota confortável, de flexão macia', 'Capacete; óculos e luva quase nunca vêm no aluguel']
    },
    snowboard: {
      nome: 'Prancha de iniciante',
      caracteristicas: [
        { item: 'Comprimento', valor: '1 a 2 cm mais curta que a sua faixa de peso', porque: 'Prancha curta gira mais fácil em baixa velocidade.' },
        { item: 'Perfil', valor: 'Rocker, plano ou híbrido com rocker', porque: 'Com as pontas levantadas, a borda prende menos e você cai menos.' },
        { item: 'Rigidez', valor: 'Macia', porque: 'Prancha macia perdoa o peso no lugar errado.' },
        { item: 'Formato', valor: 'Twin ou directional twin', porque: 'Funciona igual para os dois lados enquanto você aprende.' }
      ],
      pedirNaLoja: ['Prancha macia de iniciante, rocker ou híbrida (o pacote básico serve)', 'Bota macia e confortável', 'Descubra se você é regular ou goofy antes de ajustar a base', 'Capacete e protetor de punho, se tiver']
    },
    pistas: [
      'Comece na área de iniciante, com esteira rolante (tapete) e inclinação suave.',
      'Depois, pistas verdes largas. Passe para a azul quando fizer curvas controladas e parar quando quiser.',
      'No snowboard, evite trechos longos e planos: a prancha para e você precisa empurrar.'
    ],
    terreno: { 'area-iniciante': 4, 'pistas-preparadas': 2 },
    fontes: [1, 2, 5, 10, 11, 12, 15, 16, 17]
  },
  {
    id: 'pista',
    rotulo: 'Pista preparada e curvas na borda',
    detalhe: 'Gosto de velocidade e de curvas limpas na pista lisa (carving)',
    ski: {
      nome: 'Ski de pista (carving)',
      caracteristicas: [
        { item: 'Largura no meio', valor: 'Cerca de 65 a 85 mm', porque: 'Ski estreito entra na borda rápido e segura na neve dura.' },
        { item: 'Perfil', valor: 'Camber em quase todo o ski', porque: 'O camber põe a borda inteira em contato com a neve e dá aderência.' },
        { item: 'Rigidez', valor: 'Firme, muitas vezes com metal', porque: 'O ski firme fica estável em velocidade e não vibra.' },
        { item: 'Raio de curva', valor: 'Curto (até ~15 m) para curva curta; longo (18 m ou mais) para curva aberta', porque: 'O raio diz o tamanho natural da curva do ski.' }
      ],
      pedirNaLoja: ['Ski de pista (carving), firme', 'Raio curto se você gosta de curva fechada', 'Bota com flexão média ou firme e bem justa no calcanhar']
    },
    snowboard: {
      nome: 'Prancha de carving',
      caracteristicas: [
        { item: 'Formato', valor: 'Direcional', porque: 'Nariz e cauda diferentes deixam a prancha estável para frente.' },
        { item: 'Perfil', valor: 'Camber', porque: 'O camber prende a borda e devolve energia na saída da curva.' },
        { item: 'Rigidez', valor: 'Média a firme', porque: 'A prancha firme segura a borda em velocidade.' },
        { item: 'Largura', valor: 'A menor que não deixa a bota arrastar', porque: 'Prancha estreita troca de borda mais rápido.' }
      ],
      pedirNaLoja: ['Prancha direcional de camber, média ou firme', 'Ângulos da base mais para frente', 'Bota de flexão média ou firme']
    },
    pistas: [
      'Pistas preparadas (lisas) azuis e vermelhas; pretas preparadas para quem é forte.',
      'Vá cedo: a pista acabou de ser preparada e tem menos gente.',
      'Neve dura pede borda afiada: peça para a loja conferir.'
    ],
    terreno: { 'pistas-preparadas': 4, 'pistas-azuis': 3, 'muito-avancado': 1 },
    fontes: [1, 3, 5, 6]
  },
  {
    id: 'all-mountain',
    rotulo: 'Um pouco de tudo',
    detalhe: 'Ando na pista, na neve fofa da lateral e em algum trecho fora da pista',
    ski: {
      nome: 'Ski all-mountain',
      caracteristicas: [
        { item: 'Largura no meio', valor: 'Cerca de 85 a 100 mm; 75 a 90 mm se você fica mais na pista', porque: 'Largo o bastante para neve fofa, estreito o bastante para a pista. Muita gente compra ski largo demais.' },
        { item: 'Perfil', valor: 'Rocker na ponta e camber sob o pé', porque: 'A ponta flutua na neve fofa; o camber segura na pista.' },
        { item: 'Rigidez', valor: 'Média', porque: 'Funciona em neve variada sem cansar.' }
      ],
      pedirNaLoja: ['Ski all-mountain, cintura entre 85 e 100 mm', 'Bota de flexão média']
    },
    snowboard: {
      nome: 'Prancha all-mountain',
      caracteristicas: [
        { item: 'Formato', valor: 'Directional twin', porque: 'Anda para os dois lados, mas fica estável para frente.' },
        { item: 'Perfil', valor: 'Híbrido: camber com rocker nas pontas', porque: 'Segura na pista e flutua mais na neve fofa.' },
        { item: 'Rigidez', valor: 'Média', porque: 'Serve para pista, neve fofa e um pouco de snowpark.' }
      ],
      pedirNaLoja: ['Prancha all-mountain, directional twin, flexão média', 'Bota de flexão média']
    },
    pistas: [
      'Montanha com pistas azuis e vermelhas variadas, laterais com neve fofa e alguma área fora de pista controlada.',
      'Em dia de neve nova, procure a borda das pistas e os vales abertos perto dos teleféricos.'
    ],
    terreno: { 'pistas-azuis': 2, 'pistas-preparadas': 2, 'fora-de-pista': 2, arvores: 2, 'muito-avancado': 1, snowpark: 1 },
    fontes: [1, 2, 3, 5, 10, 13]
  },
  {
    id: 'freeride',
    rotulo: 'Neve fofa e fora de pista',
    detalhe: 'Procuro neve nova, terreno íngreme e fora de pista',
    ski: {
      nome: 'Ski de freeride (powder)',
      caracteristicas: [
        { item: 'Comprimento', valor: 'Mais longo: altura da cabeça ou acima', porque: 'Mais ski é mais área para flutuar e mais estabilidade.' },
        { item: 'Largura no meio', valor: '100 a 110 mm; acima de 110 mm para neve funda', porque: 'Ski largo flutua na neve fofa em vez de afundar.' },
        { item: 'Perfil', valor: 'Rocker na ponta e na cauda', porque: 'As pontas sobem na neve funda e o ski vira mais fácil.' }
      ],
      pedirNaLoja: ['Ski de freeride, cintura de 100 mm ou mais', 'Se for sair da pista: guia, ARVA (transceptor), pá e sonda']
    },
    snowboard: {
      nome: 'Prancha de freeride',
      caracteristicas: [
        { item: 'Comprimento', valor: '2 a 3 cm mais longa (prancha curta e larga é a exceção)', porque: 'Mais área flutua melhor na neve funda.' },
        { item: 'Formato', valor: 'Direcional, com base recuada (setback) e nariz mais largo', porque: 'O nariz sobe na neve funda e a perna de trás não cansa.' },
        { item: 'Perfil', valor: 'Rocker no nariz e camber atrás', porque: 'Flutua na frente e segura a borda no terreno duro.' },
        { item: 'Rigidez', valor: 'Média a firme', porque: 'Fica estável em velocidade e em neve variada.' }
      ],
      pedirNaLoja: ['Prancha de freeride (powder), direcional', 'Base recuada para trás', 'Se for sair da pista: guia, ARVA (transceptor), pá e sonda']
    },
    pistas: [
      'Pretas, áreas fora de pista com controle de avalanche e bosques com neve nova.',
      'Fora da área do resort, o risco de avalanche não é controlado: vá só com guia e equipamento.',
      'Neve seca e leve (comum em altitude e no frio) rende mais para esse estilo.'
    ],
    terreno: { 'fora-de-pista': 4, 'neve-seca': 3, ingreme: 3, arvores: 2, 'muito-avancado': 2 },
    fontes: [1, 2, 4, 5, 10, 12, 13]
  },
  {
    id: 'park',
    rotulo: 'Snowpark e manobras',
    detalhe: 'Gosto de salto, corrimão (rail) e manobra',
    ski: {
      nome: 'Ski de freestyle (twin tip)',
      caracteristicas: [
        { item: 'Formato', valor: 'Twin tip: as duas pontas levantadas', porque: 'Deixa descer e aterrissar de costas.' },
        { item: 'Comprimento', valor: 'Rail: um pouco mais curto; salto e half-pipe: como o all-mountain', porque: 'Curto gira fácil; longo fica estável na aterrissagem.' },
        { item: 'Rigidez', valor: 'Macia a média', porque: 'Perdoa a aterrissagem e facilita o butter.' },
        { item: 'Montagem', valor: 'Bota mais perto do centro do ski', porque: 'Equilibra o giro e o andar de costas.' }
      ],
      pedirNaLoja: ['Ski twin tip de freestyle', 'Bota de flexão média']
    },
    snowboard: {
      nome: 'Prancha de freestyle',
      caracteristicas: [
        { item: 'Formato', valor: 'True twin: igual nas duas pontas', porque: 'Anda e aterrissa igual nos dois sentidos.' },
        { item: 'Comprimento', valor: '2 a 3 cm mais curta; salto grande pede o tamanho normal', porque: 'Gira mais rápido e pesa menos no ar.' },
        { item: 'Perfil', valor: 'Rocker, plano ou híbrido', porque: 'Prende menos a borda no rail e na caixa.' },
        { item: 'Rigidez', valor: 'Macia a média', porque: 'Facilita o butter e perdoa a aterrissagem.' }
      ],
      pedirNaLoja: ['Prancha true twin de freestyle, macia', 'Base centralizada, ângulos “de pato” (duck)']
    },
    pistas: [
      'Snowpark com área por tamanho: comece nas linhas pequenas.',
      'Olhe o salto antes de pular, pare fora da aterrissagem e respeite a fila.'
    ],
    terreno: { snowpark: 5, 'pistas-azuis': 1 },
    fontes: [8, 10, 12, 14]
  },
  {
    id: 'bumps',
    rotulo: 'Curvas curtas, freadas e mogul',
    detalhe: 'Faço curva fechada, freio com força e gosto de mogul',
    ski: {
      nome: 'Ski ágil para curva curta',
      caracteristicas: [
        { item: 'Comprimento', valor: 'Alguns centímetros mais curto que o seu all-mountain', porque: 'Gira rápido entre os montinhos e nas curvas fechadas.' },
        { item: 'Largura no meio', valor: 'Cerca de 70 a 90 mm', porque: 'Troca de borda rápido e cabe entre os moguls.' },
        { item: 'Raio de curva', valor: 'Curto (cerca de 12 a 15 m)', porque: 'O ski fecha a curva com menos esforço.' },
        { item: 'Rigidez', valor: 'Ponta macia, meio firme', porque: 'A ponta absorve o montinho; o meio segura a freada.' }
      ],
      pedirNaLoja: ['Ski de pista com raio curto ou ski de mogul', 'Bota firme no calcanhar: na freada forte, o pé não pode dançar']
    },
    snowboard: null,
    pistas: [
      'Pistas não preparadas e de mogul, em geral vermelhas e pretas.',
      'Comece em moguls numa azul ou vermelha. À tarde, a neve amolece e o mogul fica mais fácil.'
    ],
    terreno: { mogul: 4, 'muito-avancado': 2, ingreme: 2, 'pistas-azuis': 1 },
    fontes: [3, 4, 9]
  }
];

/** Bota: a peça mais importante. Vale para ski e snowboard. */
export const dicasBota = [
  'A bota importa mais que o ski ou a prancha. Se for comprar algo, compre a bota primeiro e alugue o resto.',
  'Prove com uma só meia fina de ski, sem algodão. Bota grande “porque é confortável” não tem conserto.',
  'Ela deve ficar firme no calcanhar e deixar mexer um pouco os dedos.',
  'Bota de ski macia é mais confortável para aprender; bota firme passa mais força para o ski.'
];

/** Ski ou snowboard para quem nunca foi. */
export const skiOuSnowboard = {
  ski: 'Os primeiros dias costumam ser mais fáceis: as pernas ficam separadas, a “pizza” controla a velocidade e andar no plano é simples. Ficar muito bom leva mais tempo.',
  snowboard: 'Os primeiros dias têm mais queda; as lesões mais comuns são de punho e ombro. Quando você domina as bordas de dedo e de calcanhar, a evolução costuma ser rápida.',
  conselho: 'Na dúvida, faça 2 ou 3 dias de aula no esporte que mais chama você. Alugue antes de comprar.'
};

export const cores = {
  sulEuropa: 'No Chile e na Argentina: verde (fácil), azul (intermediária), vermelha (difícil) e preta (expert). Vários mapas também usam formas: círculo, quadrado, triângulo e losango.',
  eua: 'Nos EUA: círculo verde, quadrado azul, losango preto e losango duplo.',
  relativo: 'A cor compara pistas da mesma montanha. Uma azul num resort pode ser mais difícil que a azul de outro.'
};

export interface Fonte {
  titulo: string;
  url: string;
}

export const FONTES: Fonte[] = [
  { titulo: 'evo — How to Choose Skis & Ski Size Chart', url: 'https://www.evo.com/blogs/guides/how-to-choose-skis-size-chart' },
  { titulo: 'Christy Sports — Ski Buying Guide', url: 'https://www.christysports.com/learn/buying-guides/buying-guide-skis.html' },
  { titulo: 'OnTheSnow — Tips Up: Expert Advice on Buying Skis', url: 'https://www.onthesnow.com/news/tips-up-expert-advice-on-how-to-buy-skis/' },
  { titulo: 'OnTheSnow — Men’s vs. Women’s Skis (Kim Reichhelm)', url: 'https://www.onthesnow.com/news/mens-vs-womens-skis-why-yours-are-probably-too-short/' },
  { titulo: 'evo — Rocker e camber no ski e no snowboard', url: 'https://www.evo.com/blogs/guides/what-is-ski-snowboard-rocker-and-why-does-it-matter' },
  { titulo: 'K2 — How to Choose a Ski', url: 'https://k2snow.com/en-us/support/how-to-choose-a-ski' },
  { titulo: 'evo — How to Choose Ski Boots', url: 'https://www.evo.com/blogs/guides/how-to-choose-and-size-ski-boots' },
  { titulo: 'evo — Park Ski Setup', url: 'https://www.evo.com/blogs/guides/how-to-choose-freestyle-skis' },
  { titulo: 'SKI Magazine — Best Skis for Moguls', url: 'https://www.skimag.com/gear/ski-reviews/frontside-skis/best-skis-for-moguls/' },
  { titulo: 'evo — How to Choose a Snowboard & Size Chart', url: 'https://www.evo.com/blogs/guides/how-to-choose-a-snowboard-and-size-chart' },
  { titulo: 'Burton — Snowboard Buying Guide', url: 'https://www.burton.com/en-us/blogs/the-burton-blog/snowboard-buying-guide' },
  { titulo: 'Jones — Snowboard Size Guide', url: 'https://www.jonessnowboards.com/pages/a-guide-on-how-to-find-your-perfect-snowboard-size' },
  { titulo: 'Jones — Shapes, Profiles, Width and Flex', url: 'https://www.jonessnowboards.com/pages/how-to-understand-snowboard-width-waist-width-flex-and-sidecut' },
  { titulo: 'evo — Park Snowboard Setup', url: 'https://www.evo.com/blogs/guides/how-to-choose-freestyle-snowboard' },
  { titulo: 'Christy Sports — First-Time Rental Guide', url: 'https://www.christysports.com/blog/first-time-renter-advice.html' },
  { titulo: 'Snow.com — Skiing vs. Snowboarding', url: 'https://www.snow.com/articles/skiing-vs-snowboarding' },
  { titulo: 'Snowskool — Skiing or snowboarding for beginners', url: 'https://www.snowskool.com/blog/skiing-or-snowboarding-for-beginners-which-is-easier-to-learn' }
];
