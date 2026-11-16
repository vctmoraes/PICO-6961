# Próximos passos

## Feito nesta etapa

- MVP em PWA com 8 destinos (4 no Chile, 4 na Argentina).
- API de condição de neve escolhida: Open-Meteo (grátis, sem chave, licença CC BY 4.0).
- Telas do mockup: Início, Buscar, Detalhe do destino (Visão geral, Dicas, Checklist, Avaliações).
- Telas novas: Roteiros, Perfil, Termos de uso (rascunho), Créditos.
- Proposta do agente de atualização: `docs/agente-atualizacao.md`.
- Lista de fotos para verificar: `docs/fotos-e-licencas.md`.

## Para o Victor fazer

1. **Criar o repositório no GitHub** e enviar este código. Sem repositório, o código se perde quando a sessão termina.
2. **Publicar no Netlify** (ver README). O Netlify dá um endereço grátis, por exemplo `picotrip.netlify.app`.
3. **Confirmar os preços do passe** no site oficial de cada resort. Preencha `verificadoEm` em `src/data/destinos.ts`.
4. **Registrar o domínio.** Consulte `picotrip.com.br` no registro.br e `picotrip.com` num registrador internacional. Confira também o nome @picotrip no Instagram e no TikTok.
5. **Cadastrar no programa de afiliados** do Booking.com. Ponha o ID no `.env` (`VITE_BOOKING_AID`). Veja também se os resorts têm programa de afiliado.
6. **Ligar a métrica de usuário ativo:** crie uma conta no Plausible (pago, sem cookie) ou no Umami (tem plano grátis). Ponha o domínio no `.env`.
7. **Testar os links de câmera e boletim.** Hoje só 3 destinos têm link oficial: Valle Nevado (boletim), Portillo (câmeras e boletim) e Chapelco (parte diário, link tirado de notícia antiga). Teste cada link e preencha `montanha.verificadoEm`. Procure no site oficial dos outros 5 destinos uma página de câmeras ou de boletim.
8. **Verificar as fotos** do mockup (ver `docs/fotos-e-licencas.md`).
9. **Pedir revisão dos termos de uso** a um advogado antes do lançamento público.
10. **Recrutar o grupo de teste** (mensagem pronta abaixo).

## Fase 2 (depois do teste)

- Relatos e fotos de usuário num servidor (sugestão: Supabase, com login por e-mail).
- Moderação de relato.
- Mais destinos (Brasil: não há resort de ski; foco em Chile, Argentina, depois EUA e Europa).
- Alerta de neve nova para os destinos do roteiro.

## Mensagem para o grupo de teste

> Oi! Estou criando o Pico Trip, um app para planejar viagem de ski e snowboard. O app mostra a neve em tempo real, o preço do passe e onde ficar, tudo em português.
>
> Quer testar a primeira versão? Leva 10 minutos. Abra o link no celular, escolha um destino e me conte:
> 1. O que você achou útil?
> 2. O que faltou para planejar sua viagem?
> 3. Você usaria o app na próxima viagem?
>
> Link: [ENDEREÇO DO APP]
