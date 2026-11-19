import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '../components/Badge';
import { CabecalhoVolta } from '../components/Nav';
import { cores, dicasBota, estilos, FONTES, skiOuSnowboard, type Equipamento as Equip, type EstiloId } from '../data/equipamento';
import { terrenoVerificadoEm } from '../data/terreno';
import { destinos } from '../data/destinos';
import { destinosParaConsulta, estiloValido, estilosPara, precisaPranchaLarga, tamanhoSki, tamanhoSnowboard, type Consulta, type Tamanho } from '../lib/consultor';
import { linkSeguro } from '../lib/link';
import { medir } from '../lib/medir';
import { rota } from '../lib/rota';
import { perfilViajante, type NivelViajante } from '../lib/storage';
import '../consultor.css';

const CHAVE = 'pico.consultor';
type Escolhas = { modalidade: Consulta['modalidade']; nivel: NivelViajante | ''; estilo: EstiloId };

const niveis: { valor: NivelViajante; rotulo: string; detalhe: string }[] = [
  { valor: 'nunca', rotulo: 'Nunca fui', detalhe: 'Primeira vez na neve' },
  { valor: 'iniciante', rotulo: 'Iniciante', detalhe: 'Desço pista verde com cuidado' },
  { valor: 'intermediario', rotulo: 'Intermediário', detalhe: 'Desço pista azul com controle' },
  { valor: 'avancado', rotulo: 'Avançado', detalhe: 'Desço pista preta' },
  { valor: 'expert', rotulo: 'Expert', detalhe: 'Fora de pista e terreno íngreme' }
];
const modalidades: { valor: Consulta['modalidade']; rotulo: string }[] = [
  { valor: 'ski', rotulo: 'Ski' },
  { valor: 'snowboard', rotulo: 'Snowboard' },
  { valor: 'indeciso', rotulo: 'Ainda não sei' }
];

function inicial(): Escolhas {
  try {
    const salvo = sessionStorage.getItem(CHAVE);
    if (salvo) {
      const e = JSON.parse(salvo) as Partial<Escolhas>;
      const modalidade = modalidades.some((m) => m.valor === e.modalidade) ? e.modalidade! : 'ski';
      const nivel = niveis.some((n) => n.valor === e.nivel) ? e.nivel! : '';
      const estilo = estilos.some((s) => s.id === e.estilo) ? e.estilo! : 'all-mountain';
      return { modalidade, nivel, estilo };
    }
  } catch { /* sessão opcional */ }
  const p = perfilViajante.ler();
  const modalidade = p.esporte === 'snowboard' ? 'snowboard' : p.esporte === 'indeciso' ? 'indeciso' : 'ski';
  return { modalidade, nivel: p.nivel ?? '', estilo: 'all-mountain' };
}

const regioes = [
  { id: 'sul', titulo: 'Chile e Argentina', temporada: 'temporada de junho a setembro', quantos: 3, filtro: (d: { pais: string }) => d.pais !== 'Estados Unidos' },
  { id: 'eua', titulo: 'Estados Unidos', temporada: 'temporada de dezembro a março', quantos: 3, filtro: (d: { pais: string }) => d.pais === 'Estados Unidos' }
];

const numero = (v: string) => (v.trim() === '' ? undefined : Number(v));
const faixaCm = ([a, b]: [number, number]) => `${a} a ${b} cm`;

export function Equipamento() {
  const [esc, setEsc] = useState<Escolhas>(inicial);
  // Altura, peso e calçado ficam só na memória desta tela: o app não guarda.
  const [medidas, setMedidas] = useState({ altura: '', peso: '', calcado: '' });
  const medido = useRef(false);

  const nivel = esc.nivel || undefined;
  const opcoes = nivel ? estilosPara(esc.modalidade, nivel) : [];
  const estilo = nivel ? estiloValido({ modalidade: esc.modalidade, nivel, estilo: esc.estilo }) : esc.estilo;
  const consulta: Consulta | null = nivel ? { modalidade: esc.modalidade, nivel, estilo, altura: numero(medidas.altura), peso: numero(medidas.peso), calcado: numero(medidas.calcado) } : null;
  const dados = estilos.find((e) => e.id === estilo)!;
  // Duas regiões, para a América do Sul não sumir atrás dos resorts grandes dos EUA (e as temporadas são opostas).
  const grupos = useMemo(() => (consulta ? regioes.map((r) => ({ ...r, itens: destinosParaConsulta(consulta, destinos.filter(r.filtro), r.quantos) })).filter((g) => g.itens.length) : []), [esc.modalidade, nivel, estilo]);

  useEffect(() => {
    try { sessionStorage.setItem(CHAVE, JSON.stringify(esc)); } catch { /* sessão opcional */ }
  }, [esc]);
  useEffect(() => {
    if (!nivel || medido.current) return;
    medido.current = true;
    medir('Consultor de equipamento', { modalidade: esc.modalidade, nivel, estilo });
  }, [nivel, esc.modalidade, estilo]);

  const muda = (parcial: Partial<Escolhas>) => setEsc((e) => ({ ...e, ...parcial }));
  const fontesUsadas = dados.fontes.map((i) => FONTES[i - 1]).filter(Boolean);

  return (
    <main className="conteudo consultor">
      <CabecalhoVolta titulo="Ski ou prancha para você" />
      <p>Responda 3 perguntas. O app mostra o tipo de equipamento, um tamanho de partida, as pistas e as montanhas com terreno para o seu jeito de andar.</p>

      <form className="form consultor-form" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="consultor-grupo">
          <legend>O que você pratica?</legend>
          <div className="consultor-opcoes linha">
            {modalidades.map((m) => (
              <label key={m.valor}>
                <input type="radio" name="modalidade" checked={esc.modalidade === m.valor} onChange={() => muda({ modalidade: m.valor })} />
                {m.rotulo}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="consultor-grupo">
          <legend>Qual é o seu nível?</legend>
          <div className="consultor-opcoes">
            {niveis.map((n) => (
              <label key={n.valor}>
                <input type="radio" name="nivel" checked={esc.nivel === n.valor} onChange={() => muda({ nivel: n.valor })} />
                <span><strong>{n.rotulo}</strong><small>{n.detalhe}</small></span>
              </label>
            ))}
          </div>
        </fieldset>

        {nivel && opcoes.length > 1 && (
          <fieldset className="consultor-grupo">
            <legend>Como você gosta de andar?</legend>
            <div className="consultor-opcoes">
              {opcoes.map((id) => {
                const e = estilos.find((x) => x.id === id)!;
                return (
                  <label key={id}>
                    <input type="radio" name="estilo" checked={estilo === id} onChange={() => muda({ estilo: id })} />
                    <span><strong>{e.rotulo}</strong><small>{e.detalhe}</small></span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}
        {nivel && opcoes.length === 1 && (
          <p className="legenda">{esc.modalidade === 'indeciso' && !['nunca', 'iniciante'].includes(nivel) ? 'Escolha ski ou snowboard para ver os estilos.' : 'No começo, o foco é aprender em pista fácil. O estilo vem depois.'}</p>
        )}

        <details className="consultor-medidas">
          <summary>Tamanho de partida (opcional)</summary>
          <div className="linha-form">
            <label>Altura (cm)<input type="number" inputMode="numeric" min={120} max={215} value={medidas.altura} onChange={(e) => setMedidas({ ...medidas, altura: e.target.value })} /></label>
            <label>Peso (kg)<input type="number" inputMode="numeric" min={30} max={160} value={medidas.peso} onChange={(e) => setMedidas({ ...medidas, peso: e.target.value })} /></label>
            {esc.modalidade !== 'ski' && (
              <label>Calçado (BR)<input type="number" inputMode="numeric" min={30} max={52} value={medidas.calcado} onChange={(e) => setMedidas({ ...medidas, calcado: e.target.value })} /></label>
            )}
          </div>
          <p className="aviso">Usamos só para calcular a faixa de tamanho. O app não guarda altura, peso nem calçado.</p>
        </details>
      </form>

      {!consulta && <p className="consultor-vazio">Escolha o seu nível para ver a recomendação.</p>}

      {consulta && (
        <section className="consultor-resultado" aria-labelledby="consultor-titulo">
          <h2 id="consultor-titulo">{esc.modalidade === 'indeciso' ? 'Para começar' : dados.rotulo}</h2>

          {esc.modalidade === 'indeciso' && (
            <div className="consultor-indeciso">
              <p><strong>Ski:</strong> {skiOuSnowboard.ski}</p>
              <p><strong>Snowboard:</strong> {skiOuSnowboard.snowboard}</p>
              <p>{skiOuSnowboard.conselho}</p>
            </div>
          )}

          {(esc.modalidade === 'ski' || esc.modalidade === 'indeciso') && dados.ski && (
            <CartaoEquipamento equip={dados.ski} tamanho={tamanhoSki(consulta)} />
          )}
          {(esc.modalidade === 'snowboard' || esc.modalidade === 'indeciso') && dados.snowboard && (
            <CartaoEquipamento equip={dados.snowboard} tamanho={tamanhoSnowboard(consulta)} largura={precisaPranchaLarga(consulta.calcado)} />
          )}

          <details className="consultor-bota">
            <summary>A bota vem primeiro</summary>
            <ul>{dicasBota.map((d) => <li key={d}>{d}</li>)}</ul>
          </details>

          <h2>Onde andar</h2>
          <ul className="consultor-lista">{dados.pistas.map((p) => <li key={p}>{p}</li>)}</ul>
          <p className="aviso">{cores.sulEuropa} {cores.eua} {cores.relativo}</p>

          <h2>Montanhas com esse terreno</h2>
          {grupos.length ? (
            <>
              <p className="legenda">Entre os destinos revisados do app. Os motivos vêm do texto do destino e de pesquisa nos sites oficiais (em {terrenoVerificadoEm.split('-').reverse().join('/')}); toque no motivo para ver a fonte.</p>
              {grupos.map((g) => (
                <section key={g.id} className="consultor-regiao" aria-labelledby={`regiao-${g.id}`}>
                  <h3 id={`regiao-${g.id}`}>{g.titulo} <small>· {g.temporada}</small></h3>
                  <ul className="consultor-destinos">
                    {g.itens.map(({ destino, motivos, atencao }) => (
                      <li key={destino.id}>
                        <div className="consultor-destino-topo">
                          <a href={rota.destino(destino.id)}>{destino.nome}</a>
                          <Badge nivel={destino.nivel} />
                        </div>
                        <p className="legenda">{destino.pais} · {destino.regiao}</p>
                        {motivos.length > 0 && (
                          <ul className="consultor-motivos" aria-label={`Terreno em ${destino.nome}`}>
                            {motivos.slice(0, 4).map((m) => {
                              const href = m.origem === 'pesquisa' ? linkSeguro(m.fonte) : null;
                              return <li key={m.tag}>{href ? <a href={href} target="_blank" rel="noopener noreferrer">{m.texto}</a> : m.texto}</li>;
                            })}
                          </ul>
                        )}
                        {atencao.length > 0 && <p className="atencao-plano">{atencao.join(' · ')}</p>}
                      </li>
                    ))}
                  </ul>
                  {g.itens.length > 1 && (
                    <a className="botao contorno curto" href={rota.comparar(g.itens.map((s) => s.destino.id))}>Comparar {g.itens.length === 2 ? 'as duas' : `as ${g.itens.length}`}</a>
                  )}
                </section>
              ))}
              <a className="botao contorno curto" href={rota.planejar}>Planejar viagem</a>
            </>
          ) : (
            <p className="legenda">Ainda não temos um destino revisado com esse terreno confirmado. <a href={rota.buscar}>Buscar montanhas</a>.</p>
          )}

          {fontesUsadas.length > 0 && (
            <details className="consultor-fontes">
              <summary>Fontes</summary>
              <ul>
                {fontesUsadas.map((f) => {
                  const href = linkSeguro(f.url);
                  return <li key={f.url}>{href ? <a href={href} target="_blank" rel="noopener noreferrer">{f.titulo}</a> : f.titulo}</li>;
                })}
              </ul>
            </details>
          )}
          <p className="aviso">Faixas de tamanho são ponto de partida. Confirme na loja, com a bota calçada. O PICO 6961 só informa: a decisão de praticar o esporte é sua.</p>
        </section>
      )}
    </main>
  );
}

function CartaoEquipamento({ equip, tamanho, largura }: { equip: Equip; tamanho: Tamanho | null; largura?: ReturnType<typeof precisaPranchaLarga> }) {
  return (
    <article className="consultor-equip">
      <h3>{equip.nome}</h3>
      {tamanho ? (
        <p className="consultor-tamanho"><strong>Tamanho de partida: {faixaCm(tamanho.faixa)}</strong> · {tamanho.referencia}.{tamanho.observacao ? ` ${tamanho.observacao}` : ''}</p>
      ) : (
        <p className="legenda">Informe a altura em “Tamanho de partida” para ver uma faixa em centímetros.</p>
      )}
      {largura && largura !== 'nao' && (
        <p className="consultor-tamanho">{largura === 'sim' ? 'Pelo seu calçado, peça uma prancha wide (larga).' : 'Pelo seu calçado, confira se a bota não passa da borda. Se passar, peça uma prancha wide (larga).'}</p>
      )}
      <dl className="consultor-carac">
        {equip.caracteristicas.map((c) => (
          <div key={c.item}>
            <dt>{c.item}</dt>
            <dd><strong>{c.valor}</strong><span>{c.porque}</span></dd>
          </div>
        ))}
      </dl>
      <h4>Peça na loja</h4>
      <ul className="consultor-lista">{equip.pedirNaLoja.map((p) => <li key={p}>{p}</li>)}</ul>
    </article>
  );
}

