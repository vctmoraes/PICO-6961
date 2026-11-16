import { useEffect, useState } from 'react';
import { buscarDestino, type Destino } from '../data/destinos';
import { buscarClima, resumoCondicao, type Clima } from '../lib/clima';
import { salvos, viagens } from '../lib/storage';
import { rota } from '../lib/rota';
import { Icone } from './Icone';

const MAX = 6;

/** "Neve nos seus destinos": condição dos destinos salvos e dos destinos dos roteiros, no Início. */
export function NeveNosDestinos() {
  const [lista] = useState<Destino[]>(() => {
    const ids = [...new Set([...salvos.listar(), ...viagens.listar().flatMap((v) => v.destinos)])];
    return ids.map(buscarDestino).filter((d): d is Destino => d !== undefined).slice(0, MAX);
  });
  const [climas, setClimas] = useState<Record<string, Clima | 'erro'>>({});

  useEffect(() => {
    let vivo = true;
    lista.forEach((d) =>
      buscarClima(d)
        .then((c) => vivo && setClimas((x) => ({ ...x, [d.id]: c })))
        .catch(() => vivo && setClimas((x) => ({ ...x, [d.id]: 'erro' })))
    );
    return () => {
      vivo = false;
    };
  }, [lista]);

  if (lista.length === 0) return null;

  return (
    <section aria-labelledby="titulo-neve" className="neve-destinos">
      <div className="secao-titulo">
        <h2 id="titulo-neve">Neve nos seus destinos</h2>
      </div>
      {lista.map((d) => {
        const c = climas[d.id];
        const temNeve = c && c !== 'erro' && (c.neve24hCm >= 5 || c.previsao.some((p) => p.neveCm >= 10));
        return (
          <a key={d.id} href={rota.destino(d.id)} className={`linha-neve ${temNeve ? 'destaque' : ''}`}>
            <Icone nome="floco" tamanho={18} cor={temNeve ? '#1F6B44' : '#5B6660'} />
            <div>
              <strong>{d.nome}</strong>
              <small>
                {c === 'erro' ? 'Sem dado agora' : c ? `${resumoCondicao(c)}${c.exemplo ? ' (exemplo)' : ''}` : 'Carregando…'}
              </small>
            </div>
            <Icone nome="seta" tamanho={16} cor="#5B6660" />
          </a>
        );
      })}
    </section>
  );
}
