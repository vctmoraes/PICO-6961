// Build first, then run with Node 22+ and Chrome: node --test tests/descoberta.test.mjs
// Set CHROME_BIN to use another Chromium executable.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { setTimeout as sleep } from 'node:timers/promises';
import { preview } from 'vite';

let server, chrome, perfil, ws, base;
let seq = 0;
const pendentes = new Map();
const erros = [];

async function ate(fn, descricao) {
  for (let i = 0; i < 100; i++) {
    const resultado = await fn();
    if (resultado) return resultado;
    await sleep(50);
  }
  assert.fail(descricao);
}

function cdp(method, params = {}) {
  const id = ++seq;
  return new Promise((resolve, reject) => {
    pendentes.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function avaliar(expression) {
  const resposta = await cdp('Runtime.evaluate', { expression, returnByValue: true });
  assert.ok(!resposta.exceptionDetails, resposta.exceptionDetails?.exception?.description);
  return resposta.result.value;
}

const esperar = (expression) => ate(() => avaliar(expression), expression);
const clicar = (seletor) => avaliar(`document.querySelector(${JSON.stringify(seletor)}).click()`);
const digitar = (seletor, valor) => avaliar(`(() => {
  const e = document.querySelector(${JSON.stringify(seletor)});
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, ${JSON.stringify(valor)});
  e.dispatchEvent(new Event('input', {bubbles: true}));
})()`);
const ir = async (hash) => {
  await cdp('Page.navigate', { url: `${base}/${hash}` });
  await esperar(`location.hash === ${JSON.stringify(hash)} && !!document.querySelector('main')`);
};

before(async () => {
  server = await preview({ preview: { host: '127.0.0.1', port: 0 } });
  base = `http://127.0.0.1:${server.httpServer.address().port}`;
  perfil = await mkdtemp(join(tmpdir(), 'pico-descoberta-'));
  chrome = spawn(process.env.CHROME_BIN || 'google-chrome', [
    '--headless', '--no-sandbox', '--disable-dev-shm-usage', '--remote-debugging-port=0', `--user-data-dir=${perfil}`, 'about:blank'
  ], { stdio: 'ignore' });
  let erroChrome;
  chrome.on('error', (erro) => { erroChrome = erro; });
  const porta = await ate(async () => {
    if (erroChrome) throw erroChrome;
    return (await readFile(join(perfil, 'DevToolsActivePort'), 'utf8').catch(() => '')).split('\n')[0];
  }, 'Chrome não abriu a porta de depuração');
  const abas = await fetch(`http://127.0.0.1:${porta}/json/list`).then((r) => r.json());
  ws = new WebSocket(abas.find((a) => a.type === 'page').webSocketDebuggerUrl);
  await Promise.race([once(ws, 'open'), once(ws, 'error').then(([e]) => Promise.reject(e))]);
  ws.addEventListener('message', ({ data }) => {
    const m = JSON.parse(data);
    if (m.method === 'Runtime.exceptionThrown') erros.push(m.params.exceptionDetails);
    const pedido = pendentes.get(m.id);
    if (pedido) {
      pendentes.delete(m.id);
      if (m.error) pedido.reject(new Error(m.error.message));
      else pedido.resolve(m.result);
    }
  });
  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Network.enable');
  await cdp('Network.setBlockedURLs', { urls: ['https://*'] });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
});

after(async () => {
  ws?.close();
  if (chrome?.pid && chrome.exitCode === null && chrome.signalCode === null) {
    const saiu = once(chrome, 'exit');
    chrome.kill();
    await saiu;
  }
  if (server) await new Promise((resolve) => server.httpServer.close(resolve));
  if (perfil) await rm(perfil, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  assert.deepEqual(erros, []);
});

test('busca recupera filtros, paginação e posição após voltar de um destino', async () => {
  await ir('#buscar');
  await esperar(`!!document.querySelector('select[aria-label="País"]')`);
  await avaliar(`(() => { const e = document.querySelector('select[aria-label="País"]'); e.value = 'Estados Unidos'; e.dispatchEvent(new Event('change', {bubbles:true})); })()`);
  await digitar('input[aria-label="Buscar destino"]', 'estados unidos');
  await esperar(`[...document.querySelectorAll('button')].some(b => b.textContent.includes('Mostrar mais'))`);
  await avaliar(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Mostrar mais')).click()`);
  await esperar(`document.querySelectorAll('a.card').length > 40`);
  await avaliar(`document.querySelectorAll('a.card')[44].scrollIntoView({block:'center'})`);
  const y = await avaliar('scrollY');
  assert.ok(y > 500);
  await avaliar(`document.querySelectorAll('a.card')[44].click()`);
  await esperar(`location.hash.startsWith('#destino-') && !document.querySelector('input[aria-label="Buscar destino"]')`);
  await avaliar('history.back()');
  await esperar(`document.querySelector('input[aria-label="Buscar destino"]')?.value === 'estados unidos'`);
  assert.equal(await avaliar(`document.querySelector('select[aria-label="País"]').value`), 'Estados Unidos');
  await esperar(`document.querySelectorAll('a.card').length > 40 && Math.abs(scrollY - ${y}) < 3`);
});


test('comparador pesquisa, limita a seleção, preserva links e funciona no celular', async () => {
  await ir('#comparar-portillo--portillo--inexistente--la-parva');
  await esperar(`Array.from(document.querySelectorAll('.comparacao thead a'), a => a.textContent).join('|') === 'Portillo|La Parva'`);
  await digitar('input[aria-label="Buscar destino para comparar"]', 'santiago nevado');
  await esperar(`!!document.querySelector('button[aria-label="Adicionar Valle Nevado"]')`);
  await clicar('button[aria-label="Adicionar Valle Nevado"]');
  await esperar(`location.hash === '#comparar-portillo--la-parva--valle-nevado' && document.querySelectorAll('.comparacao thead a').length === 3`);
  for (const width of [360, 390, 430, 1280]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: width < 600 });
    await esperar(`innerWidth === ${width}`);
    const [scroll, client] = await avaliar('[document.documentElement.scrollWidth, document.documentElement.clientWidth]');
    assert.equal(scroll, client, `overflow em ${width}px`);
  }
  await clicar('button[aria-label="Remover La Parva"]');
  await esperar(`location.hash === '#comparar-portillo--valle-nevado' && document.querySelectorAll('.comparacao thead a').length === 2`);
  assert.equal(await avaliar(`document.activeElement.getAttribute('aria-label')`), 'Buscar destino para comparar');
  assert.equal(await avaliar(`document.querySelector('.comparacao').textContent.includes('Cotação indisponível')`), true);
});

test('busca seleciona destinos separados e o guia dá um ponto de partida', async () => {
  await ir('#buscar');
  await esperar(`!!document.querySelector('.resumo-busca')`);
  await avaliar(`document.querySelector('.resumo-busca button')?.click()`);
  await digitar('input[aria-label="Buscar destino"]', 'chile el colorado');
  await esperar(`!!document.querySelector('button[aria-label="Comparar El Colorado"]')`);
  await clicar('button[aria-label="Comparar El Colorado"]');
  await digitar('input[aria-label="Buscar destino"]', 'chapelco');
  await esperar(`!!document.querySelector('button[aria-label="Comparar Chapelco"]')`);
  await clicar('button[aria-label="Comparar Chapelco"]');
  await clicar('.acoes-montanha a[href^="#comparar"]');
  await esperar(`location.hash === '#comparar-el-colorado--chapelco' && !!document.querySelector('.comparacao')`);
  await avaliar('history.back()');
  await esperar(`document.querySelector('input[aria-label="Buscar destino"]')?.value === 'chapelco'`);
  assert.equal(await avaliar(`document.querySelector('button[aria-label="Comparar Chapelco"]').getAttribute('aria-pressed')`), 'true');
  await ir('#guia');
  await esperar(`!!document.querySelector('.guia-escolhas')`);
  const links = await avaliar(`document.querySelectorAll('.guia-escolhas a').length`);
  assert.ok(links >= 3 && links <= 5);
  await clicar('a[href="#buscar-iniciantes"]');
  await esperar(`document.querySelector('select[aria-label="Nível"]')?.value === 'iniciante'`);
  await digitar('input[aria-label="Buscar destino"]', 'xxxxx-inexistente');
  await esperar(`!!document.querySelector('.vazio button')`);
  await clicar('.vazio button');
  await esperar(`!!document.querySelector('a.card') && document.activeElement.matches('input[type="search"]')`);
  assert.equal(await avaliar(`document.querySelector('select[aria-label="Nível"]').value`), 'iniciante');
  await avaliar('history.back()');
  await esperar(`!!document.querySelector('.guia-escolhas')`);
  await clicar('.guia-acoes a[href^="#comparar-"]');
  await esperar(`document.querySelectorAll('.comparacao thead a').length === 3`);
});
