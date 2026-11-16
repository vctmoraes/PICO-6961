import type { Destino } from '../data/destinos';
import { rota } from '../lib/rota';
import { combinar } from '../lib/combina';
import { perfilViajante } from '../lib/storage';
import { Badge } from './Badge';
import { Paisagem } from './Paisagem';

export function DestinoCard({ destino }: { destino: Destino }) {
  const p = perfilViajante.ler();
  const nota = perfilViajante.temRespostas(p) ? combinar(destino, p).nota : null;
  return (
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
        <div className="nota">{destino.nota}</div>
        {nota != null && <div className={`combina ${nota >= 70 ? 'alta' : nota >= 45 ? 'media' : 'baixa'}`}>{nota}% para você</div>}
      </div>
    </a>
  );
}
