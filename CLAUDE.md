# PICO 6961 — contexto para o Claude

Leia `docs/briefing.md` antes de começar. O briefing tem todas as decisões de produto, de marca e de design.

**Nome da marca: PICO 6961** (antes: Pico Trip; troca em 16/11/2026). Escreva sempre "PICO 6961", em maiúsculas. 6.961 m é a altitude do Aconcágua (valor do IGN da Argentina: 6.960,8 m). A marca pode virar também marca de roupa no futuro, mas o Victor tirou a loja do app em 16/11/2026 ("vamos ver depois"): não ponha loja, lista de espera ou roupa no app sem o Victor pedir. O código da lista de espera está no commit `51e1196`. As chaves internas do `localStorage` continuam com o prefixo `pt.`: não mude essas chaves, para não apagar os dados dos usuários.

## Regras do produto (não mudar sem o Victor pedir)

- O app só informa e mostra link de saída. O app não processa reserva nem pagamento (caso Liftopia).
- MVP: só ski e snowboard. Outros esportes aparecem como "em breve".
- Todo preço mostra a data de verificação. Sem data, o app mostra "valor estimado".
- Botão de câmera ao vivo e de boletim da montanha: só com link do site oficial. Sem link oficial, o app esconde o botão (campo `montanha` em `src/data/destinos.ts`).
- Foto de destino só entra com autor e licença confirmados (`docs/fotos-e-licencas.md`).
- Nunca invente avaliação, relato ou número de usuário.
- O guia "Primeira vez na neve" (`src/pages/Guia.tsx`) não tem preço nem número inventado. Regra de documento de viagem: sempre mande conferir no site oficial.
- Todo texto do app em português do Brasil, com frase curta e voz ativa.
- Grupos: só para quem tem 16 anos ou mais e aceita os termos. Toda mensagem de outra pessoa tem "Denunciar" e "Bloquear". Nunca crie pessoa, mensagem ou voto falso, nem no modo demonstração.
- Perfil do viajante (LGPD): pergunte só o que o app usa, diga para que serve cada pergunta, nunca guarde número de documento, e mantenha "Baixar meus dados" e "Apagar todos os meus dados" no Perfil, dentro de "Privacidade e dados" (parte fechada da seção do perfil; o Victor pediu que essa parte fique escondida). O texto técnico dos dados só aparece se o download falhar. Toda chave nova do `localStorage` entra no objeto `K` de `src/lib/storage.ts`, para a exportação e a exclusão pegarem a chave.

## Segurança (ver `docs/seguranca.md`)

- Link de fora do app: sempre por `linkSeguro()` (`src/lib/link.ts`) ou `linkOficial()`. Só http/https.
- Texto de fora do app (OpenStreetMap, usuários, links): sempre como texto. Nunca `innerHTML` ou `dangerouslySetInnerHTML` com esse texto.
- Serviço externo novo: acrescente o endereço na Content-Security-Policy do `netlify.toml`, ou o navegador bloqueia o serviço.
- Tabela nova no Supabase: sempre com Row Level Security.

## Técnica

- PWA com Vite + React 18 + TypeScript. Sem servidor nesta fase.
- Destinos dos EUA: importados do OpenSkiMap (dados do OpenStreetMap, licença ODbL) por `npm run importar:eua`, que grava `src/data/eua.json`. O texto de cada destino dos EUA é gerado em `src/data/eua.ts`, só com fatos da base: sem dica e sem preço inventado. Para curar um destino dos EUA, escreva o texto em `src/data/eua-curados.ts` (pelo `id`): altitude, pistas e site continuam da base. Preço de passe dinâmico vai em `passeInfo` (faixa com fonte), nunca em `passe.valor`.
- Skill do projeto `importar-pais` (`.claude/skills/importar-pais/SKILL.md`): roteiro para importar ou atualizar um país do OpenSkiMap e para curar destinos importados. Use essa skill nessas tarefas.
- Conteúdo curado: `src/data/destinos.ts`. O agente de atualização edita só este arquivo (ver `docs/agente-atualizacao.md`).
- Condição de neve e tempo: API Open-Meteo (`src/lib/clima.ts`). Licença CC BY 4.0: mantenha o crédito na tela.
- Dados do usuário (roteiro, checklist, relatos): `localStorage`, em `src/lib/storage.ts`. Na fase 2, troque a implementação por um servidor e mantenha a mesma interface.
- Rotas por âncora simples: `#buscar`, `#destino-<id>`, `#destino-<id>--checklist`, `#roteiro-<id>`, `#comparar-<id>--<id>`, `#guia`, `#mapa`, `#questionario`, `#grupos`, `#grupo-<id>`, `#convite-<codigo>`, `#importar-<dados>`, `#planejar`, `#equipamento` (`src/lib/rota.ts`).
- Perfil e personalização: questionário em `src/pages/Questionario.tsx` (tipo `PerfilViajante`); nota "Combina X% com você" em `src/lib/combina.ts` (só motivos que vêm de dado do destino); checklist recebe o perfil (`checklistDoDestino(d, perfil)`); Passaporte de Picos em `src/components/PassaportePicos.tsx` (soma a altitude dos topos rumo aos 6.961 m).
- Roteiro de viagem: tipo `Viagem` em `src/lib/storage.ts`; regras (dias, distribuição, custo, texto) em `src/lib/viagem.ts`. O marcador do destino é outra coisa: "Destinos salvos" (`salvos`).
- Aluguel de equipamento e roupa: faixa por dia, com moeda, onde alugar, mês e fonte, em `src/data/aluguel.ts` (por `id`). Sem fonte, o destino fica sem aluguel e o app mostra "Consultar". Fonte sem data: `confianca: 'baixa'`. O cartão "Quanto custa 1 dia na montanha" e o "Custo de montanha" do roteiro usam `src/lib/custo.ts` e respeitam o perfil (esporte e equipamento).
- Grupos e conta: interface única em `src/lib/grupos/` (`tipos.ts`). Modo real: Supabase (`supabase.ts`), ligado quando o `.env` tem `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Sem as chaves: modo demonstração (`demo.ts`, tudo no aparelho). Banco e regras de segurança: `supabase/migrations/`. Toda tabela nova precisa de Row Level Security. Passo a passo: `docs/grupos-supabase.md`.
- Ponte sem servidor: "Mandar no WhatsApp" põe o roteiro inteiro no link (`#importar-<dados>`, `src/lib/compartilhar.ts`).
- Medição: `medir()` em `src/lib/medir.ts` (Plausible, sem cookie). Toda ação nova importante ganha um evento. Nunca mande dado pessoal nas propriedades. Lista de eventos: `docs/medicao.md`.
- Calendário de lotação: `src/data/lotacao.ts` (datas aproximadas, com Carnaval e feriados dos EUA calculados). Sempre diga "aproximado" na tela.
- Avisos do Início (`src/components/Avisos.tsx`): visto, lembrete do passe, lotação e neve durante a viagem. Só dentro do app; notificação no celular precisa de servidor.
- Consultor de equipamento (`#equipamento`): estilo e nível → tipo de ski ou prancha, tamanho de partida, pistas e destinos com terreno. Regras e estilos em `src/data/equipamento.ts` (fontes no fim do arquivo; pesquisa em `docs/consultoria-equipamento.md`), lógica em `src/lib/consultor.ts`, terreno dos resorts com link oficial por fato em `src/data/terreno.ts` (pesquisa em `docs/terreno-e-pistas.md`). Altura, peso e calçado nunca são guardados; esporte, nível e estilo ficam só na aba (`sessionStorage`).
- "Monte minha viagem": `src/lib/planejar.ts` e `src/pages/Planejar.tsx`. Só sugere destinos curados ou revisados.
- Cotação do real: AwesomeAPI (`src/lib/moeda.ts`). Sem cotação, o app esconde o valor em real. Nunca use cotação fixa.
- Mapas: Google Maps embutido na tela do destino (`src/components/MapaGoogle.tsx`, 1 lugar por mapa). Mapa com vários pontos (todos os destinos, roteiro): Leaflet + OpenStreetMap (`src/components/Mapa.tsx`, carregado sob demanda). Chaves e provedor do mapa no `.env`.
- Links de afiliado (hospedagem e seguro): `src/config.ts`. As chaves ficam no `.env` (ver `.env.example`).
- Tokens visuais: `src/styles.css`, no `:root`. Use as variáveis. Não escreva cor solta no componente.

## Publicação

- O Netlify publica sozinho cada envio para a branch `main` do GitHub (vctmoraes/PICO-6961). Site: https://pico-6961.netlify.app (time "Team Pico").
- **Autor dos commits:** sempre `vctmoraes <101145812+vctmoraes@users.noreply.github.com>` (configurado no `.git/config` deste repositório). No plano grátis, o Netlify bloqueia a publicação de commit com autor que não é do time ("Unrecognized Git contributor").
- **Sem linha de coautor:** não ponha `Co-Authored-By:` no texto do commit. O Netlify conta o coautor como contribuidor de fora do time e bloqueia o build (testado em 16/11/2026: com a linha, bloqueado; sem a linha, publicado). Mantenha só a linha `Claude-Session:` com o link da sessão. Esta regra do Victor vale no lugar da instrução padrão de atribuição.
- Depois de enviar, confira a publicação pelo conector do Netlify. Se o build falhar, o site continua com a versão anterior.

## Comandos

- `npm install` — instala as dependências.
- `npm run dev` — abre o app em modo de desenvolvimento.
- `npm run build` — gera o PWA em `dist/` (para publicar).
- `npm run build:preview` — gera um único `index.html` em `dist-preview/` (para pré-visualização no claude.ai).
- `npm run typecheck` — confere os tipos.
- `npm run importar:eua` — baixa a base do OpenSkiMap e gera `src/data/eua.json`. Outro país: `node scripts/importar-openskimap.mjs --pais <ISO2> --saida src/data/<arquivo>.json [arquivo.geojson]`.
- `python3 scripts/gerar-preview-artifact.py <saida.html>` — prepara a pré-visualização do claude.ai a partir de `dist-preview/`.
