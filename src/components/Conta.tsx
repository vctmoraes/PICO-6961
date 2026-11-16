import { useState } from 'react';
import { backend, useUsuario } from '../lib/grupos';
import { rota } from '../lib/rota';

/** Perfil → Conta: quem está logado, sair e apagar a conta do servidor (LGPD). */
export function Conta() {
  const { usuario, carregando } = useUsuario();
  const [confirmar, setConfirmar] = useState(false);
  const [msg, setMsg] = useState('');
  if (carregando) return null;
  const demo = backend().modo === 'demo';
  return (
    <section className="cartao-seguro" aria-labelledby="titulo-conta">
      <h3 id="titulo-conta">Conta e grupos</h3>
      {!usuario ? (
        <>
          <p>Você não entrou numa conta. A conta serve para os grupos com amigos.</p>
          <a className="botao secundario" href={rota.grupos} style={{ color: '#fff' }}>
            Entrar
          </a>
        </>
      ) : (
        <>
          <p>
            {demo ? 'Modo demonstração' : `Conta: ${usuario.email}`}
            {usuario.nome && ` · ${usuario.nome}`}
          </p>
          <div className="linha-form">
            <button type="button" className="botao contorno curto" onClick={() => backend().sair()}>
              Sair da conta
            </button>
          </div>
          {confirmar ? (
            <div className="confirmar">
              <p>Apagar a sua conta? O app apaga o login, as suas mensagens, os seus votos e a sua participação nos grupos. Você não pode desfazer.</p>
              <div className="linha-form">
                <button type="button" className="botao contorno" onClick={() => setConfirmar(false)}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="botao perigo"
                  onClick={async () => {
                    try {
                      await backend().apagarConta();
                      setMsg('Conta apagada.');
                      setConfirmar(false);
                    } catch (e) {
                      setMsg(e instanceof Error ? e.message : 'Não foi possível apagar a conta.');
                    }
                  }}
                >
                  Apagar conta
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="link-perigo" onClick={() => setConfirmar(true)}>
              Apagar minha conta
            </button>
          )}
        </>
      )}
      {msg && (
        <p className="legenda" role="status">
          {msg}
        </p>
      )}
    </section>
  );
}
