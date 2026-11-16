# Agente de IA de atualização de conteúdo — proposta

Item em aberto do briefing. Esta é uma proposta para o Victor aprovar.

## O que o agente atualiza

| Dado | Fonte | Frequência | Supervisão humana |
| --- | --- | --- | --- |
| Condição de neve e tempo | API Open-Meteo, direto no app | Tempo real | Não precisa |
| Preço do passe | Site oficial de cada resort | 1 vez por semana na temporada, 1 vez por mês fora dela | Sim, quando o preço muda mais de 15% |
| Data de abertura e fechamento da temporada | Site oficial e redes sociais do resort | 1 vez por semana de março a outubro | Sim |
| Link oficial (passe e site) | Site oficial | 1 vez por semana | Sim, quando o link quebra |
| Dicas, como chegar, hospedagem | Site oficial, órgão de turismo | 1 vez por temporada | Sim, sempre |

## Como o agente trabalha

1. O agente roda num horário fixo (tarefa agendada do Claude Code).
2. O agente lê o site oficial de cada resort.
3. O agente compara o dado novo com `src/data/destinos.ts`.
4. Se nada mudou, o agente só atualiza a data `verificadoEm`.
5. Se algo mudou, o agente abre um pull request com a mudança e a fonte (link e data).
6. O Victor revisa e aprova o pull request. O site publica sozinho depois da aprovação.

## Regras do agente

- O agente nunca publica sem aprovação humana. Exceção: atualizar só a data de verificação.
- O agente sempre registra a fonte e a data de cada dado.
- O agente nunca inventa dado. Se não achar a fonte, o agente marca o dado como "a confirmar".
- O agente escreve em português do Brasil, com frase curta.

## Pré-requisitos

- Repositório no GitHub (ainda não existe).
- Publicação automática (Netlify) ligada ao repositório.
- Acesso de rede da sessão do agente aos sites oficiais dos resorts.
