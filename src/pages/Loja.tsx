import { useState } from 'react';
import { CabecalhoVolta } from '../components/Nav';
import { backend, type PecaLoja } from '../lib/grupos';
import { medir } from '../lib/medir';
import { rota } from '../lib/rota';

const pecas: { id: PecaLoja; nome: string; detalhe: string; tamanho: boolean }[] = [
  { id: 'bone', nome: 'Boné 6961 m', detalhe: 'Bordado “6961 m” e o triângulo da marca', tamanho: false },
  { id: 'camiseta', nome: 'Camiseta PICO', detalhe: '“PICO” no peito e as coordenadas do Aconcágua na etiqueta', tamanho: true },
  { id: 'moletom', nome: 'Moletom Do primeiro dia ao topo', detalhe: 'Para o après-ski e para a cidade', tamanho: true },
  { id: 'gorro', nome: 'Gorro de lã', detalhe: 'Para a montanha, com o triângulo laranja', tamanho: false }
];

/** Desenho simples da peça (sem foto): só formas e a marca. */
function Desenho({ peca }: { peca: PecaLoja }) {
  return (
    <svg viewBox="0 0 120 90" className="desenho-peca" role="img" aria-label={`Desenho do ${pecas.find((p) => p.id === peca)?.nome}`}>
      {peca === 'bone' && (
        <>
          <path d="M22 58 Q60 6 98 58 Z" fill="#13394A" />
          <path d="M10 60 Q60 52 112 66 L112 70 Q60 60 10 66 Z" fill="#0B2430" />
          <text x="60" y="45" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="700" fontFamily="Space Grotesk, sans-serif">6961 m</text>
        </>
      )}
      {(peca === 'camiseta' || peca === 'moletom') && (
        <>
          <path d="M38 12 L50 8 Q60 16 70 8 L82 12 L104 28 L94 42 L84 36 L84 84 L36 84 L36 36 L26 42 L16 28 Z" fill={peca === 'camiseta' ? '#F7F5F0' : '#13394A'} stroke="#13394A" strokeWidth="2" />
          <path d="M55 30 L60 22 L65 30 Z" fill="#D9480F" />
          <text x="60" y="48" textAnchor="middle" fill={peca === 'camiseta' ? '#13394A' : '#FFFFFF'} fontSize="11" fontWeight="700" fontFamily="Space Grotesk, sans-serif">PICO</text>
        </>
      )}
      {peca === 'gorro' && (
        <>
          <path d="M30 70 Q30 18 60 18 Q90 18 90 70 Z" fill="#D9480F" />
          <rect x="26" y="62" width="68" height="14" rx="4" fill="#13394A" />
          <path d="M55 52 L60 42 L65 52 Z" fill="#FFFFFF" />
        </>
      )}
    </svg>
  );
}

export function Loja() {
  const [peca, setPeca] = useState<PecaLoja>('bone');
  const [tamanho, setTamanho] = useState('');
  const [email, setEmail] = useState('');
  const [aceito, setAceito] = useState(false);
  const [estado, setEstado] = useState<'' | 'ok' | 'interesse' | 'erro'>('');
  const [erro, setErro] = useState('');
  const atual = pecas.find((p) => p.id === peca)!;
  const demo = backend().modo === 'demo';

  return (
    <main className="conteudo">
      <CabecalhoVolta titulo="Loja PICO 6961" href={rota.perfil} />
      <section className="hero-loja">
        <p className="selo-em-breve">Em breve</p>
        <h2>Do primeiro dia na neve até o ponto mais alto.</h2>
        <p>6.961 m é a altitude do Aconcágua, o topo das Américas. A PICO 6961 vai ter roupa para a montanha e para a cidade. Diga o que você quer, e a gente avisa quando a primeira coleção sair.</p>
      </section>

      <div className="pecas" role="radiogroup" aria-label="Peça de interesse">
        {pecas.map((p) => (
          <button key={p.id} type="button" role="radio" aria-checked={peca === p.id} className={`peca ${peca === p.id ? 'ativa' : ''}`} onClick={() => setPeca(p.id)}>
            <Desenho peca={p.id} />
            <strong>{p.nome}</strong>
            <small>{p.detalhe}</small>
          </button>
        ))}
      </div>

      {estado === 'ok' ? (
        <div className="confirmado" role="status">
          <strong>Você está na lista.</strong> {demo ? 'Modo demonstração: o pedido ficou só neste aparelho, sem o seu e-mail.' : 'A gente manda um e-mail quando a peça sair.'}
        </div>
      ) : (
        <form
          className="form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!aceito) return setErro('Para entrar na lista, aceite receber o e-mail da loja.');
            try {
              await backend().entrarNaListaDeEspera({ email, peca, tamanho: atual.tamanho ? tamanho : undefined });
              medir('Lista de espera', { peca, tamanho: atual.tamanho ? tamanho || 'sem' : 'unico', email: true });
              setEstado('ok');
            } catch (err) {
              setEstado('erro');
              setErro(err instanceof Error ? err.message : 'Não foi possível entrar na lista.');
            }
          }}
        >
          <h3>Lista de espera: {atual.nome}</h3>
          {atual.tamanho && (
            <label>
              Tamanho (opcional)
              <select className="campo" value={tamanho} onChange={(e) => setTamanho(e.target.value)}>
                <option value="">Ainda não sei</option>
                {['P', 'M', 'G', 'GG'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            Seu e-mail
            <input id="email-loja" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" autoComplete="email" />
          </label>
          <label className="check">
            <input type="checkbox" checked={aceito} onChange={(e) => setAceito(e.target.checked)} />
            <span>Quero receber e-mail da PICO 6961 sobre a loja. Posso sair da lista quando quiser.</span>
          </label>
          {erro && (
            <p className="erro-form" role="alert">
              {erro}
            </p>
          )}
          <button type="submit" className="botao">
            Entrar na lista de espera
          </button>
          {estado === 'interesse' ? (
            <p className="legenda" role="status">
              Obrigado. A gente contou o seu interesse no {atual.nome}.
            </p>
          ) : (
            <button
              type="button"
              className="link-quiz"
              onClick={() => {
                medir('Lista de espera', { peca, email: false });
                setEstado('interesse');
              }}
            >
              Só quero mostrar interesse, sem e-mail
            </button>
          )}
          <p className="aviso">O app usa o seu e-mail só para avisar sobre a loja. Ninguém vê a lista pelo app. Ver os <a href={rota.termos}>termos</a>.</p>
        </form>
      )}
    </main>
  );
}
