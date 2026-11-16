import { useState } from 'react';
import { destinos, nivelLabel, paises, type Nivel, type Pais } from '../data/destinos';
import { CabecalhoVolta } from '../components/Nav';
import { MapaPreguicoso } from '../components/MapaPreguicoso';
import { rota } from '../lib/rota';

export function MapaDestinos() {
  const [nivel, setNivel] = useState<Nivel | ''>('');
  const [pais, setPais] = useState<Pais | ''>('');
  const lista = destinos.filter((d) => (!nivel || d.nivel === nivel) && (!pais || d.pais === pais));

  return (
    <main className="conteudo">
      <CabecalhoVolta titulo="Mapa dos destinos" href={rota.buscar} />
      <div className="chips" role="group" aria-label="Filtros do mapa">
        <select className="filtro select-filtro" value={pais} onChange={(e) => setPais(e.target.value as Pais | '')} aria-label="País">
          <option value="">Todos os países ▾</option>
          {paises.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select className="filtro select-filtro" value={nivel} onChange={(e) => setNivel(e.target.value as Nivel | '')} aria-label="Nível">
          <option value="">Todos os níveis ▾</option>
          {(Object.keys(nivelLabel) as Nivel[]).map((n) => (
            <option key={n} value={n}>
              {nivelLabel[n]}
            </option>
          ))}
        </select>
      </div>

      {lista.length > 0 ? (
        <MapaPreguicoso pontos={lista} altura="calc(100dvh - 300px)" />
      ) : (
        <div className="vazio">Nenhum destino com esse filtro.</div>
      )}

      <div className="legenda-pistas">
        <span><i style={{ background: '#1F6B44' }} />Iniciante</span>
        <span><i style={{ background: '#92631B' }} />Intermediário</span>
        <span><i style={{ background: '#9C3B30' }} />Avançado</span>
      </div>
      <p className="legenda">
        {lista.length} {lista.length === 1 ? 'destino' : 'destinos'}. Toque num ponto para ver o nome e abrir o destino. A posição é aproximada.
      </p>
    </main>
  );
}
