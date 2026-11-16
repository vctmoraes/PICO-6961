import { useState } from 'react';
import type { Destino } from '../data/destinos';
import { config } from '../config';

type Vista = 'mapa' | 'satelite';

/**
 * Google Maps embutido (o usuário arrasta e dá zoom). Mostra 1 lugar por vez.
 * Com VITE_GOOGLE_MAPS_KEY: Maps Embed API oficial (grátis, sem limite de uso).
 * Sem chave: endereço de incorporação clássico do Google Maps. Serve para o teste; antes do lançamento, ponha a chave.
 */
export function MapaGoogle({ destino }: { destino: Destino }) {
  const [vista, setVista] = useState<Vista>('satelite');
  const q = encodeURIComponent(`${destino.nome} centro de ski, ${destino.regiao}, ${destino.pais}`);
  const src = config.googleMapsKey
    ? `https://www.google.com/maps/embed/v1/place?key=${config.googleMapsKey}&q=${q}&zoom=12&language=pt-BR&maptype=${vista === 'satelite' ? 'satellite' : 'roadmap'}`
    : `https://maps.google.com/maps?q=${q}&t=${vista === 'satelite' ? 'k' : 'p'}&z=12&hl=pt-BR&output=embed`;

  // A pré-visualização no claude.ai não deixa incorporar outro site.
  if (import.meta.env.MODE === 'preview') {
    return <div className="mapa carregando">O mapa do Google aparece no app publicado.</div>;
  }

  return (
    <div className="mapa-google">
      <div className="alternar-vista" role="group" aria-label="Tipo de mapa">
        {(['satelite', 'mapa'] as Vista[]).map((v) => (
          <button key={v} type="button" className={vista === v ? 'ativo' : ''} aria-pressed={vista === v} onClick={() => setVista(v)}>
            {v === 'satelite' ? 'Satélite' : 'Mapa'}
          </button>
        ))}
      </div>
      <iframe
        key={src}
        className="mapa"
        title={`Mapa de ${destino.nome} no Google Maps`}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
