# ADR 0004: Papel vale dentro da área, não globalmente

- Status: aceito
- Data: 2026-09-14

## Contexto

O instituto tem três papéis: administrador, coordenador (responsável por uma área) e voluntário.
A estrutura é hierárquica: área contém atividades (Educacional contém Reforço e Inglês), e a
criança se inscreve na atividade, podendo estar em várias.

O modelo intuitivo seria uma coluna `papel` no perfil do usuário.

Esse modelo não expressa um caso que já existe hoje: a mesma pessoa coordena uma área e atua como
voluntária em outra. Com papel global, a saída improvisada é promover a pessoa a coordenadora em
todo lugar, que é exatamente o excesso de acesso que o modelo deveria evitar.

## Decisão

Administrador é papel global, gravado no perfil.

Coordenador e voluntário existem sempre em relação a uma área, em `area_membros`
(usuário, área, papel). Uma pessoa pode ter vínculos diferentes em áreas diferentes.

Áreas são uma árvore (`areas.parent_id`), e atividades são os nós folha onde a criança se
inscreve. A inscrição é `crianca_atividades` (criança, atividade), permitindo várias.

Um gatilho impede que uma área seja movida para dentro da própria descendência, o que criaria um
ciclo e travaria qualquer consulta recursiva.

## Consequências

- A checagem de acesso sempre pergunta "esta pessoa tem qual papel nesta área", nunca "esta pessoa
  é coordenadora".
- O papel é lido do banco, nunca de dado que o cliente controla.
- Consultar a subárvore de uma área usa recursão nativa do Postgres. Na escala deste projeto isso
  é barato e dispensa extensão ou tabela de fechamento.
- Ligar o escopo por área depois, com dado real dentro, seria retrofit caro. Por isso a coluna e a
  política nascem juntas, mesmo que no início todo coordenador enxergue todas as áreas.
