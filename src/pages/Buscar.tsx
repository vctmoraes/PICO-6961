import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { destinos, buscarDestino, nivelLabel, paises, type Destino, type Nivel, type Pais } from '../data/destinos';
import { DestinoCard } from '../components/DestinoCard';
import { Icone } from '../components/Icone';
import { CabecalhoVolta } from '../components/Nav';
import { rota } from '../lib/rota';
import '../descoberta.css';

const normalizar = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const POR_PAGINA = 40;
export const MAX_COMPARAR = 3;
export const idsValidos = (ids: string[]) => [...new Set(ids)].filter(buscarDestino).slice(0, MAX_COMPARAR);
export const temCuradoria = (d: Destino) => d.fonteDados !== 'openskimap' || Boolean(d.revisadoEm);
const regiaoDoFiltro = (d: Destino) => d.pais === 'Estados Unidos' ? d.regiao.split(', ').pop() ?? d.regiao : '';
const estados = [...new Set(destinos.map(regiaoDoFiltro).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
const indice = [...destinos].sort((a, b) =>
  Number(temCuradoria(b)) - Number(temCuradoria(a)) || paises.indexOf(a.pais) - paises.indexOf(b.pais) ||
  (a.pais === 'Estados Unidos' ? regiaoDoFiltro(a).localeCompare(regiaoDoFiltro(b), 'pt-BR') || a.nome.localeCompare(b.nome) : b.lat - a.lat)
).map((d) => ({ d, texto: normalizar(`${d.nome} ${d.regiao} ${d.cidadeBase} ${d.pais} ${d.pais === 'Estados Unidos' ? 'EUA USA' : ''}`) }));

export function consultarDestinos(texto: string) {
  const termos = normalizar(texto).trim().split(/\s+/).filter(Boolean);
  return indice.filter((item) => termos.every((termo) => item.texto.includes(termo))).map(({ d }) => d);
}

type Busca = { texto: string; nivel: Nivel | ''; pais: Pais | ''; estado: string; orcamento: number; fonte: '' | 'curadoria' | 'base'; mostrar: number; ids: string[] };
const padrao = (iniciantes = false): Busca => ({ texto: '', nivel: iniciantes ? 'iniciante' : '', pais: '', estado: '', orcamento: 0, fonte: '', mostrar: POR_PAGINA, ids: [] });
function lerSessao(chave: string) {
  try { return sessionStorage.getItem(chave); } catch { return null; }
}
function salvarSessao(chave: string, valor: string) {
  try { sessionStorage.setItem(chave, valor); } catch { /* armazenamento opcional */ }
}
function lerBusca(chave: string, iniciantes: boolean): Busca {
  const base = padrao(iniciantes);
  try {
    const x = JSON.parse(lerSessao(chave) ?? 'null') as Partial<Busca> | null;
    if (!x) return base;
    const pais = x.pais && paises.includes(x.pais) ? x.pais : '';
    return {
      texto: typeof x.texto === 'string' ? x.texto : '',
      pais,
      nivel: x.nivel === '' || (x.nivel && Object.prototype.hasOwnProperty.call(nivelLabel, x.nivel)) ? x.nivel : base.nivel,
      estado: pais === 'Estados Unidos' && x.estado && estados.includes(x.estado) ? x.estado : '',
      orcamento: x.orcamento && [70, 80, 95].includes(x.orcamento) ? x.orcamento : 0,
      fonte: x.fonte === 'curadoria' || x.fonte === 'base' ? x.fonte : '',
      mostrar: Number.isInteger(x.mostrar) ? Math.max(POR_PAGINA, Math.min(destinos.length, x.mostrar!)) : POR_PAGINA,
      ids: Array.isArray(x.ids) ? idsValidos(x.ids.filter((id) => typeof id === 'string')) : []
    };
  } catch { return base; }
}

export function Buscar() {
  const hash = window.location.hash;
  return <Resultados key={hash} hash={hash} iniciantes={hash.replace(/^#\/?/, '') === 'buscar-iniciantes'} />;
}

function Resultados({ hash, iniciantes }: { hash: string; iniciantes: boolean }) {
  const chave = iniciantes ? 'pt.busca.iniciantes.v1' : 'pt.busca.v1';
  const chaveScroll = `${chave}.scroll`;
  const [busca, setBusca] = useState(() => lerBusca(chave, iniciantes));
  const campoBusca = useRef<HTMLInputElement>(null);
  const linkComparar = useRef<HTMLAnchorElement>(null);
  const { texto, nivel, pais, estado, orcamento, fonte, mostrar, ids } = busca;
  const mudarFiltro = (filtro: Partial<Busca>) => setBusca((x) => ({ ...x, ...filtro, mostrar: POR_PAGINA }));
  const salvarScroll = useCallback(() => {
    if (location.hash === hash) salvarSessao(chaveScroll, String(window.scrollY));
  }, [chaveScroll, hash]);
  useLayoutEffect(() => {
    const y = Number(lerSessao(chaveScroll));
    window.scrollTo(0, Number.isFinite(y) && y >= 0 ? y : 0);
    window.addEventListener('scroll', salvarScroll, { passive: true });
    window.addEventListener('pagehide', salvarScroll);
    return () => {
      window.removeEventListener('scroll', salvarScroll);
      window.removeEventListener('pagehide', salvarScroll);
    };
  }, [chaveScroll, salvarScroll]);
  useLayoutEffect(() => salvarSessao(chave, JSON.stringify(busca)), [chave, busca]);

  const lista = consultarDestinos(texto).filter((d) =>
    (!nivel || d.nivel === nivel) && (!pais || d.pais === pais) && (!estado || regiaoDoFiltro(d) === estado) &&
    (!fonte || temCuradoria(d) === (fonte === 'curadoria')) &&
    (!orcamento || (d.passe.moeda === 'USD' && d.passe.valor != null && d.passe.valor <= orcamento))
  );
  const limpar = () => {
    campoBusca.current?.focus();
    setBusca((x) => ({ ...padrao(iniciantes), ids: x.ids }));
  };
  const alternar = (id: string) => setBusca((x) => ({ ...x, ids: x.ids.includes(id) ? x.ids.filter((i) => i !== id) : idsValidos([...x.ids, id]) }));
  const selecionados = ids.flatMap((id) => buscarDestino(id) ?? []);

  return (
    <main className="conteudo descoberta" onClickCapture={(e) => { if ((e.target as Element).closest('a[href]')) salvarScroll(); }}>
      <CabecalhoVolta titulo="Destinos de ski e snowboard" href={iniciantes ? rota.guia : rota.inicio} />

      <label className="campo-busca">
        <Icone nome="busca" tamanho={18} />
        <input
          type="search"
          placeholder="Ex.: Valle Nevado Chile"
          value={texto}
          onChange={(e) => mudarFiltro({ texto: e.target.value })}
          aria-label="Buscar destino"
          ref={campoBusca}
        />
      </label>

      <div className="filtros-descoberta">
        <select
          className="filtro"
          value={pais}
          onChange={(e) => mudarFiltro({ pais: e.target.value as Pais | '', estado: '' })}
          aria-label="País"
        >
          <option value="">País</option>
          {paises.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {pais === 'Estados Unidos' && estados.length > 0 && (
          <select className="filtro" value={estado} onChange={(e) => mudarFiltro({ estado: e.target.value })} aria-label="Estado">
            <option value="">Estado</option>
            {estados.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        )}
        <select className="filtro" value={nivel} onChange={(e) => mudarFiltro({ nivel: e.target.value as Nivel | '' })} aria-label="Nível">
          <option value="">Nível</option>
          {(Object.keys(nivelLabel) as Nivel[]).map((n) => (
            <option key={n} value={n}>
              {nivelLabel[n]}
            </option>
          ))}
        </select>
        <select className="filtro" value={orcamento} onChange={(e) => mudarFiltro({ orcamento: Number(e.target.value) })} aria-label="Orçamento do passe">
          <option value={0}>Preço do passe</option>
          <option value={70}>Até US$ 70</option>
          <option value={80}>Até US$ 80</option>
          <option value={95}>Até US$ 95</option>
        </select>
        <select className="filtro" value={fonte} onChange={(e) => mudarFiltro({ fonte: e.target.value as Busca['fonte'] })} aria-label="Tipo de conteúdo">
          <option value="">Todo o catálogo</option>
          <option value="curadoria">Com curadoria</option>
          <option value="base">Dados básicos</option>
        </select>
      </div>

      <div className="acoes-montanha">
        <a className="acao secundaria compacta" href={rota.mapa}>
          <Icone nome="mapa" tamanho={18} cor="#13394A" />
          <div>
            <div className="t">Ver no mapa</div>
            <div className="s">Os {destinos.length} destinos</div>
          </div>
        </a>
        <a className="acao secundaria compacta" href={rota.comparar(ids)} ref={linkComparar}>
          <Icone nome="comparar" tamanho={18} cor="#13394A" />
          <div>
            <div className="t">Comparar</div>
            <div className="s">{ids.length ? `${ids.length} de ${MAX_COMPARAR} selecionados` : 'De 2 a 3 lado a lado'}</div>
          </div>
        </a>
      </div>

      {selecionados.length > 0 && (
        <section className="selecao-descoberta" aria-label="Seleção para comparar">
          <p className="legenda" role="status">{ids.length === MAX_COMPARAR ? 'Limite de 3 destinos. Remova um para trocar.' : `${ids.length} de ${MAX_COMPARAR} selecionados para comparar.`}</p>
          <div className="itens-selecao">{selecionados.map((d) => (
            <button key={d.id} type="button" className="chip" aria-label={`Remover ${d.nome} da seleção`} onClick={() => {
              alternar(d.id);
              linkComparar.current?.focus();
            }}>{d.nome} ×</button>
          ))}</div>
        </section>
      )}
      <div className="resumo-busca">
        <div className="legenda" role="status">{lista.length} {lista.length === 1 ? 'destino encontrado' : 'destinos encontrados'}</div>
        {lista.length > 0 && (texto || nivel !== padrao(iniciantes).nivel || pais || orcamento || fonte) && <button className="chip" type="button" onClick={limpar}>Limpar filtros</button>}
      </div>
      {lista.slice(0, mostrar).map((d) => (
        <DestinoCard key={d.id} destino={d} fonte={temCuradoria(d) ? 'Com curadoria' : 'Dados básicos · OpenSkiMap'} comparar={{ ativo: ids.includes(d.id), bloqueado: ids.length >= MAX_COMPARAR && !ids.includes(d.id), alternar: () => alternar(d.id) }} />
      ))}
      {lista.length > mostrar && (
        <button type="button" className="botao contorno" onClick={() => setBusca((x) => ({ ...x, mostrar: x.mostrar + POR_PAGINA }))}>
          Mostrar mais {Math.min(POR_PAGINA, lista.length - mostrar)} de {lista.length - mostrar}
        </button>
      )}
      {lista.length === 0 && <div className="vazio">
        <p>Nenhum destino com essa busca. Tente outro nome ou amplie os filtros.</p>
        <button type="button" className="botao contorno curto" onClick={limpar}>Limpar busca e filtros</button>
      </div>}
    </main>
  );
}
