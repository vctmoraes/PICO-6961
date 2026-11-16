import { useEffect, useMemo, useState } from 'react';
import { destinos, nivelLabel, paises, type Nivel, type Pais } from '../data/destinos';
import { DestinoCard } from '../components/DestinoCard';
import { Icone } from '../components/Icone';
import { CabecalhoVolta } from '../components/Nav';
import { rota } from '../lib/rota';

const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const POR_PAGINA = 40;

/** Estado ou região do destino, para o filtro: nos EUA, o estado (última parte da região). */
const regiaoDoFiltro = (d: (typeof destinos)[number]) => (d.pais === 'Estados Unidos' ? d.regiao.split(', ').pop() ?? d.regiao : null);

export function Buscar() {
  const [texto, setTexto] = useState('');
  const [nivel, setNivel] = useState<Nivel | ''>('');
  const [pais, setPais] = useState<Pais | ''>('');
  const [estado, setEstado] = useState('');
  const [orcamento, setOrcamento] = useState<number>(0);
  const [mostrar, setMostrar] = useState(POR_PAGINA);

  const estados = useMemo(
    () => [...new Set(destinos.map(regiaoDoFiltro).filter((x): x is string => !!x))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    []
  );

  const lista = useMemo(() => {
    const q = semAcento(texto.trim());
    // Ordem: por país (Chile, Argentina, EUA) e, no Chile e na Argentina, de norte a sul. Nos EUA, por estado e nome.
    const ordem = (p: Pais) => paises.indexOf(p);
    const ordenados = [...destinos].sort(
      (x, y) =>
        ordem(x.pais) - ordem(y.pais) ||
        (x.pais === 'Estados Unidos' ? x.regiao.localeCompare(y.regiao, 'pt-BR') || x.nome.localeCompare(y.nome) : y.lat - x.lat)
    );
    return ordenados.filter(
      (d) =>
        (!q || semAcento(`${d.nome} ${d.regiao} ${d.pais} ${d.cidadeBase}`).includes(q)) &&
        (!nivel || d.nivel === nivel) &&
        (!pais || d.pais === pais) &&
        (!estado || regiaoDoFiltro(d) === estado) &&
        (!orcamento || (d.passe.valor != null && d.passe.valor <= orcamento))
    );
  }, [texto, nivel, pais, estado, orcamento]);

  // Filtro novo: volta para a primeira página.
  useEffect(() => setMostrar(POR_PAGINA), [texto, nivel, pais, estado, orcamento]);

  return (
    <main className="conteudo">
      <CabecalhoVolta titulo="Destinos de ski e snowboard" />

      <label className="campo-busca">
        <Icone nome="busca" tamanho={18} />
        <input
          type="search"
          placeholder="Nome, cidade, estado ou país"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          aria-label="Buscar destino"
          autoFocus
        />
      </label>

      <div className="chips">
        <select
          className="filtro select-filtro"
          value={pais}
          onChange={(e) => {
            setPais(e.target.value as Pais | '');
            setEstado('');
          }}
          aria-label="País"
        >
          <option value="">País ▾</option>
          {paises.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {pais === 'Estados Unidos' && estados.length > 0 && (
          <select className="filtro select-filtro" value={estado} onChange={(e) => setEstado(e.target.value)} aria-label="Estado">
            <option value="">Estado ▾</option>
            {estados.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        )}
        <select className="filtro select-filtro" value={nivel} onChange={(e) => setNivel(e.target.value as Nivel | '')} aria-label="Nível">
          <option value="">Nível ▾</option>
          {(Object.keys(nivelLabel) as Nivel[]).map((n) => (
            <option key={n} value={n}>
              {nivelLabel[n]}
            </option>
          ))}
        </select>
        <select className="filtro select-filtro" value={orcamento} onChange={(e) => setOrcamento(Number(e.target.value))} aria-label="Orçamento do passe">
          <option value={0}>Orçamento ▾</option>
          <option value={70}>Passe até US$ 70</option>
          <option value={80}>Passe até US$ 80</option>
          <option value={95}>Passe até US$ 95</option>
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
        <a className="acao secundaria compacta" href={rota.comparar([])}>
          <Icone nome="comparar" tamanho={18} cor="#13394A" />
          <div>
            <div className="t">Comparar</div>
            <div className="s">Até 3 lado a lado</div>
          </div>
        </a>
      </div>

      <div className="legenda" aria-live="polite">
        {lista.length} {lista.length === 1 ? 'destino encontrado' : 'destinos encontrados'}
      </div>

      {lista.slice(0, mostrar).map((d) => (
        <DestinoCard key={d.id} destino={d} />
      ))}
      {lista.length > mostrar && (
        <button type="button" className="botao contorno" onClick={() => setMostrar((m) => m + POR_PAGINA)}>
          Mostrar mais {Math.min(POR_PAGINA, lista.length - mostrar)} de {lista.length - mostrar}
        </button>
      )}
      {lista.length === 0 && <div className="vazio">Nenhum destino com esse filtro. Tente outro filtro.</div>}
    </main>
  );
}
