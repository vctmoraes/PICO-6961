import { useEffect, useState } from 'react';

// Roteador simples por âncora (#buscar, #destino-valle-nevado).
// Usa só letra, número e hífen: funciona em qualquer hospedagem estática e na pré-visualização do claude.ai.
function ler(): string[] {
  const h = window.location.hash.replace(/^#\/?/, '');
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
  /** aba opcional: dicas, checklist ou avaliacoes (ex.: #destino-portillo--checklist). */
  destino: (id: string, aba?: string) => `#destino-${id}${aba ? `--${aba}` : ''}`
};
