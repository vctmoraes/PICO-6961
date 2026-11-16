# Medição de uso (Plausible)

O app conta ações com o Plausible: sem cookie e sem dado pessoal. A medição liga quando o `.env` tem `VITE_PLAUSIBLE_DOMAIN`.

## Ligar

1. Crie uma conta no Plausible (plausible.io) e cadastre o domínio do app.
2. No Netlify, crie a variável `VITE_PLAUSIBLE_DOMAIN` com o domínio (ex.: `pico6961.netlify.app`) e publique de novo.
3. No Plausible, abra **Site settings → Goals** e crie uma meta "Custom event" para cada evento abaixo, com o nome igual.
4. Em **Site settings → Custom properties**, cadastre as propriedades (`destino`, `pais`, `tipo`, `origem`, `peca`...) para ver os detalhes.

O app também conta automaticamente as telas visitadas e os cliques em links de saída.

## Eventos

| Evento | Quando | Propriedades |
| --- | --- | --- |
| Destino aberto | O usuário abre a tela de um destino | `destino`, `pais` |
| Perfil concluído | O usuário termina o questionário | — |
| Roteiro criado | Um roteiro novo nasce | `origem`: manual, destino, importado, planejador |
| Link de afiliado | Toque em "Comprar passe", "Ver hospedagem", "Ver voos" ou "Cotar seguro" | `tipo`, `destino` |
| Compartilhar | Toque em WhatsApp | `canal`, `item`: roteiro, destino, convite |
| Grupo criado | Um grupo novo nasce | `modo`: supabase ou demo |
| Entrou em grupo | Entrada por código ou por convite | `via` |
| Mensagem enviada | Mensagem no chat do grupo | `tipo`: texto ou cartão |
| Monte minha viagem | O usuário pede sugestões | `sugestoes`, `destinos`, `pais` |
| Lista de espera | Entrada na lista da loja ou interesse sem e-mail | `peca`, `tamanho`, `email` (sim ou não) |
| Aviso tocado | Toque num aviso do Início | `tipo` |

**Regra:** nunca mande e-mail, nome, texto de mensagem ou outro dado pessoal nas propriedades.

## Como ler os números no teste com o grupo

- **Usuário ativo** (métrica do briefing): visitantes únicos por semana.
- **Ativação:** quantos visitantes fazem "Perfil concluído" ou "Roteiro criado".
- **Receita futura:** "Link de afiliado" por tipo. Mostra onde vale buscar parceria.
- **Marca:** "Lista de espera" por peça. Mostra qual peça produzir primeiro.
- **Grupos:** "Grupo criado", "Entrou em grupo" e "Mensagem enviada". Mostram se o chat pega.
