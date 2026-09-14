# ADR 0010: Bibliotecas de interface

- Status: aceito
- Data: 2026-09-14

## Contexto

Requisito: visual consistente e de boa qualidade sem esforço desproporcional, com tabelas, cards,
botões, cabeçalho, barra lateral e comportamento em celular padronizados.

Dois projetos internos servem de referência. O Pilar usa shadcn/ui sobre Radix, com 28 pacotes
Radix, TanStack Table e react-hook-form com zod. O labrynth-platform usa shadcn/ui com apenas dois
pacotes Radix, tabela própria dirigida por definição de coluna, e validação escrita à mão.

A diferença de validação entre eles tem motivo específico: o labrynth roda em Cloudflare Workers,
onde o tamanho do pacote pesa. Aqui o deploy é Vercel, então essa restrição não se aplica.

## Decisão

- **shadcn/ui** no estilo new-york, com os componentes copiados para o repositório. Não é
  dependência: é código nosso, editável, consumindo os tokens do ADR 0002.
- **Radix** apenas nos primitivos que realmente exigem comportamento acessível complexo (diálogo,
  menu suspenso, popover). Componentes simples não entram só por estarem disponíveis.
- **class-variance-authority**, **clsx** e **tailwind-merge** para variantes tipadas.
- **lucide-react** para ícones, que já é o conjunto usado no site institucional.
- **react-hook-form** com **zod** para formulários, e o mesmo esquema zod validando a entrada no
  servidor. O cadastro de criança tem mais de vinte campos com regras cruzadas, que é exatamente o
  caso em que validação manual sai mais cara.
- **Tabela própria** dirigida por definição de coluna, como no labrynth-platform, em vez de
  TanStack Table. Cada coluna declara em que largura desaparece no celular. Para listas de cerca de
  100 linhas, ordenação e filtro locais bastam.
- **sonner** para aviso de ação concluída.
- **@supabase/ssr** para sessão em cookie, exigida pelo middleware.
- **Resend** com **React Email** para o convite.
- **Vitest**, **Testing Library** e **jest-axe** para teste e verificação de acessibilidade.

Ficam de fora por ora: biblioteca de gráfico, tour guiado, paleta de comandos, geração de PDF,
internacionalização e animação declarativa. Nenhuma tem demanda hoje.

## Consequências

- A tabela própria significa escrever e manter esse componente. Em compensação, o comportamento em
  celular fica sob controle, que é o requisito principal deste produto.
- Componentes shadcn copiados não recebem atualização automática. É o modelo esperado da
  ferramenta, e o que permite que eles falem apenas a linguagem dos nossos tokens.
- Um esquema zod por formulário serve ao cliente e ao servidor, o que elimina a divergência
  clássica entre validar na tela e validar na API.
- A lista de dependências permanece pequena o suficiente para ser auditada de relance, o que
  importa num repositório público.
