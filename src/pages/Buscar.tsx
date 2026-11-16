import { useMemo, useState } from 'react';
import { destinos, nivelLabel, type Nivel, type Pais } from '../data/destinos';
import { DestinoCard } from '../components/DestinoCard';
import { Icone } from '../components/Icone';
import { CabecalhoVolta } from '../components/Nav';
import { rota } from '../lib/rota';

const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function Buscar() {
  const [texto, setTexto] = useState('');
  const [nivel, setNivel] = useState<Nivel | ''>('');
  const [pais, setPais] = useState<Pais | ''>('');
  const [orcamento, setOrcamento] = useState<number>(0);

  const lista = useMemo(() => {
    const q = semAcento(texto.trim());
    // Ordem: por país e de norte a sul (latitude), como o viajante planeja a rota.
    const ordenados = [...destinos].sort((x, y) => x.pais.localeCompare(y.pais) || y.lat - x.lat);
    return ordenados.filter(
      (d) =>
        (!q || semAcento(`${d.nome} ${d.regiao} ${d.pais} ${d.cidadeBase}`).includes(q)) &&
        (!nivel || d.nivel === nivel) &&
        (!pais || d.pais === pais) &&
        (!orcamento || (d.passe.valor != null && d.passe.valor <= orcamento))
    );
  }, [texto, nivel, pais, orcamento]);

  return (
    <main className="conteudo">
      <CabecalhoVolta titulo="Destinos de ski e snowboard" />

      <label className="campo-busca">
        <Icone nome="busca" tamanho={18} />
        <input
          type="search"
          placeholder="Nome, cidade ou país"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          aria-label="Buscar destino"
          autoFocus
        />
      </label>

      <div className="chips">
        <select className="filtro select-filtro" value={nivel} onChange={(e) => setNivel(e.target.value as Nivel | '')} aria-label="Nível">
          <option value="">Nível ▾</option>
          {(Object.keys(nivelLabel) as Nivel[]).map((n) => (
            <option key={n} value={n}>
              {nivelLabel[n]}
            </option>
          ))}
        </select>
        <select className="filtro select-filtro" value={pais} onChange={(e) => setPais(e.target.value as Pais | '')} aria-label="País">
          <option value="">País ▾</option>
          <option value="Chile">Chile</option>
          <option value="Argentina">Argentina</option>
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
            <div className="s">Os 27 destinos</div>
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

      {lista.map((d) => (
        <DestinoCard key={d.id} destino={d} />
      ))}
      {lista.length === 0 && <div className="vazio">Nenhum destino com esse filtro. Tente outro filtro.</div>}
    </main>
  );
}
