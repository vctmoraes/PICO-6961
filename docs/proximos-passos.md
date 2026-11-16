# Próximos passos

## Feito nesta etapa

- MVP em PWA com 27 destinos: 15 no Chile e 12 na Argentina.
  - Primeira lista (8): Valle Nevado, La Parva, El Colorado, Portillo, Cerro Catedral, Chapelco, Las Leñas, Cerro Castor.
  - Chile, novos (11): Lagunillas, Chapa Verde, Nevados de Chillán, Antuco, Corralco, Las Araucarias, Ski Pucón, Antillanca, Volcán Osorno, El Fraile, Cerro Mirador.
  - Argentina, novos (8): Cerro Bayo, Cerro Perito Moreno, La Hoya, Caviahue, Batea Mahuida, Lago Hermoso, Los Puquios, Cerro Martial.
  - Fora da lista: Vallecitos (teleféricos fechados), Penitentes (só reabriu como parque de montanha), Primeros Pinos e Cerro Wayle (sem fonte confiável). Parque Farellones (parque de neve) e Ski Arpa (ski com snowcat) também ficaram fora.
- API de condição de neve escolhida: Open-Meteo (grátis, sem chave, licença CC BY 4.0).
- Telas do mockup: Início, Buscar, Detalhe do destino (Visão geral, Dicas, Checklist, Avaliações).
- Telas novas: Roteiros, Perfil, Termos de uso (rascunho), Créditos.
- Roteiro personalizável: vários roteiros, datas, pessoas, destinos em ordem, dia a dia (onde, atividade, nota), distribuição automática dos dias, custo estimado de passe e texto para copiar.
- Proposta do agente de atualização: `docs/agente-atualizacao.md`.
- Lista de fotos para verificar: `docs/fotos-e-licencas.md`.

## Para o Victor fazer

1. **Criar o repositório no GitHub** e enviar este código. Sem repositório, o código se perde quando a sessão termina.
2. **Publicar no Netlify** (ver README). O Netlify dá um endereço grátis, por exemplo `picotrip.netlify.app`.
3. **Confirmar os preços do passe** no site oficial de cada resort. Preencha `verificadoEm` em `src/data/destinos.ts`.
4. **Registrar o domínio.** Consulte `picotrip.com.br` no registro.br e `picotrip.com` num registrador internacional. Confira também o nome @picotrip no Instagram e no TikTok.
5. **Cadastrar no programa de afiliados** do Booking.com. Ponha o ID no `.env` (`VITE_BOOKING_AID`). Veja também se os resorts têm programa de afiliado.
6. **Ligar a métrica de usuário ativo:** crie uma conta no Plausible (pago, sem cookie) ou no Umami (tem plano grátis). Ponha o domínio no `.env`.
7. **Conferir os 19 destinos novos.** Os dados vieram de busca na web e de sites de terceiros. Para cada destino: confira altitude, temporada e site oficial, e preencha `verificadoEm`. Hoje, 12 destinos não têm site oficial confirmado e não mostram o botão "Comprar passe". Nenhum dos 19 tem preço de passe: o app mostra "Consultar".
8. **Testar os links de câmera e boletim.** Hoje só 3 destinos têm link oficial: Valle Nevado (boletim), Portillo (câmeras e boletim) e Chapelco (parte diário, link tirado de notícia antiga). Teste cada link e preencha `montanha.verificadoEm`. Procure no site oficial dos outros 24 destinos uma página de câmeras ou de boletim.
9. **Verificar as fotos** do mockup (ver `docs/fotos-e-licencas.md`).
10. **Pedir revisão dos termos de uso** a um advogado antes do lançamento público.
11. **Recrutar o grupo de teste** (mensagem pronta abaixo).

## Fase 2 (depois do teste)

- Relatos e fotos de usuário num servidor (sugestão: Supabase, com login por e-mail).
- Moderação de relato.
- Mais destinos (Brasil: não há resort de ski; foco em Chile, Argentina, depois EUA e Europa).
- Alerta de neve nova para os destinos do roteiro.
- Roteiro compartilhado: o grupo edita o mesmo roteiro (precisa de servidor).
- Custo da viagem completo: hospedagem, voo e aluguel de equipamento, além do passe.

## Mensagem para o grupo de teste

> Oi! Estou criando o Pico Trip, um app para planejar viagem de ski e snowboard. O app mostra a neve em tempo real, o preço do passe e onde ficar, tudo em português.
>
> Quer testar a primeira versão? Leva 10 minutos. Abra o link no celular, escolha um destino e me conte:
> 1. O que você achou útil?
> 2. O que faltou para planejar sua viagem?
> 3. Você usaria o app na próxima viagem?
>
> Link: [ENDEREÇO DO APP]
