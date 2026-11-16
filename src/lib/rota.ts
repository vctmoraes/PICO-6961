import { useEffect, useState } from 'react';

// Roteador simples por âncora (#buscar, #destino-valle-nevado).
// Usa só letra, número e hífen: funciona em qualquer hospedagem estática e na pré-visualização do claude.ai.
function ler(): string[] {
  const h = window.location.hash.replace(/^#\/?/, '');
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
    const ao = () => {
      setPartes(ler());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', ao);
    return () => window.removeEventListener('hashchange', ao);
  }, []);
  return partes;
}

export const rota = {
  inicio: '#inicio',
  buscar: '#buscar',
  roteiros: '#roteiros',
  perfil: '#perfil',
  termos: '#termos',
  creditos: '#creditos',
  viagem: (id: string) => `#roteiro-${id}`,
  guia: '#guia',
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
