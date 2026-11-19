// Build first, then run with Node 22+ and Chrome: node --test tests/equipamento.test.mjs
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
  perfil = await mkdtemp(join(tmpdir(), 'pico-equipamento-'));
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

const marcar = (nome, rotulo) => avaliar(`(() => {
  const l = [...document.querySelectorAll('fieldset')].find((f) => f.querySelector('legend')?.textContent === ${JSON.stringify(nome)});
  [...l.querySelectorAll('label')].find((x) => x.textContent.includes(${JSON.stringify(rotulo)})).querySelector('input').click();
})()`);
const textoResultado = () => avaliar(`document.querySelector('.consultor-resultado')?.innerText ?? ''`);

test('consultor recomenda ski, tamanho e destinos com terreno, e lembra as escolhas na aba', async () => {
  await ir('#inicio');
  await clicar('a[href="#equipamento"]');
  await esperar(`location.hash === '#equipamento' && !!document.querySelector('.consultor-vazio')`);
  await marcar('O que você pratica?', 'Ski');
  await marcar('Qual é o seu nível?', 'Intermediário');
  await esperar(`!!document.querySelector('.consultor-resultado')`);
  await marcar('Como você gosta de andar?', 'Curvas curtas');
  await esperar(`document.querySelector('#consultor-titulo')?.textContent.includes('Curvas curtas')`);
  await avaliar(`document.querySelector('.consultor-medidas').open = true`);
  await digitar('.consultor-medidas input', '175');
  await esperar(`document.querySelector('.consultor-tamanho')?.textContent.includes('164 a 169 cm')`);
  const texto = await textoResultado();
  assert.match(texto, /Pista de mogul/);
  const destinos = await avaliar(`[...document.querySelectorAll('.consultor-destinos > li')].length`);
  assert.ok(destinos >= 2 && destinos <= 6);
  assert.equal(await avaliar(`[...document.querySelectorAll('.consultor-regiao h3')].map((h) => h.textContent.split(' ·')[0]).join('|')`), 'Chile e Argentina|Estados Unidos');
  const linksOficiais = await avaliar(`[...document.querySelectorAll('.consultor-motivos a')].every((a) => a.protocol === 'https:' && a.rel.includes('noopener'))`);
  assert.equal(linksOficiais, true);
  await clicar('.consultor-destinos a[href^="#destino-"]');
  await esperar(`location.hash.startsWith('#destino-')`);
  await avaliar('history.back()');
  await esperar(`document.querySelector('#consultor-titulo')?.textContent.includes('Curvas curtas')`);
  // Altura não é guardada.
  assert.equal(await avaliar(`document.querySelector('.consultor-medidas input').value`), '');
  assert.equal(await avaliar(`JSON.stringify({...localStorage}).includes('175') || (sessionStorage.getItem('pico.consultor') ?? '').includes('175')`), false);
});

test('snowboard iniciante: tamanho pelo peso, prancha wide e nada de resort sem snowboard', async () => {
  await ir('#equipamento');
  await marcar('O que você pratica?', 'Snowboard');
  await marcar('Qual é o seu nível?', 'Iniciante');
  await esperar(`document.querySelector('#consultor-titulo')?.textContent.includes('Aprender')`);
  assert.equal(await avaliar(`!!document.querySelector('fieldset legend') && ![...document.querySelectorAll('legend')].some((l) => l.textContent === 'Como você gosta de andar?')`), true);
  await avaliar(`document.querySelector('.consultor-medidas').open = true`);
  const campos = `document.querySelectorAll('.consultor-medidas input')`;
  await avaliar(`(() => { const [a, p, c] = ${campos}; const set = (e, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, v); e.dispatchEvent(new Event('input', {bubbles: true})); }; set(a, '180'); set(p, '75'); set(c, '44'); })()`);
  await esperar(`[...document.querySelectorAll('.consultor-tamanho')].some((e) => e.textContent.includes('150 a 155 cm'))`);
  assert.match(await textoResultado(), /prancha wide/);
  assert.doesNotMatch(await textoResultado(), /Deer Valley/);
  for (const width of [360, 390, 430, 1280]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: width < 600 });
    await esperar(`innerWidth === ${width}`);
    const [scroll, client] = await avaliar('[document.documentElement.scrollWidth, document.documentElement.clientWidth]');
    assert.equal(scroll, client, `overflow em ${width}px`);
  }
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
});

test('quem ainda não sabe vê ski e snowboard lado a lado', async () => {
  await ir('#equipamento');
  await marcar('O que você pratica?', 'Ainda não sei');
  await marcar('Qual é o seu nível?', 'Nunca fui');
  await esperar(`document.querySelectorAll('.consultor-equip').length === 2`);
  assert.match(await textoResultado(), /Ski de iniciante/);
  assert.match(await textoResultado(), /Prancha de iniciante/);
});
