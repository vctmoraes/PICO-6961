-- PICO 6961 — segurança dos convites dos grupos.
-- Rode no SQL Editor depois do 0001_grupos.sql. Pode rodar mais de uma vez.
--
-- 1. Código de convite com 12 caracteres hexadecimais de fonte aleatória segura (gen_random_uuid).
--    São cerca de 280 trilhões de combinações.
-- 2. Limite de tentativas: cada pessoa pode tentar entrar em grupos no máximo 10 vezes por hora.
--    Assim, ninguém consegue adivinhar códigos em série.

create or replace function public.gerar_codigo_convite () returns text
language sql volatile as $$
  select upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
$$;

alter table public.grupos alter column codigo set default public.gerar_codigo_convite();

-- Troca os códigos curtos que já existirem.
update public.grupos set codigo = public.gerar_codigo_convite() where char_length(codigo) < 12;

-- Registro das tentativas (só a função abaixo escreve; ninguém lê pelo app).
create table if not exists public.tentativas_convite (
  usuario_id uuid not null references auth.users (id) on delete cascade,
  em timestamptz not null default now()
);
create index if not exists tentativas_convite_usuario_em on public.tentativas_convite (usuario_id, em);
alter table public.tentativas_convite enable row level security;
-- Sem política: o app não lê nem escreve direto nesta tabela.

create or replace function public.entrar_no_grupo (codigo_convite text) returns public.grupos
language plpgsql security definer set search_path = public as $$
declare g grupos;
begin
  if auth.uid() is null then raise exception 'Faça login para entrar no grupo'; end if;
  if (select count(*) from tentativas_convite where usuario_id = auth.uid() and em > now() - interval '1 hour') >= 10 then
    raise exception 'Muitas tentativas. Espere 1 hora e tente de novo.';
  end if;
  insert into tentativas_convite (usuario_id) values (auth.uid());
  delete from tentativas_convite where em < now() - interval '1 day';

  select * into g from grupos where codigo = upper(trim(codigo_convite));
  if g.id is null then raise exception 'Código de convite não encontrado'; end if;
  if (select count(*) from membros where grupo_id = g.id) >= 50 then raise exception 'O grupo está cheio (50 pessoas)'; end if;
  insert into membros (grupo_id, usuario_id) values (g.id, auth.uid()) on conflict do nothing;
  return g;
end $$;

-- A exclusão de conta também apaga o registro de tentativas.
create or replace function public.apagar_meus_dados () returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  delete from mensagens where autor_id = auth.uid();
  delete from votos where usuario_id = auth.uid();
  delete from bloqueios where usuario_id = auth.uid() or bloqueado_id = auth.uid();
  delete from membros where usuario_id = auth.uid();
  delete from tentativas_convite where usuario_id = auth.uid();
  delete from perfis where id = auth.uid();
end $$;
