import { useState } from 'react';
import { buscarDestino, destinos } from '../data/destinos';
import { CabecalhoVolta } from '../components/Nav';
import { viagens, type Atividade, type DiaViagem, type Viagem as TViagem } from '../lib/storage';
import { MAX_DIAS, ajustarDias, atividadeLabel, custoPasses, dataCurta, distribuirDias, textoDoRoteiro } from '../lib/viagem';
import { rota } from '../lib/rota';

export function Viagem({ id }: { id: string }) {
  const [v, setV] = useState<TViagem | undefined>(() => viagens.obter(id));
  const [novoDestino, setNovoDestino] = useState('');
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [copiado, setCopiado] = useState<'' | 'ok' | 'erro'>('');

  if (!v) {
    return (
      <main className="conteudo">
        <CabecalhoVolta titulo="Roteiro" href={rota.roteiros} />
        <div className="vazio">
          Roteiro não encontrado. <a href={rota.roteiros}>Ver meus roteiros</a>
        </div>
      </main>
    );
  }

  /** Salva no aparelho a cada mudança. */
  const atualizar = (mudanca: Partial<TViagem>) => {
    const nova = { ...v, ...mudanca };
    if ('ida' in mudanca || 'volta' in mudanca) nova.dias = ajustarDias(nova);
    viagens.salvar(nova);
    setV(nova);
    setCopiado('');
  };

  const mudarDia = (data: string, m: Partial<DiaViagem>) =>
    atualizar({ dias: v.dias.map((d) => (d.data === data ? { ...d, ...m } : d)) });

  const mover = (i: number, passo: -1 | 1) => {
    const lista = [...v.destinos];
    [lista[i], lista[i + passo]] = [lista[i + passo], lista[i]];
    atualizar({ destinos: lista });
  };

  const removerDestino = (destinoId: string) =>
    atualizar({
      destinos: v.destinos.filter((x) => x !== destinoId),
      dias: v.dias.map((d) => (d.destinoId === destinoId ? { ...d, destinoId: null } : d))
    });

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(textoDoRoteiro(v));
      setCopiado('ok');
    } catch {
      setCopiado('erro');
    }
  };

  const disponiveis = destinos.filter((d) => !v.destinos.includes(d.id));
  const custo = custoPasses(v);
  const datasInvalidas = v.ida && v.volta && v.volta < v.ida;

  return (
    <main className="conteudo">
      <CabecalhoVolta titulo="Roteiro" href={rota.roteiros} />

      <section className="form" aria-label="Dados da viagem">
        <label>
          Nome do roteiro
          <input value={v.nome} onChange={(e) => atualizar({ nome: e.target.value })} maxLength={60} />
        </label>
        <div className="linha-form">
          <label>
            Ida
            <input type="date" value={v.ida} onChange={(e) => atualizar({ ida: e.target.value })} />
          </label>
          <label>
            Volta
            <input type="date" value={v.volta} min={v.ida || undefined} onChange={(e) => atualizar({ volta: e.target.value })} />
          </label>
        </div>
        {datasInvalidas && <p className="erro-form">A volta precisa ser depois da ida.</p>}
        <label>
          Pessoas
          <div className="contador">
            <button type="button" aria-label="Menos uma pessoa" onClick={() => atualizar({ pessoas: Math.max(1, v.pessoas - 1) })}>
              −
            </button>
            <strong>{v.pessoas}</strong>
            <button type="button" aria-label="Mais uma pessoa" onClick={() => atualizar({ pessoas: Math.min(30, v.pessoas + 1) })}>
              +
            </button>
          </div>
        </label>
      </section>

      <div className="secao-titulo">
        <h2>Destinos</h2>
        <span className="legenda">Na ordem da viagem</span>
      </div>
      {v.destinos.length === 0 && <p className="legenda">Adicione o primeiro destino da viagem.</p>}
      <ol className="lista-destinos">
        {v.destinos.map((destinoId, i) => {
          const d = buscarDestino(destinoId);
          if (!d) return null;
          const diasAqui = v.dias.filter((x) => x.destinoId === destinoId && x.atividade === 'ski').length;
          return (
            <li key={destinoId}>
              <span className="ordem">{i + 1}</span>
              <a href={rota.destino(d.id)} className="nome-destino">
                {d.nome}
                <small>
                  {d.pais} · {diasAqui} {diasAqui === 1 ? 'dia' : 'dias'} de ski
                </small>
              </a>
              <div className="botoes-destino">
                <button type="button" aria-label={`Subir ${d.nome}`} disabled={i === 0} onClick={() => mover(i, -1)}>
                  ↑
                </button>
                <button type="button" aria-label={`Descer ${d.nome}`} disabled={i === v.destinos.length - 1} onClick={() => mover(i, 1)}>
                  ↓
                </button>
                <button type="button" aria-label={`Remover ${d.nome}`} onClick={() => removerDestino(destinoId)}>
                  ×
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="linha-form">
        <select value={novoDestino} onChange={(e) => setNovoDestino(e.target.value)} aria-label="Escolher destino" className="campo">
          <option value="">Escolher destino…</option>
          {(['Chile', 'Argentina'] as const).map((pais) => (
            <optgroup key={pais} label={pais}>
              {disponiveis
                .filter((d) => d.pais === pais)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        <button
          type="button"
          className="botao secundario curto"
          disabled={!novoDestino}
          onClick={() => {
            atualizar({ destinos: [...v.destinos, novoDestino] });
            setNovoDestino('');
          }}
        >
          Adicionar
        </button>
      </div>

      <div className="secao-titulo">
        <h2>Dia a dia</h2>
        {v.dias.length > 0 && <span className="legenda">{v.dias.length} dias</span>}
      </div>
      {v.dias.length === 0 ? (
        <p className="legenda">Escolha a data de ida e a de volta para montar o dia a dia (até {MAX_DIAS} dias).</p>
      ) : (
        <>
          <button type="button" className="botao contorno" disabled={v.destinos.length === 0} onClick={() => atualizar({ dias: distribuirDias(v) })}>
            Distribuir os dias entre os destinos
          </button>
          <p className="legenda">O primeiro e o último dia ficam como viagem. Os outros dias viram dias de ski, em partes iguais. As notas ficam.</p>
          <div className="dias">
            {v.dias.map((dia) => (
              <div key={dia.data} className={`dia atividade-${dia.atividade}`}>
                <div className="data-dia">{dataCurta(dia.data)}</div>
                <div className="campos-dia">
                  <div className="linha-form">
                    <select
                      aria-label={`Onde, em ${dataCurta(dia.data)}`}
                      value={dia.destinoId ?? ''}
                      onChange={(e) => mudarDia(dia.data, { destinoId: e.target.value || null })}
                    >
                      <option value="">Em trânsito</option>
                      {v.destinos.map((id) => (
                        <option key={id} value={id}>
                          {buscarDestino(id)?.nome}
                        </option>
                      ))}
                    </select>
                    <select
                      aria-label={`Atividade, em ${dataCurta(dia.data)}`}
                      value={dia.atividade}
                      onChange={(e) => mudarDia(dia.data, { atividade: e.target.value as Atividade })}
                    >
                      {(Object.keys(atividadeLabel) as Atividade[]).map((a) => (
                        <option key={a} value={a}>
                          {atividadeLabel[a]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    aria-label={`Nota, em ${dataCurta(dia.data)}`}
                    value={dia.nota}
                    onChange={(e) => mudarDia(dia.data, { nota: e.target.value })}
                    placeholder="Nota (ex.: aula às 9h)"
                    maxLength={120}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {custo.diasSki > 0 && (
        <section className="resumo-custo">
          <h3>Custo estimado de passe</h3>
          <strong>US$ {custo.total.toLocaleString('pt-BR')}</strong>
          <p className="legenda">
            {custo.diasSki} {custo.diasSki === 1 ? 'dia' : 'dias'} de ski × {v.pessoas} {v.pessoas === 1 ? 'pessoa' : 'pessoas'}, com o preço de referência de
            cada destino.
            {custo.semPreco.length > 0 && ` Sem preço de referência (fora da soma): ${custo.semPreco.join(', ')}.`} O valor é estimado. Confira
            no site oficial.
          </p>
        </section>
      )}

      <div className="secao-titulo">
        <h2>Notas</h2>
      </div>
      <textarea
        className="campo"
        aria-label="Notas do roteiro"
        value={v.notas}
        onChange={(e) => atualizar({ notas: e.target.value })}
        placeholder="Voo, transfer, aluguel de carro, quem leva o quê…"
        maxLength={2000}
      />

      <button type="button" className="botao" onClick={copiar}>
        Copiar roteiro para compartilhar
      </button>
      {copiado === 'ok' && <p className="legenda" role="status">Roteiro copiado. Cole no WhatsApp ou no e-mail.</p>}
      {copiado === 'erro' && (
        <div role="status">
          <p className="legenda">Este navegador não deixou copiar. Selecione o texto abaixo e copie:</p>
          <textarea className="campo" readOnly value={textoDoRoteiro(v)} onFocus={(e) => e.target.select()} />
        </div>
      )}

      {confirmarExclusao ? (
        <div className="confirmar">
          <p>Excluir o roteiro “{v.nome}”? Você não pode desfazer.</p>
          <div className="linha-form">
            <button type="button" className="botao contorno" onClick={() => setConfirmarExclusao(false)}>
              Cancelar
            </button>
            <button
              type="button"
              className="botao perigo"
              onClick={() => {
                viagens.excluir(v.id);
                window.location.hash = rota.roteiros;
              }}
            >
              Excluir
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="link-perigo" onClick={() => setConfirmarExclusao(true)}>
          Excluir roteiro
        </button>
      )}
      <p className="aviso">O roteiro fica salvo só neste aparelho.</p>
    </main>
  );
}
