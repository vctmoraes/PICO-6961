import { buscarDestino, type Destino } from '../data/destinos';
import { DestinoCard } from '../components/DestinoCard';
import { Icone } from '../components/Icone';
import { Logo } from '../components/Logo';
import { perfil, perfilViajante, viagens } from '../lib/storage';
import { NeveNosDestinos } from '../components/NeveNosDestinos';
import { ParaVoce } from '../components/ParaVoce';
import { Avisos } from '../components/Avisos';
import { rota } from '../lib/rota';
import { dataCurta } from '../lib/viagem';

const destaques = ['el-colorado', 'valle-nevado', 'cerro-catedral'];

export function Inicio() {
  const nome = perfil.nome();
  const hoje = new Date();
  const dataLocal = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
  const roteiros = viagens.listar();
  const comDatas = roteiros.filter((v) => v.ida && v.volta >= dataLocal).sort((a, b) => a.ida.localeCompare(b.ida));
  const proximo = comDatas[0] ?? roteiros.find((v) => !v.volta);
  const personalizado = perfilViajante.temRespostas(perfilViajante.ler());

  return (
    <main className="conteudo inicio-ux">
      <div className="topo">
        <Logo />
        <a className="avatar" href={rota.perfil} aria-label="Perfil">
          {nome ? [...nome][0].toLocaleUpperCase('pt-BR') : <Icone nome="pessoa" tamanho={18} cor="#fff" />}
        </a>
      </div>

      <section className="inicio-lead" aria-labelledby="inicio-titulo">
        <p className="inicio-contexto">Ski e snowboard</p>
        <h1 id="inicio-titulo">Planeje sua viagem para a neve</h1>
        {proximo ? (
          <>
            <p>Próximo roteiro: <strong>{proximo.nome}</strong>{proximo.ida && proximo.volta ? ` · ${dataCurta(proximo.ida)} a ${dataCurta(proximo.volta)}` : ''}</p>
            <a className="botao" href={rota.viagem(proximo.id)}>Retomar roteiro</a>
            <a className="inicio-linha" href={rota.planejar}>Planejar outra viagem <Icone nome="seta" tamanho={16} /></a>
          </>
        ) : (
          <>
            <p>Encontre uma montanha para o seu nível, compare o custo em reais e monte seu roteiro.</p>
            <a className="botao" href={rota.planejar}>Planejar viagem</a>
          </>
        )}
        <a className="inicio-linha" href={rota.buscar}>Buscar montanha <Icone nome="busca" tamanho={18} /></a>
        <a className="inicio-linha" href={rota.equipamento}>Ski ou prancha para você <Icone nome="seta" tamanho={16} /></a>
        <a className="inicio-linha inicio-guia" href={rota.guia}>Primeira vez na neve? <Icone nome="seta" tamanho={16} /></a>
      </section>

      {proximo && <Avisos />}
      {personalizado && <ParaVoce />}
      <div className="secao-titulo">
        <h2>Montanhas para explorar</h2>
        <a href={rota.buscar}>Ver todos os destinos</a>
      </div>
      {destaques.map(buscarDestino).filter((d): d is Destino => d !== undefined).map((d) => (
        <DestinoCard key={d.id} destino={d} />
      ))}
      {!proximo && <Avisos />}
      <NeveNosDestinos />
    </main>
  );
}
