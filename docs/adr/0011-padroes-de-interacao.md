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
- **Tarefa curta vive em diálogo; tarefa longa tem página.** Criar área, convidar pessoa e
  vincular pessoa abrem `Dialogo` a partir do cabeçalho da tela. O cadastro de criança, com
  mais de vinte campos, é página própria com rodapé fixo. No celular o diálogo sobe do rodapé
  como uma folha.
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
- O Radix Select não aceita valor vazio; o componente traduz `""` por um sentinela e devolve
  `""` no input escondido, para que o servidor continue tratando vazio como nulo.
