import { nivelLabel, type Nivel } from '../data/destinos';

export function Badge({ nivel }: { nivel: Nivel }) {
  return <span className={`badge ${nivel}`}>{nivelLabel[nivel]}</span>;
}
