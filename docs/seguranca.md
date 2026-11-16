# Segurança do PICO 6961

Revisão de 16/11/2026. Siga estas regras em toda mudança.

## Regras do código

1. **Link de fora do app:** passe sempre por `linkSeguro()` (`src/lib/link.ts`) ou `linkOficial()` (`src/config.ts`). Só `http://` e `https://`. Link inválido: o app esconde o botão.
2. **Texto de fora do app** (OpenStreetMap, usuários, links de importação): mostre sempre como texto. No React, use `{texto}`. Fora do React (ex.: janelinha do Leaflet), use `textContent`. Nunca use `innerHTML` ou `dangerouslySetInnerHTML` com texto de fora.
3. **Serviço externo novo:** acrescente o endereço na Content-Security-Policy do `netlify.toml`. Sem isso, o navegador bloqueia o serviço no app publicado. Teste com a política ligada (ver "Teste" abaixo).
4. **Banco de dados:** toda tabela nova tem Row Level Security. Função `security definer` sempre confere `auth.uid()` e usa `set search_path = public`.
5. **Segredos:** nunca no código nem no GitHub. Chave pública (Supabase "anon", Google Maps restrita ao domínio) vai no `.env` e nas variáveis do Netlify. A chave `service_role` do Supabase fica só no Supabase.
6. **Importação de dados:** o script `scripts/importar-openskimap.mjs` limpa nomes (sem HTML) e links (só http/https). Mantenha essa limpeza.

## Proteções que já existem

| Proteção | Onde |
| --- | --- |
| HTTPS em todo o site, com HSTS | Netlify + `netlify.toml` |
| Content-Security-Policy (lista de serviços permitidos) | `netlify.toml` |
| Proibição de moldura (X-Frame-Options e frame-ancestors) | `netlify.toml` |
| X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Cross-Origin-Opener-Policy | `netlify.toml` |
| Links externos só http/https | `src/lib/link.ts` |
| Texto do OpenStreetMap sem HTML | `src/components/Mapa.tsx` e script de importação |
| Row Level Security em todas as tabelas | `supabase/migrations/0001_grupos.sql` |
| Convite de 12 caracteres e limite de 10 tentativas por hora | `supabase/migrations/0002_seguranca_convites.sql` |
| Denunciar, bloquear, apagar mensagem e apagar conta | Grupos e Perfil |
| Idade mínima de 16 anos para os grupos | Cadastro |
| Medição sem cookie e sem dado pessoal | `src/lib/medir.ts` |

## Teste

Antes de publicar uma mudança grande, rode o app com os cabeçalhos do `netlify.toml` ligados (Playwright: intercepte as respostas do `vite preview` e acrescente os cabeçalhos) e confira:
- nenhuma violação de CSP (evento `securitypolicyviolation`);
- nenhum erro de página;
- uma mensagem com `<img src=x onerror=alert(1)>` no chat aparece como texto.

## Contas (responsabilidade do Victor)

- [x] 2FA no Netlify (conferido pelo conector em 16/11/2026).
- [x] 2FA no GitHub e no Google (o Victor confirmou em 16/11/2026; a sessão do Claude não consegue conferir).
- [x] GitHub → Settings → Code security: "Dependabot alerts" e "Secret scanning" (o Victor confirmou em 16/11/2026).
- [ ] 2FA no Supabase, quando criar a conta.
- [ ] Chave do Google Maps restrita ao domínio `https://pico-6961.netlify.app/*`, quando criar a chave.

## Para depois (com o Supabase ligado)

- Captcha no login por e-mail (Supabase → Authentication → Attack Protection).
- Limite de mensagens por minuto no chat.
- Rotina de moderação das denúncias, em até 24 horas.
- Política de privacidade revisada por advogado.
- Plano de resposta a incidente (quem avisa, em quanto tempo, como).
