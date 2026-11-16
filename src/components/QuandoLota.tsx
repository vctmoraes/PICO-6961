import type { Destino } from '../data/destinos';
import { hemisferioDe, proximosPeriodos } from '../data/lotacao';

const curta = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');

/** Tela do destino: próximas épocas cheias (datas aproximadas). */
export function QuandoLota({ d }: { d: Destino }) {
  const lista = proximosPeriodos(hemisferioDe(d.lat), 3);
  if (!lista.length) return null;
  return (
    <section className="quando-lota" aria-labelledby="titulo-lota">
      <h3 id="titulo-lota">Quando lota</h3>
      <ul>
        {lista.map((p) => (
          <li key={p.nome + p.inicio}>
            <strong>
              {curta(p.inicio)} a {curta(p.fim)}
            </strong>{' '}
            · {p.nome}
          </li>
        ))}
      </ul>
      <p className="legenda">{lista[0].dica} Datas aproximadas: as férias mudam por estado, região e província. Confira o calendário oficial.</p>
    </section>
  );
}
