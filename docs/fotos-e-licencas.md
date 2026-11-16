# Fotos e licenças

## Situação atual

O app não usa foto. Cada destino mostra uma ilustração de montanha, feita no próprio app. A ilustração não tem problema de direito de autor.

## Fotos do mockup (Wikimedia Commons) — verificar antes de usar

O mockup usou estas fotos. A licença de cada foto não foi confirmada. A rede da sessão de construção bloqueou o Wikimedia, por isso a verificação ficou pendente.

| Destino | Arquivo no Wikimedia Commons | Autor | Licença | Status |
| --- | --- | --- | --- | --- |
| Cerro Catedral | `Cerro Catedral, Argentina.jpg` | ? | ? | A verificar |
| Valle Nevado | `Vista de Valle Nevado.jpg` | ? | ? | A verificar |
| Las Leñas | `Las Leñas Mendoza Argentina by Andre Charland.jpg` | Andre Charland (pelo nome do arquivo) | ? | A verificar |
| Chapelco | `Cerro Chapelco Paisaje.jpg` | ? | ? | A verificar |
| Portillo | `Portillo Chile.jpg` | ? | ? | A verificar |
| Cerro Castor | `Cerro Castor.jpg` | ? | ? | A verificar |

## Como verificar uma foto

1. Abra `https://commons.wikimedia.org/wiki/File:<nome do arquivo>`.
2. Na seção "Licensing", anote a licença (por exemplo, CC BY-SA 4.0).
3. Anote o autor no campo "Author".
4. Se a licença for CC BY ou CC BY-SA, a foto pode entrar com crédito. CC BY-SA exige crédito e link para a licença.
5. Se a licença tiver "NC" (não comercial), não use. O app tem receita de afiliado.
6. Preencha o campo `foto` do destino em `src/data/destinos.ts`, com `url`, `autor`, `licenca` e `fonte`.
7. O app mostra o crédito no `title` da imagem. Antes do lançamento, ponha o crédito também na tela de Créditos.

## Outras fontes

- Unsplash e Pexels: licença própria, uso comercial permitido, crédito opcional (dê o crédito mesmo assim).
- Foto oficial do resort: peça autorização por e-mail e guarde a resposta.
- Foto de usuário: o usuário mantém o direito. O app recebe só licença para exibir.
