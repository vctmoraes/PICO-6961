import { useEffect, useState } from 'react';
import { CabecalhoVolta } from '../components/Nav';
import { backend } from '../lib/grupos';
import { rota } from '../lib/rota';
import { medir } from '../lib/medir';
import { AvisoDemo, ComLogin } from './Grupos';

/** Link de convite: depois do login, entra no grupo e abre o chat. */
export function Convite({ codigo }: { codigo: string }) {
  return (
    <main className="conteudo">
      <CabecalhoVolta titulo="Convite para grupo" href={rota.grupos} />
      <AvisoDemo />
      <p className="legenda">Você recebeu um convite para um grupo de viagem. Código: {codigo}.</p>
      <ComLogin>{() => <EntrarNoGrupo codigo={codigo} />}</ComLogin>
    </main>
  );
}

function EntrarNoGrupo({ codigo }: { codigo: string }) {
  const [erro, setErro] = useState('');
  useEffect(() => {
    backend()
      .entrarNoGrupo(codigo)
      .then((g) => {
        medir('Entrou em grupo', { via: 'convite' });
        window.location.hash = rota.grupo(g.id);
      })
      .catch((e) => setErro(e.message));
  }, [codigo]);
  return erro ? (
    <p className="erro-form" role="alert">
      {erro}
    </p>
  ) : (
    <p className="legenda">Entrando no grupo…</p>
  );
}
