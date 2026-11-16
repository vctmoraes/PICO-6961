import { useState } from 'react';
import { perfilViajante, type PerfilViajante } from '../lib/storage';
import { rota } from '../lib/rota';

type Opcao<T> = { valor: T; rotulo: string; detalhe?: string };

interface Etapa {
  chave: keyof PerfilViajante | 'documentos';
  pergunta: string;
  /** Para que o app usa a resposta (transparência, LGPD). */
  uso: string;
  tipo: 'uma' | 'varias' | 'documentos';
  opcoes?: Opcao<string | number>[];
}

const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const aeroportosBrasil: Opcao<string>[] = [
  { valor: 'GRU', rotulo: 'São Paulo (Guarulhos)' },
  { valor: 'VCP', rotulo: 'Campinas (Viracopos)' },
  { valor: 'GIG', rotulo: 'Rio de Janeiro (Galeão)' },
  { valor: 'BSB', rotulo: 'Brasília' },
  { valor: 'CNF', rotulo: 'Belo Horizonte (Confins)' },
  { valor: 'POA', rotulo: 'Porto Alegre' },
  { valor: 'CWB', rotulo: 'Curitiba' },
  { valor: 'FLN', rotulo: 'Florianópolis' },
  { valor: 'SSA', rotulo: 'Salvador' },
  { valor: 'REC', rotulo: 'Recife' },
  { valor: 'FOR', rotulo: 'Fortaleza' }
];

const etapas: Etapa[] = [
  {
    chave: 'esporte',
    pergunta: 'O que você pratica?',
    uso: 'Usamos para escolher dicas e para avisar quando um resort proíbe snowboard.',
    tipo: 'uma',
    opcoes: [
      { valor: 'ski', rotulo: 'Ski' },
      { valor: 'snowboard', rotulo: 'Snowboard' },
      { valor: 'ambos', rotulo: 'Os 2' },
      { valor: 'indeciso', rotulo: 'Ainda não sei' }
    ]
  },
  {
    chave: 'nivel',
    pergunta: 'Qual é o seu nível?',
    uso: 'Usamos para recomendar montanhas com pistas certas para você.',
    tipo: 'uma',
    opcoes: [
      { valor: 'nunca', rotulo: 'Nunca fui para a neve' },
      { valor: 'iniciante', rotulo: 'Iniciante', detalhe: 'Desço pista verde com cuidado' },
      { valor: 'intermediario', rotulo: 'Intermediário', detalhe: 'Desço pista azul com controle' },
      { valor: 'avancado', rotulo: 'Avançado', detalhe: 'Desço pista preta' },
      { valor: 'expert', rotulo: 'Expert', detalhe: 'Fora de pista e terreno íngreme' }
    ]
  },
  {
    chave: 'grupo',
    pergunta: 'Com quem você viaja?',
    uso: 'Usamos para destacar destinos bons para família e o checklist das crianças.',
    tipo: 'uma',
    opcoes: [
      { valor: 'sozinho', rotulo: 'Sozinho' },
      { valor: 'casal', rotulo: 'Casal' },
      { valor: 'amigos', rotulo: 'Amigos' },
      { valor: 'familia', rotulo: 'Família com criança' }
    ]
  },
  {
    chave: 'estilo',
    pergunta: 'Qual é o seu estilo de viagem?',
    uso: 'Usamos para destacar destinos mais em conta ou com hotel de alto padrão.',
    tipo: 'uma',
    opcoes: [
      { valor: 'economico', rotulo: 'Econômico' },
      { valor: 'conforto', rotulo: 'Conforto' },
      { valor: 'luxo', rotulo: 'Luxo' }
    ]
  },
  {
    chave: 'saida',
    pergunta: 'De onde você sai?',
    uso: 'Usamos para abrir a busca de voo já com o seu aeroporto.',
    tipo: 'uma',
    opcoes: aeroportosBrasil
  },
  {
    chave: 'meses',
    pergunta: 'Em que meses você quer viajar?',
    uso: 'Usamos para recomendar destinos com neve na sua época. Escolha 1 ou mais meses.',
    tipo: 'varias',
    opcoes: meses.map((m, i) => ({ valor: i + 1, rotulo: m }))
  },
  {
    chave: 'documentos',
    pergunta: 'Seus documentos',
    uso: 'Usamos só para avisar o que falta. Não guardamos número de documento.',
    tipo: 'documentos'
  },
  {
    chave: 'equipamento',
    pergunta: 'E o equipamento?',
    uso: 'Usamos para montar o seu checklist.',
    tipo: 'uma',
    opcoes: [
      { valor: 'aluga', rotulo: 'Alugo tudo' },
      { valor: 'roupa', rotulo: 'Tenho a roupa, alugo o resto' },
      { valor: 'tudo', rotulo: 'Tenho tudo' }
    ]
  },
  {
    chave: 'passe',
    pergunta: 'Você tem passe de temporada?',
    uso: 'Usamos para mostrar os resorts dos EUA onde o seu passe vale.',
    tipo: 'uma',
    opcoes: [
      { valor: 'epic', rotulo: 'Epic Pass' },
      { valor: 'ikon', rotulo: 'Ikon Pass' },
      { valor: 'nenhum', rotulo: 'Não tenho' }
    ]
  }
];

export function Questionario() {
  const [p, setP] = useState<PerfilViajante>(perfilViajante.ler);
  const [i, setI] = useState(0);
  const fim = i >= etapas.length;
  const e = etapas[i];

  const salvar = (novo: PerfilViajante) => {
    perfilViajante.salvar(novo);
    setP(novo);
  };
  const avancar = () => {
    // Lê o perfil gravado: a última resposta pode ainda não estar no estado desta tela.
    if (i + 1 >= etapas.length) salvar({ ...perfilViajante.ler(), concluidoEm: new Date().toISOString() });
    setI((x) => x + 1);
    window.scrollTo(0, 0);
  };
  const escolher = (valor: string | number) => {
    salvar({ ...p, [e.chave]: valor });
    setTimeout(avancar, 180);
  };

  if (fim) {
    return (
      <main className="conteudo questionario">
        <h1 className="titulo-quiz">Perfil pronto</h1>
        <p>Agora o app mostra os destinos que combinam com você e monta o checklist para o seu perfil.</p>
        <a className="botao" href={rota.inicio} style={{ color: '#fff' }}>
          Ver destinos para você
        </a>
        <a className="botao contorno" href={rota.perfil}>
          Ver meu perfil
        </a>
        <p className="aviso">Você pode mudar as respostas quando quiser, no Perfil. As respostas ficam salvas só neste aparelho.</p>
      </main>
    );
  }

  const selecionado = (v: string | number) => {
    const atual = p[e.chave as keyof PerfilViajante];
    return Array.isArray(atual) ? atual.includes(v as number) : atual === v;
  };

  return (
    <main className="conteudo questionario">
      <div className="progresso" aria-label={`Pergunta ${i + 1} de ${etapas.length}`}>
        <div style={{ width: `${((i + 1) / etapas.length) * 100}%` }} />
      </div>
      <div className="topo-quiz">
        <button type="button" className="link-quiz" onClick={() => (i === 0 ? (window.location.hash = rota.perfil) : setI(i - 1))}>
          ← {i === 0 ? 'Sair' : 'Voltar'}
        </button>
        <span className="legenda">
          {i + 1} de {etapas.length}
        </span>
        <button type="button" className="link-quiz" onClick={avancar}>
          Pular →
        </button>
      </div>

      <h1 className="titulo-quiz">{e.pergunta}</h1>
      <p className="legenda">{e.uso}</p>

      {e.tipo === 'uma' && (
        <div className={`opcoes-quiz ${(e.opcoes?.length ?? 0) > 6 ? 'grade' : ''}`}>
          {e.opcoes!.map((o) => (
            <button key={String(o.valor)} type="button" className={`opcao-quiz ${selecionado(o.valor) ? 'ativa' : ''}`} aria-pressed={selecionado(o.valor)} onClick={() => escolher(o.valor)}>
              <strong>{o.rotulo}</strong>
              {o.detalhe && <small>{o.detalhe}</small>}
            </button>
          ))}
        </div>
      )}

      {e.tipo === 'varias' && (
        <>
          <div className="opcoes-quiz meses">
            {e.opcoes!.map((o) => {
              const ativo = selecionado(o.valor);
              return (
                <button
                  key={String(o.valor)}
                  type="button"
                  className={`opcao-quiz ${ativo ? 'ativa' : ''}`}
                  aria-pressed={ativo}
                  onClick={() => {
                    const atual = p.meses ?? [];
                    const m = o.valor as number;
                    salvar({ ...p, meses: ativo ? atual.filter((x) => x !== m) : [...atual, m].sort((a, b) => a - b) });
                  }}
                >
                  <strong>{o.rotulo}</strong>
                </button>
              );
            })}
          </div>
          <button type="button" className="botao" onClick={avancar}>
            Continuar
          </button>
        </>
      )}

      {e.tipo === 'documentos' && (
        <>
          {(
            [
              ['passaporte', 'Você tem passaporte válido?'],
              ['vistoEua', 'Você tem visto americano válido?']
            ] as const
          ).map(([chave, pergunta]) => (
            <fieldset key={chave} className="pergunta-sim-nao">
              <legend>{pergunta}</legend>
              <div className="opcoes-quiz linha">
                {[
                  [true, 'Sim'],
                  [false, 'Não']
                ].map(([v, r]) => (
                  <button
                    key={String(v)}
                    type="button"
                    className={`opcao-quiz ${p[chave] === v ? 'ativa' : ''}`}
                    aria-pressed={p[chave] === v}
                    onClick={() => salvar({ ...p, [chave]: v })}
                  >
                    <strong>{r as string}</strong>
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
          <p className="aviso">Para o Chile e a Argentina, o brasileiro entra com RG ou passaporte. Para os EUA, precisa de passaporte e visto.</p>
          <button type="button" className="botao" onClick={avancar}>
            Continuar
          </button>
        </>
      )}
    </main>
  );
}
