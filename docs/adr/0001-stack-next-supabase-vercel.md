# ADR 0001: Next.js, Supabase e Vercel

- Status: aceito
- Data: 2026-09-14

## Contexto

A plataforma interna do Instituto Projeto Fé precisa de área logada com papéis distintos,
cadastro de crianças com dado pessoal sensível (endereço, condição de saúde) e uma página
pública de ranking. Escala esperada: cerca de 100 crianças e 30 usuários.

O site institucional do instituto (`projetofe.org`) é Vite + React e continua em repositório
separado. A plataforma nasce em `projeto-fe-platform`.

Alternativas consideradas: repetir a stack do site (Vite + React SPA), que é também a stack do
Pilar, ou usar Next.js.

## Decisão

Next.js com App Router, Supabase (Postgres, Auth e Storage) e deploy na Vercel.

O motivo de não repetir a stack do site é específico deste produto: numa SPA toda a busca de dado
acontece no navegador, então endereço e condição de saúde de criança trafegam até o cliente e o
controle de rota é apenas visual. Com App Router, a proteção acontece em middleware antes de
qualquer HTML ser servido, e o dado sensível é buscado no servidor, nunca entrando no pacote
JavaScript enviado ao navegador.

O projeto Supabase é criado na região de São Paulo.

## Consequências

- A proteção de rota passa a depender de sessão em cookie, não em armazenamento local do
  navegador. Isso é requisito do middleware e está refletido no uso de `@supabase/ssr`.
- Componentes que buscam dado sensível são Server Components por padrão. Marcar um deles como
  client é decisão consciente, não descuido.
- A região do projeto Supabase não pode ser alterada depois sem recriar o projeto inteiro. São
  Paulo foi escolhida antes do primeiro provisionamento por causa de residência de dado pessoal
  brasileiro.
- O plano gratuito da Vercel atende: doação não conta como uso comercial na política da
  plataforma, e o instituto não vende nada pelo portal.
