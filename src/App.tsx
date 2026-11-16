import { Nav } from './components/Nav';
import { useRota } from './lib/rota';
import { Buscar } from './pages/Buscar';
import { Destino } from './pages/Destino';
import { Inicio } from './pages/Inicio';
import { Perfil } from './pages/Perfil';
import { Roteiros } from './pages/Roteiros';
import { Viagem } from './pages/Viagem';
import { Comparar } from './pages/Comparar';
import { Guia } from './pages/Guia';
import { MapaDestinos } from './pages/MapaDestinos';
import { Questionario } from './pages/Questionario';
import { Creditos, Termos } from './pages/Termos';

export function App() {
  const partes = useRota();
  const [pagina = '', param, extra] = partes;

  if (pagina === 'comparar') {
    return (
      <div className="app">
        <Comparar ids={partes.slice(1)} />
        <Nav atual="buscar" />
      </div>
    );
  }

  if (pagina === 'destino' && param) {
    return (
      <div className="app">
        <Destino key={param} id={param} abaInicial={extra} />
      </div>
    );
  }

  if (pagina === 'roteiro' && param) {
    return (
      <div className="app">
        <Viagem key={param} id={param} />
        <Nav atual="roteiros" />
      </div>
    );
  }

  const telas: Record<string, JSX.Element> = {
    '': <Inicio />,
    inicio: <Inicio />,
    buscar: <Buscar />,
    roteiros: <Roteiros />,
    perfil: <Perfil />,
    termos: <Termos />,
    creditos: <Creditos />,
    guia: <Guia />,
    mapa: <MapaDestinos />,
    questionario: <Questionario />
  };
  const navAtual = ['termos', 'creditos', 'questionario'].includes(pagina) ? 'perfil' : pagina === 'mapa' ? 'buscar' : pagina === 'inicio' ? '' : pagina;

  return (
    <div className="app">
      {telas[pagina] ?? <Inicio />}
      <Nav atual={navAtual in telas ? navAtual : ''} />
    </div>
  );
}
