import { useEffect, useRef, useState } from 'react';
import { paises, type Pais } from '../data/destinos';
import { CabecalhoVolta } from '../components/Nav';
import { Badge } from '../components/Badge';
import { formatarReal } from '../lib/custo';
import { medir } from '../lib/medir';
import { buscarCotacoes, type Cotacoes } from '../lib/moeda';
import { explorarMes, planejar, type Orcamento, type PedidoViagem, type Plano, type Sugestao } from '../lib/planejar';
import { perfilViajante, viagens, type NivelViajante, type PerfilViajante } from '../lib/storage';
import { distribuirDias } from '../lib/viagem';
import { rota } from '../lib/rota';
import '../planejador.css';

const orcamentos = [0, 1500, 3000, 5000, 8000];
const niveis: Record<NivelViajante, string> = {
  nunca: 'Primeira vez', iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado', expert: 'Expert'
};
const mesLongo = new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' });
const meses = Array.from({ length: 12 }, (_, i) => mesLongo.format(Date.UTC(2024, i, 1)));
const dataBR = (iso: string) => iso.split('-').reverse().join('/');
const statusTeto: Record<Orcamento, string> = {
  dentro: 'Faixa dentro do teto',
  'pode-passar': 'A faixa pode passar do teto',
  incompleto: 'Dados incompletos para comparar com o teto',
  fora: 'Mínimo acima do teto',
  'sem-teto': ''
};
type Envio =
  | { modo: 'datas'; pedido: PedidoViagem; perfil: PerfilViajante }
  | { modo: 'mes'; mes: number; pais: Pais | ''; perfil: PerfilViajante };
type Cotacao = { estado: 'aguardando' | 'indisponivel' } | { estado: 'disponivel'; taxas: Cotacoes };

export function Planejar() {
  const [perfil] = useState(perfilViajante.ler);
  const [pedido, setPedido] = useState<PedidoViagem>({ ida: '', volta: '', pessoas: 2, orcamentoPessoa: 0, pais: '', nivel: perfil.nivel ?? '' });
  const [modo, setModo] = useState<Envio['modo']>('datas');
  const [mes, setMes] = useState(0);
  const [envio, setEnvio] = useState<Envio | null>(null);
  const [alterado, setAlterado] = useState(false);
  const [cot, setCot] = useState<Cotacao>({ estado: 'aguardando' });
  const titulo = useRef<HTMLHeadingElement>(null);
  const ida = useRef<HTMLInputElement>(null);
  const focarIda = useRef(false);
  const taxas = cot.estado === 'disponivel' ? cot.taxas : null;

  useEffect(() => {
    let ativo = true;
    const prazo = window.setTimeout(() => setCot({ estado: 'indisponivel' }), 8000);
    buscarCotacoes().then((taxas) => {
      if (!ativo) return;
      window.clearTimeout(prazo);
      setCot(taxas && [taxas.USD, taxas.CLP, taxas.ARS].some((taxa) => Number.isFinite(taxa) && taxa > 0)
        ? { estado: 'disponivel', taxas }
        : { estado: 'indisponivel' });
    });
    return () => {
      ativo = false;
      window.clearTimeout(prazo);
    };
  }, []);

  useEffect(() => {
    if (envio) titulo.current?.focus();
  }, [envio]);

  useEffect(() => {
    if (modo === 'datas' && focarIda.current) {
      focarIda.current = false;
      ida.current?.focus();
    }
  }, [modo]);

  const invalidar = () => {
    if (envio) setAlterado(true);
    setEnvio(null);
  };
  const muda = (mudanca: Partial<PedidoViagem>) => {
    setPedido((anterior) => ({ ...anterior, ...mudanca }));
    invalidar();
  };
  const resultadoDatas = envio?.modo === 'datas' ? planejar(envio.pedido, envio.perfil, taxas) : null;
  const resultadoMes = envio?.modo === 'mes' ? explorarMes(envio.mes, envio.pais, envio.perfil) : null;
  const resultado = resultadoDatas ?? resultadoMes;

  const criar = (plano: Plano) => {
    if (envio?.modo !== 'datas') return;
    const { ida, volta, pessoas } = envio.pedido;
    const v = viagens.criar(`Viagem ${plano.destino.nome}`);
    const nova = { ...v, ida, volta, pessoas, destinos: [plano.destino.id] };
    viagens.salvar({ ...nova, dias: distribuirDias(nova) });
    medir('Roteiro criado', { origem: 'planejador' });
    window.location.hash = rota.viagem(v.id);
  };

  return (
    <main className="conteudo planejador">
      <CabecalhoVolta titulo="Monte minha viagem" />
      <p className="legenda">Encontre uma montanha para a época e o seu nível. Com datas definidas, estime o gasto na montanha e monte o roteiro dia a dia.</p>
      <form className="form" onSubmit={(e) => {
        e.preventDefault();
        const atual: Envio = modo === 'datas'
          ? { modo, pedido: { ...pedido }, perfil }
          : { modo, mes, pais: pedido.pais, perfil: { ...perfil, nivel: pedido.nivel || undefined } };
        const r = atual.modo === 'datas' ? planejar(atual.pedido, atual.perfil, taxas) : explorarMes(atual.mes, atual.pais, atual.perfil);
        setAlterado(false);
        setEnvio(atual);
        medir('Monte minha viagem', { sugestoes: r.planos.length, destinos: 1, pais: pedido.pais || 'todos', modo });
      }}>
        <fieldset className="planejador-periodo">
          <legend>Quando você quer viajar?</legend>
          <div className="linha-form">
            {(['datas', 'mes'] as const).map((opcao) => (
              <label key={opcao}>
                <input type="radio" name="periodo" checked={modo === opcao} onChange={() => { setModo(opcao); invalidar(); }} />
                {opcao === 'datas' ? 'Já tenho datas' : 'Só sei o mês'}
              </label>
            ))}
          </div>
        </fieldset>
        {modo === 'datas' ? (
          <div className="linha-form planejador-datas">
            <label>Ida<input ref={ida} type="date" required value={pedido.ida} onChange={(e) => muda({ ida: e.target.value })} /></label>
            <label>Volta<input type="date" required min={pedido.ida || undefined} value={pedido.volta} onChange={(e) => muda({ volta: e.target.value })} /></label>
          </div>
        ) : (
          <label>Mês da viagem
            <select required value={mes || ''} onChange={(e) => { setMes(Number(e.target.value)); invalidar(); }}>
              <option value="">Selecione</option>
              {meses.map((nome, i) => <option key={nome} value={i + 1}>{nome}</option>)}
            </select>
          </label>
        )}
        <div className="linha-form">
          <label>Seu nível
            <select value={pedido.nivel} onChange={(e) => muda({ nivel: e.target.value as NivelViajante | '' })}>
              <option value="">Não informar</option>
              {Object.entries(niveis).map(([valor, nome]) => <option key={valor} value={valor}>{nome}</option>)}
            </select>
          </label>
          <label>País
            <select value={pedido.pais} onChange={(e) => muda({ pais: e.target.value as Pais | '' })}>
              <option value="">Qualquer país</option>
              {paises.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
        </div>
        {modo === 'datas' && (
          <>
            <label>Teto por pessoa na montanha
              <select value={pedido.orcamentoPessoa} aria-describedby="escopo-teto" onChange={(e) => muda({ orcamentoPessoa: Number(e.target.value) })}>
                {orcamentos.map((o) => <option key={o} value={o}>{o ? `Até ${formatarReal(o)}` : 'Sem teto'}</option>)}
              </select>
            </label>
            <p className="aviso" id="escopo-teto">Só passe e aluguel. Não inclui voo, hospedagem, alimentação, aulas nem transporte.</p>
            <label>Pessoas no roteiro
              <input type="number" min={1} max={30} step={1} required value={pedido.pessoas || ''} onChange={(e) => muda({ pessoas: Number(e.target.value) })} />
            </label>
          </>
        )}
        <button type="submit" className="botao">{alterado ? 'Atualizar sugestões' : 'Ver sugestões'}</button>
        <p className="aviso planejador-alterado" role="status" hidden={!alterado}>Você alterou a busca. Atualize as sugestões para continuar.</p>
      </form>

      {resultado && envio && (
        <section className="sugestoes" aria-labelledby="planejador-resultado">
          <h2 ref={titulo} id="planejador-resultado" tabIndex={-1}>{resultado.planos.length ? 'Montanhas sugeridas' : 'Nenhuma sugestão'}</h2>
          {envio.modo === 'datas' ? (
            <p className="legenda">{dataBR(envio.pedido.ida)} a {dataBR(envio.pedido.volta)} · {envio.pedido.pessoas} {envio.pedido.pessoas === 1 ? 'pessoa' : 'pessoas'} · {envio.pedido.orcamentoPessoa ? `teto de ${formatarReal(envio.pedido.orcamentoPessoa)} por pessoa` : 'sem teto'}</p>
          ) : <p className="legenda">Época típica em {meses[envio.mes - 1]}. Confirme as datas de operação com o resort.</p>}
          {resultado.avisos.map((a) => <p key={a} className="aviso-lotacao">{a}</p>)}
          {resultadoDatas && (
            <div role="status" className="planejador-cotacao">
              {cot.estado === 'aguardando' && <p className="legenda">Buscando a cotação para estimar em reais…</p>}
              {cot.estado === 'indisponivel' && <p className="legenda">Cotação indisponível. As sugestões ainda podem ser usadas, mas não dá para confirmar os valores em reais.</p>}
              {cot.estado === 'disponivel' && resultadoDatas.planos.some((p) => p.semCotacao) && <p className="legenda">Não há cotação para todas as moedas destas sugestões.</p>}
            </div>
          )}
          {!!resultadoDatas?.planos.length && <p className="aviso">Estimativa por pessoa para passe e aluguel, não para a viagem toda. Os preços são referências, não cotações do resort. Ida e volta são dias de viagem.</p>}
          {resultadoDatas?.planos.map((plano) => (
            <CartaoPlano key={plano.destino.id} sugestao={plano}>
              <div className="planejador-custo">
                <p className="custo-plano">
                  {plano.custoPessoa ? <>{plano.semPreco.length || plano.semCotacao ? 'Subtotal conhecido' : 'Passe e aluguel'} por pessoa: <strong>≈ {formatarReal(...plano.custoPessoa)}</strong></> : 'Estimativa em reais indisponível'}
                  {' · '}{plano.diasSki} {plano.diasSki === 1 ? 'dia' : 'dias'} de ski
                </p>
                {statusTeto[plano.orcamento] && <p className="planejador-teto" data-status={plano.orcamento}>{statusTeto[plano.orcamento]}</p>}
                {plano.semPreco.length > 0 && <p className="aviso">Preço a consultar: {plano.semPreco.join('; ')}.</p>}
                {plano.semCotacao && (plano.custoPessoa || cot.estado === 'disponivel') && <p className="aviso">Parte dos preços não pôde ser convertida em reais.</p>}
              </div>
              {plano.lotacao.length > 0 && <p className="aviso-lotacao">Época cheia (aproximado): {plano.lotacao.join(' · ')}</p>}
              <button type="button" className="botao curto" aria-label={`Criar roteiro para ${plano.destino.nome}`} onClick={() => criar(plano)}>Criar este roteiro</button>
            </CartaoPlano>
          ))}
          {resultadoMes?.planos.map((sugestao) => <CartaoPlano key={sugestao.destino.id} sugestao={sugestao} />)}
          {!!resultadoMes?.planos.length && (
            <button type="button" className="botao" onClick={() => { focarIda.current = true; setModo('datas'); invalidar(); }}>Definir datas para estimar e criar roteiro</button>
          )}
        </section>
      )}
    </main>
  );
}

function CartaoPlano({ sugestao, children }: { sugestao: Sugestao; children?: React.ReactNode }) {
  const { destino, motivos, atencao } = sugestao;
  return (
    <article className="plano">
      <h3>{destino.nome}</h3>
      <p className="legenda">{destino.pais} · {destino.regiao} · <Badge nivel={destino.nivel} /></p>
      <ul className="motivos-plano">{motivos.map((m) => <li key={m}>{m}</li>)}</ul>
      {atencao.length > 0 && <p className="atencao-plano">{atencao.join(' · ')}</p>}
      <div className="planejador-acoes">
        {children}
        <a className="botao contorno curto" aria-label={`Ver destino: ${destino.nome}`} href={rota.destino(destino.id)}>Ver destino</a>
      </div>
    </article>
  );
}
