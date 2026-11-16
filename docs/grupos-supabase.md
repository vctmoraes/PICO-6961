# Ligar os grupos (Supabase)

Sem o Supabase, os grupos funcionam em **modo demonstração**: tudo fica só no aparelho. Siga os passos abaixo para os amigos conversarem de verdade.

## 1. Crie o projeto

1. Crie uma conta grátis em https://supabase.com.
2. Clique em **New project**. Nome: `pico-6961`. Região: **South America (São Paulo)**.
3. Guarde a senha do banco num gerenciador de senhas. O app não usa essa senha.

## 2. Crie as tabelas e as regras de segurança

1. No painel, abra **SQL Editor → New query**.
2. Copie todo o arquivo `supabase/migrations/0001_grupos.sql` e cole na consulta.
3. Clique em **Run**. O resultado deve ser "Success".

O arquivo cria as tabelas e liga as regras de segurança: cada pessoa só lê e escreve nos grupos de que participa.

4. Repita com o arquivo `supabase/migrations/0002_seguranca_convites.sql`. Esse arquivo deixa o código de convite mais longo (12 caracteres) e limita as tentativas de entrar em grupo a 10 por hora para cada pessoa.

## 3. Configure o login por e-mail

1. Abra **Authentication → Sign In / Providers**. Confirme que **Email** está ligado.
2. Abra **Authentication → URL Configuration**:
   - **Site URL:** o endereço do app (ex.: `https://pico6961.netlify.app`).
   - **Redirect URLs:** o mesmo endereço com `/**` no fim, e também `http://localhost:5173/**` para testar no computador.
3. Opcional: em **Authentication → Emails**, traduza o e-mail do link mágico para português.

O plano grátis manda poucos e-mails por hora. Para o lançamento, configure um provedor de e-mail próprio (SMTP) em **Authentication → Emails → SMTP Settings**.

## 4. Ponha as chaves no app

1. Abra **Project Settings → API**.
2. Copie a **Project URL** e a chave **anon public**.
3. No Netlify (**Site configuration → Environment variables**) e no arquivo `.env` do computador, crie:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = chave anon public
4. Publique o app de novo.

**Nunca use a chave `service_role` no app, no `.env` do app ou no chat.** Essa chave dá acesso total ao banco.

## 5. Publique a função de apagar a conta (LGPD)

Sem esta função, o botão "Apagar minha conta" apaga os dados do app, mas não apaga o login.

1. Instale a ferramenta do Supabase: https://supabase.com/docs/guides/cli
2. Na pasta do projeto, rode:

```bash
supabase login
```

```bash
supabase link --project-ref <id-do-projeto>
```

```bash
supabase functions deploy apagar-conta
```

A função usa a chave `service_role` só dentro do Supabase. O Supabase já põe essa chave na função.

## 6. Moderação

- As denúncias ficam na tabela `denuncias` (**Table Editor → denuncias**), com o texto denunciado e o autor.
- Para apagar uma mensagem: **Table Editor → mensagens**, procure pelo `id` e apague a linha.
- Para banir uma pessoa: **Authentication → Users**, procure a pessoa e clique em **Ban user** (ou **Delete user**).
- Responda às denúncias em até 24 horas. As lojas de app pedem esse prazo para apps com conteúdo de usuário.

## 7. Teste

1. Abra o app, toque em **Grupos** e entre com o seu e-mail.
2. Crie um grupo e mande o convite para outro e-mail seu.
3. Abra o convite noutro navegador. Mande uma mensagem e confira se a mensagem chega na hora no primeiro navegador.
