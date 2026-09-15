# Spec 0002: IDE JOGAI

- Status: pronta para implementar
- Data: 2026-09-14
- ADRs relacionados: [0003](../adr/0003-pontuacao-como-evento.md),
  [0006](../adr/0006-ranking-publico-com-nome-abreviado.md),
  [0014](../adr/0014-captura-de-voz-web-speech-api.md),
  [0015](../adr/0015-ditado-identifica-crianca-atividade-motivo.md),
  [0016](../adr/0016-admin-exclui-lancamento-de-pontuacao.md)

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

Alternativa por ditado: o voluntário fala o que aconteceu, com quem e, quando fizer sentido, em
qual atividade. O texto é transcrito no navegador (ADR 0014) e enviado a um LLM junto com as
crianças, atividades e motivos ativos (ADR 0015), que devolve no máximo um palpite por campo,
sempre um dos ids fornecidos ou `null`. Campo sem palpite fica em branco, pronto para escolha
manual. O texto ditado continua visível para conferência, e o lançamento só ocorre após
confirmação explícita nos três campos, iguais estejam eles preenchidos pelo modelo ou à mão. O
valor continua vindo do catálogo.

### Estornar

Coordenador ou administrador estorna um lançamento. O estorno cria um evento novo que aponta para
o original. O lançamento estornado continua visível no extrato, marcado como estornado. É o
caminho normal de corrigir um lançamento de verdade, porque preserva o rastro (ADR 0003).

### Excluir

Só administrador. Remove a linha do banco de vez, sem deixar rastro (ADR 0016). Excluir um
lançamento que já tem estorno remove os dois. Pensado para lançamento que nunca devia ter
existido (teste, engano óbvio), não para desfazer pontuação de verdade, que continua sendo
estorno.

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

- `pontuacao_eventos`: inserção por voluntário, coordenador e administrador. Nunca atualização por
  ninguém. Exclusão só por administrador (ADR 0016); qualquer outra pessoa corrige por estorno.
- `motivos_pontuacao`: escrita apenas por administrador.
- A view pública expõe exclusivamente nome de jogador, posição e pontuação.
- O ditado pode conter o nome da criança e vai para um LLM externo (ADR 0015). Nenhum outro dado
  sensível (endereço, contato do responsável, dado de tabela separada por ADR 0005) é enviado.
- O LLM só devolve ids que já estavam nas listas enviadas; qualquer id fora disso é descartado no
  código antes de chegar à tela.

## Critérios de aceite

- [ ] Nenhum caminho da aplicação consegue atualizar uma linha de `pontuacao_eventos`, testado
      contra o banco.
- [ ] Só administrador consegue excluir uma linha de `pontuacao_eventos`, testado contra o banco.
- [ ] Estorno zera o efeito no ranking e mantém os dois eventos visíveis no extrato.
- [ ] Mudar o valor de um motivo no catálogo não altera a pontuação já lançada.
- [x] O botão de ditado transcreve a fala na tela e some sozinho em navegador sem suporte.
- [x] O ditado sem palpite confiável deixa o campo em branco, sem travar o lançamento manual.
- [x] Recusar ou corrigir a sugestão do ditado não deixa nenhum registro de pontuação até o toque
      em "Lançar ponto".
- [x] Sem `GEMINI_API_KEY`, o ditado continua transcrevendo e todos os campos ficam em branco.
- [ ] A página pública não expõe sobrenome completo em nenhum lugar, incluindo o HTML enviado ao navegador.
- [ ] A página pública responde sem sessão e sem nenhuma credencial de banco no cliente.
- [ ] Lançar ponto pelo celular leva no máximo três toques a partir da tela inicial.
