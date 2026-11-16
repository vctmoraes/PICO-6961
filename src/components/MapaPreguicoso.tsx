import { Suspense, lazy } from 'react';
import type { PropsMapa } from './Mapa';

const Mapa = lazy(() => import('./Mapa'));

/** Carrega o mapa só quando a tela precisa dele. */
export function MapaPreguicoso(props: PropsMapa) {
  return (
    <Suspense fallback={<div className="mapa carregando" style={{ height: props.altura ?? 260 }}>Carregando o mapa…</div>}>
      <Mapa {...props} />
    </Suspense>
  );
}

/** Link da rota de carro no Google Maps, passando pelos destinos na ordem (até 9 paradas no meio). */
export function linkRotaGoogle(pontos: { nome: string; regiao: string; pais: string }[]): string {
  const nomes = pontos.map((p) => `${p.nome} centro de ski, ${p.regiao}, ${p.pais}`);
  const u = new URL('https://www.google.com/maps/dir/');
  u.searchParams.set('api', '1');
  u.searchParams.set('origin', nomes[0]);
  u.searchParams.set('destination', nomes[nomes.length - 1]);
  if (nomes.length > 2) u.searchParams.set('waypoints', nomes.slice(1, -1).slice(0, 9).join('|'));
  u.searchParams.set('travelmode', 'driving');
  return u.toString();
}

/** Links para abrir o destino no Google Maps e no Apple Maps (busca pelo nome: mais preciso que a coordenada aproximada). */
export function linksNavegacao(nome: string, regiao: string, pais: string) {
  const q = encodeURIComponent(`${nome} centro de ski, ${regiao}, ${pais}`);
  return {
    google: `https://www.google.com/maps/search/?api=1&query=${q}`,
    apple: `https://maps.apple.com/?q=${q}`
  };
}
