import { useState } from 'react';
import { buscarDestino, type Destino } from '../data/destinos';
import { visitados } from '../lib/storage';
import { rota } from '../lib/rota';

const ACONCAGUA = 6961;

/** Passaporte de Picos: montanhas onde o usuário já esquiou e a soma das altitudes "rumo aos 6.961 m". */
export function PassaportePicos() {
  const [lista] = useState(() =>
    visitados
      .listar()
      .map((v) => buscarDestino(v.id))
      .filter((d): d is Destino => d !== undefined)
  );
  const soma = lista.reduce((s, d) => s + d.altitudeTopo, 0);
  const vezes = soma / ACONCAGUA;
  const paises = new Set(lista.map((d) => d.pais)).size;
  const maisAlto = [...lista].sort((a, b) => b.altitudeTopo - a.altitudeTopo)[0];
  const fracao = soma === 0 ? 0 : vezes >= 1 ? (vezes % 1) * 100 : vezes * 100;

  return (
    <section className="passaporte" aria-labelledby="titulo-passaporte">
      <h2 id="titulo-passaporte">Passaporte de Picos</h2>
      {lista.length === 0 ? (
        <p className="legenda">
          Abra um destino onde você já esquiou e toque em “Já esquiei aqui”. O app soma a altitude dos topos rumo aos 6.961 m do Aconcágua.
        </p>
      ) : (
        <>
          <div className="numero-passaporte">
            <strong>{soma.toLocaleString('pt-BR')} m</strong>
            <span>
              {vezes >= 1
                ? `= ${vezes.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} Aconcágua`
                : `${Math.round(vezes * 100)}% do caminho até os 6.961 m`}
            </span>
          </div>
          <div className="progresso" aria-hidden="true">
            <div style={{ width: `${fracao}%` }} />
          </div>
          <p className="legenda">
            Faltam {((Math.floor(vezes) + 1) * ACONCAGUA - soma).toLocaleString('pt-BR')} m para {vezes >= 1 ? `o ${Math.floor(vezes) + 1}º Aconcágua` : 'o 1º Aconcágua'}.
          </p>
          <p className="legenda">
            {lista.length} {lista.length === 1 ? 'montanha' : 'montanhas'} · {paises} {paises === 1 ? 'país' : 'países'}
            {maisAlto && ` · topo mais alto: ${maisAlto.nome} (${maisAlto.altitudeTopo.toLocaleString('pt-BR')} m)`}
          </p>
          <div className="selos-picos">
            {lista.map((d) => (
              <a key={d.id} href={rota.destino(d.id)} className="selo-pico">
                {d.nome}
              </a>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
