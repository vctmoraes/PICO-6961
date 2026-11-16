import { buscarDestino } from '../data/destinos';
import { DestinoCard } from '../components/DestinoCard';
import { CabecalhoVolta } from '../components/Nav';
import { roteiro } from '../lib/storage';
import { rota } from '../lib/rota';

export function Roteiros() {
  const salvos = roteiro.listar().map(buscarDestino).filter((d) => d !== undefined);
  return (
    <main className="conteudo">
      <CabecalhoVolta titulo="Meu roteiro" />
      {salvos.length === 0 ? (
        <div className="vazio">
          <p>Você ainda não salvou nenhum destino.</p>
          <p>Abra um destino e toque em “Salvar no roteiro”.</p>
          <a className="botao secundario" href={rota.buscar} style={{ display: 'block', color: '#fff' }}>
            Buscar destino
          </a>
        </div>
      ) : (
        <>
          <p className="legenda">Destinos que você salvou. O checklist de cada destino fica salvo neste aparelho.</p>
          {salvos.map((d) => (
            <DestinoCard key={d.id} destino={d} />
          ))}
        </>
      )}
    </main>
  );
}
