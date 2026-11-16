import { useState } from 'react';
import { buscarDestino } from '../data/destinos';
import { DestinoCard } from '../components/DestinoCard';
import { CabecalhoVolta } from '../components/Nav';
import { Icone } from '../components/Icone';
import { salvos, viagens } from '../lib/storage';
import { dataCurta } from '../lib/viagem';
import { rota } from '../lib/rota';
import { medir } from '../lib/medir';

export function Roteiros() {
  const [lista] = useState(viagens.listar);
  const [nome, setNome] = useState('');
  const favoritos = salvos.listar().map(buscarDestino).filter((d) => d !== undefined);

  const criar = (e: React.FormEvent) => {
    e.preventDefault();
    const v = viagens.criar(nome);
    medir('Roteiro criado', { origem: 'manual' });
    window.location.hash = rota.viagem(v.id);
  };

  return (
    <main className="conteudo">
      <CabecalhoVolta titulo="Meus roteiros" />

      <form className="form" onSubmit={criar}>
        <label htmlFor="nome-roteiro">Novo roteiro</label>
        <div className="linha-form">
          <input id="nome-roteiro" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Chile em julho com a turma" maxLength={60} />
          <button className="botao secundario curto" type="submit">
            Criar
          </button>
        </div>
      </form>

      <a className="acao primaria" href={rota.planejar}>
        <div>
          <div className="t">Monte minha viagem</div>
          <div className="s">O app sugere o roteiro pelas datas, pelo orçamento e pelo seu perfil</div>
        </div>
      </a>

      {lista.length === 0 ? (
        <div className="vazio">
          <p>Você ainda não tem roteiro.</p>
          <p>Crie um roteiro, escolha as datas e os destinos, e monte o dia a dia da viagem.</p>
        </div>
      ) : (
        lista.map((v) => {
          const nomes = v.destinos.map((id) => buscarDestino(id)?.nome).filter(Boolean);
          return (
            <a key={v.id} className="card cartao-viagem" href={rota.viagem(v.id)}>
              <div className="icone-viagem">
                <Icone nome="calendario" tamanho={22} cor="#FFFFFF" />
              </div>
              <div className="info">
                <div className="nome">{v.nome}</div>
                <div className="sub">
                  {v.ida && v.volta ? `${dataCurta(v.ida)} a ${dataCurta(v.volta)} · ${v.dias.length} dias` : 'Sem datas'} · {v.pessoas}{' '}
                  {v.pessoas === 1 ? 'pessoa' : 'pessoas'}
                </div>
                <div className="nota">{nomes.length ? nomes.join(' → ') : 'Nenhum destino ainda'}</div>
              </div>
            </a>
          );
        })
      )}

      <div className="secao-titulo">
        <h2>Destinos salvos</h2>
      </div>
      {favoritos.length === 0 ? (
        <p className="legenda">Toque no marcador de um destino para salvar o destino aqui.</p>
      ) : (
        favoritos.map((d) => <DestinoCard key={d.id} destino={d} />)
      )}
    </main>
  );
}
