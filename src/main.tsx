import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { config } from './config';
import './styles.css';

// Métrica de usuário ativo (Plausible: sem cookie, sem dado pessoal). Só liga se o domínio estiver configurado.
if (config.plausibleDomain) {
  const s = document.createElement('script');
  s.defer = true;
  s.dataset.domain = config.plausibleDomain;
  s.src = 'https://plausible.io/js/script.hash.js';
  document.head.appendChild(s);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
