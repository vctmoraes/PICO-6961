-- PICO 6961 — grupos de viagem (Etapa 1): perfis, grupos, membros, chat, roteiro do grupo, votação, denúncia e bloqueio.
-- Rode este arquivo no Supabase: SQL Editor → New query → cole tudo → Run.
-- Regra central: cada pessoa só lê e escreve nos grupos de que participa (Row Level Security em todas as tabelas).

-- ───────── Tabelas ─────────

create table if not exists public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 40),
  -- A pessoa confirmou que tem 16 anos ou mais e aceitou os termos.
  idade_ok boolean not null default false,
  criado_em timestamptz not null default now()
);

create table if not exists public.grupos (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 1 and 60),
  codigo text not null unique default upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8)),
  criado_por uuid references auth.users (id) on delete set null,
  criado_em timestamptz not null default now()
);

create table if not exists public.membros (
  grupo_id uuid not null references public.grupos (id) on delete cascade,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  papel text not null default 'membro' check (papel in ('dono', 'membro')),
  entrou_em timestamptz not null default now(),
  primary key (grupo_id, usuario_id)
);

create table if not exists public.mensagens (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references public.grupos (id) on delete cascade,
  autor_id uuid references auth.users (id) on delete set null,
  texto text check (char_length(texto) <= 2000),
  -- Cartão do app: {"tipo":"destino","id":"..."}, {"tipo":"comparacao","ids":[...]}, {"tipo":"enquete","id":"..."}, {"tipo":"roteiro"}
  cartao jsonb,
  criado_em timestamptz not null default now(),
  check (texto is not null or cartao is not null)
);
create index if not exists mensagens_grupo_data on public.mensagens (grupo_id, criado_em);

create table if not exists public.roteiros_grupo (
  grupo_id uuid primary key references public.grupos (id) on delete cascade,
  dados jsonb not null,
  atualizado_por uuid references auth.users (id) on delete set null,
  atualizado_em timestamptz not null default now()
);

create table if not exists public.enquetes (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references public.grupos (id) on delete cascade,
  pergunta text not null check (char_length(pergunta) between 1 and 120),
  opcoes jsonb not null check (jsonb_typeof(opcoes) = 'array' and jsonb_array_length(opcoes) between 2 and 6),
  criada_por uuid references auth.users (id) on delete set null,
  criada_em timestamptz not null default now()
);

create table if not exists public.votos (
  enquete_id uuid not null references public.enquetes (id) on delete cascade,
  usuario_id uuid not null references auth.users (id) on delete cascade,
  opcao int not null check (opcao between 0 and 5),
  primary key (enquete_id, usuario_id)
);

create table if not exists public.denuncias (
  id uuid primary key default gen_random_uuid(),
  mensagem_id uuid references public.mensagens (id) on delete set null,
  grupo_id uuid references public.grupos (id) on delete set null,
  denunciante uuid references auth.users (id) on delete set null,
  motivo text check (char_length(motivo) <= 300),
  -- Cópia do texto denunciado, para a moderação ver mesmo se a mensagem for apagada.
  texto_denunciado text,
  autor_denunciado uuid,
  criado_em timestamptz not null default now()
);

create table if not exists public.bloqueios (
  usuario_id uuid not null references auth.users (id) on delete cascade,
  bloqueado_id uuid not null references auth.users (id) on delete cascade,
  primary key (usuario_id, bloqueado_id)
);

-- ───────── Funções ─────────

-- true se quem faz o pedido participa do grupo.
create or replace function public.eh_membro (g uuid) returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from membros where grupo_id = g and usuario_id = auth.uid());
$$;

-- Cria o grupo e põe quem criou como dono.
create or replace function public.criar_grupo (nome_grupo text) returns public.grupos
language plpgsql security definer set search_path = public as $$
declare g grupos;
begin
  if auth.uid() is null then raise exception 'Faça login para criar um grupo'; end if;
  insert into grupos (nome, criado_por) values (trim(nome_grupo), auth.uid()) returning * into g;
  insert into membros (grupo_id, usuario_id, papel) values (g.id, auth.uid(), 'dono');
  return g;
end $$;

-- Entra num grupo pelo código do convite (máximo de 50 pessoas por grupo).
create or replace function public.entrar_no_grupo (codigo_convite text) returns public.grupos
language plpgsql security definer set search_path = public as $$
declare g grupos;
begin
  if auth.uid() is null then raise exception 'Faça login para entrar no grupo'; end if;
  select * into g from grupos where codigo = upper(trim(codigo_convite));
  if g.id is null then raise exception 'Código de convite não encontrado'; end if;
  if (select count(*) from membros where grupo_id = g.id) >= 50 then raise exception 'O grupo está cheio (50 pessoas)'; end if;
  insert into membros (grupo_id, usuario_id) values (g.id, auth.uid()) on conflict do nothing;
  return g;
end $$;

-- Denuncia uma mensagem e guarda uma cópia do texto para a moderação.
create or replace function public.denunciar_mensagem (msg uuid, motivo_denuncia text) returns void
language plpgsql security definer set search_path = public as $$
declare m mensagens;
begin
  select * into m from mensagens where id = msg;
  if m.id is null or not eh_membro(m.grupo_id) then raise exception 'Mensagem não encontrada'; end if;
  insert into denuncias (mensagem_id, grupo_id, denunciante, motivo, texto_denunciado, autor_denunciado)
  values (m.id, m.grupo_id, auth.uid(), left(motivo_denuncia, 300), m.texto, m.autor_id);
end $$;

-- Apaga os dados do app de quem pede (LGPD). A conta de login é apagada pela função "apagar-conta".
create or replace function public.apagar_meus_dados () returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  delete from mensagens where autor_id = auth.uid();
  delete from votos where usuario_id = auth.uid();
  delete from bloqueios where usuario_id = auth.uid() or bloqueado_id = auth.uid();
  delete from membros where usuario_id = auth.uid();
  delete from perfis where id = auth.uid();
end $$;

-- ───────── Segurança (Row Level Security) ─────────

alter table public.perfis enable row level security;
alter table public.grupos enable row level security;
alter table public.membros enable row level security;
alter table public.mensagens enable row level security;
alter table public.roteiros_grupo enable row level security;
alter table public.enquetes enable row level security;
alter table public.votos enable row level security;
alter table public.denuncias enable row level security;
alter table public.bloqueios enable row level security;

-- Perfis: a pessoa vê o próprio perfil e o das pessoas dos seus grupos.
create policy perfis_ler on public.perfis for select using (
  id = auth.uid() or exists (
    select 1 from membros a join membros b on a.grupo_id = b.grupo_id
    where a.usuario_id = auth.uid() and b.usuario_id = perfis.id
  )
);
create policy perfis_criar on public.perfis for insert with check (id = auth.uid());
create policy perfis_mudar on public.perfis for update using (id = auth.uid()) with check (id = auth.uid());

-- Grupos: só membros veem. Criar e entrar: pelas funções acima. Apagar: só o dono.
create policy grupos_ler on public.grupos for select using (public.eh_membro(id));
create policy grupos_apagar on public.grupos for delete using (criado_por = auth.uid());

-- Membros: membros veem a lista. Cada pessoa pode sair (apagar a própria linha).
create policy membros_ler on public.membros for select using (public.eh_membro(grupo_id));
create policy membros_sair on public.membros for delete using (usuario_id = auth.uid());

-- Mensagens: membros leem e escrevem. Cada pessoa apaga só as próprias mensagens.
create policy mensagens_ler on public.mensagens for select using (public.eh_membro(grupo_id));
create policy mensagens_escrever on public.mensagens for insert with check (autor_id = auth.uid() and public.eh_membro(grupo_id));
create policy mensagens_apagar on public.mensagens for delete using (autor_id = auth.uid());

-- Roteiro do grupo: todos os membros leem e editam.
create policy roteiro_ler on public.roteiros_grupo for select using (public.eh_membro(grupo_id));
create policy roteiro_criar on public.roteiros_grupo for insert with check (public.eh_membro(grupo_id) and atualizado_por = auth.uid());
create policy roteiro_mudar on public.roteiros_grupo for update using (public.eh_membro(grupo_id)) with check (public.eh_membro(grupo_id) and atualizado_por = auth.uid());

-- Enquetes e votos: membros veem e votam. Cada pessoa tem 1 voto por enquete e pode mudar o voto.
create policy enquetes_ler on public.enquetes for select using (public.eh_membro(grupo_id));
create policy enquetes_criar on public.enquetes for insert with check (criada_por = auth.uid() and public.eh_membro(grupo_id));
create policy votos_ler on public.votos for select using (exists (select 1 from enquetes e where e.id = enquete_id and public.eh_membro(e.grupo_id)));
create policy votos_votar on public.votos for insert with check (usuario_id = auth.uid() and exists (select 1 from enquetes e where e.id = enquete_id and public.eh_membro(e.grupo_id)));
create policy votos_mudar on public.votos for update using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());

-- Denúncias: ninguém lê pelo app (só a moderação, no painel do Supabase). Criar: pela função denunciar_mensagem.

-- Bloqueios: cada pessoa vê e muda só os próprios bloqueios.
create policy bloqueios_ler on public.bloqueios for select using (usuario_id = auth.uid());
create policy bloqueios_criar on public.bloqueios for insert with check (usuario_id = auth.uid());
create policy bloqueios_apagar on public.bloqueios for delete using (usuario_id = auth.uid());

-- ───────── Tempo real ─────────
-- O Supabase aplica as regras acima também aos avisos em tempo real.
alter publication supabase_realtime add table public.mensagens, public.roteiros_grupo, public.enquetes, public.votos;
