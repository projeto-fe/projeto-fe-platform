-- ============================================================================
-- Criação automática do perfil quando um usuário nasce no autenticador.
--
-- Sem isto, uma conta criada pelo painel ou pelo aceite de convite existiria
-- em auth.users sem linha em perfis, e a pessoa entraria num sistema onde
-- não tem papel nenhum.
--
-- Traz junto o bootstrap do primeiro administrador: como o cadastro aberto
-- está desligado e o acesso é por convite, alguém precisa ser o primeiro.
-- A regra só dispara com a tabela vazia, então vale exatamente uma vez.
-- ============================================================================

-- Criar gatilho em auth.users pede lock exclusivo numa tabela que o serviço
-- de autenticação consulta o tempo todo. Sem limite, a migration espera para
-- sempre em vez de falhar. Melhor falhar rápido e repetir.
set lock_timeout = '10s';
set statement_timeout = '60s';

create or replace function criar_perfil_para_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  primeiro boolean;
  nome_informado text;
begin
  select not exists (select 1 from perfis) into primeiro;

  nome_informado := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'nome'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    split_part(new.email, '@', 1)
  );

  insert into perfis (id, nome, email, is_admin, ativo)
  values (new.id, nome_informado, new.email, primeiro, true)
  on conflict (id) do nothing;

  if primeiro then
    insert into auditoria (ator_id, acao, entidade, entidade_id, detalhe, sensivel)
    values (
      new.id,
      'bootstrap do primeiro administrador',
      'perfis',
      new.id::text,
      jsonb_build_object('email', new.email),
      true
    );
  end if;

  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function criar_perfil_para_novo_usuario();

revoke execute on function criar_perfil_para_novo_usuario() from public;
