# Portal Projeto Fé

Plataforma interna do Instituto Projeto Fé, em Marília/SP. Cadastro das crianças atendidas,
estrutura de áreas e voluntários, e o IDE JOGAI, a gamificação do projeto.

Endereço previsto: `app.projetofe.org`. O site institucional fica em
[projeto-fe-website](https://github.com/projeto-fe/projeto-fe-website).

## Aviso sobre este repositório

Este repositório é **público** e o sistema trata **dado pessoal sensível de crianças**. Portanto:

- Nenhum dado real em semente, teste ou exemplo. Sempre dado fictício.
- Falha de segurança ainda não corrigida não vai para issue, pull request nem mensagem de commit.
  Use canal privado até a correção estar publicada.
- Nenhuma proteção depende de o código ser secreto. As regras de acesso valem no banco.

## Stack

Next.js (App Router), Supabase (Postgres, Auth, Storage) e Vercel. Detalhes e motivos em
[ADR 0001](docs/adr/0001-stack-next-supabase-vercel.md) e
[ADR 0010](docs/adr/0010-libs-de-interface.md).

## Decisões de arquitetura

| ADR | Decisão |
| --- | --- |
| [0001](docs/adr/0001-stack-next-supabase-vercel.md) | Next.js, Supabase e Vercel |
| [0002](docs/adr/0002-tokens-de-design-em-tres-camadas.md) | Tokens em três camadas, CI bloqueia cor crua |
| [0003](docs/adr/0003-pontuacao-como-evento.md) | Pontuação é evento, não saldo |
| [0004](docs/adr/0004-papel-por-area-nao-global.md) | Papel vale dentro da área |
| [0005](docs/adr/0005-dado-sensivel-em-tabela-separada.md) | Dado sensível em tabela separada |
| [0006](docs/adr/0006-ranking-publico-com-nome-de-jogador.md) | Ranking público usa nome de jogador |
| [0007](docs/adr/0007-voz-interpreta-humano-confirma.md) | Ditado sugere, pessoa confirma |
| [0008](docs/adr/0008-acesso-somente-por-convite.md) | Acesso apenas por convite |
| [0009](docs/adr/0009-backup-por-export-agendado.md) | Backup por exportação agendada |
| [0010](docs/adr/0010-libs-de-interface.md) | Bibliotecas de interface |

## Especificações

| Spec | Escopo |
| --- | --- |
| [0001](docs/specs/0001-cadastro-de-criancas.md) | Cadastro de crianças |
| [0002](docs/specs/0002-ide-jogai.md) | IDE JOGAI: pontuação, extrato e ranking |
| [0003](docs/specs/0003-estrutura-e-acessos.md) | Estrutura, pessoas e acessos |

## Convenções

- Código, comentários e documentação em português. Commits, branches e pull requests em inglês.
- Toda tabela nasce com Row Level Security ligada na mesma migração que a cria.
- Migração só entra por pipeline, nunca aplicada à mão em produção.
- Valores monetários e medidas em inteiro, nunca ponto flutuante.
- Componente nunca escreve cor literal. O CI recusa.
