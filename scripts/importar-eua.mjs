#!/usr/bin/env node
// Importa as áreas de ski dos Estados Unidos da base aberta do OpenSkiMap (dados do OpenStreetMap, licença ODbL).
// Uso:
//   node scripts/importar-eua.mjs                    (baixa a base e gera src/data/eua.json)
//   node scripts/importar-eua.mjs caminho/ski_areas.geojson   (usa um arquivo já baixado)
// Saída: src/data/eua.json. Rode de novo para atualizar os dados.
import { readFileSync, writeFileSync } from 'node:fs';

const URL_BASE = 'https://tiles.openskimap.org/geojson/ski_areas.geojson';
const SAIDA = new URL('../src/data/eua.json', import.meta.url);

async function carregar() {
  const arquivo = process.argv[2];
  if (arquivo) return JSON.parse(readFileSync(arquivo, 'utf8'));
  console.log(`Baixando ${URL_BASE} …`);
  const r = await fetch(URL_BASE);
  if (!r.ok) throw new Error(`Download falhou: HTTP ${r.status}`);
  return r.json();
}

const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);

/** Centro aproximado da geometria (ponto, polígono ou multipolígono). */
function centro(g) {
  if (!g) return null;
  if (g.type === 'Point') return g.coordinates;
  const pts = [];
  const andar = (c) => (typeof c[0] === 'number' ? pts.push(c) : c.forEach(andar));
  andar(g.coordinates);
  if (!pts.length) return null;
  return [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
}

const slug = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function km(dif, chaves) {
  return chaves.reduce((s, k) => s + (num(dif?.[k]?.lengthInKm) ?? 0), 0);
}

const dados = await carregar();
const lista = Array.isArray(dados) ? dados : dados.features ?? [];
const motivos = { pais: 0, status: 0, atividade: 0, nome: 0, altitude: 0, tamanho: 0, local: 0 };
const areas = [];
const ids = new Set();

for (const f of lista) {
  const p = f.properties ?? {};
  // Formato atual: p.places (lista). Formato antigo: p.location. Prefere o lugar que tem cidade.
  const lugares = Array.isArray(p.places) ? p.places : p.location ? [p.location] : [];
  const loc = lugares.find((l) => l?.localized?.en?.locality) ?? lugares[0] ?? {};
  const pais = loc.iso3166_1Alpha2 ?? loc.localized?.en?.country;
  if (pais !== 'US' && pais !== 'United States') { motivos.pais++; continue; }
  if (p.status && p.status !== 'operating') { motivos.status++; continue; }
  if (Array.isArray(p.activities) && !p.activities.includes('downhill')) { motivos.atividade++; continue; }
  if (!p.name) { motivos.nome++; continue; }

  const est = p.statistics ?? {};
  const dif = est.runs?.byActivity?.downhill?.byDifficulty ?? {};
  const kmI = km(dif, ['novice', 'easy']);
  const kmM = km(dif, ['intermediate']);
  const kmA = km(dif, ['advanced', 'expert', 'freeride', 'extreme']);
  const kmTotal = kmI + kmM + kmA + km(dif, ['other']);
  const lifts = Object.values(est.lifts?.byType ?? {}).reduce((s, t) => s + (num(t?.count) ?? 0), 0);
  const min = num(est.minElevation) ?? num(est.runs?.minElevation) ?? num(est.lifts?.minElevation);
  const max = num(est.maxElevation) ?? num(est.runs?.maxElevation) ?? num(est.lifts?.maxElevation);
  if (min == null || max == null || max <= min) { motivos.altitude++; continue; }
  if (kmTotal < 0.5 && lifts === 0) { motivos.tamanho++; continue; }
  const c = Array.isArray(p.viewportHint?.center) ? p.viewportHint.center : centro(f.geometry);
  if (!c) { motivos.local++; continue; }

  const estado = (loc.iso3166_2 ?? '').replace('US-', '') || null;
  let id = `${slug(p.name)}-${(estado ?? 'eua').toLowerCase()}`;
  for (let i = 2; ids.has(id); i++) id = `${slug(p.name)}-${(estado ?? 'eua').toLowerCase()}-${i}`;
  ids.add(id);

  areas.push({
    id,
    nome: p.name,
    estado,
    localidade: loc.localized?.en?.locality ?? null,
    lat: Math.round(c[1] * 10000) / 10000,
    lon: Math.round(c[0] * 10000) / 10000,
    min: Math.round(min),
    max: Math.round(max),
    km: { i: Math.round(kmI * 10) / 10, m: Math.round(kmM * 10) / 10, a: Math.round(kmA * 10) / 10, total: Math.round(kmTotal * 10) / 10 },
    teleferico: lifts,
    site: Array.isArray(p.websites) && p.websites[0] ? p.websites[0] : null,
    fonte: p.id ?? null
  });
}

areas.sort((a, b) => (a.estado ?? '').localeCompare(b.estado ?? '') || a.nome.localeCompare(b.nome));
writeFileSync(
  SAIDA,
  JSON.stringify(
    {
      fonte: 'OpenSkiMap (openskimap.org), dados do OpenStreetMap',
      licenca: 'ODbL 1.0 — © colaboradores do OpenStreetMap',
      geradoEm: new Date().toISOString().slice(0, 10),
      total: areas.length,
      areas
    },
    null,
    0
  ) + '\n'
);
console.log(`Áreas dos EUA gravadas: ${areas.length}`);
console.log('Fora da lista, por motivo:', motivos);
