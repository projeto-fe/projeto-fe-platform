-- ============================================================================
-- Catálogo inicial de motivos do IDE JOGAI.
--
-- Valores fixos, para que dois voluntários apliquem o mesmo critério à mesma
-- situação. A coordenação ajusta rótulos e valores depois pela interface, e
-- mudar um valor aqui não reescreve lançamento já feito (ADR 0003).
--
-- Os valores abaixo são um ponto de partida, não uma regra do instituto.
-- ============================================================================

insert into motivos_pontuacao (rotulo, valor, ordem) values
  ('Ajudou um colega',            5,  1),
  ('Ajudou a organizar o espaço', 3,  2),
  ('Boa participação',            2,  3),
  ('Presença na atividade',       2,  4),
  ('Linguagem inadequada',       -3,  5),
  ('Desrespeito com colega',     -5,  6)
on conflict (rotulo) do nothing;
