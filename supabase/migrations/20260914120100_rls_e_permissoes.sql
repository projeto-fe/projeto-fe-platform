-- ============================================================================
-- Row Level Security, helpers de papel e concessões explícitas
--
-- Regras que valem para todo este arquivo:
--   1. Papel vem SEMPRE do banco, nunca de metadado que o cliente controla.
--   2. Helpers concentram a lógica de papel. Policy nova não reimplementa.
--   3. Nenhuma tabela recebe GRANT amplo. Cada verbo é concedido por decisão.
--   4. Função SECURITY DEFINER nasce sem EXECUTE para PUBLIC.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helpers
-- ----------------------------------------------------------------------------

create or replace function e_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (select p.is_admin and p.ativo from perfis p where p.id = auth.uid()),
    false
  );
$$;

create or replace function esta_ativo()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce((select p.ativo from perfis p where p.id = auth.uid()), false);
$$;

-- Todas as áreas ancestrais de uma área, incluindo ela mesma.
-- Coordenador de "Educacional" também responde por "Inglês", que é filha.
create or replace function areas_ancestrais(alvo uuid)
returns table (area_id uuid)
language sql
stable
as $$
  with recursive subida as (
    select a.id, a.parent_id from areas a where a.id = alvo
    union all
    select a.id, a.parent_id from areas a join subida s on a.id = s.parent_id
  )
  select id from subida;
$$;

create or replace function tem_papel_na_area(alvo uuid, papel_minimo papel_na_area)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from area_membros m
    where m.usuario_id = auth.uid()
      and m.area_id in (select area_id from areas_ancestrais(alvo))
      and (papel_minimo = 'voluntario' or m.papel = 'coordenador')
  );
$$;

-- É coordenador de alguma área? Usado onde a permissão não é sobre uma área
-- específica, como ler dado sensível de criança.
create or replace function e_coordenador_de_alguma_area()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from area_membros m
    where m.usuario_id = auth.uid() and m.papel = 'coordenador'
  );
$$;

-- Nenhum helper fica executável por PUBLIC por padrão.
revoke execute on function
  e_admin(), esta_ativo(), areas_ancestrais(uuid),
  tem_papel_na_area(uuid, papel_na_area), e_coordenador_de_alguma_area()
  from public;

grant execute on function
  e_admin(), esta_ativo(), areas_ancestrais(uuid),
  tem_papel_na_area(uuid, papel_na_area), e_coordenador_de_alguma_area()
  to authenticated;

-- ----------------------------------------------------------------------------
-- RLS ligada em tudo
-- ----------------------------------------------------------------------------
alter table perfis                    enable row level security;
alter table areas                     enable row level security;
alter table area_membros              enable row level security;
alter table criancas                  enable row level security;
alter table criancas_dados_sensiveis  enable row level security;
alter table crianca_atividades        enable row level security;
alter table motivos_pontuacao         enable row level security;
alter table pontuacao_eventos         enable row level security;
alter table convites                  enable row level security;
alter table auditoria                 enable row level security;

-- ----------------------------------------------------------------------------
-- Perfis
-- ----------------------------------------------------------------------------
create policy perfis_leitura on perfis
  for select to authenticated
  using (esta_ativo());

create policy perfis_edita_proprio_nome on perfis
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy perfis_admin_escreve on perfis
  for all to authenticated
  using (e_admin())
  with check (e_admin());

-- Promover a admin ou reativar conta não pode passar pela policy de
-- "editar o próprio perfil". Bloqueio explícito e independente.
create or replace function impedir_autopromocao()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if e_admin() then
    return new;
  end if;

  if new.is_admin is distinct from old.is_admin then
    raise exception 'Apenas administrador altera privilégio de administrador.';
  end if;

  if new.ativo is distinct from old.ativo then
    raise exception 'Apenas administrador ativa ou desativa uma conta.';
  end if;

  return new;
end;
$$;

create trigger perfis_sem_autopromocao
  before update on perfis
  for each row execute function impedir_autopromocao();

-- ----------------------------------------------------------------------------
-- Estrutura
-- ----------------------------------------------------------------------------
create policy areas_leitura on areas
  for select to authenticated
  using (esta_ativo());

create policy areas_admin_escreve on areas
  for all to authenticated
  using (e_admin())
  with check (e_admin());

create policy area_membros_leitura on area_membros
  for select to authenticated
  using (esta_ativo());

create policy area_membros_admin_escreve on area_membros
  for all to authenticated
  using (e_admin())
  with check (e_admin());

-- ----------------------------------------------------------------------------
-- Crianças
-- ----------------------------------------------------------------------------
create policy criancas_leitura on criancas
  for select to authenticated
  using (esta_ativo());

create policy criancas_equipe_insere on criancas
  for insert to authenticated
  with check (esta_ativo());

create policy criancas_equipe_atualiza on criancas
  for update to authenticated
  using (esta_ativo())
  with check (esta_ativo());

create policy criancas_admin_remove on criancas
  for delete to authenticated
  using (e_admin());

-- Dado sensível: só coordenação e administração. Voluntário não enxerga
-- a linha, então não existe campo mascarado para o formulário destruir.
create policy dados_sensiveis_coordenacao on criancas_dados_sensiveis
  for all to authenticated
  using (e_admin() or e_coordenador_de_alguma_area())
  with check (e_admin() or e_coordenador_de_alguma_area());

create policy crianca_atividades_leitura on crianca_atividades
  for select to authenticated
  using (esta_ativo());

create policy crianca_atividades_equipe_escreve on crianca_atividades
  for all to authenticated
  using (esta_ativo())
  with check (esta_ativo());

-- ----------------------------------------------------------------------------
-- IDE JOGAI
-- ----------------------------------------------------------------------------
create policy motivos_leitura on motivos_pontuacao
  for select to authenticated
  using (esta_ativo());

create policy motivos_admin_escreve on motivos_pontuacao
  for all to authenticated
  using (e_admin())
  with check (e_admin());

-- Lançar: qualquer pessoa ativa da equipe, sempre em nome próprio.
create policy eventos_leitura on pontuacao_eventos
  for select to authenticated
  using (esta_ativo());

create policy eventos_insercao on pontuacao_eventos
  for insert to authenticated
  with check (esta_ativo() and lancado_por = auth.uid());

-- Não existe policy de UPDATE nem de DELETE para ninguém, inclusive admin.
-- Correção é estorno, que é INSERT. Ver ADR 0003.

-- O valor aplicado tem que vir do catálogo, nunca do cliente.
create or replace function fixar_valor_do_evento()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  valor_catalogo integer;
  evento_original pontuacao_eventos;
begin
  if new.estorna_evento_id is not null then
    select * into evento_original
      from pontuacao_eventos where id = new.estorna_evento_id;

    if evento_original is null then
      raise exception 'Evento a estornar não existe.';
    end if;

    if evento_original.estorna_evento_id is not null then
      raise exception 'Não se estorna um estorno.';
    end if;

    if not (e_admin() or e_coordenador_de_alguma_area()) then
      raise exception 'Apenas coordenação ou administração estorna lançamento.';
    end if;

    new.valor_aplicado := -evento_original.valor_aplicado;
    new.crianca_id := evento_original.crianca_id;
    return new;
  end if;

  select valor into valor_catalogo
    from motivos_pontuacao where id = new.motivo_id and ativo;

  if valor_catalogo is null then
    raise exception 'Motivo inexistente ou inativo.';
  end if;

  new.valor_aplicado := valor_catalogo;
  return new;
end;
$$;

create trigger eventos_valor_do_catalogo
  before insert on pontuacao_eventos
  for each row execute function fixar_valor_do_evento();

-- Ranking interno, com nome real.
create view ranking_interno
with (security_invoker = true) as
  select
    c.id            as crianca_id,
    c.nome_completo,
    c.nome_jogador,
    coalesce(sum(e.valor_aplicado), 0)::integer as pontos
  from criancas c
  left join pontuacao_eventos e on e.crianca_id = c.id
  where c.ativo
  group by c.id, c.nome_completo, c.nome_jogador;

comment on view ranking_interno is
  'security_invoker garante que a view respeita as policies de quem consulta.';

-- ----------------------------------------------------------------------------
-- Convites e auditoria
-- ----------------------------------------------------------------------------
create policy convites_admin on convites
  for all to authenticated
  using (e_admin())
  with check (e_admin());

create policy auditoria_admin_le on auditoria
  for select to authenticated
  using (e_admin());

-- Ninguém escreve auditoria pelo cliente: só o servidor, com service role,
-- que não passa por RLS. E ninguém altera nem apaga, nunca.

-- ----------------------------------------------------------------------------
-- Concessões explícitas
--
-- O projeto foi criado sem exposição automática de tabelas. Tudo abaixo é
-- decisão consciente. Repare que não existe nenhum GRANT ALL: é justamente
-- o GRANT amplo herdado do schema base que tornou decorativo um REVOKE de
-- coluna no Pilar.
-- ----------------------------------------------------------------------------
grant usage on schema public to authenticated;

-- Atenção: administrador e voluntário são o MESMO papel de banco
-- (authenticated). Privilégio de coluna não serve para separá-los, e um
-- `grant update (nome)` seguido de `grant update` na tabela seria pura
-- decoração: privilégios de coluna e de tabela somam, nunca subtraem.
-- Quem protege is_admin e ativo aqui é o trigger perfis_sem_autopromocao.
grant select, insert, update, delete on perfis                   to authenticated;

grant select, insert, update, delete on areas                    to authenticated;
grant select, insert, update, delete on area_membros             to authenticated;

grant select, insert, update, delete on criancas                 to authenticated;
grant select, insert, update, delete on criancas_dados_sensiveis to authenticated;
grant select, insert, update, delete on crianca_atividades       to authenticated;

grant select, insert, update, delete on motivos_pontuacao        to authenticated;
-- eventos: só leitura e inserção. Sem UPDATE e sem DELETE no privilégio,
-- além de não existir policy. Duas barreiras independentes.
grant select, insert                 on pontuacao_eventos        to authenticated;

grant select, insert, update, delete on convites                 to authenticated;
grant select                         on auditoria                to authenticated;

grant select                         on ranking_interno          to authenticated;

-- A página pública do ranking é renderizada no servidor e não usa estes
-- papéis. Por isso anon não recebe absolutamente nada.
