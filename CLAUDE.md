# Pico Trip — contexto para o Claude

Leia `docs/briefing.md` antes de começar. O briefing tem todas as decisões de produto, de marca e de design.

## Regras do produto (não mudar sem o Victor pedir)

- O app só informa e mostra link de saída. O app não processa reserva nem pagamento (caso Liftopia).
- MVP: só ski e snowboard. Outros esportes aparecem como "em breve".
- Todo preço mostra a data de verificação. Sem data, o app mostra "valor estimado".
- Foto de destino só entra com autor e licença confirmados (`docs/fotos-e-licencas.md`).
- Nunca invente avaliação, relato ou número de usuário.
- Todo texto do app em português do Brasil, com frase curta e voz ativa.

## Técnica

- PWA com Vite + React 18 + TypeScript. Sem servidor nesta fase.
- Conteúdo curado: `src/data/destinos.ts`. O agente de atualização edita só este arquivo (ver `docs/agente-atualizacao.md`).
- Condição de neve e tempo: API Open-Meteo (`src/lib/clima.ts`). Licença CC BY 4.0: mantenha o crédito na tela.
- Dados do usuário (roteiro, checklist, relatos): `localStorage`, em `src/lib/storage.ts`. Na fase 2, troque a implementação por um servidor e mantenha a mesma interface.
- Rotas por âncora simples: `#buscar`, `#destino-<id>`, `#destino-<id>--checklist` (`src/lib/rota.ts`).
- Links de afiliado: `src/config.ts`. As chaves ficam no `.env` (ver `.env.example`).
- Tokens visuais: `src/styles.css`, no `:root`. Use as variáveis. Não escreva cor solta no componente.

## Comandos

- `npm install` — instala as dependências.
- `npm run dev` — abre o app em modo de desenvolvimento.
- `npm run build` — gera o PWA em `dist/` (para publicar).
- `npm run build:preview` — gera um único `index.html` em `dist-preview/` (para pré-visualização no claude.ai).
- `npm run typecheck` — confere os tipos.
