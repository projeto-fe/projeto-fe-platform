-- ============================================================================
-- Privilégios que faltavam para o fluxo de convite funcionar.
--
-- Quem abre o link de convite ainda não tem conta, então nenhuma política de
-- linha se aplica a essa pessoa: a leitura tem que acontecer pelo papel de
-- serviço. A migration anterior concedeu a ele apenas o necessário para o
-- ranking público e o log de auditoria, e o fluxo de convite ficou de fora.
--
-- O sintoma era pior que a falha: sem privilégio, a consulta volta vazia e a
-- tela concluía "convite não existe", mandando a pessoa conferir um link que
-- estava correto.
--
-- Continua valendo a regra: service_role ignora as políticas de linha, então
-- cada item aqui é uma decisão, e a lista corresponde exatamente ao que o
-- fluxo faz.
-- ============================================================================

set lock_timeout = '10s';

-- ler o convite pelo hash do token, e marcá-lo como aceito depois
grant select, update on convites to service_role;

-- aplicar o vínculo de área que veio no convite
grant insert on area_membros to service_role;

-- o gatilho que cria o perfil roda como definidor, mas o aceite lê o perfil
-- recém-criado para confirmar que existe antes de seguir
grant select on perfis to service_role;
