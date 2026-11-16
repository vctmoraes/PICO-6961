import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { config } from './config';
import './styles.css';

// Métrica de usuário ativo (Plausible: sem cookie, sem dado pessoal). Só liga se o domínio estiver configurado.
if (config.plausibleDomain) {
  // Fila: guarda os eventos até o script carregar.
  window.plausible =
    window.plausible ||
    Object.assign((...args: unknown[]) => (window.plausible!.q = window.plausible!.q || []).push(args), { q: [] as unknown[] });
  const s = document.createElement('script');
  s.defer = true;
  s.dataset.domain = config.plausibleDomain;
  // hash: conta as telas do roteador por âncora; outbound-links: conta os cliques em links de saída.
  s.src = 'https://plausible.io/js/script.hash.outbound-links.js';
  document.head.appendChild(s);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
