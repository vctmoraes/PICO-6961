import { useState } from 'react';
import type { Destino } from '../data/destinos';
import { viagens } from '../lib/storage';
import { rota } from '../lib/rota';

/** Painel que sobe do rodapé: escolhe um roteiro existente ou cria um roteiro novo com o destino. */
export function AdicionarAoRoteiro({ destino, aoFechar }: { destino: Destino; aoFechar: () => void }) {
  const [lista, setLista] = useState(viagens.listar);
  const [nome, setNome] = useState(`Viagem para ${destino.nome}`);
  const [adicionadoEm, setAdicionadoEm] = useState<string | null>(null);

  const adicionar = (id: string) => {
    viagens.adicionarDestino(id, destino.id);
    setLista(viagens.listar());
    setAdicionadoEm(id);
  };

  return (
    <div className="fundo-painel" onClick={aoFechar}>
      <div className="painel-inferior" role="dialog" aria-modal="true" aria-labelledby="titulo-painel" onClick={(e) => e.stopPropagation()}>
        <div className="secao-titulo">
          <h2 id="titulo-painel">Adicionar {destino.nome} a um roteiro</h2>
          <button type="button" className="fechar" aria-label="Fechar" onClick={aoFechar}>
            ×
          </button>
        </div>

        {lista.map((v) => {
          const ja = v.destinos.includes(destino.id);
          return (
            <div key={v.id} className="item-painel">
              <div>
                <strong>{v.nome}</strong>
                <small>{v.destinos.length} {v.destinos.length === 1 ? 'destino' : 'destinos'}</small>
              </div>
              {ja ? (
                <a href={rota.viagem(v.id)} className="botao contorno curto">
                  {adicionadoEm === v.id ? 'Adicionado ✓ Abrir' : 'Já está · Abrir'}
                </a>
              ) : (
                <button type="button" className="botao secundario curto" onClick={() => adicionar(v.id)}>
                  Adicionar
                </button>
              )}
            </div>
          );
        })}

        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            const v = viagens.criar(nome, destino.id);
            window.location.hash = rota.viagem(v.id);
          }}
        >
          <label htmlFor="nome-novo-roteiro">Criar roteiro novo</label>
          <div className="linha-form">
            <input id="nome-novo-roteiro" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={60} />
            <button type="submit" className="botao curto">
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
