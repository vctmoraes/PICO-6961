// Curadoria dos destinos dos EUA mais procurados por brasileiros.
// Altitude, pistas, teleféricos e site continuam vindo do OpenSkiMap (eua.json). Aqui fica só o texto da equipe.
// Regra: só fato conferido. Preço de passe nos EUA é dinâmico: use faixa com fonte e data, nunca valor fixo inventado.
import type { Destino } from './destinos';

export type Curadoria = Partial<
  Pick<Destino, 'resumo' | 'destaques' | 'comoChegar' | 'hospedagem' | 'dicas' | 'nota' | 'temporada' | 'regiao' | 'cidadeBase' | 'rede' | 'passeInfo'>
> & {
  /** Data da revisão do texto (AAAA-MM-DD). */
  revisadoEm: string;
};

const PRECO_DINAMICO = 'Preço dinâmico: muda com a data e com a antecedência da compra. Comprado com 4 semanas ou mais de antecedência, o passe costuma sair bem mais barato que na bilheteria.';

export const curadoriaEua: Record<string, Curadoria> = {
  'vail-co': {
    revisadoEm: '2026-11-16',
    nota: 'Back Bowls e vila alpina',
    resumo: 'Um dos maiores resorts dos EUA, nas Montanhas Rochosas do Colorado. A vila tem estilo alpino, com lojas e restaurantes no pé da pista.',
    destaques: ['Back Bowls: área enorme de neve aberta', 'Vila de pedestres no pé da pista', 'Ônibus grátis na cidade'],
    comoChegar:
      'Voo até Denver (DEN). Depois, carro ou transfer pela estrada I-70 (cerca de 2h30, mais no fim de semana). Na temporada, há voo para Eagle/Vail (EGE), a cerca de 45 min.',
    hospedagem: {
      resumo: 'Hotéis em Vail Village e Lionshead, no pé da pista. Opções mais baratas em Avon e Edwards, com ônibus para a montanha.',
      buscaReserva: 'Vail, Colorado, Estados Unidos'
    },
    dicas: [
      'Compre o passe com pelo menos 4 semanas de antecedência. Na bilheteria, o preço é muito mais alto.',
      'Evite a I-70 no sábado de manhã e no domingo à tarde. O trânsito fica muito lento.',
      'Use o ônibus grátis entre Vail Village, Lionshead e West Vail.',
      'Beba muita água. A vila fica a quase 2.500 m de altitude.'
    ],
    rede: 'Epic Pass',
    passeInfo: `${PRECO_DINAMICO} Na temporada 2025/26, o dia na bilheteria chegou a US$ 356 nos dias de pico.`
  },
  'breckenridge-ski-resort-co': {
    revisadoEm: '2026-11-16',
    nota: 'Cidade histórica a 2.900 m',
    regiao: 'Breckenridge, Colorado',
    resumo:
      'Resort ao lado de uma antiga cidade mineira, com rua principal histórica. A cidade fica a cerca de 2.900 m de altitude, uma das mais altas dos EUA.',
    destaques: ['5 picos com pistas para todos os níveis', 'Cidade histórica com muitos restaurantes', 'Imperial Express: um dos teleféricos mais altos da América do Norte'],
    comoChegar: 'Voo até Denver (DEN). Depois, carro ou transfer pela estrada I-70 (cerca de 2h).',
    hospedagem: {
      resumo: 'Hotéis e condomínios na cidade. Muitos ficam a pé ou a uma gôndola da montanha.',
      buscaReserva: 'Breckenridge, Colorado, Estados Unidos'
    },
    dicas: [
      'A altitude é alta. Descanse no primeiro dia e beba muita água.',
      'Use a gôndola grátis BreckConnect entre a cidade e a base.',
      'Compre o passe com antecedência. Na bilheteria, o preço é bem mais alto.'
    ],
    rede: 'Epic Pass',
    passeInfo: PRECO_DINAMICO
  },
  'aspen-snowmass-co': {
    revisadoEm: '2026-11-16',
    nota: '4 montanhas, 1 passe',
    resumo:
      'Snowmass é a maior das 4 montanhas de Aspen Snowmass. O mesmo passe vale em Aspen Mountain, Aspen Highlands e Buttermilk. Destino muito procurado por brasileiros.',
    destaques: ['4 montanhas com o mesmo passe', 'Snowmass Village com ski in/ski out', 'Ônibus grátis entre Aspen e Snowmass'],
    comoChegar:
      'Voo até Aspen (ASE), a cerca de 15 min de Snowmass. O voo para Aspen é caro e pode atrasar com tempo ruim. Outras opções: voo até Eagle/Vail (EGE) e cerca de 1h30 de carro, ou voo até Denver (DEN) e cerca de 4h.',
    hospedagem: {
      resumo: 'Hotéis e condomínios em Snowmass Village, no pé da pista. A cidade de Aspen tem mais restaurantes e vida noturna.',
      buscaReserva: 'Snowmass Village, Colorado, Estados Unidos'
    },
    dicas: [
      'Escolha a montanha pelo nível: Buttermilk para iniciante, Snowmass para todos, Aspen Mountain e Highlands para quem já esquia bem.',
      'Use o ônibus grátis entre Aspen e Snowmass.',
      'Reserve hospedagem cedo para o Natal, o Ano-Novo e o Carnaval.'
    ],
    rede: 'Ikon Pass',
    passeInfo: `${PRECO_DINAMICO} Na semana de fim de ano de 2025/26, o dia de pico chegou a US$ 279. O Ikon Pass dá um número limitado de dias aqui.`
  },
  'aspen-mountain-co': {
    revisadoEm: '2026-11-16',
    nota: 'Gôndola no centro de Aspen',
    resumo: 'A montanha no centro da cidade de Aspen. Não tem pista para iniciante: só pista intermediária e avançada.',
    destaques: ['Gôndola sai do centro de Aspen', 'Mesmo passe das outras 3 montanhas de Aspen Snowmass', 'Sem pista para iniciante'],
    comoChegar: 'Voo até Aspen (ASE), a cerca de 10 min do centro. Outras opções: Eagle/Vail (EGE), cerca de 1h30, ou Denver (DEN), cerca de 4h.',
    hospedagem: { resumo: 'Hotéis no centro de Aspen, perto da gôndola.', buscaReserva: 'Aspen, Colorado, Estados Unidos' },
    dicas: ['Se você é iniciante, vá para Buttermilk ou Snowmass.', 'Reserve hospedagem cedo para o Natal, o Ano-Novo e o Carnaval.'],
    rede: 'Ikon Pass',
    passeInfo: `${PRECO_DINAMICO} O Ikon Pass dá um número limitado de dias aqui.`
  },
  'park-city-mountain-resort-ut': {
    revisadoEm: '2026-11-16',
    nota: 'Enorme e perto de Salt Lake City',
    resumo:
      'Um dos maiores resorts dos EUA em área esquiável. Fica ao lado da cidade de Park City, a cerca de 45 min do aeroporto de Salt Lake City.',
    destaques: ['Área enorme, ligada à base de Canyons', 'Rua principal histórica com restaurantes', 'Perto do aeroporto'],
    comoChegar: 'Voo até Salt Lake City (SLC). Depois, carro ou transfer (cerca de 45 min).',
    hospedagem: {
      resumo: 'Hotéis e condomínios na cidade de Park City e em Canyons Village, na base.',
      buscaReserva: 'Park City, Utah, Estados Unidos'
    },
    dicas: ['Use o ônibus grátis da cidade de Park City.', 'Compre o passe com antecedência.', 'A neve de Utah costuma ser seca e leve.'],
    rede: 'Epic Pass',
    passeInfo: `${PRECO_DINAMICO} Na temporada 2025/26, o dia na bilheteria chegou a US$ 351 nos dias de pico.`
  },
  'deer-valley-resort-ut': {
    revisadoEm: '2026-11-16',
    nota: 'Só ski, serviço de luxo',
    resumo: 'Resort famoso pelo serviço e pela pista bem preparada. Só aceita ski: o snowboard é proibido. Fica ao lado de Park City.',
    destaques: ['Só ski (snowboard proibido)', 'Pistas bem preparadas', 'Sede de provas dos Jogos Olímpicos de Inverno de 2002'],
    comoChegar: 'Voo até Salt Lake City (SLC). Depois, carro ou transfer (cerca de 50 min).',
    hospedagem: { resumo: 'Hotéis de alto padrão na montanha e opções na cidade de Park City.', buscaReserva: 'Park City, Utah, Estados Unidos' },
    dicas: ['Se o grupo tem snowboarder, escolha Park City: em Deer Valley, o snowboard é proibido.', 'Reserve aula e restaurante com antecedência.'],
    rede: 'Ikon Pass',
    passeInfo: PRECO_DINAMICO
  },
  'jackson-hole-mountain-resort-wy': {
    revisadoEm: '2026-11-16',
    nota: 'Íngreme e lendária',
    resumo: 'Montanha íngreme e famosa entre esquiadores avançados. Fica em Teton Village, perto do Parque Nacional Grand Teton.',
    destaques: ['Bondinho (Aerial Tram) até o topo', "Corbet's Couloir, uma das descidas mais famosas dos EUA", 'Muito terreno para avançado'],
    comoChegar: 'Voo até Jackson Hole (JAC), a cerca de 30 min de Teton Village. Outra opção: voo até Salt Lake City (SLC) e cerca de 5h de carro.',
    hospedagem: {
      resumo: 'Hotéis em Teton Village, no pé da pista, ou na cidade de Jackson, a cerca de 20 km, com ônibus.',
      buscaReserva: 'Teton Village, Wyoming, Estados Unidos'
    },
    dicas: [
      'Se você é iniciante, faça aula: grande parte da montanha é difícil.',
      'Visite a cidade de Jackson e o Parque Nacional Grand Teton.',
      'Leve roupa para frio forte.'
    ],
    rede: 'Ikon Pass',
    passeInfo: `${PRECO_DINAMICO} Na temporada 2025/26, o dia variou de cerca de US$ 110 a US$ 255, conforme o dia e o mês.`
  },
  'mammoth-mountain-ca': {
    revisadoEm: '2026-11-16',
    nota: 'Temporada longa e muito sol',
    temporada: 'Em geral, de novembro a maio. Em ano de muita neve, vai até junho ou julho',
    resumo: 'Resort num antigo vulcão da Califórnia, com uma das temporadas mais longas dos EUA. Tem muito sol e muita neve.',
    destaques: ['Temporada longa', 'Muitos dias de sol', 'Cidade de Mammoth Lakes com restaurantes'],
    comoChegar:
      'Voo até Los Angeles (LAX) e cerca de 5h de carro, ou voo até Reno (RNO) e cerca de 3h. Na temporada, há voo para Bishop (BIH), a cerca de 1h.',
    hospedagem: { resumo: 'Hotéis e condomínios em Mammoth Lakes.', buscaReserva: 'Mammoth Lakes, Califórnia, Estados Unidos' },
    dicas: ['Confira a estrada antes de sair: com nevasca, pode ser preciso corrente.', 'A altitude passa de 2.400 m. Beba muita água.'],
    rede: 'Ikon Pass',
    passeInfo: PRECO_DINAMICO
  },
  'palisades-tahoe-olympic-valley-ca': {
    revisadoEm: '2026-11-16',
    nota: 'Sede olímpica no lago Tahoe',
    regiao: 'Olympic Valley, Califórnia',
    cidadeBase: 'Olympic Valley',
    resumo:
      'Sede dos Jogos Olímpicos de Inverno de 1960, perto do lago Tahoe. Até 2021, o resort se chamava Squaw Valley. Uma gôndola liga Olympic Valley à base de Alpine Meadows.',
    destaques: ['Sede dos Jogos de 1960', 'Gôndola entre as 2 bases', 'Perto do lago Tahoe'],
    comoChegar: 'Voo até Reno (RNO). Depois, carro ou transfer (cerca de 1h).',
    hospedagem: { resumo: 'Hotéis e condomínios em Olympic Valley e em Truckee.', buscaReserva: 'Olympic Valley, Califórnia, Estados Unidos' },
    dicas: ['Confira a estrada antes de sair: com nevasca, pode ser preciso corrente.', 'Combine com um dia no lago Tahoe.'],
    rede: 'Ikon Pass',
    passeInfo: PRECO_DINAMICO
  },
  'heavenly-mountain-resort-nv': {
    revisadoEm: '2026-11-16',
    nota: 'Vista do lago Tahoe',
    regiao: 'South Lake Tahoe, Califórnia e Nevada',
    cidadeBase: 'South Lake Tahoe',
    resumo: 'Resort na divisa entre a Califórnia e Nevada, com vista para o lago Tahoe. A gôndola sai do centro de South Lake Tahoe.',
    destaques: ['Vista do lago Tahoe', 'Pistas em 2 estados', 'Cassinos do lado de Nevada'],
    comoChegar: 'Voo até Reno (RNO). Depois, carro ou transfer até South Lake Tahoe (cerca de 1h15).',
    hospedagem: { resumo: 'Hotéis em South Lake Tahoe e em Stateline, perto da gôndola.', buscaReserva: 'South Lake Tahoe, Califórnia, Estados Unidos' },
    dicas: ['Fique perto da gôndola: você vai a pé até a montanha.', 'Compre o passe com antecedência.'],
    rede: 'Epic Pass',
    passeInfo: PRECO_DINAMICO
  },
  'big-sky-resort-mt': {
    revisadoEm: '2026-11-16',
    nota: 'Enorme e com pouca fila',
    resumo: 'Um dos maiores resorts dos EUA em área, em Montana. Tem pouca fila e um bondinho até o topo do Lone Peak.',
    destaques: ['Área enorme e pouca fila', 'Bondinho até o topo do Lone Peak', 'Perto do Parque Nacional de Yellowstone'],
    comoChegar: 'Voo até Bozeman (BZN). Depois, carro ou transfer (cerca de 1h).',
    hospedagem: { resumo: 'Hotéis e condomínios na base (Mountain Village).', buscaReserva: 'Big Sky, Montana, Estados Unidos' },
    dicas: ['Leve roupa para frio forte: Montana é muito fria no inverno.', 'O topo do Lone Peak é só para avançado.'],
    rede: 'Ikon Pass',
    passeInfo: PRECO_DINAMICO
  }
};

/** Ids dos destinos dos EUA em destaque no Início. */
export const destaquesEua = ['aspen-snowmass-co', 'vail-co', 'park-city-mountain-resort-ut', 'jackson-hole-mountain-resort-wy'];
