-- PICO 6961 — lista de espera da loja (marca de roupa).
-- Rode no SQL Editor depois do 0001_grupos.sql.
-- Qualquer pessoa pode entrar na lista (com consentimento). Ninguém lê a lista pelo app: só a equipe, no painel do Supabase.

create table if not exists public.lista_espera (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) between 5 and 200 and email like '%@%'),
  peca text not null check (peca in ('bone', 'camiseta', 'moletom', 'gorro')),
  tamanho text check (tamanho in ('P', 'M', 'G', 'GG')),
  -- Consentimento para receber e-mail sobre a loja (LGPD). Sem consentimento, a linha não entra.
  aceita_email boolean not null check (aceita_email),
  criado_em timestamptz not null default now()
);
create unique index if not exists lista_espera_email_peca on public.lista_espera (lower(email), peca);

alter table public.lista_espera enable row level security;
create policy lista_espera_entrar on public.lista_espera for insert to anon, authenticated with check (aceita_email);
-- Sem política de leitura: o app não lê a lista.
