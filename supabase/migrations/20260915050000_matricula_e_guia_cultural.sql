-- ============================================================================
-- Matrícula da criança (preenchimento automático) e bucket do guia cultural.
-- ============================================================================

set lock_timeout = '10s';

-- ----------------------------------------------------------------------------
-- Matrícula: numeração sequencial, gerada pelo banco. Nunca digitada por
-- ninguém, então não existe campo pra isso em formulário nenhum — ela só
-- aparece depois de a criança já existir.
-- ----------------------------------------------------------------------------
alter table criancas add column matricula integer generated always as identity;

comment on column criancas.matricula is
  'Numeração sequencial gerada pelo banco na hora do cadastro. Nunca digitada.';

-- ----------------------------------------------------------------------------
-- Bucket para documento institucional (guia cultural e o que mais vier).
-- Mesma decisão do bucket de fotos: privado, sem policy nenhuma em
-- `storage.objects`, servido só pela rota própria do app.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('arquivos', 'arquivos', false)
on conflict (id) do nothing;
