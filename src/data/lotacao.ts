// Calendário de lotação: períodos em que as montanhas e os voos costumam encher.
// Datas APROXIMADAS: as férias escolares mudam por estado (Brasil), região (Chile) e província (Argentina).
// O app sempre mostra "aproximado" e manda conferir o calendário oficial.

export interface PeriodoLotado {
  nome: string;
  /** AAAA-MM-DD */
  inicio: string;
  fim: string;
  /** Hemisfério dos destinos afetados. 'todos' = afeta voos e preços em geral. */
  afeta: 'sul' | 'norte' | 'todos';
  dica: string;
}

const z = (n: number) => String(n).padStart(2, '0');
const data = (a: number, m: number, d: number) => `${a}-${z(m)}-${z(d)}`;

/** Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher). */
function pascoa(ano: number): Date {
  const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(ano, mes - 1, dia));
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const somar = (d: Date, dias: number) => new Date(d.getTime() + dias * 86400000);

/** N-ésima segunda-feira de um mês (EUA: MLK e Presidents' Day). */
function segunda(ano: number, mes: number, n: number): Date {
  const d = new Date(Date.UTC(ano, mes - 1, 1));
  const primeira = (8 - d.getUTCDay()) % 7; // dias até a 1ª segunda
  return new Date(Date.UTC(ano, mes - 1, 1 + primeira + (n - 1) * 7));
}

export function periodosDoAno(ano: number): PeriodoLotado[] {
  const carnavalTerca = somar(pascoa(ano), -47);
  const mlk = segunda(ano, 1, 3);
  const presidentes = segunda(ano, 2, 3);
  return [
    {
      nome: 'Férias de fim de ano nos EUA',
      inicio: data(ano - 1, 12, 20),
      fim: data(ano, 1, 4),
      afeta: 'norte',
      dica: 'É a semana mais cheia e mais cara nos resorts dos EUA. Reserve hotel e passe com meses de antecedência.'
    },
    {
      nome: 'Feriado de Martin Luther King nos EUA',
      inicio: iso(somar(mlk, -2)),
      fim: iso(mlk),
      afeta: 'norte',
      dica: 'Fim de semana prolongado: mais fila nos resorts perto das cidades grandes.'
    },
    {
      nome: "Feriado de Presidents' Day nos EUA",
      inicio: iso(somar(presidentes, -2)),
      fim: iso(somar(presidentes, 5)),
      afeta: 'norte',
      dica: 'Semana de férias em muitas escolas dos EUA. Os resorts enchem.'
    },
    {
      nome: 'Carnaval no Brasil',
      inicio: iso(somar(carnavalTerca, -4)),
      fim: iso(somar(carnavalTerca, 1)),
      // Em fevereiro só há temporada no hemisfério norte: o Carnaval pesa nos voos para os EUA.
      afeta: 'norte',
      dica: 'Os voos que saem do Brasil ficam mais caros. Compre a passagem cedo.'
    },
    {
      nome: 'Férias de inverno no Chile',
      inicio: data(ano, 6, 22),
      fim: data(ano, 7, 5),
      afeta: 'sul',
      dica: 'Os resorts perto de Santiago enchem, principalmente no fim de semana.'
    },
    {
      nome: 'Férias escolares de julho no Brasil',
      inicio: data(ano, 7, 1),
      fim: data(ano, 7, 31),
      afeta: 'sul',
      dica: 'Época de mais brasileiro nos Andes. Voos e hotéis ficam mais caros. Reserve cedo.'
    },
    {
      nome: 'Férias de inverno na Argentina',
      inicio: data(ano, 7, 13),
      fim: data(ano, 7, 31),
      afeta: 'sul',
      dica: 'Bariloche e os resorts da Argentina enchem. Espere fila e preço mais alto.'
    },
    {
      nome: 'Férias de fim de ano nos EUA',
      inicio: data(ano, 12, 20),
      fim: data(ano + 1, 1, 4),
      afeta: 'norte',
      dica: 'É a semana mais cheia e mais cara nos resorts dos EUA. Reserve hotel e passe com meses de antecedência.'
    }
  ];
}

/** Períodos lotados que cruzam as datas da viagem, para o hemisfério do destino (ou geral). */
export function lotacaoNasDatas(ida: string, volta: string, hemisferio: 'sul' | 'norte' | null): PeriodoLotado[] {
  if (!ida || !volta) return [];
  const anos = new Set([Number(ida.slice(0, 4)), Number(volta.slice(0, 4))]);
  const todos = [...anos].flatMap(periodosDoAno);
  const vistos = new Set<string>();
  return todos.filter((p) => {
    const cruza = p.inicio <= volta && p.fim >= ida;
    const serve = p.afeta === 'todos' || hemisferio === null || p.afeta === hemisferio;
    const chave = p.nome + p.inicio;
    if (!cruza || !serve || vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}

/** Próximos períodos lotados para um hemisfério (a partir de hoje). */
export function proximosPeriodos(hemisferio: 'sul' | 'norte', quantos = 3): PeriodoLotado[] {
  const hoje = new Date().toISOString().slice(0, 10);
  const ano = Number(hoje.slice(0, 4));
  return [ano, ano + 1]
    .flatMap(periodosDoAno)
    .filter((p) => p.fim >= hoje && (p.afeta === hemisferio || p.afeta === 'todos'))
    .sort((a, b) => a.inicio.localeCompare(b.inicio))
    .filter((p, i, l) => l.findIndex((x) => x.nome === p.nome && x.inicio === p.inicio) === i)
    .slice(0, quantos);
}

export const hemisferioDe = (lat: number): 'sul' | 'norte' => (lat > 0 ? 'norte' : 'sul');
