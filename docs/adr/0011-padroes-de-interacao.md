# ADR 0011: Padrões de interação: confirmação, aviso, diálogo e formulário

- Status: aceito
- Data: 2026-09-14

## Contexto

As primeiras telas resolveram cada interação do seu jeito: formulário sempre aberto numa
tela, mensagem de sucesso inline em outra, botão que desativa acesso sem perguntar, seleção
nativa do navegador ao lado de controle desenhado. A soma parecia amadora mesmo com cada peça
funcionando. O ADR 0010 escolheu as bibliotecas; faltava decidir o comportamento.

## Decisão

- **Ação sem desfazer pede confirmação.** Desativar acesso, cancelar convite, remover vínculo e
  estornar lançamento passam pelo componente `Confirmacao` (Radix AlertDialog). O texto diz o
  que vai acontecer e o botão nomeia a ação ("Desativar acesso"), nunca "Sim" ou "OK".
- **Ação concluída dá aviso.** Um só `Toaster` (sonner) no layout raiz; a tela dispara
  `toast.success` com uma frase que diz o que aconteceu. Erro de validação continua inline, ao
  lado do campo ou no topo do formulário, porque precisa ser lido com calma.
- **Criar e editar acontece em diálogo, aberto por um botão.** Nenhum formulário fica parado
  dentro de uma tela: criar área, criar atividade, convidar pessoa, vincular pessoa, lançar
  ponto, editar o próprio nome e o cadastro de criança abrem `Dialogo` a partir do cabeçalho
  da tela ou da linha da lista. No celular o diálogo sobe do rodapé como uma folha.
- **O cadastro longo também tem rota própria.** O cadastro de criança tem mais de vinte campos
  e usa `largura="xl"`, mas `/criancas/nova` e `/criancas/[id]` continuam existindo como
  página: é o que sustenta link compartilhado, recarregar a aba e acesso direto pelo endereço.
  Os campos ficam num componente só (`campos.tsx`), consumido pelas duas cascas.
- **Formulário em diálogo envia por `onSubmit`, não por `<form action>`.** Com `action`, o
  React limpa os campos quando a ação termina, inclusive em erro: num cadastro de vinte campos
  isso apaga tudo que a pessoa digitou por causa de um nome curto demais. O hook
  `useAcaoEmDialogo` faz `preventDefault`, chama a server action e só limpa em caso de sucesso.
- **Erro de formulário fica preso acima do rodapé** (`DialogoAviso`), fora da área que rola.
  Erro no fim de um formulário longo é erro que ninguém vê: a pessoa clica em salvar, nada
  parece acontecer, e a explicação está trezentos pixels abaixo.
- **Controle de formulário tem um desenho só.** `CampoSelecao` usa Radix Select com o mesmo
  visual em todo navegador; caixa de marcar e interruptor idem. Rótulo em caixa baixa, com peso,
  acima do controle; ajuda ou erro abaixo, nunca os dois.
- **Formulário longo em seções de duas colunas.** Título e explicação à esquerda, campos à
  direita (`SecaoDoFormulario`). No celular empilha.
- **Estado vazio ensina.** `EstadoVazio` sempre com título, uma frase sobre o que vai aparecer
  ali e a primeira ação quando ela existe.
- **Marca é acento.** A cor laranja aparece em foco, item ativo, posição 1 do ranking e no botão
  de lançar ponto. A ação primária comum continua em tinta (ADR 0002).

## Consequências

- Toda tela nova nasce com estas peças em vez de decidir de novo; a revisão de código pode
  apontar "isto devia ser `Confirmacao`" sem discussão.
- O aviso sai do componente `Confirmacao`, então quem chama não repete a lógica de toast.
- `Confirmacao` recebe a server action e os campos escondidos; ações que antes eram `<form>`
  com botão de submit viram um clique protegido, sem mudar o servidor.
- A server action de salvar criança deixou de redirecionar e passou a devolver
  `{ sucesso }`: quem chamou decide o que fazer. O diálogo fecha sobre a lista já revalidada;
  a página volta para a lista. Redirecionar de dentro do diálogo o deixaria aberto sobre a
  mesma rota.
- Rota interceptada (`@modal` com `(.)`) foi testada e descartada: o Next 16.3.5 recusa o
  marcador em desenvolvimento (`Invalid interception route: /criancas/(.)(.)nova`, com o
  marcador se repetindo a cada recompilação). O diálogo cliente entrega o mesmo
  comportamento sem depender disso.
- O Radix Select não aceita valor vazio; o componente traduz `""` por um sentinela e devolve
  `""` no input escondido, para que o servidor continue tratando vazio como nulo.
