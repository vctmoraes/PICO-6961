---
name: importar-pais
description: Importa ou atualiza as áreas de ski de um país no app PICO 6961 a partir do OpenSkiMap (dados do OpenStreetMap) e faz a curadoria dos destinos mais procurados por brasileiros. Use quando o pedido for adicionar um país (ex.: "adicione as montanhas do Canadá", "coloque a Europa"), atualizar a base de um país já importado (ex.: "atualize os EUA para a nova temporada") ou escrever o conteúdo de destinos importados (ex.: "revise Whistler e Banff").
---

# Importar país e curar destinos (PICO 6961)

Esta skill tem 2 partes:

- **Parte A:** importar ou atualizar as áreas de ski de um país.
- **Parte B:** escrever o conteúdo dos destinos mais procurados.

Leia `CLAUDE.md` antes de começar. As regras do produto valem aqui também. Escreva em português do Brasil, com frase curta e voz ativa.

## Regras que não mudam

- Nunca invente dado: preço, dica, avaliação, número de pista, aeroporto ou voo.
- Nunca entregue o app com destino de exemplo ou de teste.
- Preço de passe dinâmico: use uma faixa com fonte e data (campo `passeInfo`). Nunca ponha um valor fixo inventado em `passe.valor`.
- Botão "Comprar passe": só com site oficial.
- Mantenha o crédito da licença ODbL do OpenStreetMap na tela do destino e na tela de Créditos.
- Não mude as chaves do `localStorage` (prefixo `pt.`).

## Parte A — Importar ou atualizar um país

### A1. Baixe a base

1. A base fica em `https://tiles.openskimap.org/geojson/ski_areas.geojson` (cerca de 20 MB, o mundo inteiro).
2. Se a rede bloquear o endereço, use `get_environment` e depois `update_environment` para liberar só `tiles.openskimap.org`. Explique ao usuário antes.
3. Se o modo de permissão recusar o download, peça ao usuário uma autorização clara ("pode baixar a base do OpenSkiMap"). Não tente contornar a recusa. Outra opção: o usuário roda o script no computador dele.
4. Salve o arquivo no scratchpad, numa pasta própria (ex.: `<scratchpad>/osm/ski_areas.geojson`).

### A2. Confira o formato da base

O formato pode mudar. Antes de importar, abra 1 resort conhecido do país e confira os campos. Use `python3 -I` e passe o caminho como argumento.

Campos que o script usa hoje:

- `properties.places[]` (lista de lugares) com `iso3166_1Alpha2`, `iso3166_2` e `localized.en.locality`. O formato antigo usava `properties.location`.
- `properties.status` (`operating`, `abandoned`, `disused`...).
- `properties.activities` (precisa ter `downhill`).
- `properties.statistics.runs.byActivity.downhill.byDifficulty` com `lengthInKm` por nível (`novice`, `easy`, `intermediate`, `advanced`, `expert`, `freeride`, `extreme`, `other`).
- `properties.statistics.lifts.byType[*].count`, `minElevation` e `maxElevation`.
- `properties.viewportHint.center` (centro do resort) e `properties.websites[]`.

Se um campo mudou, corrija `scripts/importar-openskimap.mjs` antes de seguir.

### A3. Rode a importação

```bash
node scripts/importar-openskimap.mjs --pais <ISO2> --saida src/data/<arquivo>.json <caminho-da-base>
```

- EUA (padrão): `npm run importar:eua` ou `node scripts/importar-openskimap.mjs <caminho-da-base>`.
- O script mostra o total e quantas áreas saíram por motivo. Conte esses números ao usuário.
- Confira 5 a 10 resorts famosos do país no JSON. Procure pelo nome parcial: o nome do OpenStreetMap pode ser longo (ex.: "Breckenridge Ski Resort").

### A4. País novo: ligue o país ao app

Para os EUA, isso já está feito. Para um país novo, use os arquivos dos EUA como modelo:

1. Crie `src/data/<pais>.ts` a partir de `src/data/eua.ts`:
   - nomes das regiões em português (como `estadosEua`);
   - lista de aeroportos que atendem as regiões de ski, com código e coordenada;
   - temporada e "Melhor época" pelo hemisfério (o app usa `lat > 0` para "Dez – Mar");
   - `fonteDados: 'openskimap'`.
2. Em `src/data/destinos.ts`:
   - acrescente o país no tipo `Pais` e na lista de `paises` (a ordem dos filtros);
   - junte os destinos novos em `destinos`;
   - ajuste o rótulo de grupo em `gruposDeDestinos` (ex.: "Canadá · Colúmbia Britânica").
3. Em `src/data/checklist.ts`, função `documentos`: escreva os documentos do país para brasileiro (passaporte, visto, autorização eletrônica). Confira a regra atual em fonte oficial e mande o usuário conferir no site do governo.
4. Em `src/pages/Guia.tsx`: acrescente a época e os documentos do país.
5. Em `src/pages/Buscar.tsx`: o filtro de região hoje só aparece para os EUA (`regiaoDoFiltro`). Estenda o filtro para o país novo.
6. Em `src/pages/Termos.tsx` (Créditos): cite a fonte dos destinos do país.
7. Moeda: se o país usa outra moeda, acrescente a moeda em `src/lib/moeda.ts` (AwesomeAPI) e no tipo `passe.moeda`.

### A5. Teste

1. `npx tsc -b`, `npm run build` e `npm run build:preview`.
2. Teste no navegador com Playwright (bloqueie Open-Meteo, AwesomeAPI, Google e OpenStreetMap com `page.route`, e use `serviceWorkers: 'block'`):
   - Busca: total, filtro de país, filtro de região, botão "Mostrar mais".
   - Página de 1 resort grande: nível, época, resumo, como chegar, checklist.
   - Comparar e Roteiro: o país aparece nos grupos da lista.
   - Mapa: o número de marcadores bate com o número de destinos.
   - Nenhum erro de página (`pageerror`).
3. Veja 1 captura de tela da página de um resort.

## Parte B — Curar os destinos mais procurados

Destino importado tem só fatos da base. Para os destinos que brasileiros mais visitam, escreva o conteúdo à mão.

1. Escolha de 10 a 30 destinos com o usuário.
2. Pegue o `id` exato de cada destino no JSON importado.
3. Escreva a curadoria no arquivo de curadoria do país (modelo: `src/data/eua-curados.ts`):
   - `nota`: frase curta para o card (até 5 palavras).
   - `resumo`: 2 ou 3 frases com fato.
   - `destaques`: 3 itens.
   - `comoChegar`: aeroporto real e tempo aproximado de carro.
   - `hospedagem.resumo` e `hospedagem.buscaReserva` ("Cidade, Região, País").
   - `dicas`: 2 a 4 dicas práticas.
   - `rede`: passe de temporada que vale no resort (ex.: Epic Pass, Ikon Pass), só se for fato.
   - `passeInfo`: preço dinâmico, com faixa, temporada e fonte. Sem fonte, use só o texto padrão de preço dinâmico.
   - `regiao` e `cidadeBase`: só se a base não tiver a cidade ou se a cidade estiver errada.
   - `revisadoEm`: data de hoje (AAAA-MM-DD).
4. Faça 1 ou 2 buscas na web para conferir o que não for conhecimento estável (preço, voo sazonal, nome novo de resort). Liste as fontes para o usuário.
5. Altitude, pistas e site continuam da base. Não copie esses números para a curadoria.
6. Se quiser destaque no Início, acrescente o id na lista de destaques do país (modelo: `destaquesEua`).

## Entrega

1. Atualize `docs/proximos-passos.md` (o que entrou, o que saiu e por quê) e `CLAUDE.md`, se a técnica mudou.
2. Gere a pré-visualização: `npm run build:preview` e depois `python3 scripts/gerar-preview-artifact.py <scratchpad>/pico-trip-preview.html`. Publique com o Artifact tool no mesmo arquivo de sempre, para manter o link.
3. Faça o commit, gere o .zip sem `node_modules`, `dist`, `dist-preview` e `.env`, e envie o .zip ao usuário.
4. Na resposta, conte: total importado, motivos de saída, destinos curados, fontes, limites dos dados e o próximo passo.
