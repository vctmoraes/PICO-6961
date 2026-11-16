import { useEffect, useState } from 'react';
import { buscarDestino, nivelLabel, type Destino as TDestino } from '../data/destinos';
import { checklistDoDestino } from '../data/checklist';
import { buscarClima, descricaoTempo, diaCurto, resumoCondicao, type Clima } from '../lib/clima';
import { checklistMarcados, perfil, perfilViajante, relatos, salvos, viagens, visitados, type Relato } from '../lib/storage';
import { combinar } from '../lib/combina';
import { custoDoDia, formatarFaixa, formatarReal } from '../lib/custo';
import { AdicionarAoRoteiro } from '../components/AdicionarAoRoteiro';
import { MandarParaGrupo } from '../components/MandarParaGrupo';
import { QuandoLota } from '../components/QuandoLota';
import { linkWhatsApp } from '../lib/compartilhar';
import { medir } from '../lib/medir';
import { Seguro } from '../components/Seguro';
import { linksNavegacao } from '../components/MapaPreguicoso';
import { MapaGoogle } from '../components/MapaGoogle';
import { emReal, useCotacoes } from '../lib/moeda';
import { linkHospedagem, linkOficial } from '../config';
import { rota } from '../lib/rota';
import { Icone } from '../components/Icone';
import { Paisagem } from '../components/Paisagem';

type Aba = 'geral' | 'dicas' | 'checklist' | 'avaliacoes';
const abas: { id: Aba; rotulo: string }[] = [
  { id: 'geral', rotulo: 'Visão geral' },
  { id: 'dicas', rotulo: 'Dicas' },
  { id: 'checklist', rotulo: 'Checklist' },
  { id: 'avaliacoes', rotulo: 'Avaliações' }
];

const corNivel = { iniciante: 'var(--ini-texto)', intermediario: 'var(--int-texto)', avancado: 'var(--ava-texto)' };

function precoPasse(d: TDestino): string {
  if (d.passe.valor == null) return d.passeInfo ? 'Dinâmico' : 'Consultar';
  const simbolo = { USD: 'US$', CLP: 'CLP$', ARS: 'AR$' }[d.passe.moeda];
  return `${simbolo} ${d.passe.valor.toLocaleString('pt-BR')}*`;
}

function melhorEpoca(d: TDestino): string {
  if (d.lat > 0) return 'Dez – Mar'; // hemisfério norte
  return d.temporada.toLowerCase().includes('outubro') ? 'Jun – Out' : 'Jun – Set';
}

export function Destino({ id, abaInicial }: { id: string; abaInicial?: string }) {
  const d = buscarDestino(id);
  const [aba, setAba] = useState<Aba>((abas.find((a) => a.id === abaInicial)?.id as Aba) ?? 'geral');
  const [salvo, setSalvo] = useState(() => salvos.tem(id));
  const [painel, setPainel] = useState(false);
  const [painelGrupo, setPainelGrupo] = useState(false);
  useEffect(() => {
    const d0 = buscarDestino(id);
    if (d0) medir('Destino aberto', { destino: d0.id, pais: d0.pais });
  }, [id]);
  const emRoteiros = viagens.listar().filter((v) => v.destinos.includes(id)).length;

  if (!d) {
    return (
      <main className="conteudo">
        <div className="vazio">
          Destino não encontrado. <a href={rota.buscar}>Ver todos os destinos</a>
        </div>
      </main>
    );
  }

  return (
    <div className="detalhe">
      <div className="hero">
        <Paisagem destino={d} />
        <div className="sombra" />
        <a className="botao-redondo esq" href={rota.buscar} aria-label="Voltar">
          <Icone nome="voltar" tamanho={18} />
        </a>
        <button
          className="botao-redondo dir"
          type="button"
          aria-label={salvo ? 'Remover dos destinos salvos' : 'Salvar destino'}
          aria-pressed={salvo}
          onClick={() => setSalvo(salvos.alternar(d.id))}
        >
          <Icone nome="marcador" tamanho={18} cheio={salvo} cor={salvo ? '#D9480F' : '#1C2321'} />
        </button>
        <div className="texto">
          <h1>{d.nome}</h1>
          <div>
            {d.pais} · {d.regiao}
          </div>
        </div>
      </div>

      <div className="blocos">
        <div className="bloco">
          <small>Nível</small>
          <strong style={{ color: corNivel[d.nivel] }}>{nivelLabel[d.nivel]}</strong>
        </div>
        <div className="bloco">
          <small>Melhor época</small>
          <strong>{melhorEpoca(d)}</strong>
        </div>
        <div className="bloco">
          <small>Passe (dia)</small>
          <strong>{precoPasse(d)}</strong>
          <PrecoEmReal d={d} />
        </div>
      </div>

      <CustoDoDia d={d} />

      <CombinaComVoce d={d} />

      <div className="acoes">
        {linkOficial(d.passe.urlOficial) && (
        <a className="acao primaria" href={linkOficial(d.passe.urlOficial)!} target="_blank" rel="noopener sponsored" onClick={() => medir('Link de afiliado', { tipo: 'passe', destino: d.id })}>
          <Icone nome="ticket" tamanho={18} cor="#D9480F" />
          <div>
            <div className="t">Comprar passe</div>
            <div className="s">No site oficial de {d.nome}</div>
          </div>
          <Icone nome="seta" tamanho={16} cor="#5B6660" />
        </a>
        )}
        <a className="acao secundaria" href={linkHospedagem(d.hospedagem.buscaReserva)} target="_blank" rel="noopener sponsored" onClick={() => medir('Link de afiliado', { tipo: 'hospedagem', destino: d.id })}>
          <Icone nome="cama" tamanho={18} cor="#13394A" />
          <div>
            <div className="t">Ver hospedagem</div>
            <div className="s">Hotéis em {d.hospedagem.buscaReserva.split(',')[0]}</div>
          </div>
          <Icone nome="seta" tamanho={16} cor="#5B6660" />
        </a>
        <BuscaVoo d={d} />
        <div className="acoes-montanha">
          <button type="button" className="acao secundaria compacta" onClick={() => setPainelGrupo(true)}>
            <Icone nome="pessoas" tamanho={18} cor="#13394A" />
            <div>
              <div className="t">Mandar para um grupo</div>
            </div>
          </button>
          <a
            className="acao secundaria compacta"
            href={linkWhatsApp(`${d.nome} (${d.regiao}, ${d.pais}) no PICO 6961: ${window.location.origin}${window.location.pathname}${rota.destino(d.id)}`)}
            target="_blank"
            rel="noopener"
            onClick={() => medir('Compartilhar', { canal: 'whatsapp', item: 'destino' })}
          >
            <Icone nome="compartilhar" tamanho={18} cor="#13394A" />
            <div>
              <div className="t">WhatsApp</div>
            </div>
          </a>
        </div>
        {(d.montanha?.cameras || d.montanha?.boletim) && (
          <div className="acoes-montanha">
            {linkOficial(d.montanha.cameras) && (
              <a className="acao secundaria compacta" href={linkOficial(d.montanha.cameras)!} target="_blank" rel="noopener">
                <Icone nome="camera" tamanho={18} cor="#13394A" />
                <div>
                  <div className="t">Câmeras ao vivo</div>
                  <div className="s">Site oficial</div>
                </div>
              </a>
            )}
            {linkOficial(d.montanha.boletim) && (
              <a className="acao secundaria compacta" href={linkOficial(d.montanha.boletim)!} target="_blank" rel="noopener">
                <Icone nome="montanha" tamanho={18} cor="#13394A" />
                <div>
                  <div className="t">Boletim da montanha</div>
                  <div className="s">Pistas e teleféricos</div>
                </div>
              </a>
            )}
          </div>
        )}
      </div>

      <div className="abas" role="tablist">
        {abas.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={aba === a.id}
            className={`aba ${aba === a.id ? 'ativa' : ''}`}
            onClick={() => setAba(a.id)}
          >
            {a.rotulo}
          </button>
        ))}
      </div>

      <div className="painel" role="tabpanel">
        {aba === 'geral' && <VisaoGeral d={d} />}
        {aba === 'dicas' &&
          (d.dicas.length ? (
            d.dicas.map((t) => (
              <div key={t} className="dica">
                {t}
              </div>
            ))
          ) : (
            <p className="legenda">Ainda não temos dicas de {d.nome}. Já esteve lá? Conte na aba Avaliações.</p>
          ))}
        {aba === 'checklist' && <Checklist d={d} />}
        {aba === 'avaliacoes' && <Avaliacoes d={d} />}
      </div>

      <div className="rodape-cta">
        <button type="button" className="botao" onClick={() => setPainel(true)}>
          {emRoteiros ? `No roteiro ✓ · Adicionar a outro` : 'Adicionar ao roteiro'}
        </button>
      </div>
      {painel && <AdicionarAoRoteiro destino={d} aoFechar={() => setPainel(false)} />}
      {painelGrupo && <MandarParaGrupo cartao={{ tipo: 'destino', id: d.id }} titulo={`Mandar ${d.nome} para um grupo`} aoFechar={() => setPainelGrupo(false)} />}
    </div>
  );
}

/** "Quanto custa 1 dia na montanha": passe + aluguel, por pessoa, ajustado ao perfil e em reais. */
function CustoDoDia({ d }: { d: TDestino }) {
  const p = perfilViajante.ler();
  const cot = useCotacoes();
  const c = custoDoDia(d, p, cot);
  const a = d.aluguel;
  const temPerfil = p.equipamento !== undefined || p.esporte !== undefined;
  return (
    <section className="custo-dia" aria-labelledby="titulo-custo-dia">
      <h2 id="titulo-custo-dia">Quanto custa 1 dia na montanha</h2>
      <p className="legenda">Por pessoa{temPerfil ? ', ajustado ao seu perfil' : ''}.</p>
      <dl>
        {c.linhas.map((l) => (
          <div key={l.rotulo} className={l.semValor ? 'sem-valor' : ''}>
            <dt>{l.rotulo}</dt>
            <dd>
              {l.valor}
              {l.real && <small>≈ {formatarReal(l.real[0], l.real[1])}</small>}
            </dd>
          </div>
        ))}
        {c.total && (
          <div className="total">
            <dt>Total{c.parcial ? ' (sem os itens a consultar)' : ''}</dt>
            <dd>≈ {formatarReal(c.total[0], c.total[1])}</dd>
          </div>
        )}
      </dl>
      {p.equipamento === 'tudo' && <p className="legenda">Você tem todo o equipamento: o aluguel ficou fora da conta.</p>}
      {a?.dica && <p className="dica-custo">{a.dica}</p>}
      <p className="aviso">
        {a ? (
          <>
            Aluguel: valor médio de referência ({a.onde}, {new Date(`${a.verificadoEm}-15T12:00:00`).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}).{' '}
            {a.confianca === 'baixa' && 'A fonte não confirma a data do preço. '}
            Fonte:{' '}
            {a.fontes.map((f, i) => (
              <span key={f.url}>
                {i > 0 && ' · '}
                <a href={f.url} target="_blank" rel="noopener">
                  {f.nome}
                </a>
              </span>
            ))}
            . O preço muda com a loja e com a data.
          </>
        ) : (
          'Ainda não temos o valor médio do aluguel deste destino. Consulte as lojas da região.'
        )}
        {!cot && ' O valor em real aparece com a cotação do dia.'}
        {!temPerfil && (
          <>
            {' '}
            <a href={rota.questionario}>Ajuste ao seu perfil</a>.
          </>
        )}
      </p>
    </section>
  );
}

/** Nota de combinação com o perfil, os motivos e o botão do Passaporte de Picos. */
function CombinaComVoce({ d }: { d: TDestino }) {
  const p = perfilViajante.ler();
  const [visitei, setVisitei] = useState(() => visitados.tem(d.id));
  const tem = perfilViajante.temRespostas(p);
  const c = tem ? combinar(d, p) : null;
  return (
    <div className="combina-bloco">
      {c ? (
        <div className={`combina-cartao ${c.nota >= 70 ? 'alta' : c.nota >= 45 ? 'media' : 'baixa'}`}>
          <strong>Combina {c.nota}% com você</strong>
          {c.aFavor.length > 0 && (
            <ul>
              {c.aFavor.slice(0, 3).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
          {c.atencao.length > 0 && (
            <ul className="atencao">
              {c.atencao.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <a className="link-perfil" href={rota.questionario}>
          Faça o seu perfil e veja se {d.nome} combina com você →
        </a>
      )}
      <button
        type="button"
        className={`botao-visita ${visitei ? 'ativo' : ''}`}
        aria-pressed={visitei}
        onClick={() => setVisitei(visitados.alternar(d.id))}
      >
        {visitei ? '✓ Já esquiei aqui' : 'Já esquiei aqui'}
      </button>
    </div>
  );
}

/** Busca de voo no Google Voos, do aeroporto do perfil até o aeroporto do destino. */
function BuscaVoo({ d }: { d: TDestino }) {
  const saida = perfilViajante.ler().saida;
  if (!saida || !d.aeroporto) return null;
  const url = `https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights from ${saida} to ${d.aeroporto}`)}&hl=pt-BR&curr=BRL`;
  return (
    <a className="acao secundaria" href={url} target="_blank" rel="noopener" onClick={() => medir('Link de afiliado', { tipo: 'voo', destino: d.id })}>
      <Icone nome="aviao" tamanho={18} cor="#13394A" />
      <div>
        <div className="t">
          Ver voos {saida} → {d.aeroporto}
        </div>
        <div className="s">No Google Voos, com o aeroporto do seu perfil</div>
      </div>
      <Icone nome="seta" tamanho={16} cor="#5B6660" />
    </a>
  );
}

function PrecoEmReal({ d }: { d: TDestino }) {
  const cot = useCotacoes();
  const r = d.passe.valor != null ? emReal(d.passe.valor, d.passe.moeda, cot) : null;
  return r ? <small className="em-real">{r}</small> : null;
}

function CondicaoAgora({ d }: { d: TDestino }) {
  const [clima, setClima] = useState<Clima | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let vivo = true;
    setClima(null);
    setErro(false);
    buscarClima(d)
      .then((c) => vivo && setClima(c))
      .catch(() => vivo && setErro(true));
    return () => {
      vivo = false;
    };
  }, [d]);

  if (erro) {
    return (
      <div className="condicao erro">
        <div className="manchete">Não foi possível carregar a condição agora. Confira a conexão e abra o destino de novo.</div>
      </div>
    );
  }
  if (!clima) {
    return (
      <div className="condicao" aria-busy="true">
        <div className="manchete">Carregando a condição da montanha…</div>
      </div>
    );
  }
  return (
    <div className="condicao">
      {clima.exemplo && (
        <div className="manchete" style={{ color: 'var(--ava-texto)' }}>
          Dados de exemplo. A pré-visualização não acessa a API de tempo. No app publicado, o dado é real.
        </div>
      )}
      <div className="manchete">Condição agora: {resumoCondicao(clima)}</div>
      <div className="grade">
        <div>
          <small>Topo ({d.altitudeTopo} m)</small>
          <strong>
            {Math.round(clima.topo.temperatura)}°C · {descricaoTempo(clima.topo.codigo)}
          </strong>
        </div>
        <div>
          <small>Base ({d.altitudeBase} m)</small>
          <strong>
            {Math.round(clima.base.temperatura)}°C · {descricaoTempo(clima.base.codigo)}
          </strong>
        </div>
        <div>
          <small>Neve nova (24h)</small>
          <strong>{clima.neve24hCm} cm</strong>
        </div>
        <div>
          <small>Vento no topo</small>
          <strong>{Math.round(clima.topo.vento)} km/h</strong>
        </div>
        {clima.topo.neveNoSoloCm != null && (
          <div>
            <small>Neve no solo (topo, estimativa)</small>
            <strong>{clima.topo.neveNoSoloCm} cm</strong>
          </div>
        )}
        <div>
          <small>Sensação no topo</small>
          <strong>{Math.round(clima.topo.sensacao)}°C</strong>
        </div>
      </div>
      <div className="previsao" aria-label="Previsão no topo">
        {clima.previsao.map((p) => (
          <div key={p.data}>
            {diaCurto(p.data)}
            <strong>{p.neveCm > 0 ? `${p.neveCm} cm` : '—'}</strong>
            {p.min}° / {p.max}°
          </div>
        ))}
      </div>
      <div className="credito">
        Previsão do modelo meteorológico, não é boletim oficial do resort.{' '}
        {linkOficial(d.montanha?.boletim) && (
          <>
            <a href={linkOficial(d.montanha?.boletim)!} target="_blank" rel="noopener">
              Ver o boletim oficial
            </a>
            .{' '}
          </>
        )}
        Dados:{' '}
        <a href="https://open-meteo.com/" target="_blank" rel="noopener">
          Open-Meteo.com
        </a>{' '}
        (CC BY 4.0).
      </div>
    </div>
  );
}

function VisaoGeral({ d }: { d: TDestino }) {
  return (
    <>
      <CondicaoAgora d={d} />
      <p>{d.resumo}</p>
      {d.destaques.map((t) => (
        <div key={t} className="dica">
          {t}
        </div>
      ))}

      {d.rede && (
        <p className="selo-rede">
          Aceita o <strong>{d.rede}</strong>, passe de temporada que vale em vários resorts.
        </p>
      )}

      <h3>A montanha</h3>
      {d.pistas && (
        <>
          <div className="barra-pistas" aria-hidden="true">
            <div style={{ width: `${d.pistas.iniciante}%`, background: 'var(--ini-texto)' }} />
            <div style={{ width: `${d.pistas.intermediario}%`, background: '#D9A441' }} />
            <div style={{ width: `${d.pistas.avancado}%`, background: 'var(--ava-texto)' }} />
          </div>
          <div className="legenda-pistas">
            <span><i style={{ background: 'var(--ini-texto)' }} />Iniciante {d.pistas.iniciante}%</span>
            <span><i style={{ background: '#D9A441' }} />Intermediário {d.pistas.intermediario}%</span>
            <span><i style={{ background: 'var(--ava-texto)' }} />Avançado {d.pistas.avancado}%</span>
          </div>
        </>
      )}
      <p className="legenda">
        {d.kmPista ? `Cerca de ${d.kmPista} km de pista · ` : ''}Altitude de {d.altitudeBase.toLocaleString('pt-BR')} m a {d.altitudeTopo.toLocaleString('pt-BR')} m ·
        Temporada: {d.temporada.toLowerCase()}
      </p>

      <QuandoLota d={d} />

      <h3>Onde fica</h3>
      <MapaGoogle destino={d} />
      <p className="legenda">Arraste e use 2 dedos para dar zoom. <a href={rota.mapa}>Ver todos os destinos no mapa</a>.</p>
      <div className="acoes-montanha">
        <a className="acao secundaria compacta" href={linksNavegacao(d.nome, d.regiao, d.pais).google} target="_blank" rel="noopener">
          <Icone nome="pino" tamanho={18} cor="#13394A" />
          <div>
            <div className="t">Google Maps</div>
          </div>
        </a>
        <a className="acao secundaria compacta" href={linksNavegacao(d.nome, d.regiao, d.pais).apple} target="_blank" rel="noopener">
          <Icone nome="mapa" tamanho={18} cor="#13394A" />
          <div>
            <div className="t">Apple Maps</div>
          </div>
        </a>
      </div>

      <h3>Como chegar</h3>
      <p>{d.comoChegar}</p>

      <h3>Onde ficar</h3>
      <p>{d.hospedagem.resumo}</p>

      <a className="acao secundaria compacta" href={rota.comparar([d.id])}>
        <Icone nome="comparar" tamanho={18} cor="#13394A" />
        <div>
          <div className="t">Comparar {d.nome} com outro destino</div>
        </div>
        <Icone nome="seta" tamanho={16} cor="#5B6660" />
      </a>

      <Seguro />
      {d.pais === 'Argentina' && (
        <p className="aviso">
          <strong>Câmbio na Argentina:</strong> o valor em real depende de como você paga (cartão, dinheiro em espécie ou conta
          internacional). As cotações podem ser diferentes. Compare antes de pagar.
        </p>
      )}

      {d.fonteDados === 'openskimap' && (
        <p className="aviso">
          <strong>Fonte:</strong> altitude, pistas e site vêm do OpenSkiMap, com dados do{' '}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">
            OpenStreetMap
          </a>{' '}
          (ODbL).{' '}
          {d.revisadoEm
            ? `Texto e dicas: equipe do PICO 6961, revisados em ${new Date(`${d.revisadoEm}T12:00:00`).toLocaleDateString('pt-BR')}.`
            : 'A equipe do PICO 6961 ainda não revisou este destino.'}
        </p>
      )}
      {!d.verificadoEm && d.fonteDados !== 'openskimap' && (
        <p className="aviso">
          <strong>Dados em conferência:</strong> altitude, pistas e temporada são valores de referência. Confira no site oficial
          antes de viajar.
        </p>
      )}
      {d.passe.valor != null ? (
        <p className="aviso">
          <strong>* Preço do passe:</strong>{' '}
          {d.passe.verificadoEm
            ? `valor de referência, verificado em ${new Date(d.passe.verificadoEm).toLocaleDateString('pt-BR')}.`
            : 'valor estimado, ainda não confirmado no site oficial.'}{' '}
          O preço muda com a data e a temporada. Confira no site oficial antes de comprar.
        </p>
      ) : d.passeInfo ? (
        <p className="aviso">
          <strong>Preço do passe:</strong> {d.passeInfo}
        </p>
      ) : (
        <p className="aviso">
          <strong>Preço do passe:</strong> ainda sem valor de referência. Consulte o centro de ski.
        </p>
      )}
      <p className="aviso">
        O PICO 6961 só informa. A decisão de praticar o esporte é sua. Ver os <a href={rota.termos}>termos de uso</a>.
      </p>
    </>
  );
}

function Checklist({ d }: { d: TDestino }) {
  const grupos = checklistDoDestino(d, perfilViajante.ler());
  const [marcados, setMarcados] = useState(() => checklistMarcados.listar(d.id));
  const total = grupos.reduce((s, g) => s + g.itens.length, 0);
  const feitos = grupos.reduce((s, g) => s + g.itens.filter((i) => marcados.includes(i)).length, 0);

  return (
    <>
      <div>
        <div className="legenda" style={{ marginBottom: 6 }}>
          {feitos} de {total} itens prontos
        </div>
        <div className="progresso">
          <div style={{ width: `${(feitos / total) * 100}%` }} />
        </div>
      </div>
      {grupos.map((g) => (
        <div key={g.titulo}>
          <h3>{g.titulo}</h3>
          {g.titulo === 'Equipamento' && d.aluguel?.equipamento && perfilViajante.ler().equipamento !== 'tudo' && (
            <p className="legenda">
              Aluguel: {formatarFaixa(d.aluguel.equipamento, d.aluguel.moeda)} por dia ({d.aluguel.onde}). Veja o custo completo na Visão geral.
            </p>
          )}
          {g.itens.map((item) => {
            const feito = marcados.includes(item);
            return (
              <label key={item} className={`check ${feito ? 'feito' : ''}`}>
                <input type="checkbox" checked={feito} onChange={() => setMarcados(checklistMarcados.alternar(d.id, item))} />
                <span>{item}</span>
              </label>
            );
          })}
        </div>
      ))}
    </>
  );
}

function Avaliacoes({ d }: { d: TDestino }) {
  const [lista, setLista] = useState<Relato[]>(() => relatos.listar(d.id));
  const [nota, setNota] = useState(0);
  const [nome, setNome] = useState(perfil.nome());
  const [texto, setTexto] = useState('');

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nota || !texto.trim()) return;
    relatos.adicionar({ destinoId: d.id, nome: nome.trim() || 'Anônimo', nota, texto: texto.trim(), data: new Date().toISOString() });
    setLista(relatos.listar(d.id));
    setNota(0);
    setTexto('');
  };

  return (
    <>
      {lista.length === 0 && <p className="legenda">Ainda não há relatos de {d.nome}. Já esteve lá? Conte como foi.</p>}
      {lista.map((r) => (
        <div key={r.data} className="relato">
          <div className="linha">
            <strong>{r.nome}</strong>
            <span className="estrelas" aria-label={`${r.nota} de 5 estrelas`}>
              {'★'.repeat(r.nota)}
              {'☆'.repeat(5 - r.nota)}
            </span>
          </div>
          <div>{r.texto}</div>
          <div className="legenda">{new Date(r.data).toLocaleDateString('pt-BR')}</div>
        </div>
      ))}

      <form className="form" onSubmit={enviar}>
        <h3>Escrever um relato</h3>
        <div className="seletor-estrelas" role="radiogroup" aria-label="Nota">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={nota === n}
              aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
              className={n <= nota ? 'on' : ''}
              onClick={() => setNota(n)}
            >
              ★
            </button>
          ))}
        </div>
        <label>
          Seu nome
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como quer aparecer" maxLength={40} />
        </label>
        <label>
          Seu relato
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Quando foi, como estava a neve, dicas…" maxLength={600} />
        </label>
        <button className="botao secundario" type="submit" disabled={!nota || !texto.trim()}>
          Publicar relato
        </button>
        <p className="aviso">
          Versão de teste: o relato fica salvo só neste aparelho. Você mantém o direito sobre o que escreve. O PICO 6961 recebe só licença para exibir.
        </p>
      </form>
    </>
  );
}
