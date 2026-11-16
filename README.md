# PICO 6961

App (PWA) para planejar viagem de ski e snowboard: condição da neve em tempo real, preço do passe, hospedagem, checklist e relato de usuário.

## Rodar no computador

1. Instale o Node.js 20 ou mais novo.
2. Na pasta do projeto, rode `npm install`.
3. Rode `npm run dev`.
4. Abra o endereço que aparece no terminal (em geral, http://localhost:5173).

## Importar os destinos dos Estados Unidos

Os destinos dos EUA vêm da base aberta do OpenSkiMap (dados do OpenStreetMap).

1. Rode `npm run importar:eua`. O script baixa a base (cerca de dezenas de MB) e grava `src/data/eua.json`.
2. Rode `npm run build` de novo.

Rode o passo 1 de novo para atualizar os dados. Licença dos dados: ODbL. O app mostra o crédito ao OpenStreetMap. Se o app publicar a base derivada (`eua.json`), essa base também fica sob a ODbL.

## Publicar (Netlify, grátis)

1. Crie um repositório no GitHub e envie esta pasta.
2. No Netlify, clique em "Add new site" e escolha o repositório.
3. Use o comando de build `npm run build` e a pasta `dist`.
4. Em "Environment variables", preencha as variáveis do `.env.example`.

O Vercel e o Cloudflare Pages também servem. A configuração é a mesma.

## Estrutura

- `src/data/destinos.ts` — conteúdo curado dos destinos.
- `src/data/checklist.ts` — checklist de equipamento.
- `src/lib/clima.ts` — condição de neve e tempo (Open-Meteo).
- `src/lib/storage.ts` — roteiro, checklist e relatos do usuário.
- `src/pages/` — telas: Início, Buscar, Destino, Roteiros, Perfil, Termos.
- `docs/` — briefing, agente de atualização, fotos e licenças, próximos passos.
