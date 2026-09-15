-- ADR 0016: revisa o ADR 0003 para permitir que administrador exclua um
-- lançamento de pontuação de vez. Antes só existia estorno, sem nenhuma
-- policy nem privilégio de DELETE para ninguém.

grant delete on pontuacao_eventos to authenticated;

create policy eventos_exclusao on pontuacao_eventos
  for delete to authenticated
  using (e_admin());
