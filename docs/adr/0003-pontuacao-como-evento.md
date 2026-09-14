# ADR 0003: Pontuação do IDE JOGAI é evento, não saldo

- Status: aceito
- Data: 2026-09-14

## Contexto

O IDE JOGAI é a gamificação do projeto: criança ganha ponto por atitude positiva e perde por
atitude negativa, com ranking anual e premiação no fim do ano.

O modelo intuitivo seria uma coluna `pontos` na tabela da criança, atualizada a cada lançamento.

Três situações reais derrubam esse modelo:

1. Criança ou responsável pergunta por que perdeu ponto, e não existe resposta.
2. Voluntário lança errado, e corrigir significa sobrescrever o número, apagando o registro do
   erro.
3. Prêmio de fim de ano decidido por um número que ninguém consegue auditar gera conflito
   justamente no momento de maior expectativa.

## Decisão

Cada lançamento é uma linha em `pontuacao_eventos`: criança, motivo, valor, quem lançou, quando,
e em qual atividade. O saldo e o ranking são derivados desses eventos, nunca digitados.

Estorno é um evento novo que aponta para o evento estornado, e não uma exclusão.

Os motivos vêm de um catálogo com valor fixo (`motivos_pontuacao`). Não existe campo livre de
quantidade de pontos.

## Consequências

- O extrato da criança existe de graça: é a própria lista de eventos.
- Todo ponto tem autor registrado, o que importa porque voluntários lançam pontos.
- O catálogo de valor fixo evita que dois voluntários apliquem critérios diferentes para a mesma
  situação, que é o que tornaria o ranking injusto.
- O ranking exige agregação. Na escala deste projeto (100 crianças, poucos milhares de eventos por
  ano) uma view materializada ou uma consulta simples resolve. Se um dia doer, a otimização é
  isolada e não muda o modelo.
- Mudar o valor de um motivo no catálogo não deve reescrever o passado: o evento guarda o valor
  aplicado no momento do lançamento.
