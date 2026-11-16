// "Combina com você": nota de 0 a 100 entre o perfil do viajante e um destino, com os motivos.
// Regra: só motivos que vêm de dado do destino. Nada de promessa que o app não sabe cumprir.
import type { Destino } from '../data/destinos';
import type { PerfilViajante } from './storage';

export interface Combinacao {
  nota: number;
  /** Motivos a favor, do mais forte para o mais fraco. */
  aFavor: string[];
  /** Pontos de atenção (ex.: precisa de visto). */
  atencao: string[];
}

const nomeMes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** Meses de temporada do destino (aproximado, pelo hemisfério e pelo texto da temporada). */
export function mesesDeTemporada(d: Destino): number[] {
  const t = d.temporada.toLowerCase();
  if (d.lat > 0) {
    const m = [12, 1, 2, 3];
    if (t.includes('novembro')) m.push(11);
    if (t.includes('abril') || t.includes('maio')) m.push(4);
    if (t.includes('maio')) m.push(5);
    return m;
  }
  const m = [7, 8, 9];
  if (t.includes('junho')) m.push(6);
  if (t.includes('outubro')) m.push(10);
  return m;
}

const texto = (d: Destino) => `${d.resumo} ${d.destaques.join(' ')} ${d.nota}`.toLowerCase();

export function combinar(d: Destino, p: PerfilViajante): Combinacao {
  let pontos = 0;
  let maximo = 0;
  const aFavor: { peso: number; t: string }[] = [];
  const atencao: string[] = [];
  let teto = 100;

  // Nível (peso 30)
  if (p.nivel) {
    maximo += 30;
    const novato = p.nivel === 'nunca' || p.nivel === 'iniciante';
    const forte = p.nivel === 'avancado' || p.nivel === 'expert';
    const areaIniciante = (d.pistas?.iniciante ?? 0) >= 25;
    let v = 15;
    if (novato) v = d.nivel === 'iniciante' ? 30 : d.nivel === 'intermediario' ? (areaIniciante ? 22 : 16) : areaIniciante ? 12 : 4;
    else if (forte) v = d.nivel === 'avancado' ? 30 : d.nivel === 'intermediario' ? 22 : 8;
    else v = d.nivel === 'intermediario' ? 30 : d.nivel === 'iniciante' ? 20 : 18;
    pontos += v;
    if (v >= 22) aFavor.push({ peso: v, t: novato ? 'Bom para quem está começando' : forte ? 'Tem terreno para o seu nível' : 'Combina com o seu nível' });
    if (novato && d.nivel === 'avancado') atencao.push('Montanha difícil para quem está começando');
  }

  // Época (peso 25)
  if (p.meses?.length) {
    maximo += 25;
    const temporada = mesesDeTemporada(d);
    const bate = p.meses.filter((m) => temporada.includes(m));
    if (bate.length) {
      pontos += 25;
      aFavor.push({ peso: 25, t: `Temporada de neve em ${nomeMes[bate[0] - 1]}` });
    } else atencao.push('Fora da temporada nos meses que você escolheu');
  }

  // Documentos (peso 10)
  if (d.pais === 'Estados Unidos') {
    if (p.vistoEua === false || p.passaporte === false) {
      teto = 30;
      atencao.push(p.passaporte === false ? 'Precisa de passaporte e de visto americano' : 'Precisa de visto americano');
    } else if (p.vistoEua === true) {
      maximo += 10;
      pontos += 10;
    }
  } else if (p.passaporte !== undefined || p.vistoEua !== undefined) {
    maximo += 10;
    pontos += 10;
    aFavor.push({ peso: 10, t: 'Brasileiro entra com RG' });
  }

  // Esporte
  if (/snowboard (é )?proibido/i.test(texto(d)) && (p.esporte === 'snowboard' || p.esporte === 'ambos')) {
    teto = Math.min(teto, 10);
    atencao.push('Snowboard é proibido aqui');
  }

  // Com quem viaja (peso 10)
  if (p.grupo === 'familia') {
    maximo += 10;
    if (d.nivel === 'iniciante' || (d.pistas?.iniciante ?? 0) >= 30 || /fam[ií]lia/.test(texto(d))) {
      pontos += 10;
      aFavor.push({ peso: 10, t: 'Bom para família' });
    }
  }

  // Estilo (peso 8)
  if (p.estilo === 'luxo' || p.estilo === 'economico') {
    maximo += 8;
    const t = texto(d) + ' ' + d.hospedagem.resumo.toLowerCase();
    if (p.estilo === 'luxo' && /luxo|alto padrão|ski in\/ski out|hotel na base|hotéis do (próprio )?resort|serviço/.test(t)) {
      pontos += 8;
      aFavor.push({ peso: 8, t: 'Tem opção de hotel de alto padrão' });
    }
    if (p.estilo === 'economico' && ((d.passe.valor != null && d.passe.valor <= 75) || /barat|preço mais baixo|bom custo/.test(t))) {
      pontos += 8;
      aFavor.push({ peso: 8, t: 'Opção mais em conta' });
    }
  }

  // Passe de temporada (peso 15)
  if (p.passe === 'epic' || p.passe === 'ikon') {
    const rede = p.passe === 'epic' ? 'Epic Pass' : 'Ikon Pass';
    if (d.rede === rede) {
      maximo += 15;
      pontos += 15;
      aFavor.push({ peso: 15, t: `Seu ${rede} vale aqui` });
    }
  }

  // Acesso a partir do Brasil (peso 10): só fato geral, sem depender da cidade de saída.
  maximo += 10;
  if (d.aeroporto === 'SCL') {
    pontos += 10;
    aFavor.push({ peso: 9, t: 'Perto de Santiago, com voo direto de várias capitais do Brasil' });
  } else if (d.pais !== 'Estados Unidos') pontos += 6;
  else pontos += 4;

  // Destino com conteúdo revisado pela equipe (desempate, sem motivo na tela)
  maximo += 5;
  if (d.fonteDados !== 'openskimap' || d.revisadoEm) pontos += 5;

  const nota = maximo ? Math.min(teto, Math.round((pontos / maximo) * 100)) : 0;
  return { nota, aFavor: aFavor.sort((a, b) => b.peso - a.peso).map((x) => x.t), atencao };
}

/** Destinos que mais combinam com o perfil. */
export function paraVoce(lista: Destino[], p: PerfilViajante, quantos = 4): { d: Destino; c: Combinacao }[] {
  return lista
    .map((d) => ({ d, c: combinar(d, p) }))
    .sort((a, b) => b.c.nota - a.c.nota || Number(!!b.d.revisadoEm || b.d.fonteDados !== 'openskimap') - Number(!!a.d.revisadoEm || a.d.fonteDados !== 'openskimap'))
    .slice(0, quantos);
}
