# Spec 0004: Redesenho da interface

- Status: em implementação
- Data: 2026-09-14
- ADRs relacionados: [0002](../adr/0002-tokens-de-design-em-tres-camadas.md),
  [0010](../adr/0010-libs-de-interface.md), [0011](../adr/0011-padroes-de-interacao.md)

## Problema

As telas funcionam, mas parecem montadas e não desenhadas: tudo tem o mesmo tamanho e peso,
rótulos em caixa alta minúscula por toda parte, controles nativos com cara diferente em cada
navegador, quatro caixas de número soltas no início, formulários sempre abertos na tela, ações
irreversíveis sem confirmação e nenhum aviso de conclusão. O resultado é um portal que a equipe
não sente como confiável, e o pedido é direto: minimalista, dado fácil de ler, uso fácil.

## Não é objetivo

- Trocar a identidade (navy, laranja, Poppins e Open Sans continuam).
- Mudar regra de negócio, permissão ou modelo de dado.
- Introduzir gráfico, paleta de comandos ou tour guiado (fora por ADR 0010).

## Direção

Modo **operar**: a interface serve à tarefa. Cor contida: neutros com viés navy e a marca só em
acento (foco, item ativo, ação característica). Três planos de superfície: barra lateral um
degrau abaixo do conteúdo, conteúdo um degrau abaixo dos painéis. Tipografia em escala fixa
(11 a 36 px), rótulos em caixa baixa com peso, Poppins apenas em título de página, números
grandes e marca. Um painel nunca fica dentro de outro.

Cena de uso que decide o tema: coordenação à mesa à noite (escuro do sistema) e voluntário no
celular na quadra de dia (claro). Os dois temas são verificados.

## O que muda, tela a tela

- **Casca**: barra lateral de 256 px em `--surface-nav`, item ativo em painel branco com ícone
  laranja, grupos em caixa baixa. Cabeçalho de página com título grande, uma frase de contexto,
  ação principal à direita e link de voltar em tela filha. Largura máxima de conteúdo de 1120 px.
- **Entrar e convite**: capa navy com o leão em marca d'água e frase grande; formulário à
  direita com controles de 44 px. A tela de entrada passa a explicar o `?motivo=sem-acesso`.
- **Início**: faixa única de resumo com números reais (crianças ativas, equipe, pontos lançados
  na semana, cadastros sem termo de autorização, este último só para quem lê dado sensível).
  Ranking dos cinco primeiros e um painel de próximos passos derivado do estado real.
- **Crianças**: busca e filtro numa barra, contagem visível, tabela com iniciais, idade e
  atividades; estado vazio que ensina. Aviso de "salvo" ao voltar do cadastro.
- **Cadastro de criança**: abre em diálogo largo, a partir do botão da lista ou clicando na
  criança; seções com título e explicação à esquerda e campos à direita; interruptor para
  saúde; atividades como opções marcáveis; seleção padronizada; rodapé fixo com cancelar e
  salvar. As rotas `/criancas/nova` e `/criancas/[id]` seguem existindo como página, para
  link compartilhado e acesso direto.
- **IDE JOGAI**: "Lançar ponto" no cabeçalho, em botão de marca, abrindo o lançador em diálogo
  com os motivos como opções de cartão; a tela fica com últimos lançamentos e ranking lado a
  lado, e o estorno atrás de confirmação.
- **Estrutura**: árvore limpa; "Nova área" e "Nova atividade" abrem diálogo; vincular pessoa
  em diálogo; remover vínculo pede confirmação.
- **Pessoas e acessos**: "Convidar pessoa" em diálogo a partir do cabeçalho; convites
  pendentes e registro de atividade como listas; desativar e cancelar pedem confirmação.
- **Ranking público**: mesma família tipográfica e pódio, ajustado à escala nova.
- **Página não encontrada** própria, em vez da tela preta do framework.

## Critérios de aceite

- [ ] `npm run verify` passa (tokens, lint, tipos, testes).
- [ ] Nenhum rótulo de campo em caixa alta; nenhum `<select>` nativo em tela autenticada.
- [ ] Nenhum formulário de criar ou editar parado dentro de uma tela: todos abrem em diálogo
      a partir de um botão.
- [ ] Erro de validação continua visível sem rolar, e não apaga o que já foi digitado.
- [ ] Toda ação sem desfazer (desativar acesso, cancelar convite, remover vínculo, estornar)
      abre confirmação antes de executar.
- [ ] Toda ação concluída dá aviso (toast) com o que aconteceu.
- [ ] Cada lista vazia diz o que vai aparecer ali e qual é a primeira ação.
- [ ] Início mostra números lidos do banco; nenhum valor fixo no código.
- [ ] Tela de criança tem link de volta para a lista; cadastro tem cancelar e salvar sempre
      visíveis.
- [ ] Desktop 1440 e celular 390, em claro e escuro, sem quebra de layout nem texto cortado.
- [ ] Contraste de texto corrido ≥ 4,5:1 nos dois temas.
