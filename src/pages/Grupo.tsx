import { useCallback, useEffect, useRef, useState } from 'react';
import { CabecalhoVolta } from '../components/Nav';
import { CartaoMensagem } from '../components/CartaoMensagem';
import { gruposDeDestinos, buscarDestino } from '../data/destinos';
import { backend, type Enquete, type Grupo as TGrupo, type Membro, type Mensagem, type RoteiroGrupo, type Usuario } from '../lib/grupos';
import { linkWhatsApp } from '../lib/compartilhar';
import { viagens, type Viagem as TViagem } from '../lib/storage';
import { rota } from '../lib/rota';
import { medir } from '../lib/medir';
import { AvisoDemo, ComLogin } from './Grupos';
import { Viagem } from './Viagem';

type Aba = 'chat' | 'roteiro' | 'votacao' | 'pessoas';
const abas: { id: Aba; rotulo: string }[] = [
  { id: 'chat', rotulo: 'Chat' },
  { id: 'roteiro', rotulo: 'Roteiro' },
  { id: 'votacao', rotulo: 'Votação' },
  { id: 'pessoas', rotulo: 'Pessoas' }
];

export function Grupo({ id }: { id: string }) {
  return (
    <main className="conteudo grupo">
      <AvisoDemo />
      <ComLogin>{(u) => <TelaGrupo id={id} eu={u} />}</ComLogin>
    </main>
  );
}

function TelaGrupo({ id, eu }: { id: string; eu: Usuario }) {
  const [g, setG] = useState<TGrupo | null | undefined>(undefined);
  const [aba, setAba] = useState<Aba>('chat');
  useEffect(() => {
    backend().grupo(id).then(setG).catch(() => setG(null));
  }, [id]);

  if (g === undefined) return <p className="legenda">Carregando…</p>;
  if (g === null)
    return (
      <>
        <CabecalhoVolta titulo="Grupo" href={rota.grupos} />
        <div className="vazio">Grupo não encontrado, ou você não participa deste grupo.</div>
      </>
    );

  return (
    <>
      <CabecalhoVolta titulo={g.nome} href={rota.grupos} />
      <div className="abas abas-grupo" role="tablist">
        {abas.map((a) => (
          <button key={a.id} type="button" role="tab" aria-selected={aba === a.id} className={`aba ${aba === a.id ? 'ativa' : ''}`} onClick={() => setAba(a.id)}>
            {a.rotulo}
          </button>
        ))}
      </div>
      {aba === 'chat' && <Chat g={g} eu={eu} aoAbrirAba={setAba} />}
      {aba === 'roteiro' && <RoteiroDoGrupo g={g} eu={eu} />}
      {aba === 'votacao' && <Votacao g={g} eu={eu} />}
      {aba === 'pessoas' && <Pessoas g={g} eu={eu} />}
    </>
  );
}

// ───────── Chat ─────────

function Chat({ g, eu, aoAbrirAba }: { g: TGrupo; eu: Usuario; aoAbrirAba: (a: Aba) => void }) {
  const [msgs, setMsgs] = useState<Mensagem[]>([]);
  const [bloq, setBloq] = useState<string[]>([]);
  const [texto, setTexto] = useState('');
  const [anexo, setAnexo] = useState(false);
  const [destinoAnexo, setDestinoAnexo] = useState('');
  const [menu, setMenu] = useState<string | null>(null);
  const [aviso, setAviso] = useState('');
  const fim = useRef<HTMLDivElement>(null);

  const carregar = useCallback(() => {
    backend().mensagens(g.id).then(setMsgs).catch((e) => setAviso(e.message));
    backend().bloqueados().then(setBloq);
  }, [g.id]);

  useEffect(() => {
    carregar();
    return backend().ouvir(g.id, (m) => m === 'mensagens' && carregar());
  }, [carregar, g.id]);

  // Chaves: no Chrome novo, scrollIntoView devolve uma promessa, e o React não aceita promessa como limpeza.
  useEffect(() => {
    fim.current?.scrollIntoView({ block: 'end' });
  }, [msgs.length]);

  const enviar = async (m: Parameters<ReturnType<typeof backend>['enviar']>[1]) => {
    try {
      await backend().enviar(g.id, m);
      medir('Mensagem enviada', { tipo: m.cartao ? `cartao-${m.cartao.tipo}` : 'texto' });
      carregar();
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'Não foi possível enviar.');
    }
  };

  const visiveis = msgs.filter((m) => !m.autorId || !bloq.includes(m.autorId));

  return (
    <section className="chat" aria-label="Chat do grupo">
      {visiveis.length === 0 && <p className="legenda">Nenhuma mensagem ainda. Mande um destino para começar a conversa.</p>}
      <ol className="mensagens">
        {visiveis.map((m) => {
          const minha = m.autorId === eu.id;
          return (
            <li key={m.id} className={`msg ${minha ? 'minha' : ''}`}>
              {!minha && <span className="autor">{m.autorNome}</span>}
              {m.texto && <p>{m.texto}</p>}
              {m.cartao && <CartaoMensagem cartao={m.cartao} grupoId={g.id} aoAbrirAba={(a) => aoAbrirAba(a)} />}
              <span className="hora">
                {new Date(m.criadoEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                <button type="button" className="mais-msg" aria-label="Opções da mensagem" onClick={() => setMenu(menu === m.id ? null : m.id)}>
                  ⋯
                </button>
              </span>
              {menu === m.id && (
                <div className="menu-msg">
                  {minha ? (
                    <button
                      type="button"
                      onClick={async () => {
                        await backend().apagarMensagem(m.id);
                        setMenu(null);
                        carregar();
                      }}
                    >
                      Apagar mensagem
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={async () => {
                          await backend().denunciar(m.id, 'Denúncia pelo app');
                          setMenu(null);
                          setAviso('Denúncia enviada. A equipe do PICO 6961 vai analisar.');
                        }}
                      >
                        Denunciar
                      </button>
                      {m.autorId && (
                        <button
                          type="button"
                          onClick={async () => {
                            await backend().bloquear(m.autorId!);
                            setMenu(null);
                            setAviso(`Você bloqueou ${m.autorNome}. As mensagens dessa pessoa ficam escondidas para você.`);
                            carregar();
                          }}
                        >
                          Bloquear {m.autorNome}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <div ref={fim} />
      {aviso && (
        <p className="legenda" role="status">
          {aviso}
        </p>
      )}

      {anexo && (
        <div className="anexo">
          <label htmlFor="destino-anexo">Mandar um destino</label>
          <div className="linha-form">
            <select id="destino-anexo" className="campo" value={destinoAnexo} onChange={(e) => setDestinoAnexo(e.target.value)}>
              <option value="">Escolher destino…</option>
              {gruposDeDestinos().map((gr) => (
                <optgroup key={gr.rotulo} label={gr.rotulo}>
                  {gr.itens.map((d) => (
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
              disabled={!destinoAnexo}
              onClick={() => {
                enviar({ cartao: { tipo: 'destino', id: destinoAnexo } });
                setDestinoAnexo('');
                setAnexo(false);
              }}
            >
              Mandar
            </button>
          </div>
          <p className="legenda">Dica: na tela de um destino ou de uma comparação, toque em “Mandar para um grupo”.</p>
        </div>
      )}

      <form
        className="escrever"
        onSubmit={(e) => {
          e.preventDefault();
          if (!texto.trim()) return;
          enviar({ texto: texto.trim() });
          setTexto('');
        }}
      >
        <button type="button" className="botao-anexo" aria-label="Mandar um destino" aria-expanded={anexo} onClick={() => setAnexo(!anexo)}>
          +
        </button>
        <input aria-label="Mensagem" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Mensagem" maxLength={2000} />
        <button type="submit" className="botao curto" disabled={!texto.trim()}>
          Enviar
        </button>
      </form>
    </section>
  );
}

// ───────── Roteiro do grupo ─────────

function RoteiroDoGrupo({ g, eu }: { g: TGrupo; eu: Usuario }) {
  const [r, setR] = useState<RoteiroGrupo | null>(null);
  const [versao, setVersao] = useState(0);
  const [mudouFora, setMudouFora] = useState(false);
  const [meuSalvamento, setMeuSalvamento] = useState(0);
  const locais = viagens.listar();

  const carregar = useCallback(() => backend().roteiro(g.id).then(setR), [g.id]);
  useEffect(() => {
    carregar();
    return backend().ouvir(g.id, (m) => {
      // Mudança de outra pessoa: avisa, sem trocar o texto que você está digitando.
      if (m === 'roteiro' && Date.now() - meuSalvamento > 3000) setMudouFora(true);
    });
  }, [carregar, g.id, meuSalvamento]);

  const salvar = async (v: TViagem, avisarNoChat = false) => {
    setMeuSalvamento(Date.now());
    await backend().salvarRoteiro(g.id, v);
    if (avisarNoChat) await backend().enviar(g.id, { cartao: { tipo: 'roteiro' } });
  };

  if (!r) return <p className="legenda">Carregando…</p>;

  if (!r.viagem) {
    return (
      <section className="form">
        <h2 className="titulo">Roteiro do grupo</h2>
        <p className="legenda">Todas as pessoas do grupo veem e editam o mesmo roteiro.</p>
        <button
          type="button"
          className="botao"
          onClick={async () => {
            const base = viagens.criar(g.nome);
            viagens.excluir(base.id);
            await salvar({ ...base, id: `grupo-${g.id}` }, true);
            carregar();
          }}
        >
          Criar roteiro do grupo
        </button>
        {locais.length > 0 && (
          <>
            <p className="legenda">Ou comece com um roteiro seu:</p>
            {locais.map((v) => (
              <button
                key={v.id}
                type="button"
                className="botao contorno"
                onClick={async () => {
                  await salvar({ ...v, id: `grupo-${g.id}` }, true);
                  carregar();
                }}
              >
                Usar “{v.nome}”
              </button>
            ))}
          </>
        )}
      </section>
    );
  }

  return (
    <>
      {mudouFora && (
        <div className="aviso-mudanca" role="status">
          Alguém do grupo mudou o roteiro.
          <button
            type="button"
            className="botao secundario curto"
            onClick={async () => {
              await carregar();
              setMudouFora(false);
              setVersao((x) => x + 1);
            }}
          >
            Atualizar
          </button>
        </div>
      )}
      {r.atualizadoEm && (
        <p className="legenda">
          Última mudança: {r.atualizadoPor ?? 'alguém do grupo'}, {new Date(r.atualizadoEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}.
        </p>
      )}
      <Viagem key={versao} id={r.viagem.id} externo={{ viagem: r.viagem, salvar: (v) => void salvar(v), voltar: rota.grupo(g.id) }} />
      <button
        type="button"
        className="botao contorno"
        onClick={async () => {
          await backend().enviar(g.id, { cartao: { tipo: 'roteiro' } });
        }}
      >
        Avisar o grupo no chat
      </button>
      <p className="aviso">Você ({eu.nome}) e as outras pessoas do grupo editam este roteiro. A última mudança salva vale para todos.</p>
    </>
  );
}

// ───────── Votação ─────────

function Votacao({ g, eu }: { g: TGrupo; eu: Usuario }) {
  const [lista, setLista] = useState<Enquete[]>([]);
  const [pergunta, setPergunta] = useState('');
  const [opcoes, setOpcoes] = useState(['', '']);
  const [criando, setCriando] = useState(false);
  const carregar = useCallback(() => backend().enquetes(g.id).then(setLista), [g.id]);
  useEffect(() => {
    carregar();
    return backend().ouvir(g.id, (m) => m === 'enquetes' && carregar());
  }, [carregar, g.id]);

  const sugerirDestinos = async () => {
    const r = await backend().roteiro(g.id);
    const nomes = (r.viagem?.destinos ?? []).map((id) => buscarDestino(id)?.nome ?? '').filter(Boolean).slice(0, 6);
    setPergunta('Qual destino?');
    setOpcoes(nomes.length >= 2 ? nomes : ['', '']);
    setCriando(true);
  };

  return (
    <section className="votacao">
      {!criando ? (
        <div className="linha-form">
          <button type="button" className="botao curto" onClick={() => setCriando(true)}>
            Nova votação
          </button>
          <button type="button" className="botao contorno curto" onClick={sugerirDestinos}>
            Votar o destino
          </button>
        </div>
      ) : (
        <form
          className="form"
          onSubmit={async (e) => {
            e.preventDefault();
            const ops = opcoes.map((o) => o.trim()).filter(Boolean);
            if (!pergunta.trim() || ops.length < 2) return;
            const enq = await backend().criarEnquete(g.id, pergunta.trim(), ops);
            await backend().enviar(g.id, { cartao: { tipo: 'enquete', id: enq.id, pergunta: enq.pergunta } });
            setPergunta('');
            setOpcoes(['', '']);
            setCriando(false);
            carregar();
          }}
        >
          <label>
            Pergunta
            <input value={pergunta} onChange={(e) => setPergunta(e.target.value)} maxLength={120} placeholder="Ex.: Que semana a gente vai?" required />
          </label>
          {opcoes.map((o, i) => (
            <label key={i}>
              Opção {i + 1}
              <input value={o} onChange={(e) => setOpcoes(opcoes.map((x, k) => (k === i ? e.target.value : x)))} maxLength={60} required={i < 2} />
            </label>
          ))}
          {opcoes.length < 6 && (
            <button type="button" className="link-quiz" onClick={() => setOpcoes([...opcoes, ''])}>
              + Mais uma opção
            </button>
          )}
          <div className="linha-form">
            <button type="button" className="botao contorno" onClick={() => setCriando(false)}>
              Cancelar
            </button>
            <button type="submit" className="botao">
              Criar e avisar no chat
            </button>
          </div>
        </form>
      )}

      {lista.length === 0 && !criando && <p className="legenda">Nenhuma votação ainda. Use a votação para decidir destino, datas ou hotel.</p>}
      {lista.map((e) => {
        const total = Object.keys(e.votos).length;
        const meu = e.votos[eu.id];
        return (
          <div key={e.id} className="enquete">
            <h3>{e.pergunta}</h3>
            {e.opcoes.map((o, i) => {
              const n = Object.values(e.votos).filter((v) => v === i).length;
              const pct = total ? Math.round((n / total) * 100) : 0;
              return (
                <button
                  key={i}
                  type="button"
                  className={`opcao-enquete ${meu === i ? 'minha' : ''}`}
                  aria-pressed={meu === i}
                  onClick={async () => {
                    await backend().votar(e.id, i);
                    carregar();
                  }}
                >
                  <span className="barra" style={{ width: `${pct}%` }} aria-hidden="true" />
                  <span className="texto-opcao">
                    {meu === i ? '✓ ' : ''}
                    {o}
                  </span>
                  <span className="contagem">
                    {n} {n === 1 ? 'voto' : 'votos'}
                  </span>
                </button>
              );
            })}
            <p className="legenda">
              {total} {total === 1 ? 'pessoa votou' : 'pessoas votaram'}. Toque em outra opção para mudar o seu voto.
            </p>
          </div>
        );
      })}
    </section>
  );
}

// ───────── Pessoas e convite ─────────

function Pessoas({ g, eu }: { g: TGrupo; eu: Usuario }) {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [bloq, setBloq] = useState<string[]>([]);
  const [copiado, setCopiado] = useState('');
  const [sair, setSair] = useState(false);
  const carregar = () => {
    backend().membros(g.id).then(setMembros);
    backend().bloqueados().then(setBloq);
  };
  useEffect(carregar, [g.id]);
  const link = `${window.location.origin}${window.location.pathname}${rota.convite(g.codigo)}`;
  const convite = `Entre no grupo “${g.nome}” no PICO 6961 para planejar a viagem de ski: ${link} (código ${g.codigo})`;

  return (
    <section className="pessoas">
      <div className="cartao-seguro">
        <h3>Convidar amigos</h3>
        <p>
          Código do grupo: <strong className="codigo">{g.codigo}</strong>
        </p>
        <div className="linha-form">
          <a className="botao whatsapp curto" href={linkWhatsApp(convite)} target="_blank" rel="noopener" onClick={() => medir('Compartilhar', { canal: 'whatsapp', item: 'convite' })}>
            Convidar pelo WhatsApp
          </a>
          <button
            type="button"
            className="botao contorno curto"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(link);
                setCopiado('Link copiado.');
              } catch {
                setCopiado(link);
              }
            }}
          >
            Copiar link
          </button>
        </div>
        {copiado && <p className="legenda" role="status">{copiado}</p>}
      </div>

      <h3>
        {membros.length} {membros.length === 1 ? 'pessoa' : 'pessoas'}
      </h3>
      <ul className="lista-simples">
        {membros.map((m) => (
          <li key={m.usuarioId} className="item">
            <span>
              {m.nome}
              {m.usuarioId === eu.id && ' (você)'}
              {m.papel === 'dono' && <small> · criou o grupo</small>}
            </span>
            {m.usuarioId !== eu.id &&
              (bloq.includes(m.usuarioId) ? (
                <button type="button" className="link-quiz" onClick={async () => (await backend().desbloquear(m.usuarioId), carregar())}>
                  Desbloquear
                </button>
              ) : (
                <button type="button" className="link-quiz" onClick={async () => (await backend().bloquear(m.usuarioId), carregar())}>
                  Bloquear
                </button>
              ))}
          </li>
        ))}
      </ul>

      {sair ? (
        <div className="confirmar">
          <p>Sair do grupo “{g.nome}”? Para voltar, você precisa de um novo convite.</p>
          <div className="linha-form">
            <button type="button" className="botao contorno" onClick={() => setSair(false)}>
              Cancelar
            </button>
            <button
              type="button"
              className="botao perigo"
              onClick={async () => {
                await backend().sairDoGrupo(g.id);
                window.location.hash = rota.grupos;
              }}
            >
              Sair do grupo
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="link-perigo" onClick={() => setSair(true)}>
          Sair do grupo
        </button>
      )}
    </section>
  );
}
