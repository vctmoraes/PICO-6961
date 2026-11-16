import { useEffect, useState } from 'react';
import { buscarDestino, destinos, type Destino } from '../data/destinos';
import { Badge } from '../components/Badge';
import { CabecalhoVolta } from '../components/Nav';
import { buscarClima, type Clima } from '../lib/clima';
import { emReal, useCotacoes } from '../lib/moeda';
import { rota } from '../lib/rota';

const MAX = 3;

function useClimas(lista: Destino[]) {
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
  }, [lista.map((d) => d.id).join()]);
  return climas;
}

export function Comparar({ ids: idsIniciais }: { ids: string[] }) {
  const [ids, setIds] = useState<string[]>(() => idsIniciais.filter((id) => buscarDestino(id)).slice(0, MAX));
  const escolhidos = ids.map(buscarDestino).filter((d): d is Destino => d !== undefined);
  const climas = useClimas(escolhidos);
  const cot = useCotacoes();

  // Guarda a escolha no endereço, para o usuário compartilhar a comparação.
  useEffect(() => {
    history.replaceState(null, '', ids.length ? rota.comparar(ids) : rota.comparar([]));
  }, [ids.join()]);

  const trocar = (i: number, id: string) => setIds((x) => (id ? Object.assign([...x], { [i]: id }) : x.filter((_, k) => k !== i)));

  const clima = (d: Destino) => climas[d.id];
  const linhas: { rotulo: string; valor: (d: Destino) => React.ReactNode }[] = [
    { rotulo: 'País e região', valor: (d) => `${d.pais} · ${d.regiao}` },
    { rotulo: 'Nível', valor: (d) => <Badge nivel={d.nivel} /> },
    { rotulo: 'Altitude', valor: (d) => `${d.altitudeBase.toLocaleString('pt-BR')} a ${d.altitudeTopo.toLocaleString('pt-BR')} m` },
    { rotulo: 'Km de pista', valor: (d) => (d.kmPista ? `${d.kmPista} km` : '—') },
    { rotulo: 'Temporada', valor: (d) => d.temporada },
    {
      rotulo: 'Passe (dia)',
      valor: (d) =>
        d.passe.valor == null ? (
          'Consultar'
        ) : (
          <>
            {d.passe.moeda === 'USD' ? 'US$' : d.passe.moeda} {d.passe.valor}*
            {emReal(d.passe.valor, d.passe.moeda, cot) && <small>{emReal(d.passe.valor, d.passe.moeda, cot)}</small>}
          </>
        )
    },
    { rotulo: 'Cidade-base', valor: (d) => d.cidadeBase },
    {
      rotulo: 'Neve nova (24h)',
      valor: (d) => {
        const c = clima(d);
        return c === 'erro' ? 'Sem dado' : c ? `${c.neve24hCm} cm${c.exemplo ? ' (exemplo)' : ''}` : '…';
      }
    },
    {
      rotulo: 'Neve prevista (5 dias)',
      valor: (d) => {
        const c = clima(d);
        return c === 'erro' ? 'Sem dado' : c ? `${c.previsao.reduce((s, p) => s + p.neveCm, 0)} cm` : '…';
      }
    },
    {
      rotulo: 'Agora no topo',
      valor: (d) => {
        const c = clima(d);
        return c === 'erro' ? 'Sem dado' : c ? `${Math.round(c.topo.temperatura)}°C · vento ${Math.round(c.topo.vento)} km/h` : '…';
      }
    },
    { rotulo: 'Câmera ao vivo', valor: (d) => (d.montanha?.cameras ? 'Sim' : 'Não') }
  ];

  return (
    <main className="conteudo">
      <CabecalhoVolta titulo="Comparar destinos" href={rota.buscar} />
      <p className="legenda">Escolha até {MAX} destinos.</p>

      <div className="seletores-comparar">
        {[...Array(Math.min(ids.length + 1, MAX))].map((_, i) => (
          <select key={i} className="campo" aria-label={`Destino ${i + 1}`} value={ids[i] ?? ''} onChange={(e) => trocar(i, e.target.value)}>
            <option value="">{ids[i] ? 'Remover' : `Destino ${i + 1}…`}</option>
            {(['Chile', 'Argentina'] as const).map((pais) => (
              <optgroup key={pais} label={pais}>
                {destinos
                  .filter((d) => d.pais === pais && (d.id === ids[i] || !ids.includes(d.id)))
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nome}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        ))}
      </div>

      {escolhidos.length >= 2 ? (
        <div className="comparacao" style={{ ['--colunas' as string]: escolhidos.length }}>
          <div className="linha-comparar cabecalho">
            {escolhidos.map((d) => (
              <a key={d.id} href={rota.destino(d.id)}>
                {d.nome}
              </a>
            ))}
          </div>
          {linhas.map((l) => (
            <div key={l.rotulo} className="linha-comparar">
              <div className="rotulo">{l.rotulo}</div>
              {escolhidos.map((d) => (
                <div key={d.id}>{l.valor(d)}</div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="vazio">Escolha pelo menos 2 destinos para comparar.</div>
      )}
      <p className="aviso">
        * Preço estimado. Neve e tempo: previsão do modelo meteorológico (Open-Meteo), não é boletim oficial. Cotação do real: AwesomeAPI.
      </p>
    </main>
  );
}
