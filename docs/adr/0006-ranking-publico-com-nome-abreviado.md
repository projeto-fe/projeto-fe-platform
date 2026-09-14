# ADR 0006: Ranking público usa nome abreviado e é renderizado no servidor

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

A página pública exibe o nome **abreviado**, a posição e a pontuação. Nome completo, idade,
atividade, bairro e qualquer outro dado ficam restritos à área autenticada.

O nome abreviado é derivado do cadastro por uma função no banco (`nome_publico`): primeiro nome
mais a inicial do último sobrenome, então "Ana Beatriz Moraes" aparece como "Ana M.".

**Revisão de 2026-09-14**: a primeira versão desta decisão pedia um apelido digitado num campo
separado. Foi substituída pela derivação automática, porque o campo exigia trabalho extra em todo
cadastro e ainda dependia de alguém escolher um apelido que não revelasse o nome. Derivar remove
as duas fragilidades e a criança continua se reconhecendo na lista.

A página é renderizada no servidor, com revalidação periódica, e lê apenas uma view que expõe
essas três colunas. Nenhuma credencial do banco é enviada ao navegador, e não existe caminho entre
o visitante e a tabela de crianças.

## Consequências

- Não há campo a preencher: cadastrar a criança basta, e o nome público sai do nome completo.
- Duas crianças podem aparecer como "Ana M.". Na lista isso não atrapalha, porque cada uma se
  encontra pela própria posição, e a alternativa (sobrenome inteiro) é justamente o que se quer
  evitar.
- Mudar a regra de abreviação depois é trocar uma função no banco, sem migrar dado nenhum.
- Não é necessário configurar acesso anônimo ao banco, o que elimina uma classe inteira de erro de
  permissão.
- A página pública é a única superfície indexável do sistema. Toda rota autenticada fica fora dos
  buscadores.
