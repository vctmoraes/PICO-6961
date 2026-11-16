import { useState } from 'react';
import { paises, type Pais } from '../data/destinos';
import { CabecalhoVolta } from '../components/Nav';
import { Badge } from '../components/Badge';
import { formatarReal } from '../lib/custo';
import { medir } from '../lib/medir';
import { useCotacoes } from '../lib/moeda';
import { planejar, type PedidoViagem, type Plano, type Resultado } from '../lib/planejar';
import { perfilViajante, viagens } from '../lib/storage';
import { distribuirDias } from '../lib/viagem';
import { rota } from '../lib/rota';

const orcamentos = [0, 1500, 3000, 5000, 8000];

export function Planejar() {
  const cot = useCotacoes();
  const perfil = perfilViajante.ler();
  const [pedido, setPedido] = useState<PedidoViagem>({ ida: '', volta: '', pessoas: 2, orcamentoPessoa: 0, pais: '', quantosDestinos: 1 });
  const [res, setRes] = useState<Resultado | null>(null);
  const muda = (m: Partial<PedidoViagem>) => setPedido((p) => ({ ...p, ...m }));

  const criar = (pl: Plano) => {
    const nome = `Viagem ${pl.destinos.map((d) => d.nome).join(' + ')}`;
    const v = viagens.criar(nome);
    const nova = { ...v, ida: pedido.ida, volta: pedido.volta, pessoas: pedido.pessoas, destinos: pl.destinos.map((d) => d.id) };
    viagens.salvar({ ...nova, dias: distribuirDias(nova) });
    medir('Roteiro criado', { origem: 'planejador' });
    window.location.hash = rota.viagem(v.id);
  };

  return (
    <main className="conteudo">
      <CabecalhoVolta titulo="Monte minha viagem" />
      <p className="legenda">Diga as datas e o orçamento. O app usa o seu perfil, a época de neve, a lotação e o custo do dia para sugerir roteiros prontos.</p>
      {!perfilViajante.temRespostas(perfil) && (
        <p className="aviso-lotacao">
          Dica: <a href={rota.questionario}>faça o seu perfil</a> para receber sugestões do seu nível e do seu jeito de viajar.
        </p>
      )}

      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          const r = planejar(pedido, perfil, cot);
          setRes(r);
          medir('Monte minha viagem', { sugestoes: r.planos.length, destinos: pedido.quantosDestinos, pais: pedido.pais || 'todos' });
        }}
      >
        <div className="linha-form">
          <label>
            Ida
            <input type="date" required value={pedido.ida} onChange={(e) => muda({ ida: e.target.value })} />
          </label>
          <label>
            Volta
            <input type="date" required min={pedido.ida || undefined} value={pedido.volta} onChange={(e) => muda({ volta: e.target.value })} />
          </label>
        </div>
        <label>
          Pessoas
          <div className="contador">
            <button type="button" aria-label="Menos uma pessoa" onClick={() => muda({ pessoas: Math.max(1, pedido.pessoas - 1) })}>
              −
            </button>
            <strong>{pedido.pessoas}</strong>
            <button type="button" aria-label="Mais uma pessoa" onClick={() => muda({ pessoas: Math.min(30, pedido.pessoas + 1) })}>
              +
            </button>
          </div>
        </label>
        <label>
          Orçamento por pessoa para a montanha (passe e aluguel)
          <select className="campo" value={pedido.orcamentoPessoa} onChange={(e) => muda({ orcamentoPessoa: Number(e.target.value) })}>
            {orcamentos.map((o) => (
              <option key={o} value={o}>
                {o ? `Até R$ ${o.toLocaleString('pt-BR')}` : 'Sem limite'}
              </option>
            ))}
          </select>
        </label>
        <div className="linha-form">
          <label>
            País
            <select className="campo" value={pedido.pais} onChange={(e) => muda({ pais: e.target.value as Pais | '' })}>
              <option value="">Qualquer</option>
              {paises.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label>
            Destinos
            <select className="campo" value={pedido.quantosDestinos} onChange={(e) => muda({ quantosDestinos: Number(e.target.value) as 1 | 2 })}>
              <option value={1}>1 destino</option>
              <option value={2}>2 destinos</option>
            </select>
          </label>
        </div>
        <button type="submit" className="botao">
          Ver sugestões
        </button>
      </form>

      {res && (
        <section className="sugestoes" aria-live="polite">
          {res.avisos.map((a) => (
            <p key={a} className="legenda">
              {a}
            </p>
          ))}
          {res.planos.map((pl, i) => (
            <article key={pl.destinos.map((d) => d.id).join()} className="plano">
              <div className="topo-plano">
                <span className="ordem">{i + 1}</span>
                <h3>{pl.destinos.map((d) => d.nome).join(' + ')}</h3>
                <span className={`combina ${pl.nota >= 70 ? 'alta' : pl.nota >= 45 ? 'media' : 'baixa'}`}>{pl.nota}%</span>
              </div>
              <p className="legenda">
                {pl.destinos.map((d) => `${d.pais} · ${d.regiao}`).join(' | ')} · <Badge nivel={pl.destinos[0].nivel} />
              </p>
              {pl.motivos.length > 0 && (
                <ul className="motivos-plano">
                  {pl.motivos.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              )}
              {pl.atencao.length > 0 && <p className="atencao-plano">{pl.atencao.join(' · ')}</p>}
              {pl.lotacao.length > 0 && <p className="aviso-lotacao">Época cheia (aproximado): {pl.lotacao.join(' · ')}</p>}
              <p className="custo-plano">
                {pl.custoPessoa ? (
                  <>
                    Custo de montanha por pessoa: <strong>≈ {formatarReal(pl.custoPessoa[0], pl.custoPessoa[1])}</strong> ({pl.diasSki} {pl.diasSki === 1 ? 'dia' : 'dias'} de ski
                    {pl.custoParcial ? ', sem os itens a consultar' : ''})
                  </>
                ) : cot ? (
                  'Custo de montanha: ainda sem valor de referência para todos os itens.'
                ) : (
                  'O custo em real aparece com a cotação do dia.'
                )}
              </p>
              <div className="linha-form">
                <button type="button" className="botao curto" onClick={() => criar(pl)}>
                  Criar este roteiro
                </button>
                <a className="botao contorno curto" href={pl.destinos.length > 1 ? rota.comparar(pl.destinos.map((d) => d.id)) : rota.destino(pl.destinos[0].id)}>
                  {pl.destinos.length > 1 ? 'Comparar' : 'Ver destino'}
                </a>
              </div>
            </article>
          ))}
          {res.planos.length > 0 && (
            <p className="aviso">O custo inclui só passe e aluguel, pelo valor médio de referência. Voo, hotel e comida ficam fora. As datas de lotação são aproximadas.</p>
          )}
        </section>
      )}
    </main>
  );
}
