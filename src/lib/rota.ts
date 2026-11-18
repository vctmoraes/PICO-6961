import { useEffect, useState } from 'react';

// Roteador simples por âncora (#buscar, #destino-valle-nevado).
// Usa só letra, número e hífen: funciona em qualquer hospedagem estática e na pré-visualização do claude.ai.
function ler(): string[] {
  const h = window.location.hash.replace(/^#\/?/, '');
  if (h === 'buscar-iniciantes') return ['buscar', 'iniciante'];
  if (h.startsWith('roteiro-')) return ['roteiro', h.slice('roteiro-'.length)];
  if (h.startsWith('importar-')) return ['importar', h.slice('importar-'.length)];
  if (h.startsWith('grupo-')) return ['grupo', h.slice('grupo-'.length)];
  if (h.startsWith('convite-')) return ['convite', h.slice('convite-'.length)];
  if (h === 'comparar' || h.startsWith('comparar-')) return ['comparar', ...h.slice('comparar-'.length).split('--').filter(Boolean)];
  if (h.startsWith('destino-')) {
    const resto = h.slice('destino-'.length);
    const [id, aba] = resto.split('--');
    return ['destino', id, ...(aba ? [aba] : [])];
  }
  return h ? [h] : [];
}

export function useRota(): string[] {
  const [partes, setPartes] = useState(ler);
  useEffect(() => {
    const anterior = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    const ao = () => {
      const proxima = ler();
      setPartes(proxima);
      // A busca restaura o scroll depois de renderizar os resultados e a paginação.
      if (proxima[0] !== 'buscar') window.scrollTo(0, 0);
    };
    const aoSubstituir = () => setPartes(ler());
    window.addEventListener('hashchange', ao);
    window.addEventListener('pico:substituir-rota', aoSubstituir);
    return () => {
      history.scrollRestoration = anterior;
      window.removeEventListener('hashchange', ao);
      window.removeEventListener('pico:substituir-rota', aoSubstituir);
    };
  }, []);
  return partes;
}

export function substituirRota(href: string) {
  history.replaceState(history.state, '', href);
  window.dispatchEvent(new Event('pico:substituir-rota'));
}

export const rota = {
  inicio: '#inicio',
  buscar: '#buscar',
  buscarIniciantes: '#buscar-iniciantes',
  roteiros: '#roteiros',
  perfil: '#perfil',
  termos: '#termos',
  creditos: '#creditos',
  viagem: (id: string) => `#roteiro-${id}`,
  guia: '#guia',
  planejar: '#planejar',
  grupos: '#grupos',
  grupo: (id: string) => `#grupo-${id}`,
  convite: (codigo: string) => `#convite-${codigo}`,
  questionario: '#questionario',
  mapa: '#mapa',
  /** ex.: #comparar-portillo--la-parva */
  comparar: (ids: string[]) => (ids.length ? `#comparar-${ids.join('--')}` : '#comparar'),
  /** aba opcional: dicas, checklist ou avaliacoes (ex.: #destino-portillo--checklist). */
  destino: (id: string, aba?: string) => `#destino-${id}${aba ? `--${aba}` : ''}`
};
