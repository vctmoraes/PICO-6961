import { useMemo, useState } from 'react';
import { destinos } from '../data/destinos';
import { paraVoce } from '../lib/combina';
import { perfilViajante } from '../lib/storage';
import { rota } from '../lib/rota';
import { DestinoCard } from './DestinoCard';
import { Icone } from './Icone';

/** Início: destinos que combinam com o perfil, ou o convite para fazer o perfil. */
export function ParaVoce() {
  const [p] = useState(perfilViajante.ler);
  const [dispensado, setDispensado] = useState(perfilViajante.avisoDispensado);
  const lista = useMemo(() => (perfilViajante.temRespostas(p) ? paraVoce(destinos, p) : []), [p]);

  if (!perfilViajante.temRespostas(p)) {
    if (dispensado) return null;
    return (
      <section className="convite-perfil" aria-labelledby="titulo-convite">
        <h2 id="titulo-convite">Destinos para o seu perfil</h2>
        <p>Responda 9 perguntas rápidas. O app mostra as montanhas que combinam com você e monta o seu checklist.</p>
        <div className="linha-form">
          <a className="botao curto" href={rota.questionario} style={{ color: '#fff' }}>
            Fazer meu perfil
          </a>
          <button
            type="button"
            className="link-quiz"
            onClick={() => {
              perfilViajante.dispensarAviso();
              setDispensado(true);
            }}
          >
            Agora não
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="para-voce" aria-labelledby="titulo-para-voce">
      <div className="secao-titulo">
        <h2 id="titulo-para-voce">Para você</h2>
        <a href={rota.questionario}>Editar perfil</a>
      </div>
      {lista.map(({ d, c }) => (
        <div key={d.id} className="item-para-voce">
          <DestinoCard destino={d} />
          {c.aFavor.length > 0 && (
            <p className="motivos">
              <Icone nome="floco" tamanho={14} cor="#1F6B44" /> {c.aFavor.slice(0, 2).join(' · ')}
            </p>
          )}
        </div>
      ))}
    </section>
  );
}
