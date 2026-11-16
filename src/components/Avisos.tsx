import { useEffect, useState } from 'react';
import { buscarDestino, type Destino } from '../data/destinos';
import { hemisferioDe, lotacaoNasDatas } from '../data/lotacao';
import { buscarClima } from '../lib/clima';
import { medir } from '../lib/medir';
import { perfilViajante, viagens, type Viagem } from '../lib/storage';
import { rota } from '../lib/rota';
import { Icone, type NomeIcone } from './Icone';

interface Aviso {
  chave: string;
  tipo: 'neve' | 'passe' | 'documento' | 'lotacao';
  icone: NomeIcone;
  texto: string;
  href: string;
  urgente?: boolean;
}

const hoje = () => new Date().toISOString().slice(0, 10);
const diasAte = (iso: string) => Math.round((new Date(`${iso}T12:00:00`).getTime() - new Date(`${hoje()}T12:00:00`).getTime()) / 86400000);
const destinosDe = (v: Viagem) => v.destinos.map(buscarDestino).filter((d): d is Destino => d !== undefined);

/** Avisos que não dependem da internet: passe, documentos e lotação. */
function avisosFixos(): Aviso[] {
  const p = perfilViajante.ler();
  const lista: Aviso[] = [];
  for (const v of viagens.listar()) {
    if (!v.ida || !v.volta || v.volta < hoje()) continue;
    const ds = destinosDe(v);
    if (!ds.length) continue;
    const faltam = diasAte(v.ida);
    const href = rota.viagem(v.id);

    if (ds.some((d) => d.pais === 'Estados Unidos') && (p.vistoEua === false || p.passaporte === false)) {
      lista.push({
        chave: `doc-${v.id}`,
        tipo: 'documento',
        icone: 'escudo',
        urgente: true,
        texto: `“${v.nome}” vai para os EUA: você precisa de ${p.passaporte === false ? 'passaporte e ' : ''}visto americano. O processo pode levar meses.`,
        href
      });
    }

    if (faltam >= 7 && faltam <= 45) {
      const eua = ds.find((d) => d.pais === 'Estados Unidos');
      lista.push({
        chave: `passe-${v.id}`,
        tipo: 'passe',
        icone: 'ticket',
        texto:
          eua && faltam >= 28
            ? `Faltam ${faltam} dias para “${v.nome}”. Compre o passe de ${eua.nome} agora: com 4 semanas ou mais de antecedência, o preço costuma ser bem menor.`
            : `Faltam ${faltam} dias para “${v.nome}”. Compre o passe on-line: em muitos resorts, o passe antecipado sai mais barato que na bilheteria.`,
        href
      });
    }

    const lotados = lotacaoNasDatas(v.ida, v.volta, hemisferioDe(ds[0].lat));
    if (lotados.length && faltam > 0) {
      lista.push({
        chave: `lot-${v.id}`,
        tipo: 'lotacao',
        icone: 'calendario',
        texto: `“${v.nome}” cai numa época cheia (datas aproximadas): ${lotados.map((l) => l.nome).join(' e ')}. ${lotados[0].dica}`,
        href
      });
    }
  }
  return lista;
}

/** "Avisos para você" no Início. Sem roteiro com data, a seção não aparece. */
export function Avisos() {
  const [lista, setLista] = useState<Aviso[]>(avisosFixos);

  // Previsão de neve durante a viagem (a previsão cobre os próximos 5 dias).
  useEffect(() => {
    let vivo = true;
    for (const v of viagens.listar()) {
      if (!v.ida || !v.volta) continue;
      const faltam = diasAte(v.ida);
      if (faltam > 4 || v.volta < hoje()) continue;
      for (const d of destinosDe(v).slice(0, 3)) {
        buscarClima(d)
          .then((c) => {
            const cm = c.previsao.filter((x) => x.data >= v.ida && x.data <= v.volta).reduce((s, x) => s + x.neveCm, 0);
            if (!vivo || cm < 5 || c.exemplo) return;
            setLista((l) =>
              l.some((a) => a.chave === `neve-${v.id}-${d.id}`)
                ? l
                : [{ chave: `neve-${v.id}-${d.id}`, tipo: 'neve', icone: 'floco', texto: `Previsão de ${cm} cm de neve em ${d.nome} durante a sua viagem.`, href: rota.destino(d.id) }, ...l]
            );
          })
          .catch(() => undefined);
      }
    }
    return () => {
      vivo = false;
    };
  }, []);

  if (!lista.length) return null;
  const ordem = { documento: 0, neve: 1, passe: 2, lotacao: 3 };
  return (
    <section className="avisos" aria-labelledby="titulo-avisos">
      <div className="secao-titulo">
        <h2 id="titulo-avisos">Avisos para você</h2>
      </div>
      {[...lista]
        .sort((a, b) => ordem[a.tipo] - ordem[b.tipo])
        .slice(0, 4)
        .map((a) => (
          <a key={a.chave} href={a.href} className={`aviso-item ${a.tipo} ${a.urgente ? 'urgente' : ''}`} onClick={() => medir('Aviso tocado', { tipo: a.tipo })}>
            <Icone nome={a.icone} tamanho={18} />
            <span>{a.texto}</span>
          </a>
        ))}
    </section>
  );
}
