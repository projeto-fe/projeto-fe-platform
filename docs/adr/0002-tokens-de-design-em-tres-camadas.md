# ADR 0002: Tokens de design em três camadas, com CI bloqueando cor crua

- Status: aceito
- Data: 2026-09-14

## Contexto

Requisito explícito: trocar a cor de vários elementos editando um lugar só. A identidade vem do
site institucional (laranja `#F05A28`, navy `#1F2A44`, Poppins e Open Sans).

Dois projetos internos já resolveram isso e ensinam lados opostos do mesmo problema. O
labrynth-platform tem um verificador que falha o build quando alguém escreve cor crua no CSS. O
Pilar tem as mesmas regras de lint, porém todas em nível de aviso "até a onda zerar", e hoje
convive com mais de 120 usos de cor primitiva e 30 valores hexadecimais soltos.

## Decisão

Três camadas de token, em CSS puro (Tailwind 4, sem arquivo de configuração):

1. **Primitivo**: a paleta bruta (`--c-orange-500: #F05A28`). Nenhum componente lê daqui.
2. **Semântico**: a intenção (`--surface-raised`, `--ink-muted`, `--brand`, `--positive-strong`).
   É o que todo componente consome.
3. **Componente**: classes que falam apenas em token semântico.

Cores de estado seguem o par `fill` e `strong`, herdado do Pilar: `--positive` preenche uma barra
ou fundo, `--positive-strong` é a variante com contraste suficiente para texto. O par existe
porque a mesma cor raramente serve para as duas coisas.

A cor de marca é reservada para acento: foco, navegação ativa, destaque e a ação característica do
produto (lançar ponto). A ação primária comum usa a cor de tinta. Essa separação vem do
labrynth-platform.

Um verificador roda no CI e **falha o build** quando encontra valor hexadecimal fora do arquivo de
primitivos, ou referência a um token que não existe.

## Consequências

- Trocar a cor de todos os cards é editar `--surface-raised` em um arquivo.
- A regra nasce bloqueante, não como aviso. Ligar bloqueio depois, com a base já suja, é a
  situação que o Pilar vive hoje e que este projeto evita pagando o custo no dia zero, quando ele
  é zero.
- Tema escuro fica barato: redefine a camada semântica, nenhum componente muda. Se o tema escuro
  não for implementado de verdade, seus tokens não são escritos, para não deixar trinta linhas que
  ninguém testa.
- Usar uma cor nova exige adicioná-la aos primitivos e dar a ela um nome semântico. É atrito
  proposital.
