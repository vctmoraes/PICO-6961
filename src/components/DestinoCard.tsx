import type { Destino } from '../data/destinos';
import { rota } from '../lib/rota';
import { Badge } from './Badge';
import { Paisagem } from './Paisagem';

export function DestinoCard({ destino }: { destino: Destino }) {
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
      </div>
    </a>
  );
}
