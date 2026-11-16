// Mapa com Leaflet + OpenStreetMap. Carregado sob demanda (React.lazy), para não pesar a abertura do app.
// Os pontos são marcadores desenhados em CSS/SVG: nenhuma imagem externa além do mapa de fundo.
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { nivelLabel, type Destino } from '../data/destinos';
import { config } from '../config';
import { rota } from '../lib/rota';

const corNivel = { iniciante: '#1F6B44', intermediario: '#92631B', avancado: '#9C3B30' };

export interface PropsMapa {
  pontos: Destino[];
  /** Destino em destaque (marcador maior, laranja). */
  foco?: string;
  /** Mostra o número da ordem no marcador e liga os pontos com uma linha (roteiro). */
  ordem?: boolean;
  altura?: number | string;
  /** Zoom fixo no destino em foco. Sem zoom, o mapa mostra todos os pontos. */
  zoom?: number;
}

export default function Mapa({ pontos, foco, ordem = false, altura = 260, zoom }: PropsMapa) {
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!caixa.current || pontos.length === 0) return;
    const mapa = L.map(caixa.current, { scrollWheelZoom: false, attributionControl: true });
    L.tileLayer(config.mapaTiles, { attribution: config.mapaCredito, maxZoom: 17 }).addTo(mapa);

    pontos.forEach((d, i) => {
      const emFoco = d.id === foco;
      const cor = emFoco ? '#D9480F' : corNivel[d.nivel];
      const tam = ordem ? 28 : emFoco ? 22 : pontos.length > 8 ? 12 : 16;
      const icone = L.divIcon({
        className: 'marcador',
        html: `<span style="background:${cor};width:${tam}px;height:${tam}px">${ordem ? i + 1 : ''}</span>`,
        iconSize: [tam, tam],
        iconAnchor: [tam / 2, tam / 2]
      });
      L.marker([d.lat, d.lon], { icon: icone, title: d.nome, zIndexOffset: emFoco ? 1000 : 0 })
        .addTo(mapa)
        .on('click', () => {
          // Na visão geral, o toque aproxima o mapa, para separar centros que ficam perto um do outro.
          if (mapa.getZoom() < 9) mapa.flyTo([d.lat, d.lon], 10, { duration: 0.6 });
        })
        .bindPopup(
          `<strong>${d.nome}</strong><br>${d.pais} · ${nivelLabel[d.nivel]}<br>${d.altitudeBase}–${d.altitudeTopo} m` +
            (emFoco ? '' : `<br><a href="${rota.destino(d.id)}">Ver destino</a>`)
        );
    });

    if (ordem && pontos.length > 1) {
      L.polyline(
        pontos.map((d) => [d.lat, d.lon] as [number, number]),
        { color: '#13394A', weight: 3, dashArray: '6 6', opacity: 0.8 }
      ).addTo(mapa);
    }

    const focado = pontos.find((d) => d.id === foco);
    if (focado && zoom) mapa.setView([focado.lat, focado.lon], zoom);
    else if (pontos.length === 1) mapa.setView([pontos[0].lat, pontos[0].lon], zoom ?? 9);
    else mapa.fitBounds(L.latLngBounds(pontos.map((d) => [d.lat, d.lon] as [number, number])), { padding: [28, 28] });

    // O mapa pode nascer dentro de um bloco que ainda está mudando de tamanho.
    const t = setTimeout(() => mapa.invalidateSize(), 150);
    return () => {
      clearTimeout(t);
      mapa.remove();
    };
  }, [pontos.map((d) => d.id).join(), foco, ordem, zoom]);

  return (
    <>
      <div ref={caixa} className="mapa" style={{ height: altura }} role="region" aria-label="Mapa" />
      {import.meta.env.MODE === 'preview' && (
        <p className="legenda">A pré-visualização não carrega o mapa de fundo. Os pontos funcionam. No app publicado, o mapa aparece completo.</p>
      )}
    </>
  );
}
