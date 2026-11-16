import { destinos } from '../data/destinos';
import { DestinoCard } from '../components/DestinoCard';
import { Icone } from '../components/Icone';
import { Logo } from '../components/Logo';
import { perfil } from '../lib/storage';
import { rota } from '../lib/rota';

const esportesEmBreve = ['Surf', 'Escalada', 'Mountain bike', 'Kite', 'Parapente'];

function saudacao(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function Inicio() {
  const nome = perfil.nome();
  return (
    <main className="conteudo">
      <div className="topo">
        <Logo />
        <a className="avatar" href={rota.perfil} aria-label="Perfil">
          {nome ? nome[0].toUpperCase() : <Icone nome="pessoa" tamanho={18} cor="#fff" />}
        </a>
      </div>

      <div className="saudacao">
        <small>{saudacao()}</small>
        <h1>{nome ? `Oi, ${nome}` : 'Para onde vai a próxima viagem?'}</h1>
      </div>

      <a className="campo-busca" href={rota.buscar}>
        <Icone nome="busca" tamanho={18} />
        Buscar destino de ski ou snowboard
      </a>

      <div className="chips" role="group" aria-label="Esportes">
        <span className="chip ativo">Ski e snowboard</span>
        {esportesEmBreve.map((e) => (
          <span key={e} className="chip" aria-disabled="true">
            {e} · em breve
          </span>
        ))}
      </div>

      <div className="secao-titulo">
        <h2>Destinos em alta</h2>
        <a href={rota.buscar}>Ver todos</a>
      </div>
      {destinos.slice(0, 4).map((d) => (
        <DestinoCard key={d.id} destino={d} />
      ))}

      <p className="legenda" style={{ textAlign: 'center' }}>
        Mais esportes em breve · Esta versão é só de ski e snowboard
      </p>
    </main>
  );
}
