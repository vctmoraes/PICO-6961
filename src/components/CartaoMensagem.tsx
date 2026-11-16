import { buscarDestino } from '../data/destinos';
import { combinar } from '../lib/combina';
import type { Cartao } from '../lib/grupos';
import { perfilViajante } from '../lib/storage';
import { rota } from '../lib/rota';
import { Badge } from './Badge';
import { Paisagem } from './Paisagem';

/** Cartão do app dentro do chat. Cada pessoa vê a própria nota de combinação. */
export function CartaoMensagem({ cartao, grupoId, aoAbrirAba }: { cartao: Cartao; grupoId: string; aoAbrirAba: (aba: 'roteiro' | 'votacao') => void }) {
  if (cartao.tipo === 'destino') {
    const d = buscarDestino(cartao.id);
    if (!d) return <div className="cartao-msg">Destino não encontrado.</div>;
    const p = perfilViajante.ler();
    const nota = perfilViajante.temRespostas(p) ? combinar(d, p).nota : null;
    return (
      <a className="cartao-msg destino" href={rota.destino(d.id)}>
        <div className="mini">
          <Paisagem destino={d} />
        </div>
        <div>
          <strong>{d.nome}</strong>
          <small>
            {d.pais} · {d.nota}
          </small>
          <span className="linha-cartao">
            <Badge nivel={d.nivel} />
            {nota != null && <span className="combina alta">{nota}% para você</span>}
          </span>
        </div>
      </a>
    );
  }
  if (cartao.tipo === 'comparacao') {
    const nomes = cartao.ids.map((id) => buscarDestino(id)?.nome).filter(Boolean);
    return (
      <a className="cartao-msg" href={rota.comparar(cartao.ids)}>
        <strong>Comparação</strong>
        <small>{nomes.join(' × ')}</small>
        <span className="link-cartao">Abrir a comparação →</span>
      </a>
    );
  }
  if (cartao.tipo === 'enquete') {
    return (
      <button type="button" className="cartao-msg" onClick={() => aoAbrirAba('votacao')}>
        <strong>Votação</strong>
        <small>{cartao.pergunta ?? 'Nova votação no grupo'}</small>
        <span className="link-cartao">Votar →</span>
      </button>
    );
  }
  return (
    <button type="button" className="cartao-msg" onClick={() => aoAbrirAba('roteiro')} data-grupo={grupoId}>
      <strong>Roteiro do grupo</strong>
      <small>O roteiro do grupo mudou.</small>
      <span className="link-cartao">Ver o roteiro →</span>
    </button>
  );
}
