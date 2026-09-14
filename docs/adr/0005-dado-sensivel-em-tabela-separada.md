# ADR 0005: Dado sensível em tabela separada, não coluna mascarada

- Status: aceito
- Data: 2026-09-14

## Contexto

O cadastro guarda dois grupos de informação com públicos diferentes. Voluntário precisa reconhecer
a criança e saber de condição de saúde, que é informação de segurança durante a atividade.
Endereço, telefone e nome dos responsáveis não são necessários para ele.

O caminho intuitivo é manter tudo numa tabela e mascarar colunas por permissão. O Pilar tentou
exatamente isso e produziu três defeitos distintos:

1. `REVOKE` de coluna não tem efeito quando a tabela já concedeu privilégio amplo. A instrução é
   válida, parece correta, e não protege nada.
2. Mascarar a leitura com uma view não protege a escrita. Um usuário que via o campo como nulo
   continuava conseguindo sobrescrevê-lo às cegas, o que é pior do que ler indevidamente.
3. O campo mascarado volta do formulário como zero ou nulo e apaga o dado real, ou faz a validação
   barrar a edição inteira com uma mensagem sobre um campo que a pessoa nem podia ver.

Três defeitos na mesma técnica, em um projeto com mais maturidade que este.

## Decisão

Separar em duas tabelas:

- `criancas`: nome, nome de jogador, data de nascimento, condição de saúde, observações de
  atividade.
- `criancas_dados_sensiveis`: endereço completo, telefones, nome dos responsáveis, registro da
  autorização assinada.

Cada uma tem política de acesso por linha, simples, sem mascaramento de coluna.

## Consequências

- O controle vira uma decisão por tabela, legível e testável, em vez de uma matriz de colunas com
  view, gatilho e privilégio de coluna interagindo.
- Nenhuma tela lista endereço junto com a lista geral de crianças, porque a busca padrão não toca
  na tabela sensível.
- Editar dado sensível exige rota própria, o que facilita registrar a ação no log de auditoria.
- O custo é uma junção a mais quando a tela realmente precisa dos dois grupos, que acontece em
  poucos lugares.
