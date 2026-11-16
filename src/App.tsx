import { Nav } from './components/Nav';
import { useRota } from './lib/rota';
import { Buscar } from './pages/Buscar';
import { Destino } from './pages/Destino';
import { Inicio } from './pages/Inicio';
import { Perfil } from './pages/Perfil';
import { Roteiros } from './pages/Roteiros';
import { Viagem } from './pages/Viagem';
import { Creditos, Termos } from './pages/Termos';

export function App() {
  const [pagina = '', param, extra] = useRota();

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
    creditos: <Creditos />
  };
  const navAtual = ['termos', 'creditos'].includes(pagina) ? 'perfil' : pagina === 'inicio' ? '' : pagina;

  return (
    <div className="app">
      {telas[pagina] ?? <Inicio />}
      <Nav atual={navAtual in telas ? navAtual : ''} />
    </div>
  );
}
