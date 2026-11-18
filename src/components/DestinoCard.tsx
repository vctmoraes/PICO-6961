import type { Destino } from '../data/destinos';
import { rota } from '../lib/rota';
import { combinar } from '../lib/combina';
import { perfilViajante } from '../lib/storage';
import { Badge } from './Badge';
import { Paisagem } from './Paisagem';

type Props = { destino: Destino; fonte?: string; comparar?: { ativo: boolean; bloqueado: boolean; alternar: () => void } };

export function DestinoCard({ destino, fonte, comparar }: Props) {
  const p = perfilViajante.ler();
  const nota = perfilViajante.temRespostas(p) ? combinar(destino, p).nota : null;
  const link = (
    <a className="card" href={rota.destino(destino.id)}>
      <div className="miniatura">
        <Paisagem destino={destino} />
      </div>
      <div className="info">
        <div className="linha">
          <div className="nome">{destino.nome}</div>
          <Badge nivel={destino.nivel} />
        </div>
        <div className="sub">
          {destino.pais} · {destino.regiao}
        </div>
        {fonte && <div className="legenda">{fonte}</div>}
        <div className="nota">{destino.nota}</div>
        {nota != null && <div className={`combina ${nota >= 70 ? 'alta' : nota >= 45 ? 'media' : 'baixa'}`}>{nota}% para você</div>}
      </div>
    </a>
  );
  return comparar ? (
    <article className="resultado-descoberta">
      {link}
      <button type="button" className="chip" disabled={comparar.bloqueado} aria-pressed={comparar.ativo}
        aria-label={`Comparar ${destino.nome}`} onClick={comparar.alternar}>
        {comparar.ativo ? '✓ Selecionado' : '+ Comparar'}
      </button>
    </article>
  ) : link;
}
