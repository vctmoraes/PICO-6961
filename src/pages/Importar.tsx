import { useState } from 'react';
import { buscarDestino } from '../data/destinos';
import { CabecalhoVolta } from '../components/Nav';
import { decodificarViagem } from '../lib/compartilhar';
import { viagens } from '../lib/storage';
import { dataCurta } from '../lib/viagem';
import { rota } from '../lib/rota';

/** Tela que abre quando alguém recebe um roteiro pelo WhatsApp. */
export function Importar({ dados }: { dados: string }) {
  const [v] = useState(() => decodificarViagem(dados));
  if (!v) {
    return (
      <main className="conteudo">
        <CabecalhoVolta titulo="Roteiro recebido" href={rota.roteiros} />
        <div className="vazio">Este link de roteiro está incompleto. Peça para a pessoa mandar o link de novo.</div>
      </main>
    );
  }
  const nomes = v.destinos.map((id) => buscarDestino(id)?.nome).filter(Boolean);
  return (
    <main className="conteudo">
      <CabecalhoVolta titulo="Roteiro recebido" href={rota.roteiros} />
      <section className="form">
        <h2 className="titulo">{v.nome}</h2>
        <p className="legenda">
          {v.ida && v.volta ? `${dataCurta(v.ida)} a ${dataCurta(v.volta)} · ${v.dias.length} dias` : 'Sem datas'} · {v.pessoas}{' '}
          {v.pessoas === 1 ? 'pessoa' : 'pessoas'}
        </p>
        <p>{nomes.length ? nomes.join(' → ') : 'Nenhum destino'}</p>
        <button
          type="button"
          className="botao"
          onClick={() => {
            const nova = viagens.criar(v.nome);
            viagens.salvar({ ...nova, ...v, id: nova.id, criadaEm: nova.criadaEm });
            window.location.hash = rota.viagem(nova.id);
          }}
        >
          Salvar nos meus roteiros
        </button>
        <p className="aviso">O app salva uma cópia só neste aparelho. A sua cópia não muda o roteiro de quem mandou.</p>
      </section>
    </main>
  );
}
