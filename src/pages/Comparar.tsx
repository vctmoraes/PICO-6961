import { useEffect, useRef, useState } from 'react';
import { buscarDestino, type Destino } from '../data/destinos';
import { Badge } from '../components/Badge';
import { CabecalhoVolta } from '../components/Nav';
import { buscarClima, type Clima } from '../lib/clima';
import { emReal, useCotacoes } from '../lib/moeda';
import { custoDoDia, formatarFaixa, formatarReal } from '../lib/custo';
import { rota, substituirRota } from '../lib/rota';
import { MandarParaGrupo } from '../components/MandarParaGrupo';

import { consultarDestinos, idsValidos, MAX_COMPARAR, temCuradoria } from './Buscar';

const LIMITE_RESULTADOS = 8;

function useClimas(lista: Destino[]) {
  const [climas, setClimas] = useState<Record<string, Clima | 'erro'>>({});
  useEffect(() => {
    let vivo = true;
    lista.forEach((d) =>
      buscarClima(d)
        .then((c) => vivo && setClimas((x) => ({ ...x, [d.id]: c })))
        .catch(() => vivo && setClimas((x) => ({ ...x, [d.id]: 'erro' })))
    );
    return () => {
      vivo = false;
    };
  }, [lista.map((d) => d.id).join()]);
  return climas;
}

export function Comparar({ ids: idsIniciais }: { ids: string[] }) {
  const ids = idsValidos(idsIniciais);
  const escolhidos = ids.map(buscarDestino).filter((d): d is Destino => d !== undefined);
  const climas = useClimas(escolhidos.length >= 2 ? escolhidos : []);
  const cot = useCotacoes();
  const [painelGrupo, setPainelGrupo] = useState(false);
  const [texto, setTexto] = useState('');
  const campo = useRef<HTMLInputElement>(null);
  const selecao = useRef<HTMLDivElement>(null);
  const voltarFoco = useRef(false);
  const completo = ids.length >= MAX_COMPARAR;
  const resultados = completo ? [] : consultarDestinos(texto).filter((d) => !ids.includes(d.id));
  const trocar = (proximos: string[]) => {
    voltarFoco.current = true;
    setTexto('');
    substituirRota(rota.comparar(proximos));
  };
  useEffect(() => {
    if (!voltarFoco.current) return;
    voltarFoco.current = false;
    if (completo) selecao.current?.querySelector<HTMLButtonElement>('button:last-child')?.focus();
    else campo.current?.focus();
  }, [ids.join('--'), completo]);

  const clima = (d: Destino) => climas[d.id];
  const linhas: { rotulo: string; valor: (d: Destino) => React.ReactNode }[] = [
    { rotulo: 'Conteúdo', valor: (d) => temCuradoria(d) ? 'Com curadoria' : 'Dados básicos · OpenSkiMap' },
    { rotulo: 'País e região', valor: (d) => `${d.pais} · ${d.regiao}` },
    { rotulo: 'Nível', valor: (d) => <Badge nivel={d.nivel} /> },
    { rotulo: 'Temporada típica', valor: (d) => d.temporada },
    { rotulo: 'Cidade-base', valor: (d) => d.cidadeBase },
    { rotulo: 'Altitude', valor: (d) => `${d.altitudeBase.toLocaleString('pt-BR')} a ${d.altitudeTopo.toLocaleString('pt-BR')} m` },
    { rotulo: 'Km de pista', valor: (d) => (d.kmPista ? `${d.kmPista} km` : '—') },
    {
      rotulo: 'Passe (dia)',
      valor: (d) =>
        d.passe.valor == null ? (
          d.passeInfo ? 'Dinâmico (ver destino)' : 'Consultar'
        ) : (
          <>
            {d.passe.moeda === 'USD' ? 'US$' : d.passe.moeda} {d.passe.valor}*
            <small>{emReal(d.passe.valor, d.passe.moeda, cot) ?? 'Cotação indisponível'}</small>
          </>
        )
    },
    {
      rotulo: 'Aluguel de equipamento (dia)',
      valor: (d) =>
        d.aluguel?.equipamento ? (
          <>
            {formatarFaixa(d.aluguel.equipamento, d.aluguel.moeda)}
            {emReal(d.aluguel.equipamento.min, d.aluguel.moeda, cot) && (
              <small>
                {emReal(d.aluguel.equipamento.min, d.aluguel.moeda, cot)}
                {d.aluguel.equipamento.max !== d.aluguel.equipamento.min && ` a ${emReal(d.aluguel.equipamento.max, d.aluguel.moeda, cot)?.replace('≈ ', '')}`}
              </small>
            )}
          </>
        ) : (
          'Consultar'
        )
    },
    {
      rotulo: 'Passe + aluguéis por dia',
      valor: (d) => {
        const { total, parcial, linhas } = custoDoDia(d, {}, cot);
        if (linhas.every((l) => l.semValor)) return 'Sem dados de preço';
        if (!total) return 'Cotação indisponível';
        return <>{formatarReal(...total)}{parcial && <small>Parcial: faltam preços</small>}</>;
      }
    },
    { rotulo: 'Passe de temporada', valor: (d) => d.rede ?? '—' },
    {
      rotulo: 'Neve nova (24h)',
      valor: (d) => {
        const c = clima(d);
        return c === 'erro' ? 'Sem dado' : c ? `${c.neve24hCm} cm${c.exemplo ? ' (exemplo)' : ''}` : 'Carregando…';
      }
    },
    {
      rotulo: 'Neve prevista (5 dias)',
      valor: (d) => {
        const c = clima(d);
        return c === 'erro' ? 'Sem dado' : c ? `${c.previsao.reduce((s, p) => s + p.neveCm, 0)} cm${c.exemplo ? ' (exemplo)' : ''}` : 'Carregando…';
      }
    },
    {
      rotulo: 'Agora no topo',
      valor: (d) => {
        const c = clima(d);
        return c === 'erro' ? 'Sem dado' : c ? `${Math.round(c.topo.temperatura)}°C · vento ${Math.round(c.topo.vento)} km/h${c.exemplo ? ' (exemplo)' : ''}` : 'Carregando…';
      }
    },
    { rotulo: 'Câmera ao vivo', valor: (d) => (d.montanha?.cameras ? 'Sim' : 'Não') }
  ];

  return (
    <main className="conteudo descoberta">
      <CabecalhoVolta titulo="Comparar destinos" href={rota.buscar} />
      <p className="legenda" role="status">{completo ? 'Limite de 3 destinos. Remova um para trocar.' : `${ids.length} de ${MAX_COMPARAR} selecionados. Compare 2 ou 3 destinos.`}</p>
      {ids.length > 0 && <div className="itens-selecao" ref={selecao} aria-label="Destinos selecionados" role="group">
        {escolhidos.map((d) => <button key={d.id} type="button" className="chip" aria-label={`Remover ${d.nome}`} onClick={() => trocar(ids.filter((id) => id !== d.id))}>{d.nome} ×</button>)}
      </div>}
      {!completo && (
        <div className="seletor-descoberta">
          <label className="campo-busca">
            <input ref={campo} type="search" value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Buscar destino para comparar" placeholder="Ex.: Valle Nevado Chile" />
          </label>
          {texto.trim() ? (
            <p className="legenda" role="status">{resultados.length ? `Mostrando ${Math.min(resultados.length, LIMITE_RESULTADOS)} de ${resultados.length} resultados.` : 'Nenhum outro destino encontrado. Tente outro nome, região ou país.'}</p>
          ) : !escolhidos.length && <p className="legenda">Sugestões do catálogo ou digite para buscar outro destino.</p>}
          {(texto.trim() || !escolhidos.length) && resultados.length > 0 && <ul className="opcoes-descoberta">
            {resultados.slice(0, texto.trim() ? LIMITE_RESULTADOS : 3).map((d) => (
              <li key={d.id}><button type="button" aria-label={`Adicionar ${d.nome}`} onClick={() => trocar([...ids, d.id])}>
                <span><strong>{d.nome}</strong><small>{d.pais} · {d.regiao}</small></span><span aria-hidden="true">+</span>
              </button></li>
            ))}
          </ul>}
        </div>
      )}
      {escolhidos.length >= 2 ? (
        <div className="comparacao">
          <table className="tabela-descoberta">
            <caption>Temporada típica, nível, preços estimados e tempo nos destinos selecionados</caption>
            <thead><tr>
              {escolhidos.map((d) => <th scope="col" key={d.id}><a href={rota.destino(d.id)}>{d.nome}</a></th>)}
            </tr></thead>
            {linhas.map((l) => (
              <tbody key={l.rotulo}>
                <tr><th scope="rowgroup" colSpan={escolhidos.length}>{l.rotulo}</th></tr>
                <tr>{escolhidos.map((d) => <td key={d.id}>{l.valor(d)}</td>)}</tr>
              </tbody>
            ))}
          </table>
        </div>
      ) : <div className="vazio">{ids.length ? 'Adicione mais um destino para comparar.' : 'Escolha pelo menos 2 destinos para comparar.'}</div>}
      {escolhidos.length >= 2 && (
        <button type="button" className="botao contorno" onClick={() => setPainelGrupo(true)}>
          Mandar esta comparação para um grupo
        </button>
      )}
      {painelGrupo && (
        <MandarParaGrupo cartao={{ tipo: 'comparacao', ids }} titulo="Mandar a comparação para um grupo" aoFechar={() => setPainelGrupo(false)} />
      )}
      <p className="aviso">
        * Preço estimado, sem incluir viagem, hospedagem ou aulas. A faixa diária considera passe, equipamento e roupa quando há dados. Tempo: modelo Open-Meteo, não boletim oficial. Conversão para reais: AwesomeAPI.
      </p>
    </main>
  );
}
