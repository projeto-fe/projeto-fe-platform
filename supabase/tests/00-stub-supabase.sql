-- Reproduz o mínimo do ambiente Supabase para rodar as migrations num
-- Postgres puro: papéis, schema auth e auth.uid().
-- roles são globais ao cluster, então o stub precisa ser idempotente
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin bypassrls;
  end if;
end;
$$;

create schema if not exists auth;

-- Mesmas colunas que o schema real do Supabase expõe e que usamos.
create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  raw_user_meta_data jsonb not null default '{}'::jsonb
);

-- auth.uid() real lê o JWT. Aqui lê um GUC de sessão, que é como os testes
-- trocam de usuário.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

grant usage on schema auth to anon, authenticated, service_role;
grant select on auth.users to authenticated, service_role;
