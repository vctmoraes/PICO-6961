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
import { Importar } from './pages/Importar';
import { Grupos } from './pages/Grupos';
import { Grupo } from './pages/Grupo';
import { Convite } from './pages/Convite';
import { Planejar } from './pages/Planejar';
import { Loja } from './pages/Loja';
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
        <Destino key={`${param}--${extra ?? ''}`} id={param} abaInicial={extra} />
      </div>
    );
  }

  if (pagina === 'grupo' && param) {
    return (
      <div className="app">
        <Grupo key={param} id={param} />
        <Nav atual="grupos" />
      </div>
    );
  }

  if (pagina === 'convite' && param) {
    return (
      <div className="app">
        <Convite codigo={param} />
        <Nav atual="grupos" />
      </div>
    );
  }

  if (pagina === 'importar' && param) {
    return (
      <div className="app">
        <Importar dados={param} />
        <Nav atual="roteiros" />
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
    questionario: <Questionario />,
    grupos: <Grupos />,
    planejar: <Planejar />,
    loja: <Loja />
  };
  const navAtual = ['termos', 'creditos', 'questionario', 'loja'].includes(pagina) ? 'perfil' : pagina === 'mapa' ? 'buscar' : pagina === 'inicio' ? '' : pagina;

  return (
    <div className="app">
      {telas[pagina] ?? <Inicio />}
      <Nav atual={navAtual in telas ? navAtual : ''} />
    </div>
  );
}
