#!/usr/bin/env node
// Importa as áreas de ski de um país da base aberta do OpenSkiMap (dados do OpenStreetMap, licença ODbL).
// Uso:
//   node scripts/importar-openskimap.mjs                                   (EUA: baixa a base e gera src/data/eua.json)
//   node scripts/importar-openskimap.mjs caminho/ski_areas.geojson         (EUA, com arquivo já baixado)
//   node scripts/importar-openskimap.mjs --pais CA --saida src/data/canada.json caminho/ski_areas.geojson
// --pais: código ISO 3166-1 de 2 letras. --saida: caminho do JSON, a partir da pasta do projeto.
// Rode de novo para atualizar os dados.
import { readFileSync, writeFileSync } from 'node:fs';

const URL_BASE = 'https://tiles.openskimap.org/geojson/ski_areas.geojson';

const args = process.argv.slice(2);
const opcao = (nome, padrao) => {
  const i = args.indexOf(nome);
  if (i < 0) return padrao;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const PAIS = opcao('--pais', 'US').toUpperCase();
const saidaArg = opcao('--saida', 'src/data/eua.json');
const SAIDA = saidaArg.startsWith('/') ? new URL(`file://${saidaArg}`) : new URL(`../${saidaArg}`, import.meta.url);

async function carregar() {
  const arquivo = args[0];
  if (arquivo) return JSON.parse(readFileSync(arquivo, 'utf8'));
  console.log(`Baixando ${URL_BASE} …`);
  const r = await fetch(URL_BASE);
  if (!r.ok) throw new Error(`Download falhou: HTTP ${r.status}`);
  return r.json();
}

const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);

/** Texto puro: sem sinais de HTML nem caracteres de controle, no máximo 80 caracteres. */
const textoLimpo = (s) => String(s).replace(/[<>"`]/g, '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);

/** Só links http/https. Domínio solto vira https. O resto vira null. */
function linkLimpo(bruto) {
  const t = String(bruto ?? '').trim();
  if (!t) return null;
  const c = /^[a-z][a-z0-9+.-]*:/i.test(t) ? t : /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?:[/?#]\S*)?$/i.test(t) ? `https://${t}` : null;
  if (!c) return null;
  try {
    const u = new URL(c);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null;
  } catch {
    return null;
  }
}

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
  if (pais !== PAIS) { motivos.pais++; continue; }
  if (p.status && p.status !== 'operating') { motivos.status++; continue; }
  if (Array.isArray(p.activities) && !p.activities.includes('downhill')) { motivos.atividade++; continue; }
  const nomeLimpo = p.name ? textoLimpo(p.name) : '';
  if (!nomeLimpo) { motivos.nome++; continue; }

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

  const estado = (loc.iso3166_2 ?? '').replace(`${PAIS}-`, '') || null;
  const sufixo = (estado ?? PAIS).toLowerCase();
  let id = `${slug(nomeLimpo)}-${sufixo}`;
  for (let i = 2; ids.has(id); i++) id = `${slug(nomeLimpo)}-${sufixo}-${i}`;
  ids.add(id);

  areas.push({
    id,
    nome: nomeLimpo,
    estado,
    localidade: loc.localized?.en?.locality ? textoLimpo(loc.localized.en.locality) : null,
    lat: Math.round(c[1] * 10000) / 10000,
    lon: Math.round(c[0] * 10000) / 10000,
    min: Math.round(min),
    max: Math.round(max),
    km: { i: Math.round(kmI * 10) / 10, m: Math.round(kmM * 10) / 10, a: Math.round(kmA * 10) / 10, total: Math.round(kmTotal * 10) / 10 },
    teleferico: lifts,
    site: Array.isArray(p.websites) ? p.websites.map(linkLimpo).find(Boolean) ?? null : null,
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
console.log(`Áreas de ${PAIS} gravadas: ${areas.length} → ${SAIDA.pathname}`);
console.log('Fora da lista, por motivo:', motivos);
