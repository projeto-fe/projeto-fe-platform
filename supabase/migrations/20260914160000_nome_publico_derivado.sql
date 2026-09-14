-- ============================================================================
-- O ranking público passa a derivar o nome do cadastro, em vez de exigir um
-- apelido digitado à parte.
--
-- Revisa o ADR 0006: o campo separado saiu porque pedia trabalho extra no
-- cadastro e ainda dependia de alguém escolher bem. A proteção continua, só
-- que automática: "Ana Beatriz Moraes" aparece publicamente como "Ana M.".
--
-- A criança se reconhece na hora, e a página deixa de ser um inventário de
-- menores identificáveis ligados a uma instituição e a uma cidade.
--
-- Seguro rodar agora: nenhuma criança cadastrada ainda.
-- ============================================================================

set lock_timeout = '10s';

create or replace function nome_publico(nome_completo text)
returns text
language sql
immutable
as $$
  select case
    -- um nome só: devolve como está
    when array_length(partes, 1) = 1 then partes[1]
    -- primeiro nome mais a inicial do último sobrenome
    else partes[1] || ' ' || left(partes[array_length(partes, 1)], 1) || '.'
  end
  from (
    select regexp_split_to_array(trim(regexp_replace(nome_completo, '\s+', ' ', 'g')), ' ') as partes
  ) as _;
$$;

comment on function nome_publico is
  'Versão do nome exibível na página aberta. Ver ADR 0006.';

drop view if exists ranking_interno;

create view ranking_interno
with (security_invoker = true) as
  select
    c.id            as crianca_id,
    c.nome_completo,
    nome_publico(c.nome_completo) as nome_publico,
    coalesce(sum(e.valor_aplicado), 0)::integer as pontos
  from criancas c
  left join pontuacao_eventos e on e.crianca_id = c.id
  where c.ativo
  group by c.id, c.nome_completo;

grant select on ranking_interno to authenticated, service_role;

alter table criancas drop column nome_jogador;
