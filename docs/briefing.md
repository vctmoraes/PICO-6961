# Pico Trip — Instruções do projeto

Documento de referência pro Claude Code. Reúne tudo decidido até agora sobre o app. Use isso como contexto inicial antes de começar a construir.

## O que é o app

Pico Trip é um app que reúne, num só lugar, a informação que um praticante de esporte radical precisa pra planejar uma viagem: onde ficar, condição do tempo/neve/onda em tempo real, e preço de passe da montanha. Hoje essa informação está espalhada em apps separados por esporte. Nenhum concorrente junta tudo isso em português, com foco no viajante brasileiro.

## Decisões confirmadas

### Marca
- Nome: **Pico Trip**.
- "Pico" sozinho estava concorrido (domínio pico.com.br já registrado, app brasileiro "Pico.app" de vestibular, marca de headset VR PICO). "Pico Trip" resolve isso.
- Ainda falta confirmar disponibilidade real de domínio e redes sociais na hora de registrar.

### Conceito
- Tipo de app: **híbrido**. Conteúdo curado (Victor + IA) como base. Usuário complementa com avaliação, foto e relato.

### Escopo
- Esportes na visão final: todos os esportes radicais (ski, snowboard, surf, kite, escalada, mountain bike, parapente etc.).
- Esporte do MVP (primeira versão): **só ski/snowboard**.
- Público: iniciante e praticante experiente, os dois.
- Alcance: Brasil primeiro, expansão global depois.

### Funcionalidades
- Busca e detalhe de destino.
- Condição de neve/onda/tempo em tempo real, via **API externa**.
- Preço do passe da montanha, com link pra comprar no site oficial.
- Informação de hospedagem, com link pra reservar em outro site.
- Checklist de equipamento por destino.
- Avaliação e relato de usuário.
- **Sem reserva nem pagamento dentro do app** — só informação e link de saída.
  - Decisão tomada depois de ver o caso da Liftopia: marketplace que vendia passe com desconto direto no site, faliu em 2020 por problema de reembolso/cancelamento. Reforça que só linkar, sem processar pagamento, evita esse risco.

### Modelo de negócio
- Receita por **afiliado**: comissão quando o usuário reserva hospedagem ou compra passe pelo link indicado no app.

### Direito de imagem e fotos
- Conteúdo postado por usuário (foto, relato): usuário mantém o direito, o app recebe só licença de uso pra exibir (padrão tipo Instagram).
- Foto de destino (conteúdo curado, não de usuário): **toda foto tem direito de autor**, mesmo sendo de paisagem/lugar. Pra usar foto real, as opções são:
  - Banco de imagem com licença (Unsplash, Pexels, pago).
  - Foto oficial do destino/resort/turismo, com crédito.
  - Foto própria.
  - Foto de usuário (já cobre o caso acima).
- No mockup, algumas fotos de destino vieram do Wikimedia Commons (licença aberta CC). Antes de usar em produção, confirmar autor/licença exata de cada imagem e colocar o crédito correto.

### Legal
- Responsabilidade por informação errada: aviso claro de isenção de responsabilidade nos termos de uso — a decisão de praticar o esporte é do usuário, o app só informa.

### Operação
- Atualização do conteúdo/condição: um **agente de IA dedicado** cuida da verificação e atualização ao longo do tempo (em vez de atualização manual).
- Ainda em aberto: detalhar frequência, fontes de dado, e o que precisa de supervisão humana.

### Técnico
- Plataforma: **site ou PWA primeiro** (não nativo).
- MVP: bem pequeno — só ski/snowboard, poucos destinos, pra validar rápido com usuário real.

### Validação
- Victor já conhece gente da comunidade de ski/snowboard disposta a testar a primeira versão.
- Métrica de sucesso do MVP: número de usuário ativo.

## Design — tokens visuais usados no mockup

O mockup (telas Início, Busca, Detalhe do destino) já define um estilo visual. Manter consistência com isso ao construir a versão real.

**Cores**
- Fundo geral: `#F7F5F0`
- Cartão/fundo branco: `#FFFFFF`
- Borda de cartão: `#E8E4DC`
- Texto principal: `#1C2321`
- Texto secundário: `#5B6660`
- Marca/primária (teal): `#13394A`
- Destaque/ação (laranja): `#D9480F`
- Nível iniciante (fundo/texto): `#E4F3EA` / `#1F6B44`
- Nível intermediário (fundo/texto): `#FBEDD9` / `#92631B`
- Nível avançado (fundo/texto): `#FBE4E1` / `#9C3B30`

**Tipografia**
- Texto geral: Inter (400/500/600/700)
- Títulos: Space Grotesk (600/700)

**Layout**
- Mobile-first, frame de referência 390×844 (tamanho de celular).
- Navegação inferior fixa: Início, Buscar, Roteiros, Perfil.
- Cards de destino com foto/cor à esquerda, nome + badge de nível + nota à direita.

**Logo**
- Marca "Pico Trip": ícone de pico de montanha (triângulo) em laranja `#D9480F`, nome em duas cores — "Pico" em teal `#13394A`, "Trip" em laranja.

Mockup publicado (referência visual): https://claude.ai/artifact/YFmLQYKc9BcsAfeE4xeJJx

## Concorrência — resumo

Pesquisa feita em 15/11/2026. Nenhum concorrente direto cobre tudo que o Pico Trip pretende cobrir.

| App | Esporte | Modelo | Observação |
| --- | --- | --- | --- |
| OnTheSnow | Ski/snowboard | Grátis | Relatório de neve, maior app de ski do mundo |
| Surfline | Surf | Freemium | Previsão de onda, câmera ao vivo |
| AllTrails | Trilha/hike/bike | Freemium | Banco de trilha gerado por comunidade |
| Trailforks | Mountain bike | Freemium | Banco de trilha, dados da comunidade |
| FATMAP (Strava) | Ski/hike/bike | Assinatura | Mapa 3D, comprado pela Strava em 2023 |
| Komoot | Hike/bike/run | Freemium | Planejador de rota, forte na Europa |

**Caso de atenção — Liftopia**: marketplace de passe de montanha com desconto, reserva e pagamento integrados no app. Faliu em 2020 após reclamações de reembolso (muitos usuários perderam dinheiro quando resort fechou por Covid). Por isso o Pico Trip só informa e linka, nunca processa pagamento.

**Gap de mercado**: no Brasil, o que existe sobre viagem de esporte radical é conteúdo de blog e comparador de seguro viagem — não um app dedicado. Nenhum concorrente junta hospedagem + clima + preço de passe + dica, em vários esportes, em português, foco Brasil.

## Ainda em aberto

- Detalhar o agente de IA de atualização de conteúdo (frequência, fontes de dado, supervisão humana).
- Confirmar disponibilidade real de domínio e redes sociais para "Pico Trip" (registro formal).
- Confirmar autor/licença de cada foto de destino antes de usar em produção.
- Escolher a API de condição de neve/onda a integrar.
- Listar os primeiros destinos de ski/snowboard do MVP.
- Recrutar o grupo de teste da comunidade.
