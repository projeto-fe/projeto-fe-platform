-- ============================================================================
-- Spec 0005: calendário de atividades e presença
--
-- Cronograma recorrente (atividade_horarios) e exceções pontuais
-- (atividade_eventos) alimentam o calendário interno e o público. Presença
-- (chamadas + presencas) é dado interno, nunca público, e ao contrário de
-- pontuacao_eventos (ADR 0003) não é evento imutável: corrige-se direto.
-- ============================================================================

set lock_timeout = '10s';

-- ----------------------------------------------------------------------------
-- Tipos
-- ----------------------------------------------------------------------------
create type tipo_evento_atividade as enum ('extra', 'cancelado');
create type status_presenca as enum ('presente', 'falta', 'falta_justificada');
-- semanal: repete todo mesmo dia da semana.
-- mensal_dia_fixo: repete todo mesmo dia do mês (ex.: todo dia 15).
-- mensal_ordinal: repete no enésimo dia da semana do mês (ex.: toda 3ª terça).
create type frequencia_de_horario as enum ('semanal', 'mensal_dia_fixo', 'mensal_ordinal');

-- ----------------------------------------------------------------------------
-- Helper: o alvo é uma atividade (folha), nunca uma área.
-- ----------------------------------------------------------------------------
create or replace function e_atividade(alvo uuid)
returns boolean
language sql
stable
as $$
  select exists (select 1 from areas where id = alvo and tipo = 'atividade');
$$;

create or replace function checar_atividade_valida()
returns trigger
language plpgsql
as $$
begin
  if not e_atividade(new.atividade_id) then
    raise exception 'atividade_id precisa apontar para um nó do tipo atividade.';
  end if;
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- Cronograma recorrente
-- ----------------------------------------------------------------------------
create table atividade_horarios (
  id uuid primary key default gen_random_uuid(),
  atividade_id uuid not null references areas (id) on delete cascade,
  frequencia frequencia_de_horario not null default 'semanal',
  -- semanal e mensal_ordinal usam dia_semana; mensal_dia_fixo não usa.
  dia_semana smallint check (dia_semana between 0 and 6),
  -- só mensal_dia_fixo: dia do mês, de 1 a 31 (mês sem esse dia, pula o mês).
  dia_do_mes smallint check (dia_do_mes between 1 and 31),
  -- só mensal_ordinal: 1 a 4 = primeira à quarta ocorrência, -1 = última.
  semana_do_mes smallint check (semana_do_mes between -1 and 4 and semana_do_mes <> 0),
  hora_inicio time not null,
  hora_fim time not null check (hora_fim > hora_inicio),
  local text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  constraint campos_da_frequencia check (
    (frequencia = 'semanal'
      and dia_semana is not null and dia_do_mes is null and semana_do_mes is null)
    or (frequencia = 'mensal_dia_fixo'
      and dia_do_mes is not null and dia_semana is null and semana_do_mes is null)
    or (frequencia = 'mensal_ordinal'
      and dia_semana is not null and semana_do_mes is not null and dia_do_mes is null)
  )
);

comment on column atividade_horarios.dia_semana is '0 = domingo, 6 = sábado.';

create index atividade_horarios_atividade_idx on atividade_horarios (atividade_id);

create trigger atividade_horarios_valida
  before insert or update of atividade_id on atividade_horarios
  for each row execute function checar_atividade_valida();

-- ----------------------------------------------------------------------------
-- Exceções: cancelamento de uma data ou evento extra fora do padrão semanal
-- ----------------------------------------------------------------------------
create table atividade_eventos (
  id uuid primary key default gen_random_uuid(),
  atividade_id uuid not null references areas (id) on delete cascade,
  data date not null,
  tipo tipo_evento_atividade not null,
  hora_inicio time,
  hora_fim time,
  titulo text,
  local text,
  criado_por uuid references perfis (id) on delete set null,
  criado_em timestamptz not null default now(),
  -- cancelamento não precisa de horário; evento extra precisa, e com fim depois do início
  constraint horario_do_extra check (
    tipo = 'cancelado' or (hora_inicio is not null and hora_fim is not null and hora_fim > hora_inicio)
  )
);

create index atividade_eventos_atividade_data_idx on atividade_eventos (atividade_id, data);

create trigger atividade_eventos_valida
  before insert or update of atividade_id on atividade_eventos
  for each row execute function checar_atividade_valida();

-- ----------------------------------------------------------------------------
-- Presença: uma chamada por atividade e data, várias linhas de presença
-- ----------------------------------------------------------------------------
create table chamadas (
  id uuid primary key default gen_random_uuid(),
  atividade_id uuid not null references areas (id) on delete cascade,
  data date not null,
  aberta_por uuid not null references perfis (id) on delete restrict,
  aberta_em timestamptz not null default now(),
  unique (atividade_id, data)
);

create trigger chamadas_valida
  before insert or update of atividade_id on chamadas
  for each row execute function checar_atividade_valida();

create table presencas (
  id uuid primary key default gen_random_uuid(),
  chamada_id uuid not null references chamadas (id) on delete cascade,
  -- copiado da chamada na inserção: mantém a policy simples, sem join.
  atividade_id uuid not null references areas (id) on delete cascade,
  crianca_id uuid references criancas (id) on delete cascade,
  usuario_id uuid references perfis (id) on delete cascade,
  status status_presenca not null,
  observacao text,
  registrado_por uuid not null references perfis (id) on delete restrict,
  registrado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint presenca_uma_pessoa check ((crianca_id is not null) <> (usuario_id is not null)),
  unique (chamada_id, crianca_id),
  unique (chamada_id, usuario_id)
);

create index presencas_chamada_idx on presencas (chamada_id);
create index presencas_crianca_idx on presencas (crianca_id);
create index presencas_usuario_idx on presencas (usuario_id);

create or replace function copiar_atividade_da_chamada()
returns trigger
language plpgsql
as $$
begin
  select atividade_id into new.atividade_id from chamadas where id = new.chamada_id;
  if new.atividade_id is null then
    raise exception 'Chamada inexistente.';
  end if;
  return new;
end;
$$;

create trigger presencas_copia_atividade
  before insert on presencas
  for each row execute function copiar_atividade_da_chamada();

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
alter table atividade_horarios enable row level security;
alter table atividade_eventos  enable row level security;
alter table chamadas           enable row level security;
alter table presencas          enable row level security;

-- Cronograma: qualquer pessoa ativa lê; só administrador edita, mesma regra
-- de areas.
create policy atividade_horarios_leitura on atividade_horarios
  for select to authenticated
  using (esta_ativo());

create policy atividade_horarios_admin_escreve on atividade_horarios
  for all to authenticated
  using (e_admin())
  with check (e_admin());

-- Exceções: leitura livre; escrita por administrador ou coordenador da área
-- (não voluntário simples).
create policy atividade_eventos_leitura on atividade_eventos
  for select to authenticated
  using (esta_ativo());

create policy atividade_eventos_coordenacao_escreve on atividade_eventos
  for all to authenticated
  using (e_admin() or tem_papel_na_area(atividade_id, 'coordenador'))
  with check (e_admin() or tem_papel_na_area(atividade_id, 'coordenador'));

-- Presença: só quem tem vínculo com a área da atividade (qualquer papel) ou
-- administrador. Sem leitura aberta à equipe inteira, ao contrário do
-- cronograma: presença de criança é dado sensível-adjacente.
create policy chamadas_da_equipe_da_area on chamadas
  for all to authenticated
  using (e_admin() or tem_papel_na_area(atividade_id, 'voluntario'))
  with check (e_admin() or tem_papel_na_area(atividade_id, 'voluntario'));

-- Sem policy de DELETE em chamadas: nenhum grant de delete foi concedido
-- (ver GRANT abaixo), então a policy 'for all' nunca chega a valer para esse
-- verbo. Corrigir chamada errada é UPDATE, nunca remoção.

create policy presencas_da_equipe_da_area on presencas
  for all to authenticated
  using (e_admin() or tem_papel_na_area(atividade_id, 'voluntario'))
  with check (e_admin() or tem_papel_na_area(atividade_id, 'voluntario'));

-- ----------------------------------------------------------------------------
-- Views para o calendário. security_invoker: quem lê continua sujeito às
-- próprias policies (igual ranking_interno).
-- ----------------------------------------------------------------------------
create view agenda_horarios
with (security_invoker = true) as
  select
    h.id,
    h.atividade_id,
    atividade.nome as atividade_nome,
    area.nome as area_nome,
    h.frequencia,
    h.dia_semana,
    h.dia_do_mes,
    h.semana_do_mes,
    h.hora_inicio,
    h.hora_fim,
    h.local
  from atividade_horarios h
  join areas atividade on atividade.id = h.atividade_id
  left join areas area on area.id = atividade.parent_id
  where h.ativo and atividade.ativo;

create view agenda_eventos
with (security_invoker = true) as
  select
    e.id,
    e.atividade_id,
    atividade.nome as atividade_nome,
    area.nome as area_nome,
    e.data,
    e.tipo,
    e.hora_inicio,
    e.hora_fim,
    e.titulo,
    e.local
  from atividade_eventos e
  join areas atividade on atividade.id = e.atividade_id
  left join areas area on area.id = atividade.parent_id
  where atividade.ativo;

-- ----------------------------------------------------------------------------
-- Concessões explícitas
-- ----------------------------------------------------------------------------
grant select, insert, update, delete on atividade_horarios to authenticated;
grant select, insert, update, delete on atividade_eventos  to authenticated;
-- Sem delete: chamada e presença se corrigem, não se apagam.
grant select, insert, update          on chamadas           to authenticated;
grant select, insert, update          on presencas           to authenticated;

grant select on agenda_horarios to authenticated, service_role;
grant select on agenda_eventos  to authenticated, service_role;

-- As views rodam com security_invoker: para o service_role (página pública
-- /agenda) resolvê-las, ele precisa de leitura direta nas tabelas de trás.
-- Mesma necessidade que já existe para o ranking público, agora estendida ao
-- que a agenda pública passa a juntar.
grant select on areas              to service_role;
grant select on atividade_horarios to service_role;
grant select on atividade_eventos  to service_role;
