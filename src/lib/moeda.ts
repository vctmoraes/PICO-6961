// Cotação do real (BRL) pela AwesomeAPI (grátis, sem chave): https://docs.awesomeapi.com.br/api-de-moedas
// Sem cotação (sem internet, API fora do ar, pré-visualização), o app esconde o valor em real. Nunca inventa cotação.
import { useEffect, useState } from 'react';

export type Moeda = 'USD' | 'CLP' | 'ARS';
/** Quantos reais vale 1 unidade de cada moeda. */
export type Cotacoes = Record<Moeda, number> & { em: string };

const CHAVE = 'pt.cotacao';
const VALIDADE_MS = 6 * 60 * 60 * 1000;
let pedido: Promise<Cotacoes | null> | null = null;

function lerCache(): Cotacoes | null {
  try {
    const c = JSON.parse(localStorage.getItem(CHAVE) ?? 'null') as Cotacoes | null;
    return c && Date.now() - new Date(c.em).getTime() < VALIDADE_MS ? c : null;
  } catch {
    return null;
  }
}

export function buscarCotacoes(): Promise<Cotacoes | null> {
  const cache = lerCache();
  if (cache) return Promise.resolve(cache);
  pedido ??= fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,CLP-BRL,ARS-BRL')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`AwesomeAPI respondeu ${r.status}`))))
    .then((j: Record<string, { bid: string }>) => {
      const c: Cotacoes = { USD: Number(j.USDBRL?.bid), CLP: Number(j.CLPBRL?.bid), ARS: Number(j.ARSBRL?.bid), em: new Date().toISOString() };
      if (!(c.USD > 0)) return null;
      try {
        localStorage.setItem(CHAVE, JSON.stringify(c));
      } catch {
        /* sem armazenamento: segue sem cache */
      }
      return c;
    })
    .catch(() => {
      pedido = null;
      return null;
    });
  return pedido;
}

export function useCotacoes(): Cotacoes | null {
  const [c, setC] = useState<Cotacoes | null>(lerCache);
  useEffect(() => {
    let vivo = true;
    buscarCotacoes().then((x) => vivo && setC(x));
    return () => {
      vivo = false;
    };
  }, []);
  return c;
}

/** "≈ R$ 520" ou null quando não há cotação dessa moeda. */
export function emReal(valor: number, moeda: Moeda, c: Cotacoes | null): string | null {
  const taxa = c?.[moeda];
  if (!taxa || !(taxa > 0)) return null;
  return `≈ R$ ${Math.round(valor * taxa).toLocaleString('pt-BR')}`;
}
