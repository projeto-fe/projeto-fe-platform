-- ============================================================================
-- Esqueci minha senha.
--
-- Mesmo desenho do convite (token em claro só no e-mail, hash no banco,
-- validade curta, uso único), mas numa tabela própria: convite cria conta,
-- isto troca a senha de uma conta que já existe. São eventos diferentes e
-- não faz sentido reaproveitar `convites` para os dois.
--
-- Quem pede a redefinição e quem a confirma ainda não tem sessão, então
-- nenhuma política de linha se aplica: o servidor mexe aqui inteiramente
-- pelo papel de serviço, igual ao fluxo de convite.
-- ============================================================================

set lock_timeout = '10s';

create table redefinicoes_senha (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references perfis (id) on delete cascade,
  token_hash text not null unique,
  expira_em timestamptz not null,
  usado_em timestamptz,
  criado_em timestamptz not null default now()
);

create index redefinicoes_senha_usuario_idx on redefinicoes_senha (usuario_id);

comment on column redefinicoes_senha.token_hash is
  'Hash do token. O valor em claro só existe no e-mail enviado.';

alter table redefinicoes_senha enable row level security;

-- Sem policy para "authenticated": ninguém navega nesta tabela logado, nem
-- administrador. É só uma ponte entre pedir e confirmar a troca de senha.

grant usage on schema public to service_role;
grant select, insert, update on redefinicoes_senha to service_role;
-- select em perfis já veio de 20260915010000, reaproveitado aqui pra achar a
-- conta pelo e-mail do formulário de "esqueci a senha"
