// Run with: node --test scripts/test-planejador.mjs
import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';

const vite = await createServer({ configFile: false, server: { middlewareMode: true, ws: false }, appType: 'custom' });
after(() => vite.close());
const lib = await vite.ssrLoadModule('/src/lib/planejar.ts');
const { distribuirDias } = await vite.ssrLoadModule('/src/lib/viagem.ts');
const cot = { USD: 5, CLP: 0.0055, ARS: 0.005, em: '2026-07-01T12:00:00Z' };
const pedido = { ida: '2026-07-13', volta: '2026-07-19', pessoas: 2, orcamentoPessoa: 3000, pais: 'Chile', nivel: 'nunca' };

test('classifies complete ranges against the cap, including exact boundaries', () => {
  const status = lib.classificarOrcamento;
  assert.equal(status([100, 200], false, 200), 'dentro');
  assert.equal(status([100, 201], false, 200), 'pode-passar');
  assert.equal(status([100, 201], false, 100), 'pode-passar');
  assert.equal(status([201, 300], false, 200), 'fora');
  assert.equal(status([201, 300], false, 0), 'sem-teto');
});

test('does not mistake a partial estimate for a budget fit or ignore a known excessive minimum', () => {
  const status = lib.classificarOrcamento;
  assert.equal(status([100, 150], true, 200), 'incompleto');
  assert.equal(status([201, 300], true, 200), 'fora');
  assert.equal(status(undefined, true, 200), 'incompleto');
});

test('July suggestions are single-destination, explain the season and prioritize complete fits', () => {
  const { planos } = lib.planejar(pedido, {}, cot);
  assert.ok(planos.length > 0);
  for (const plano of planos) {
    assert.equal('nota' in plano, false);
    assert.ok(plano.motivos.some((motivo) => /julho/i.test(motivo)));
    assert.equal(plano.diasSki, 5);
    assert.notEqual(plano.orcamento, 'fora');
  }
  const peso = { dentro: 0, 'pode-passar': 1, incompleto: 2 };
  assert.ok(planos.every((plano, i) => i === 0 || peso[planos[i - 1].orcamento] <= peso[plano.orcamento]));
});

test('no or wrong exchange rate is not interpreted as a zero cost', () => {
  for (const taxas of [null, { ...cot, CLP: NaN }]) {
    const { planos } = lib.planejar(pedido, {}, taxas);
    assert.ok(planos.some((p) => p.semCotacao));
    for (const plano of planos) {
      if (!taxas) assert.equal(plano.custoPessoa, undefined);
      else if (plano.custoPessoa) assert.ok(plano.custoPessoa[0] > 0);
      assert.equal(plano.orcamento, 'incompleto');
      assert.ok(plano.semCotacao || plano.semPreco.length);
    }
  }
});

test('distinguishes unavailable price data from currency conversion', () => {
  const { planos } = lib.planejar({ ...pedido, ida: '2026-01-13', volta: '2026-01-19', pais: 'Estados Unidos' }, {}, cot);
  assert.ok(planos.some((p) => p.semPreco.length && !p.semCotacao));
});

test('rejects dates with no ski day or beyond the itinerary length, without truncating', () => {
  for (const volta of ['2026-07-14', '2026-09-12', '2026-07-12', '2026-07-XX']) {
    assert.equal(lib.planejar({ ...pedido, volta }, {}, cot).planos.length, 0, volta);
  }
  assert.ok(lib.planejar({ ...pedido, volta: '2026-09-10', orcamentoPessoa: 0 }, {}, cot).planos.length);
});

test('does not suggest typical July resorts when any planned ski day is out of season', () => {
  const { planos, avisos } = lib.planejar({ ...pedido, ida: '2026-05-30', volta: '2026-06-04' }, {}, cot);
  assert.equal(planos.length, 0);
  assert.match(avisos.join(' '), /temporada/i);
});

test('requires no exact dates to explore and does not pretend to price a whole trip', () => {
  const { planos } = lib.explorarMes(7, 'Chile', { nivel: 'nunca' });
  assert.ok(planos.length);
  assert.equal(planos[0].destino.nivel, 'iniciante');
  for (const plano of planos) {
    assert.match(plano.motivos.join(' '), /julho/i);
    assert.equal('custoPessoa' in plano, false);
  }
  assert.equal(lib.explorarMes(1, 'Chile', {}).planos.length, 0);
});

test('generated itinerary uses exactly the priced ski days', () => {
  const plano = lib.planejar(pedido, {}, cot).planos[0];
  const dias = distribuirDias({ ...pedido, dias: [], destinos: [plano.destino.id] });
  assert.equal(dias.filter((d) => d.atividade === 'ski').length, plano.diasSki);
  assert.equal(dias[0].atividade, 'viagem');
  assert.equal(dias.at(-1).atividade, 'viagem');
});
