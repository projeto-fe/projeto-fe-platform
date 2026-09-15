---
name: Portal Projeto Fé
description: Portal interno do Instituto Projeto Fé. Neutros com viés navy, marca laranja só em acento, Poppins em título e número grande, Open Sans em tudo o mais.
colors:
  surface-nav: "#edf1f7"
  surface: "#f6f8fb"
  surface-raised: "#ffffff"
  surface-sunken: "#edf1f7"
  surface-inverse: "#1f2a44"
  ink: "#1f2a44"
  ink-muted: "#626b7d"
  ink-subtle: "#8d97aa"
  ink-faint: "#c3cddc"
  ink-inverse: "#ffffff"
  line: "#dde4ee"
  line-strong: "#c3cddc"
  brand: "#f05a28"
  brand-hover: "#d14418"
  brand-soft: "#fdede6"
  brand-soft-strong: "#fbd9c9"
  brand-ink: "#d14418"
  action: "#1f2a44"
  action-hover: "#141c2f"
  action-ink: "#ffffff"
  brand-canvas: "#1f2a44"
  brand-canvas-deep: "#141c2f"
  brand-canvas-ink: "#ffffff"
  brand-canvas-accent: "#f05a28"
  positive: "#16a34a"
  positive-strong: "#15803d"
  positive-soft: "#eaf7ef"
  negative: "#dc2626"
  negative-strong: "#b91c1c"
  negative-soft: "#fdecec"
  warning: "#d97706"
  warning-strong: "#b45309"
  warning-soft: "#fdf3e3"
  scrim: "rgb(20 28 47 / 55%)"
typography:
  display:
    fontFamily: "Poppins, Montserrat, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: "2.5rem"
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Poppins, Montserrat, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: "1.75rem"
    letterSpacing: "-0.025em"
  numeral:
    fontFamily: "Poppins, Montserrat, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: "2.125rem"
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Open Sans, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: "1.5rem"
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Open Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.375rem"
    letterSpacing: "normal"
  label:
    fontFamily: "Open Sans, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: "1.25rem"
    letterSpacing: "normal"
  caption:
    fontFamily: "Open Sans, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1.125rem"
    letterSpacing: "normal"
  micro:
    fontFamily: "Open Sans, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: "1rem"
    letterSpacing: "0.025em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  xl: "20px"
  full: "9999px"
spacing:
  "1": "4px"
  "1.5": "6px"
  "2": "8px"
  "2.5": "10px"
  "3": "12px"
  "3.5": "14px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.action-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
  button-brand:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.action-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "36px"
  button-brand-hover:
    backgroundColor: "{colors.brand-hover}"
  button-outline:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "36px"
  button-outline-hover:
    backgroundColor: "{colors.surface-sunken}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "36px"
  button-ghost-hover:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink}"
  button-destructive:
    backgroundColor: "{colors.negative}"
    textColor: "{colors.action-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "36px"
  button-lg:
    typography: "{typography.body}"
    padding: "0 20px"
    height: "44px"
  input:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
  input-disabled:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink-muted}"
  card:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.lg}"
    padding: "20px"
  badge-neutral:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "24px"
  badge-brand:
    backgroundColor: "{colors.brand-soft}"
    textColor: "{colors.brand-ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "24px"
  badge-positive:
    backgroundColor: "{colors.positive-soft}"
    textColor: "{colors.positive-strong}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "24px"
  badge-negative:
    backgroundColor: "{colors.negative-soft}"
    textColor: "{colors.negative-strong}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "24px"
  badge-warning:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning-strong}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "24px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 10px"
    height: "36px"
  nav-item-active:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 10px"
    height: "36px"
  dialog:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "20px"
  toast:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "14px 16px"
    width: "360px"
---

# Design System: Portal Projeto Fé

## Overview

**Creative North Star: "A prancheta da quadra"**

O portal é uma ferramenta de operar, não de impressionar. A cena que decide tudo é o voluntário com o celular na quadra de dia e a coordenação à mesa à noite: a interface precisa ser lida de relance, com números que alinham e rótulos que não pedem interpretação. Por isso a cor é contida (neutros com viés navy, nunca cinza puro), a tipografia é uma escala fixa em rem (11 a 36 px) e a marca laranja aparece como acento raro: foco, item ativo, primeiro lugar do ranking e o botão de lançar ponto.

A profundidade vem de três planos de superfície empilhados, não de sombra dramática: a barra lateral fica um degrau abaixo do conteúdo, o conteúdo um degrau abaixo dos painéis. Um painel nunca fica dentro de outro. Lista, tabela e formulário moram dentro do painel encostados na borda, separados por fio. Isso é o que deixa uma tela com quatro indicadores, um ranking e um formulário parecer uma coisa só.

Duas superfícies fogem da regra de propósito: a capa de entrada (login e convite) e o ranking público vivem sobre o navy da marca e não invertem com o tema, porque a identidade do Instituto precisa ser a mesma para quem chega, venha a pessoa com o sistema em claro ou em escuro. O tema escuro do app, esse sim, segue o sistema e redefine só a camada semântica de tokens.

**Key Characteristics:**
- Cor só nasce em `app/tokens.css`; componente consome token semântico e o CI (`scripts/check-design-tokens.mjs`) falha o build se encontrar hex, `rgb()`, `hsl()`, `oklch()` ou `color-mix()` fora dali (e de `lib/brand.ts`).
- Marca laranja é acento, a ação primária comum é tinta navy (`--action`), nunca laranja.
- Três planos: `--surface-nav`, `--surface`, `--surface-raised`, com `--surface-sunken` como recuo dentro do painel.
- Poppins (`font-display`) só em título de página, número grande, lockup da marca e manchete de login e ranking; Open Sans em tudo o mais, inclusive dado.
- Algarismos tabulares no `body` inteiro; rótulos em caixa baixa com peso 600, nunca caixa alta com espaçamento.
- Celular primeiro: barra inferior de cinco destinos, diálogo que sobe do rodapé como folha, coluna de tabela que declara se some no celular.

## Colors

Neutros frios com viés navy formam a base; o laranja da marca entra só onde precisa chamar a mão, e as cores de estado vêm em par (preenchimento e tinta legível).

### Primary
- **Laranja da marca** (`--brand`, `#f05a28`): foco (`:focus-visible` e anel de controle), ícone do item de navegação ativo, posição 1 do ranking, barra proporcional de pontos, caixa marcada, interruptor ligado, asterisco de campo obrigatório, a palavra "FÉ" no lockup e o botão `variant="brand"` (lançar ponto). No tema escuro sobe para `#ff8a4c` para manter contraste sobre o ink.
- **Laranja de hover** (`--brand-hover`, `#d14418`): só o hover do botão de marca.
- **Laranja suave** (`--brand-soft`, `#fdede6`): fundo de opção selecionada (cartão de motivo, `OpcaoMarcavel`), anel de foco de controle (`ring-brand-soft`), etiqueta de marca, pílula do item ativo na barra inferior, posições 2 e 3 do ranking.
- **Laranja de texto** (`--brand-ink`, `#d14418`): texto de link dentro de prosa e da etiqueta de marca. É a variante legível; `--brand` puro não vira texto pequeno.

### Secondary
- **Tinta de ação** (`--action`, `#1f2a44`): fundo do botão primário comum ("Nova criança", "Salvar", confirmar). Hover em `--action-hover` (`#141c2f`). No escuro inverte para claro (`#e8ecf4` sobre `#141c2f`).
- **Território de marca** (`--brand-canvas`, `#1f2a44`, e `--brand-canvas-deep`, `#141c2f`): capa do login e convite, e fundo inteiro do ranking público. Texto em `--brand-canvas-ink` (`#ffffff`), acento em `--brand-canvas-accent`. Não muda com o tema.

### Tertiary
- **Positivo** (`--positive` `#16a34a`, `--positive-strong` `#15803d`, `--positive-soft` `#eaf7ef`): ponto de etiqueta, ícone de sucesso no toast, chip de valor positivo (`+5`) e aviso de sucesso.
- **Negativo** (`--negative` `#dc2626`, `--negative-strong` `#b91c1c`, `--negative-soft` `#fdecec`): botão destrutivo, borda de campo inválido, mensagem de erro, chip de valor negativo, item "Sair" do menu.
- **Atenção** (`--warning` `#d97706`, `--warning-strong` `#b45309`, `--warning-soft` `#fdf3e3`): indicador "Sem termo de autorização" quando maior que zero, aviso de atenção no formulário.

### Neutral
- **Painel** (`--surface-raised`, `#ffffff`): fundo de card, controle, diálogo, toast, menu e item de navegação ativo. Plano mais alto.
- **Conteúdo** (`--surface`, `#f6f8fb`): fundo do `body`, rodapé de card e diálogo, hover de linha de tabela.
- **Navegação e recuo** (`--surface-nav` e `--surface-sunken`, ambos `#edf1f7`): barra lateral, botão `subtle`, etiqueta neutra, avatar neutro, fundo de controle desabilitado, ícone do estado vazio.
- **Inverso** (`--surface-inverse`, `#1f2a44`): avatar da pessoa logada no menu da conta.
- **Tinta** (`--ink`, `#1f2a44`): texto principal. **Tinta apagada** (`--ink-muted`, `#626b7d`): descrição, rótulo de indicador, texto secundário, cabeçalho de tabela, placeholder. **Tinta sutil** (`--ink-subtle`, `#8d97aa`): ícone decorativo, chevron, ponto de etiqueta neutra. **Tinta tênue** (`--ink-faint`, `#c3cddc`): reservada, sem uso em componente hoje.
- **Fio** (`--line`, `#dde4ee`): borda de card, divisor de lista e tabela, borda de etiqueta outline. **Fio forte** (`--line-strong`, `#c3cddc`): borda de controle e do botão outline, trilho do interruptor, barra de rolagem.
- **Véu** (`--scrim`, `rgb(20 28 47 / 55%)`): atrás de diálogo e confirmação, com desfoque de 2px.

### Named Rules
**A regra do acento.** A marca laranja aparece em foco, item ativo, posição 1 do ranking e no botão de lançar ponto. A ação primária comum usa `--action` (tinta navy). Se um botão laranja aparecer fora do IDE JOGAI, está errado.

**A regra da cor só em tokens.css.** Componente nunca escreve cor literal. Cor nova exige primitivo em `app/tokens.css` mais um nome semântico, e o CI recusa o build com hex ou função de cor fora dali. `lib/brand.ts` é a única exceção, para themeColor, manifest e HTML de e-mail.

**A regra fill e strong.** Cor de estado vem em par: `--positive` preenche barra ou ponto, `--positive-strong` é o que vira texto. Etiqueta e chip de valor usam sempre `-strong` sobre `-soft`. Usar o preenchimento como texto produz o verde ilegível clássico.

**A regra do território de marca.** `--brand-canvas` e companhia não invertem com o tema. Sobre esse navy, botão primário e outline não têm contraste; o botão de entrar no ranking público usa borda e texto em `brand-canvas-ink` com alfa.

## Typography

**Display Font:** Poppins (com Montserrat e system-ui como reserva), pesos 500, 600, 700 e 800 via `next/font`.
**Body Font:** Open Sans (com system-ui como reserva).

**Character:** Poppins geométrica e firme só onde a tela precisa de um nome ou de um número que se lê a dois metros; Open Sans humanista e neutra carrega texto, rótulo, tabela e dado. A escala é fixa em rem, própria de interface de produto, sem clamp.

### Hierarchy
- **Display** (Poppins 600, 2.25rem / 2.5rem, tracking -0.025em): manchete do ranking público ("IDE JOGAI"), manchete da capa de entrada em desktop, página não encontrada.
- **Headline** (Poppins 600, 1.375rem / 1.75rem no celular, 1.75rem / 2.125rem em `md`, tracking -0.025em): o `h1` de `CabecalhoDaPagina`, o `h2` de `CabecalhoDeEntrada`, a manchete da capa de entrada no celular.
- **Numeral** (Poppins 600, 1.75rem / 2.125rem): o valor do `Indicador` na faixa de resumo. No pódio do ranking público, Poppins 700 em 1.375rem.
- **Title** (Open Sans 600, 0.9375rem / 1.5rem, tracking -0.025em): `CardTitle`, título de `SecaoDoFormulario`, `Numero` de lista, chip de valor de ponto. Título de diálogo e confirmação sobe para 1.0625rem.
- **Body** (Open Sans 400, 0.875rem / 1.375rem): `body`, controle de formulário, botão `lg`, frase da capa. Descrição de página com máximo de 64ch, estado vazio com 40ch.
- **Label** (Open Sans 600, 0.8125rem / 1.25rem): rótulo de campo, item de navegação, botão padrão, descrição de card, linha de lista, célula de tabela.
- **Caption** (Open Sans 400, 0.75rem / 1.125rem): ajuda, erro (peso 500), texto secundário de linha, cabeçalho de tabela (peso 600), etiqueta, nota de rodapé de card.
- **Micro** (Open Sans 600, 0.6875rem / 1rem, tracking 0.025em): rótulo de grupo da barra lateral ("Operação", "Administração") e rótulo da barra inferior. Sempre em caixa baixa com inicial maiúscula.

### Named Rules
**A regra da Poppins.** `font-display` só em título de página, número grande, lockup da marca e manchete de login e ranking. Título de card, título de diálogo, tabela e todo dado ficam em Open Sans. Se um card ganhar Poppins, virou pôster.

**A regra do rótulo em caixa baixa.** Rótulo tem peso 600 e caixa de frase, nunca caixa alta com espaçamento. A única caixa alta do sistema é o lockup da marca ("INSTITUTO" e "PROJETO FÉ"), que é o desenho da identidade, não um rótulo.

**A regra dos algarismos tabulares.** `font-variant-numeric: tabular-nums` no `body` inteiro. Coluna numérica alinha à direita. Número em lista vive em `Numero` com largura fixa de 3rem.

## Layout

Grade de dois planos no desktop: barra lateral fixa de 256px (`--sidebar-w`) em `--surface-nav`, conteúdo ao lado com largura máxima de 1120px (`--content-w`) centralizado. `CabecalhoDaPagina` e `CorpoDaPagina` partilham a mesma largura: padding horizontal de 16px no celular e 32px em `md`, vertical de 20px e 24px. No celular a barra lateral desaparece e uma barra inferior fixa de cinco destinos assume, com `pb-20` no conteúdo para não cobrir o fim da página e `env(safe-area-inset-bottom)` respeitado.

Pontos de quebra são os padrões do Tailwind 4: `sm` 640px (diálogo deixa de ser folha e centraliza, barra proporcional aparece, grade de motivos vira duas colunas), `md` 768px (barra lateral, colunas de tabela secundárias, seção de formulário em duas colunas com 220px para o texto) e `lg` 1024px (faixa de resumo em quatro colunas, início em `1.5fr 1fr`, IDE JOGAI em duas colunas iguais).

Ritmo de espaçamento em múltiplos de 4px. Inset horizontal padrão de painel é 20px (`px-5`) em cabeçalho, corpo, rodapé, linha de lista e célula de tabela, para tudo alinhar numa vertical só. Entre blocos de página, 20px (`gap-5`); entre elementos de um bloco, 12px (`gap-3`); entre rótulo e controle, 6px (`gap-1.5`); entre título e descrição, 2px a 4px. Formulário em grade de 12 colunas com 16px de calha; cada campo declara quantas colunas ocupa em `md` e se ocupa metade no celular.

Densidade de linha: lista e cabeçalho de card com altura mínima de 52px (`min-h-13`), item de navegação e botão padrão com 36px, controle de formulário com 40px, controle de login e convite com 44px, botão `lg` com 44px.

## Elevation & Depth

Híbrido com o plano na frente: a profundidade principal vem dos três planos de superfície (`--surface-nav` abaixo, `--surface` no meio, `--surface-raised` em cima) e do fio (`--line`) que separa tudo. A sombra é uma confirmação discreta do plano, derivada do navy da marca com alfa baixo, e só cresce quando o elemento sai do fluxo (menu, toast, diálogo). No tema escuro as sombras trocam para preto com alfa maior, porque sombra navy some sobre ink.

### Shadow Vocabulary
- **Card** (`box-shadow: 0 1px 2px rgb(31 42 68 / 4%), 0 1px 3px rgb(31 42 68 / 6%)`): painel, controle de formulário, botão primário, outline, brand e destrutivo, item de navegação ativo, polegar do interruptor, caixa de marcar. É quase invisível de propósito.
- **Pop** (`box-shadow: 0 12px 32px -12px rgb(31 42 68 / 22%), 0 2px 6px rgb(31 42 68 / 10%)`): menu suspenso, lista do select, toast. Elemento que flutua sobre o conteúdo sem véu.
- **Modal** (`box-shadow: 0 24px 64px -16px rgb(31 42 68 / 22%), 0 4px 12px rgb(31 42 68 / 10%)`): diálogo e confirmação, sempre com `--scrim` e `backdrop-blur` de 2px atrás.

### Named Rules
**A regra do plano antes da sombra.** Se dois elementos precisam parecer em níveis diferentes, muda-se o token de superfície primeiro. Sombra maior que `shadow-card` é só para o que sai do fluxo: menu, toast, diálogo.

**A regra do controle sem sombra em repouso morto.** Controle desabilitado e somente leitura perde a sombra (`shadow-none`) e recua para `--surface-sunken`. Sombra sinaliza "dá para mexer".

## Shapes

Cantos arredondados em três degraus mais a pílula. O raio padrão de tudo que se toca é 10px (`--radius`, `rounded-md`): botão, controle, item de navegação, cartão de opção, aviso de formulário, chip de valor. Painel, diálogo em desktop, toast e faixa de resumo sobem para 14px (`--radius-lg`). A folha de diálogo no celular usa 20px (`--radius-xl`) só nos cantos de cima. Item de menu e de select, e o contorno de foco global, descem para 6px (`--radius-sm`). Etiqueta, avatar de iniciais, posição de ranking, barra proporcional, interruptor, ícone de estado vazio e pílula do item ativo na barra inferior são círculo ou pílula (`rounded-full`). A caixa de marcar tem 5px, um valor próprio de 18px de lado.

Borda de 1px em `--line` define o painel; `--line-strong` define o que se edita (controle, botão outline). Painel usa `overflow-hidden` para que lista e tabela encostem na borda e herdem o raio. Não há bordas duplas, não há recorte diagonal, não há formas decorativas. A única silhueta livre é o leão da marca em marca d'água (opacidade 7%) na capa de entrada.

### Named Rules
**A regra do painel único.** Um `Card` nunca fica dentro de outro `Card`. Dentro do painel, agrupamento se faz com fio (`divide-y divide-line`) e recuo (`--surface-sunken`), não com outro painel.

## Components

### Buttons
Firmes e baixos: altura fixa, peso 600, transição de 150ms em `--ease` e leve encolhimento no clique (`scale 0.985`).
- **Shape:** cantos de 10px (`rounded-md`); ícone interno de 16px.
- **Primary:** `--action` sobre `--action-ink`, 36px de altura, padding horizontal de 14px, texto 0.8125rem, `shadow-card`. Hover em `--action-hover`. É o padrão sem variante.
- **Brand:** `--brand` sobre `--action-ink`, mesmo formato. Só para a ação característica do produto (lançar ponto). Hover em `--brand-hover`.
- **Outline:** `--surface-raised` com borda `--line-strong`, texto `--ink`, `shadow-card`; hover em `--surface-sunken`. Usado em "Voltar" da confirmação e ações secundárias.
- **Subtle:** `--surface-sunken`, texto `--ink`; hover em `--line`.
- **Ghost:** transparente, texto `--ink-muted`; hover em `--surface-sunken` com texto `--ink`. Para "Ver tudo" e botões de ícone. Botão de estorno acrescenta hover em `--negative-soft` e `--negative-strong`.
- **Destructive:** `--negative` sobre `--action-ink`; hover em opacidade 90%.
- **Link:** sem altura nem padding, texto `--brand-ink`, sublinhado no hover.
- **Sizes:** `sm` 32px com padding 12px; `default` 36px; `lg` 44px com padding 20px e texto 0.875rem (login, convite, lançar ponto); `icon` 36px quadrado; `icon-sm` 32px.
- **Loading / Disabled:** `loading` troca por `Loader2` girando e marca `aria-busy`; desabilitado fica em opacidade 50% sem eventos.

### Chips
- **Style:** `Badge` em pílula de 24px de altura, padding horizontal de 10px, texto 0.75rem peso 600. Variantes `neutral` (`--surface-sunken` e `--ink-muted`), `brand` (`--brand-soft` e `--brand-ink`), `positive`, `negative`, `warning` (sempre `-soft` de fundo e `-strong` de texto) e `outline` (borda `--line`, texto `--ink-muted`).
- **State:** com `ponto`, um círculo de 6px à esquerda na cor de preenchimento marca situação (ativo, pendente, expirado). Sem ponto, a etiqueta é só classificação (área, papel, ano).
- **Chip de valor:** o número do motivo (`+5`, `-2`) é um bloco de 44px mínimo, cantos de 10px, texto 0.9375rem peso 600, em `--positive-soft`/`--positive-strong` ou `--negative-soft`/`--negative-strong`. Estornado fica em opacidade 50%.

### Cards / Containers
- **Corner Style:** 14px (`rounded-lg`), `overflow-hidden`.
- **Background:** `--surface-raised`.
- **Shadow Strategy:** `shadow-card` (ver Elevation & Depth).
- **Border:** 1px `--line`.
- **Internal Padding:** cabeçalho `px-5 pt-4 pb-3` com altura mínima de 52px, título 0.9375rem peso 600 e descrição 0.8125rem em `--ink-muted` empilhados em `CardHeading`; ações do cabeçalho à direita (etiqueta, botão ghost). `CardBody` só quando há texto solto (`px-5 pb-5`); lista e tabela encostam na borda. `CardFooter` com fio em cima, fundo `--surface` e `px-5 py-3.5`, ações à direita. `CardNota` é uma frase de 0.75rem em `--ink-muted` com fio em cima, para explicar uma regra.
- **Faixa de resumo:** um painel só dividido por fio, duas colunas no celular e quatro em `lg`; cada `Indicador` tem rótulo 0.8125rem peso 500 em `--ink-muted`, valor em Poppins 1.75rem, detalhe 0.75rem, seta que se move 1px no hover e fundo `--surface` quando é link.

### Inputs / Fields
- **Style:** `estiloDeControle` é a aparência única: 40px de altura, cantos de 10px, borda 1px `--line-strong`, fundo `--surface-raised`, padding horizontal de 12px, texto 0.875rem em `--ink`, `shadow-card`, placeholder em `--ink-muted`, cursor em `--brand`. Login e convite usam 44px. Textarea tem mínimo de 96px e `resize-y`.
- **Focus:** borda `--brand` mais anel de 3px em `--brand-soft`, transição de 150ms.
- **Error / Disabled:** `aria-invalid` pinta a borda em `--negative` e o anel em `--negative-soft`; a mensagem (`role="alert"`, 0.75rem peso 500 em `--negative-strong`) aparece abaixo no lugar da ajuda, nunca os dois. Desabilitado e somente leitura: fundo `--surface-sunken`, texto `--ink-muted`, sem sombra.
- **Rótulo:** 0.8125rem peso 600 em `--ink`, acima do controle com 6px de folga; obrigatório recebe " *" em `--brand`.
- **Select:** Radix com o mesmo desenho do controle; chevron em `--ink-subtle`; lista em `--surface-raised` com `shadow-pop` e `animate-surgir`, item com cantos de 6px, destaque em `--surface-sunken`, marcado em peso 600 com check em `--brand`.
- **Checkbox e switch:** caixa de 18px com cantos de 5px, marcada em `--brand` com check branco em traço 3; interruptor de 42 por 24px com trilho `--surface-sunken` e polegar de 18px com `shadow-card`, ligado em `--brand`. `OpcaoMarcavel` e `LinhaComInterruptor` embrulham em cartão de opção com borda `--line`, `px-3.5 py-3`, e selecionado em borda `--brand` com fundo `--brand-soft`.
- **Aviso de formulário:** bloco com cantos de 10px, `px-3.5 py-3`, ícone de 16px à esquerda, tons `erro`, `sucesso`, `atencao` (par `-soft`/`-strong`) e `info` (`--surface-sunken`/`--ink-muted`).

### Navigation
- **Barra lateral (desktop, `md` para cima):** 256px, `--surface-nav`, fio à direita. Logo com padding de 20px em cima. Grupos rotulados em 0.6875rem peso 600 `--ink-muted` com tracking 0.025em, caixa de frase. Item de 36px, cantos de 10px, texto 0.8125rem peso 600, ícone de 18px em `--ink-subtle`; hover em `--surface-raised` a 60% com texto `--ink`; ativo em `--surface-raised` com `shadow-card`, texto `--ink`, ícone em `--brand` com traço 2.25. Foco em anel de 2px `--brand`. Menu da conta no rodapé com avatar inverso, nome e papel, abrindo para cima em `--surface-raised` com `shadow-pop`.
- **Barra inferior (celular):** fixa, cinco colunas, `--surface-raised` a 95% com `backdrop-blur`, fio em cima, `safe-area-inset-bottom`. Item com ícone de 20px dentro de pílula de 48 por 28px (ativa em `--brand-soft` com ícone `--brand`) e rótulo curto 0.6875rem peso 600.
- **Cabeçalho de página:** título em Poppins 1.375rem (1.75rem em `md`), uma frase de contexto até 64ch em `--ink-muted`, ação principal à direita, link de voltar com chevron em tela filha. No celular ganha fundo `--surface-raised`, fio embaixo e o símbolo compacto da marca.

### Diálogo e confirmação
Tarefa curta vive em diálogo; tarefa longa tem página. No celular o `Dialogo` sobe do rodapé como folha (`rounded-t-xl`, `animate-deslizar-de-baixo`, até 92dvh), em `sm` centraliza com cantos de 14px e `animate-surgir`. Fundo `--surface-raised`, borda `--line`, `shadow-modal`, véu `--scrim` com desfoque de 2px e `animate-esmaecer`. Título 1.0625rem peso 600, descrição 0.8125rem `--ink-muted`, corpo com `px-5 py-5`, rodapé com fio, fundo `--surface` e botões empilhados no celular (confirmar em cima) e à direita em `sm`. Botão de fechar de 32px no canto. `Confirmacao` (AlertDialog) segue o mesmo desenho com largura máxima `sm`, botão "Voltar" em outline e o de confirmar em `primary` ou `destructive`, sempre nomeando a ação.

### Lista, tabela e ranking
`Lista` é o bloco de linhas separadas por fio, encostado na borda do painel: linha de 52px mínimos com `px-5 py-2.5`, texto 0.8125rem, `LinhaTexto` com principal em peso 600 e secundário 0.75rem `--ink-muted`, ambos com reticências. `Posicao` é círculo de 28px com número 0.75rem peso 700: 1 em `--brand` com texto branco, 2 e 3 em `--brand-soft` com `--brand-ink`, o resto em `--surface-sunken` com `--ink-muted`. `Barra` é trilho de 96 por 6px em `--surface-sunken` com preenchimento `--brand`, oculto abaixo de `sm`. `Numero` tem 3rem de largura, alinhado à direita, 0.9375rem peso 600. `Tabela` é dirigida por definição de coluna: cabeçalho 0.75rem peso 600 `--ink-muted` com fio embaixo, célula `px-5 py-3` 0.8125rem, hover de linha em `--surface`, coluna numérica à direita e coluna secundária com `hidden md:table-cell`. Tabela vazia nunca aparece: renderiza `EstadoVazio` no lugar.

### Estado vazio e toast
`EstadoVazio` centraliza ícone Lucide de traço 1.75 dentro de círculo de 48px (40px em `compacto`) em `--surface-sunken` e `--ink-subtle`, título 0.9375rem peso 600 (0.8125rem em compacto), frase até 40ch em `--ink-muted` e a primeira ação quando existe. `Toaster` (sonner) é único no layout raiz, canto inferior direito, 3.6s: caixa `--surface-raised` com borda `--line`, cantos de 14px, `px-4 py-3.5`, `shadow-pop`, 360px em `sm`, ícone de estado à esquerda (`--positive-strong`, `--negative-strong` ou `--ink-muted`), título peso 600 e descrição 0.75rem.

### Iniciais
Não há foto no sistema; `Iniciais` é a identidade visual de pessoa e criança. Círculo de 28, 32 ou 40px com duas letras em peso 600 (0.6875, 0.75 ou 0.8125rem), tons `neutro` (`--surface-sunken`/`--ink-muted`), `inverso` (`--surface-inverse`/`--ink-inverse`) e `marca` (`--brand-soft`/`--brand-ink`).

### Movimento
Três animações nomeadas em `globals.css`, todas com `--ease` (`cubic-bezier(0.22, 0.61, 0.36, 1)`): `surgir` (180ms, opacidade e 6px para cima com escala 0.985) para menu, select, diálogo em desktop e check; `esmaecer` (160ms) para o véu; `deslizar-de-baixo` (220ms, 16px) para a folha no celular. Transições de estado em 150ms. `prefers-reduced-motion` zera tudo.

## Do's and Don'ts

### Do:
- **Do** consumir só token semântico (`bg-surface-raised`, `text-ink-muted`, `border-line`); cor nova nasce em `app/tokens.css` como primitivo mais nome semântico, e o CI recusa o resto.
- **Do** usar `--action` no botão primário comum e reservar `variant="brand"` para lançar ponto; a marca fica em foco, item ativo, posição 1 e nas seleções em `--brand-soft`.
- **Do** manter os três planos: barra lateral em `--surface-nav`, corpo em `--surface`, painel em `--surface-raised`, recuo interno em `--surface-sunken`.
- **Do** usar Poppins (`font-display`) só em título de página, número do `Indicador`, lockup e manchete de login e ranking, sempre com `tracking-tight` e peso 600.
- **Do** escrever rótulo em caixa de frase com peso 600 e 0.8125rem; texto de apoio em 0.75rem `--ink-muted`.
- **Do** encostar lista, tabela e formulário na borda do painel, separando com `divide-y divide-line`; padding horizontal de 20px em todo nível do painel.
- **Do** dar a toda ação sem desfazer um `Confirmacao` que nomeia a ação, e a toda ação concluída um `toast.success` com frase que diz o que aconteceu.
- **Do** declarar em cada coluna de tabela se ela some no celular, e oferecer `EstadoVazio` com título, frase e primeira ação em vez de tabela vazia.
- **Do** usar o par `-soft` de fundo e `-strong` de texto para toda cor de estado que vira texto.

### Don't:
- **Don't** escrever hex, `rgb()`, `hsl()`, `oklch()` ou `color-mix()` em componente, tela ou CSS fora de `app/tokens.css` e `lib/brand.ts`.
- **Don't** pintar botão comum de laranja nem usar `--brand` como fundo de área grande; marca é acento, não papel de parede.
- **Don't** colocar `Card` dentro de `Card`, nem inventar borda dupla ou sombra maior que `shadow-card` para elemento no fluxo.
- **Don't** usar Poppins em título de card, diálogo, tabela ou dado; Open Sans carrega tudo isso.
- **Don't** escrever rótulo, grupo ou cabeçalho de tabela em caixa alta com espaçamento; a única caixa alta é o lockup da marca.
- **Don't** usar `--positive`, `--negative` ou `--warning` (preenchimento) como cor de texto; texto usa `-strong`.
- **Don't** inverter `--brand-canvas` com o tema nem usar botão primário ou outline sobre ele; a capa de entrada e o ranking público ficam navy nos dois temas.
- **Don't** mostrar ajuda e erro do campo ao mesmo tempo; erro substitui ajuda.
- **Don't** usar select, checkbox ou switch nativos do navegador ao lado dos desenhados; `Select`, `Checkbox` e `Switch` são o desenho único.
