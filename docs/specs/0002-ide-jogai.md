# Spec 0002: IDE JOGAI

- Status: pronta para implementar
- Data: 2026-09-14
- ADRs relacionados: [0003](../adr/0003-pontuacao-como-evento.md),
  [0006](../adr/0006-ranking-publico-com-nome-abreviado.md),
  [0007](../adr/0007-voz-interpreta-humano-confirma.md)

## Problema

A gamificação do projeto premia atitudes ao longo do ano. Hoje não há registro estruturado: a
pontuação depende de memória e anotação avulsa, e não há como explicar a uma criança por que ela
tem determinada pontuação, nem como ela acompanha sua posição.

## Não é objetivo

- Prêmios e sua entrega, que são processo do instituto, não do software.
- Notificação automática para responsáveis.
- Metas ou desafios por período.
- Lançar ponto sem internet.

## Fluxos

### Lançar ponto

Voluntário seleciona a criança, escolhe o motivo no catálogo e confirma. O valor vem do motivo e
não é editável.

Alternativa por ditado: com a criança já selecionada, o voluntário dita o que aconteceu, o sistema
sugere o motivo correspondente, e o lançamento só ocorre após confirmação explícita. O valor
continua vindo do catálogo.

### Estornar

Coordenador ou administrador estorna um lançamento. O estorno cria um evento novo que aponta para
o original. O lançamento estornado continua visível no extrato, marcado como estornado.

### Ver extrato

Extrato da criança com todos os eventos: valor, motivo, quem lançou, quando, em qual atividade.

### Ranking interno

Ranking do ano com nome real, visível para a equipe autenticada.

### Ranking público

Página aberta em `app.projetofe.org/ranking`, exibindo apenas o nome abreviado, a posição e a
pontuação. Renderizada no servidor, com revalidação a cada 5 minutos.

## Modelo de dado

```
motivos_pontuacao
  id, rotulo, valor, ativo, ordem

pontuacao_eventos
  id, crianca_id, motivo_id, valor_aplicado, atividade_id,
  lancado_por, lancado_em,
  estorna_evento_id (nulo), estornado (derivado)
```

`valor_aplicado` é copiado do motivo no momento do lançamento, para que mudar o catálogo não
reescreva o passado.

Ranking derivado por view. Nenhuma coluna de saldo é mantida.

## Segurança

- `pontuacao_eventos`: inserção por voluntário, coordenador e administrador. Nunca atualização ou
  exclusão por ninguém, inclusive administrador. Correção é sempre estorno.
- `motivos_pontuacao`: escrita apenas por administrador.
- A view pública expõe exclusivamente nome de jogador, posição e pontuação.
- O ditado envia apenas o texto do que aconteceu, jamais o nome da criança.

## Critérios de aceite

- [ ] Nenhum caminho da aplicação consegue atualizar ou excluir uma linha de `pontuacao_eventos`,
      testado contra o banco.
- [ ] Estorno zera o efeito no ranking e mantém os dois eventos visíveis no extrato.
- [ ] Mudar o valor de um motivo no catálogo não altera a pontuação já lançada.
- [ ] O ditado com frase ambígua mostra a sugestão e aguarda confirmação, sem gravar nada.
- [ ] Recusar a sugestão do ditado não deixa nenhum registro de pontuação.
- [ ] A página pública não expõe sobrenome completo em nenhum lugar, incluindo o HTML enviado ao navegador.
- [ ] A página pública responde sem sessão e sem nenhuma credencial de banco no cliente.
- [ ] Lançar ponto pelo celular leva no máximo três toques a partir da tela inicial.
