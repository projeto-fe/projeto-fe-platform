# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Equipe do Instituto Projeto Fé, em Marília/SP: coordenação (mesa, computador, geralmente fora
do horário das atividades) e voluntários (celular, na quadra ou na sala, durante a atividade).
Administradores são poucos e cuidam de estrutura, acessos e auditoria. As crianças e seus
responsáveis não têm conta; só veem a página pública do ranking.
(Inferido do repositório: README, specs 0001 a 0003 e ADR 0004. Não confirmado em entrevista.)

## Product Purpose

Tirar da planilha o cadastro de cerca de 100 crianças atendidas, organizar áreas e atividades com
seus responsáveis, e registrar o IDE JOGAI (gamificação que premia atitudes ao longo do ano) de
forma que qualquer ponto possa ser explicado a uma criança. Sucesso é a equipe consultar e lançar
pelo celular durante a atividade sem esforço, e a coordenação confiar no dado.

## Positioning

Ferramenta interna feita para este instituto: papel vale por área (não global), dado sensível de
criança fica separado e restrito no banco, pontuação é evento auditável e nunca saldo editado, e o
ranking público só mostra nome abreviado. Nada disso é configurável por um produto genérico de
gestão de ONG.

## Operating Context

Next.js App Router com Supabase (Postgres, Auth) e Vercel. Repositório público, portanto nenhuma
proteção depende de segredo no código. Convite por e-mail via Resend; sem cadastro aberto. Uso
real alterna computador da coordenação e celular do voluntário, em dia claro e à noite; o tema
segue o sistema.

## Capabilities and Constraints

- Cadastro de crianças com dados básicos, saúde, medidas, inscrições em atividades e, para
  coordenação/admin, endereço, contato e termo de autorização.
- Estrutura em árvore: área contém atividades; pessoa tem papel dentro da área.
- IDE JOGAI: lançar ponto a partir de um catálogo de motivos com valor fixo; estorno cria evento
  contrário; ranking interno e público.
- Pessoas e acessos: convite, desativação, registro de auditoria imutável.
- Restrições: valores em inteiro (gramas, centímetros); toda tabela com RLS; componente nunca
  escreve cor literal (CI recusa); commits e branches em inglês, código e copy em português.
- Ainda não existe: frequência/presença, upload de foto, funcionamento offline, gráficos.

## Brand Commitments

Nome "Portal Projeto Fé" / "Instituto Projeto Fé". Leão coroado como símbolo (`public/logo-mark*.svg`).
Paleta da marca: laranja #f05a28, navy #1f2a44, branco. Fontes Poppins (display) e Open Sans
(texto), herdadas do site institucional (ADR 0002). Voz: direta, em português, sentence case,
sem jargão; erro diz o que houve e o próximo passo.

## Evidence on Hand

Sem dado real de criança em nenhum lugar do repositório, por regra. Conteúdo de demonstração
precisa ser fictício e identificado como tal. Logos em `public/`. Especificações em `docs/specs`.

## Product Principles

- O celular na quadra é o cenário mais exigente; o que não funciona lá não está pronto.
- Dado sensível de criança aparece só para quem precisa, e a interface não decide isso sozinha:
  o banco decide.
- Todo ponto do IDE JOGAI é explicável: quem lançou, por quê, quando.
- Familiaridade acima de surpresa: a equipe é voluntária e troca; a tela não pode exigir
  treinamento.
- Cor de marca é acento, não papel de parede.
