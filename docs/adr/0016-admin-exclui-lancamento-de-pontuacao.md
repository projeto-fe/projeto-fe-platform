# ADR 0016: Administrador pode excluir um lançamento de pontuação

- Status: aceito
- Data: 2026-09-15
- Revisa: [ADR 0003](0003-pontuacao-como-evento.md)

## Contexto

O ADR 0003 proibiu exclusão de propósito: todo lançamento, certo ou errado, fica para sempre no
extrato, e correção é sempre um estorno novo, nunca um apagar. A garantia era que o extrato sempre
responde "por que a criança tem essa pontuação".

Na prática, isso deixou sem saída um caso real: lançamento de teste ou engano que ninguém precisa
explicar depois, e que só polui o extrato mesmo depois de estornado. Pedido explícito do
administrador foi poder apagar de vez, sem depender de estorno.

## Decisão

Administrador pode excluir qualquer linha de `pontuacao_eventos`, lançamento normal ou estorno,
implementado como exclusão de verdade no banco (`delete`), não mais reversão só por evento novo. A
regra de segurança do ADR 0003 muda: em vez de "nenhuma exclusão para ninguém, nem admin", passa a
ser "nenhuma exclusão para ninguém, exceto admin".

Excluir um lançamento que já tem estorno remove os dois juntos, porque a chave estrangeira entre
eles (`estorna_evento_id`) impediria apagar só o original com o estorno ainda apontando pra ele.

Continua sem existir `UPDATE`: mudar valor ou motivo de um lançamento já feito não é objetivo deste
ADR, só remover.

## Consequências

- O extrato deixa de ser prova auditável e imutável do que aconteceu, que era a razão de existir do
  ADR 0003. Um lançamento apagado não deixa rastro nenhum, nem estornado, nem em log.
- Se um dia surgir disputa sobre pontuação (criança ou responsável questionando), não há mais
  garantia de que o extrato mostra tudo que já foi lançado.
- Correção do dia a dia continua sendo estorno, o que preserva o rastro. Excluir é para lançamento
  que nunca devia ter existido (teste, engano óbvio), não para desfazer pontuação de verdade.
- Se a falta de auditoria virar problema real, a saída é uma tabela de log separada que grava o
  antes de apagar, sem reabrir a policy de exclusão em si.
