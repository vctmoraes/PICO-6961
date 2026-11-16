import { useEffect, useState } from 'react';
import { CabecalhoVolta } from '../components/Nav';
import { Icone } from '../components/Icone';
import { PassaportePicos } from '../components/PassaportePicos';
import { Conta } from '../components/Conta';
import { apagarTodosOsDados, exportarDados, perfil, perfilViajante, type PerfilViajante } from '../lib/storage';
import { aeroportosBrasil } from './Questionario';
import { rota } from '../lib/rota';

interface EventoInstalar extends Event {
  prompt: () => Promise<void>;
}

const rotulos: Record<string, Record<string, string>> = {
  esporte: { ski: 'Ski', snowboard: 'Snowboard', ambos: 'Ski e snowboard', indeciso: 'Ainda não sei' },
  nivel: { nunca: 'Nunca fui para a neve', iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado', expert: 'Expert' },
  grupo: { sozinho: 'Sozinho', casal: 'Casal', amigos: 'Amigos', familia: 'Família com criança' },
  estilo: { economico: 'Econômico', conforto: 'Conforto', luxo: 'Luxo' },
  equipamento: { aluga: 'Aluga tudo', roupa: 'Tem a roupa', tudo: 'Tem tudo' },
  passe: { epic: 'Epic Pass', ikon: 'Ikon Pass', nenhum: 'Nenhum' }
};
const nomeMes = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const simNao = (v?: boolean) => (v === undefined ? '—' : v ? 'Sim' : 'Não');

function resumoPerfil(p: PerfilViajante): [string, string][] {
  return [
    ['Esporte', rotulos.esporte[p.esporte ?? ''] ?? '—'],
    ['Nível', rotulos.nivel[p.nivel ?? ''] ?? '—'],
    ['Com quem', rotulos.grupo[p.grupo ?? ''] ?? '—'],
    ['Estilo', rotulos.estilo[p.estilo ?? ''] ?? '—'],
    ['Saída', aeroportosBrasil.find((a) => a.valor === p.saida)?.rotulo ?? '—'],
    ['Meses', p.meses?.length ? p.meses.map((m) => nomeMes[m - 1]).join(', ') : '—'],
    ['Passaporte', simNao(p.passaporte)],
    ['Visto americano', simNao(p.vistoEua)],
    ['Equipamento', rotulos.equipamento[p.equipamento ?? ''] ?? '—'],
    ['Passe de temporada', rotulos.passe[p.passe ?? ''] ?? '—']
  ];
}

export function Perfil() {
  const [nome, setNome] = useState(perfil.nome());
  const [salvo, setSalvo] = useState(false);
  const [instalar, setInstalar] = useState<EventoInstalar | null>(null);
  const [p] = useState(perfilViajante.ler);
  const [confirmarApagar, setConfirmarApagar] = useState(false);
  const [aviso, setAviso] = useState('');
  const [textoDados, setTextoDados] = useState('');

  useEffect(() => {
    const ao = (e: Event) => {
      e.preventDefault();
      setInstalar(e as EventoInstalar);
    };
    window.addEventListener('beforeinstallprompt', ao);
    return () => window.removeEventListener('beforeinstallprompt', ao);
  }, []);

  const baixar = () => {
    const json = JSON.stringify(exportarDados(), null, 2);
    try {
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `pico6961-meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setAviso('Arquivo gerado. Se o download não começou, use "Mostrar meus dados".');
    } catch {
      setTextoDados(json);
    }
  };

  return (
    <main className="conteudo">
      <CabecalhoVolta titulo="Perfil" />

      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          perfil.salvarNome(nome);
          setSalvo(true);
        }}
      >
        <label>
          Seu nome
          <input
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setSalvo(false);
            }}
            placeholder="Como quer ser chamado"
            maxLength={40}
          />
        </label>
        <button className="botao secundario" type="submit">
          {salvo ? 'Salvo ✓' : 'Salvar'}
        </button>
      </form>

      <section className="perfil-viajante" aria-labelledby="titulo-perfil-viajante">
        <div className="secao-titulo">
          <h2 id="titulo-perfil-viajante">Seu perfil de viagem</h2>
          {perfilViajante.temRespostas(p) && <a href={rota.questionario}>Editar</a>}
        </div>
        {perfilViajante.temRespostas(p) ? (
          <dl className="resumo-perfil">
            {resumoPerfil(p).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <>
            <p className="legenda">Responda 9 perguntas rápidas. O app recomenda destinos e monta o checklist para você.</p>
            <a className="botao" href={rota.questionario} style={{ color: '#fff' }}>
              Fazer meu perfil
            </a>
          </>
        )}
      </section>

      <PassaportePicos />

      {instalar && (
        <button className="botao" type="button" onClick={() => instalar.prompt().then(() => setInstalar(null))}>
          Instalar o PICO 6961 no celular
        </button>
      )}
      <p className="aviso">Para instalar no iPhone: abra no Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”.</p>

      <div className="lista-simples">
        <a href={rota.roteiros}>
          Meus roteiros <Icone nome="seta" tamanho={16} />
        </a>
        <a href={rota.guia}>
          Guia: primeira vez na neve <Icone nome="seta" tamanho={16} />
        </a>
        <a href={rota.comparar([])}>
          Comparar destinos <Icone nome="seta" tamanho={16} />
        </a>
        <a href={rota.termos}>
          Termos de uso e privacidade <Icone nome="seta" tamanho={16} />
        </a>
        <a href={rota.creditos}>
          Créditos e fontes de dados <Icone nome="seta" tamanho={16} />
        </a>
      </div>

      <Conta />

      <section className="cartao-seguro" aria-labelledby="titulo-dados">
        <h3 id="titulo-dados">Seus dados</h3>
        <p>
          O app guarda o seu nome, o perfil de viagem, os roteiros, o checklist, os relatos e o Passaporte de Picos só neste aparelho. Os grupos são a
          exceção: as mensagens, o roteiro do grupo e os votos ficam no servidor, para os amigos verem. Para apagar esses dados, use “Apagar minha
          conta”.
        </p>
        <div className="linha-form">
          <button type="button" className="botao contorno curto" onClick={baixar}>
            Baixar meus dados
          </button>
          <button type="button" className="botao contorno curto" onClick={() => setTextoDados(JSON.stringify(exportarDados(), null, 2))}>
            Mostrar meus dados
          </button>
        </div>
        {aviso && (
          <p className="legenda" role="status">
            {aviso}
          </p>
        )}
        {textoDados && <textarea className="campo" readOnly value={textoDados} aria-label="Meus dados" onFocus={(e) => e.target.select()} />}
        {confirmarApagar ? (
          <div className="confirmar">
            <p>Apagar todos os seus dados deste aparelho? Você não pode desfazer.</p>
            <div className="linha-form">
              <button type="button" className="botao contorno" onClick={() => setConfirmarApagar(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className="botao perigo"
                onClick={() => {
                  apagarTodosOsDados();
                  window.location.hash = rota.inicio;
                  window.location.reload();
                }}
              >
                Apagar tudo
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="link-perigo" onClick={() => setConfirmarApagar(true)}>
            Apagar todos os meus dados
          </button>
        )}
      </section>

      <section className="cartao-seguro" aria-labelledby="titulo-nome">
        <h3 id="titulo-nome">Por que 6961?</h3>
        <p>
          6.961 m é a altitude do Aconcágua, a montanha mais alta das Américas, medida pelo Instituto Geográfico Nacional da Argentina. O
          Aconcágua fica no meio do caminho entre as montanhas do Chile e da Argentina. É o nosso ponto mais alto.
        </p>
      </section>

      <p className="legenda" style={{ textAlign: 'center' }}>
        PICO 6961 · versão de teste 0.2
      </p>
    </main>
  );
}
