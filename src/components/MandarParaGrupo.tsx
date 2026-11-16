import { useEffect, useState } from 'react';
import { backend, useUsuario, type Cartao, type Grupo } from '../lib/grupos';
import { rota } from '../lib/rota';

/** Painel que sobe do rodapé: escolhe um grupo e manda o cartão para o chat. */
export function MandarParaGrupo({ cartao, titulo, aoFechar }: { cartao: Cartao; titulo: string; aoFechar: () => void }) {
  const { usuario, carregando } = useUsuario();
  const [grupos, setGrupos] = useState<Grupo[] | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (usuario?.nome) backend().meusGrupos().then(setGrupos).catch((e) => setErro(e.message));
  }, [usuario]);

  return (
    <div className="fundo-painel" onClick={aoFechar}>
      <div className="painel-inferior" role="dialog" aria-modal="true" aria-labelledby="titulo-mandar" onClick={(e) => e.stopPropagation()}>
        <div className="secao-titulo">
          <h2 id="titulo-mandar">{titulo}</h2>
          <button type="button" className="fechar" aria-label="Fechar" onClick={aoFechar}>
            ×
          </button>
        </div>
        {carregando ? (
          <p className="legenda">Carregando…</p>
        ) : !usuario || !usuario.nome ? (
          <>
            <p className="legenda">Entre na sua conta para mandar para um grupo.</p>
            <a className="botao" href={rota.grupos} style={{ color: '#fff' }}>
              Entrar
            </a>
          </>
        ) : grupos === null ? (
          <p className="legenda">Carregando…</p>
        ) : grupos.length === 0 ? (
          <>
            <p className="legenda">Você ainda não tem grupo.</p>
            <a className="botao" href={rota.grupos} style={{ color: '#fff' }}>
              Criar um grupo
            </a>
          </>
        ) : (
          grupos.map((g) => (
            <div key={g.id} className="item-painel">
              <strong>{g.nome}</strong>
              <button
                type="button"
                className="botao secundario curto"
                onClick={async () => {
                  try {
                    await backend().enviar(g.id, { cartao });
                    window.location.hash = rota.grupo(g.id);
                  } catch (e) {
                    setErro(e instanceof Error ? e.message : 'Não foi possível mandar.');
                  }
                }}
              >
                Mandar
              </button>
            </div>
          ))
        )}
        {erro && (
          <p className="erro-form" role="alert">
            {erro}
          </p>
        )}
      </div>
    </div>
  );
}
