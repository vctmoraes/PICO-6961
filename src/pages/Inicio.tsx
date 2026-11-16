import { buscarDestino, destinos, type Destino } from '../data/destinos';
import { destaquesEua } from '../data/eua-curados';
import { DestinoCard } from '../components/DestinoCard';
import { Icone } from '../components/Icone';
import { Logo } from '../components/Logo';
import { perfil } from '../lib/storage';
import { NeveNosDestinos } from '../components/NeveNosDestinos';
import { ParaVoce } from '../components/ParaVoce';
import { Avisos } from '../components/Avisos';
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

      <a className="acao primaria" href={rota.planejar}>
        <Icone nome="calendario" tamanho={18} cor="#D9480F" />
        <div>
          <div className="t">Monte minha viagem</div>
          <div className="s">Datas e orçamento → roteiro pronto, com custo em real</div>
        </div>
        <Icone nome="seta" tamanho={16} cor="#5B6660" />
      </a>

      <Avisos />

      <ParaVoce />

      <NeveNosDestinos />

      <a className="acao secundaria" href={rota.guia}>
        <Icone nome="livro" tamanho={18} cor="#13394A" />
        <div>
          <div className="t">Primeira vez na neve?</div>
          <div className="s">Guia para iniciante: destino, época, aula, roupa e custo</div>
        </div>
        <Icone nome="seta" tamanho={16} cor="#5B6660" />
      </a>

      <div className="secao-titulo">
        <h2>Destinos em alta</h2>
        <a href={rota.buscar}>Ver todos</a>
      </div>
      {destinos.slice(0, 4).map((d) => (
        <DestinoCard key={d.id} destino={d} />
      ))}

      {destaquesEua.some((id) => buscarDestino(id)) && (
        <>
          <div className="secao-titulo">
            <h2>Em alta nos EUA</h2>
            <a href="#buscar">Ver todos</a>
          </div>
          {destaquesEua
            .map(buscarDestino)
            .filter((d): d is Destino => d !== undefined)
            .map((d) => (
              <DestinoCard key={d.id} destino={d} />
            ))}
        </>
      )}

      <p className="legenda" style={{ textAlign: 'center' }}>
        Mais esportes em breve · Esta versão é só de ski e snowboard
      </p>
    </main>
  );
}
