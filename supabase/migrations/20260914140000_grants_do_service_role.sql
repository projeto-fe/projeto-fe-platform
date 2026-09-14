-- ============================================================================
-- Privilégios mínimos para o papel de serviço.
--
-- Com a exposição automática de tabelas desligada, service_role nasceu sem
-- acesso a nada. Isso pegou um defeito real: a migration de RLS afirmava que
-- o log de auditoria é escrito "pelo servidor, com service role", mas esse
-- privilégio nunca foi concedido, então nenhuma auditoria seria gravada.
--
-- service_role ignora as políticas de linha, então cada item aqui dá acesso
-- irrestrito à tabela citada. Por isso a lista é curta e corresponde apenas
-- ao que o servidor realmente faz:
--
--   1. a página pública do ranking lê a view de ranking
--   2. o servidor grava o log de auditoria
--
-- Tudo o mais no sistema passa pelo cliente autenticado e continua sujeito
-- às políticas. Precisar de mais aqui é decisão consciente, com uma linha
-- nova e o motivo escrito.
-- ============================================================================

set lock_timeout = '10s';

grant usage on schema public to service_role;

-- 1. ranking público
grant select on ranking_interno to service_role;
-- a view lê estas duas tabelas; sem acesso a elas, a view não resolve
grant select on criancas to service_role;
grant select on pontuacao_eventos to service_role;

-- 2. log de auditoria: escreve e lê, nunca altera nem apaga
grant select, insert on auditoria to service_role;
grant usage, select on sequence auditoria_id_seq to service_role;
