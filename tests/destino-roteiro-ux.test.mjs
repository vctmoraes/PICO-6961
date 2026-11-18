// Run npm run build, then npm run preview -- --port 4377.
// Run node --test tests/destino-roteiro-ux.test.mjs with Playwright installed or PLAYWRIGHT_MODULE set.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const base = process.env.PICO_TEST_URL ?? 'http://127.0.0.1:4377';

async function scenario(run, width = 390) {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE });
  try {
    const context = await browser.newContext({ viewport: { width, height: 844 }, serviceWorkers: 'block' });
    await context.route('**/*', (route) => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
    const page = await context.newPage();
    page.setDefaultTimeout(5000);
    await run(page, context);
  } finally {
    await browser.close();
  }
}

const destino = '#destino-valle-nevado';
const cta = (page) => page.getByRole('button', { name: 'Adicionar ao roteiro', exact: true });

test('destination shows the decision and keeps official operations separate from weather', async () => {
  for (const width of [360, 390, 430, 1280]) await scenario(async (page) => {
    await page.goto(base + destino);
    await page.getByRole('heading', { name: 'Valle Nevado' }).waitFor();
    await page.getByText('Época típica').waitFor();
    await page.getByText('Não inclui hospedagem, transporte ou aulas.').waitFor();
    const official = page.getByRole('link', { name: 'Boletim oficial' });
    await official.waitFor();
    assert.match(await official.getAttribute('href'), /vallenevado/);
    for (const control of [cta(page), official]) {
      const box = await control.boundingBox();
      assert.ok(box.height >= 44 && box.y + box.height <= 844, JSON.stringify(box));
    }
    await page.getByRole('button', { name: 'Previsão dos próximos dias' }).click();
    await page.getByRole('button', { name: 'Tentar novamente' }).waitFor();
    await page.getByText('Conversão para reais indisponível.').waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
  }, width);
});

test('existing itinerary add confirms persistence and restores keyboard focus', async () => {
  await scenario(async (page) => {
    await page.addInitScript(() => localStorage.setItem('pt.viagens', JSON.stringify([
      { id: 'teste', nome: 'Chile em julho', destinos: [], dias: [], ida: '', volta: '', pessoas: 1, notas: '', criadaEm: '' }
    ])));
    await page.goto(base + '#roteiros');
    await page.getByText('Chile em julho').waitFor();
    await page.evaluate((hash) => { location.hash = hash; }, destino);
    const voltar = page.getByRole('link', { name: 'Voltar para meus roteiros' });
    assert.equal(await voltar.getAttribute('href'), '#roteiros');
    await cta(page).focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), 'Fechar');
    await dialog.getByRole('button', { name: 'Adicionar a Chile em julho' }).click();
    assert.match(await dialog.getByRole('status').textContent(), /Adicionado ao roteiro “Chile em julho”/);
    assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Abrir roteiro');
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('pt.viagens'))[0].destinos), ['valle-nevado']);
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    assert.match(await page.evaluate(() => document.activeElement.textContent), /Adicionar a outro roteiro/);
  });
});

test('draft creation survives reload, dates unlock the schedule, and WhatsApp imports a separate copy', async () => {
  await scenario(async (page, context) => {
    await page.goto(base + destino);
    await cta(page).click();
    await page.getByRole('button', { name: 'Criar roteiro' }).click();
    await page.getByText('Adicione as datas de ida e volta para montar o dia a dia.').waitFor();
    await page.reload();
    await page.getByRole('link', { name: /^Valle Nevado/ }).waitFor();
    await page.getByLabel('Ida', { exact: true }).fill('2027-07-10');
    await page.getByLabel('Volta', { exact: true }).fill('2027-07-12');
    await page.getByRole('button', { name: 'Distribuir os dias entre os destinos' }).click();
    assert.equal(await page.locator('.dia').count(), 3);
    await page.getByRole('link', { name: /Valle Nevado/ }).first().click();
    await page.getByRole('link', { name: 'Voltar ao roteiro' }).click();
    await page.getByRole('heading', { name: 'Dia a dia' }).waitFor();
    assert.equal(await page.locator('.dia').count(), 3);
    const whatsapp = page.getByRole('link', { name: 'Enviar cópia pelo WhatsApp' });
    const mensagem = new URL(await whatsapp.getAttribute('href')).searchParams.get('text');
    const importUrl = mensagem.match(/https?:\/\/\S+#importar-\S+/)[0];
    const receiver = await context.newPage();
    await receiver.goto(importUrl);
    await receiver.getByRole('button', { name: 'Salvar nos meus roteiros' }).click();
    await receiver.getByRole('heading', { name: 'Dia a dia' }).waitFor();
    assert.notEqual(new URL(receiver.url()).hash, new URL(page.url()).hash);
    assert.equal(await receiver.locator('.dia').count(), 3);
  });
});
