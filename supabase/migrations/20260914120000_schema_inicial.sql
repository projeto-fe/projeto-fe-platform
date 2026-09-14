-- ============================================================================
-- Schema inicial do Portal Projeto Fé
--
-- Princípios aplicados (ver docs/adr):
--   0004  papel vale dentro da área, não globalmente
--   0005  dado sensível em tabela separada, sem mascaramento de coluna
--   0003  pontuação é evento imutável, nunca saldo editável
--   0006  ranking público expõe apenas nome de jogador
--
-- O projeto foi criado com "expose new tables" DESLIGADO, então nenhuma tabela
-- fica acessível sem GRANT explícito. Cada GRANT abaixo é uma decisão, não um
-- padrão herdado. É o oposto do que causou o vazamento de escrita no Pilar,
-- onde GRANT ALL no schema base tornou decorativo o REVOKE de coluna.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tipos
-- ----------------------------------------------------------------------------
create type papel_na_area as enum ('coordenador', 'voluntario');
create type tipo_de_no as enum ('area', 'atividade');
create type tamanho_uniforme as enum ('PP', 'P', 'M', 'G', 'GG');

-- ----------------------------------------------------------------------------
-- Perfis
-- ----------------------------------------------------------------------------
create table perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null check (length(trim(nome)) > 0),
  email text not null unique,
  is_admin boolean not null default false,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

comment on column perfis.is_admin is
  'Único papel global. Coordenador e voluntário vivem em area_membros (ADR 0004).';

-- ----------------------------------------------------------------------------
-- Estrutura: áreas e atividades na mesma árvore
-- ----------------------------------------------------------------------------
create table areas (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(trim(nome)) > 0),
  parent_id uuid references areas (id) on delete restrict,
  tipo tipo_de_no not null default 'area',
  descricao_horario text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  -- atividade é sempre folha de uma área, nunca raiz
  constraint atividade_precisa_de_area check (tipo = 'area' or parent_id is not null)
);

create index areas_parent_idx on areas (parent_id);

-- Impede que uma área seja movida para dentro da própria descendência.
-- Sem isto a árvore vira anel e toda consulta recursiva trava.
create or replace function impedir_ciclo_em_areas()
returns trigger
language plpgsql
as $$
declare
  ancestral uuid := new.parent_id;
  saltos int := 0;
begin
  if new.parent_id is null then
    return new;
  end if;

  if new.parent_id = new.id then
    raise exception 'Uma área não pode ser pai de si mesma.';
  end if;

  while ancestral is not null loop
    saltos := saltos + 1;
    if saltos > 50 then
      raise exception 'Hierarquia de áreas profunda demais, possível ciclo.';
    end if;

    if ancestral = new.id then
      raise exception 'Não dá para mover uma área para dentro dela mesma.';
    end if;

    select parent_id into ancestral from areas where id = ancestral;
  end loop;

  return new;
end;
$$;

create trigger areas_sem_ciclo
  before insert or update of parent_id on areas
  for each row execute function impedir_ciclo_em_areas();

-- ----------------------------------------------------------------------------
-- Vínculo pessoa x área
-- ----------------------------------------------------------------------------
create table area_membros (
  usuario_id uuid not null references perfis (id) on delete cascade,
  area_id uuid not null references areas (id) on delete cascade,
  papel papel_na_area not null,
  criado_em timestamptz not null default now(),
  primary key (usuario_id, area_id)
);

create index area_membros_area_idx on area_membros (area_id);

-- ----------------------------------------------------------------------------
-- Crianças: dado não sensível
-- ----------------------------------------------------------------------------
create table criancas (
  id uuid primary key default gen_random_uuid(),
  nome_completo text not null check (length(trim(nome_completo)) > 0),
  nome_jogador text not null unique check (length(trim(nome_jogador)) > 0),
  data_nascimento date not null check (data_nascimento <= current_date),
  tem_problema_saude boolean not null default false,
  observacao_saude text,
  -- medidas em inteiro: gramas e centímetros, nunca ponto flutuante
  peso_g integer check (peso_g > 0),
  altura_cm integer check (altura_cm > 0),
  numero_calcado integer check (numero_calcado between 10 and 50),
  uniforme tamanho_uniforme,
  observacoes_gerais text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  criado_por uuid references perfis (id) on delete set null
);

comment on column criancas.nome_jogador is
  'Único identificador exibido na página pública do ranking (ADR 0006).';

-- ----------------------------------------------------------------------------
-- Crianças: dado sensível, tabela separada (ADR 0005)
-- ----------------------------------------------------------------------------
create table criancas_dados_sensiveis (
  crianca_id uuid primary key references criancas (id) on delete cascade,
  cep text,
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  cidade text default 'Marília',
  uf text default 'SP' check (uf is null or length(uf) = 2),
  telefone_principal text,
  telefone_secundario text,
  nome_mae text,
  nome_pai text,
  autorizacao_responsavel_nome text,
  autorizacao_data date,
  autorizacao_colhida_por uuid references perfis (id) on delete set null,
  atualizado_em timestamptz not null default now()
);

comment on table criancas_dados_sensiveis is
  'Endereço, contato e autorização. Separada de criancas para que o controle '
  'seja por linha e não por coluna mascarada (ADR 0005).';

-- ----------------------------------------------------------------------------
-- Inscrição em atividades (uma criança pode estar em várias)
-- ----------------------------------------------------------------------------
create table crianca_atividades (
  crianca_id uuid not null references criancas (id) on delete cascade,
  atividade_id uuid not null references areas (id) on delete cascade,
  inscrita_em timestamptz not null default now(),
  primary key (crianca_id, atividade_id)
);

create index crianca_atividades_atividade_idx on crianca_atividades (atividade_id);

-- ----------------------------------------------------------------------------
-- IDE JOGAI
-- ----------------------------------------------------------------------------
create table motivos_pontuacao (
  id uuid primary key default gen_random_uuid(),
  rotulo text not null unique check (length(trim(rotulo)) > 0),
  valor integer not null check (valor <> 0),
  ativo boolean not null default true,
  ordem integer not null default 0
);

create table pontuacao_eventos (
  id uuid primary key default gen_random_uuid(),
  crianca_id uuid not null references criancas (id) on delete cascade,
  motivo_id uuid references motivos_pontuacao (id) on delete restrict,
  -- copiado do motivo no momento do lançamento: mudar o catálogo não
  -- pode reescrever o passado (ADR 0003)
  valor_aplicado integer not null,
  atividade_id uuid references areas (id) on delete set null,
  lancado_por uuid not null references perfis (id) on delete restrict,
  lancado_em timestamptz not null default now(),
  estorna_evento_id uuid unique references pontuacao_eventos (id) on delete restrict,
  -- estorno não tem motivo próprio; lançamento normal exige motivo
  constraint estorno_ou_motivo check (
    (estorna_evento_id is null and motivo_id is not null)
    or (estorna_evento_id is not null and motivo_id is null)
  )
);

create index pontuacao_eventos_crianca_idx on pontuacao_eventos (crianca_id);
create index pontuacao_eventos_data_idx on pontuacao_eventos (lancado_em desc);

-- ----------------------------------------------------------------------------
-- Convites e auditoria
-- ----------------------------------------------------------------------------
create table convites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  papel papel_na_area,
  area_id uuid references areas (id) on delete cascade,
  conceder_admin boolean not null default false,
  token_hash text not null unique,
  expira_em timestamptz not null,
  aceito_em timestamptz,
  convidado_por uuid not null references perfis (id) on delete restrict,
  criado_em timestamptz not null default now()
);

create index convites_email_idx on convites (lower(email));

comment on column convites.token_hash is
  'Hash do token. O valor em claro só existe no e-mail enviado.';

create table auditoria (
  id bigserial primary key,
  ator_id uuid references perfis (id) on delete set null,
  acao text not null,
  entidade text not null,
  entidade_id text,
  detalhe jsonb,
  sensivel boolean not null default false,
  criado_em timestamptz not null default now()
);

create index auditoria_data_idx on auditoria (criado_em desc);
create index auditoria_ator_idx on auditoria (ator_id);
