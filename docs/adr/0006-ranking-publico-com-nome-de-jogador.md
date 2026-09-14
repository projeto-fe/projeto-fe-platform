# ADR 0006: Ranking público usa nome de jogador e é renderizado no servidor

- Status: aceito
- Data: 2026-09-14

## Contexto

As crianças precisam acompanhar o ranking do IDE JOGAI, e a maioria não tem conta na plataforma.
A página precisa ser aberta, sem login.

Publicar o ranking com nome completo expõe uma lista de crianças identificadas, associadas a uma
instituição, a uma cidade e a atividades com horário fixo. É informação suficiente para localizar
uma criança específica. Além disso, o repositório é público, então o código da página é legível
por qualquer pessoa e nenhuma proteção pode depender de obscuridade.

## Decisão

Cada criança tem um **nome de jogador**, escolhido por ela, gravado em `criancas.nome_jogador`.
A página pública exibe apenas nome de jogador, posição e pontuação. Nome real, idade, atividade,
bairro e qualquer outro dado ficam restritos à área autenticada.

A página é renderizada no servidor, com revalidação periódica, e lê apenas uma view que expõe
essas três colunas. Nenhuma credencial do banco é enviada ao navegador, e não existe caminho entre
o visitante e a tabela de crianças.

## Consequências

- O nome de jogador passa a ser obrigatório para participar do ranking, e precisa ser único.
- Um nome de jogador que contenha o nome real anula a proteção. A tela de cadastro orienta isso, e
  a moderação é responsabilidade da coordenação.
- A abordagem também é melhor como produto: a criança se identifica com o próprio apelido de jogo.
- Não é necessário configurar acesso anônimo ao banco, o que elimina uma classe inteira de erro de
  permissão.
- A página pública é a única superfície indexável do sistema. Toda rota autenticada fica fora dos
  buscadores.
