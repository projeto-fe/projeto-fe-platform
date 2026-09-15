# ADR 0012: Desativar em vez de apagar, e etapa extra para privilégio

- Status: aceito
- Data: 2026-09-15

## Contexto

O portal nasceu sem nenhum caminho para tirar alguém da operação. Uma criança que saiu do
projeto continuava na lista de lançamento de pontos, e `criancas.ativo` existia no banco, era
filtrado na consulta, mas nada no produto sabia mudá-lo. A única saída era o painel do Supabase,
à mão.

O mesmo vazio existia do lado das pessoas: dava para ativar e desativar o acesso, mas não para
mudar o papel de alguém. Quem precisava promover um voluntário a coordenador tinha que ir à tela
de Estrutura, achar a área e vincular de lá. E não havia nenhum caminho para conceder
administrador, apesar de `perfis.is_admin` existir desde o schema inicial.

O risco dos dois lados é o mesmo, por motivos opostos: apagar demais e conceder demais.

## Decisão

- **Desativar é o caminho normal; apagar é exceção.** Criança que saiu do projeto é desativada:
  some das listas e dos lançamentos, mas cadastro e pontuação continuam guardados e reversíveis.
  A lista ganha um filtro de situação, senão desativar viraria sumiço.
- **Excluir só sem histórico, e só administrador.** `pontuacao_eventos.crianca_id` é
  `on delete cascade`: apagar uma criança com pontos lançados levaria junto os eventos que
  sustentam o ranking do ano, e a turma deixaria de conseguir conferir as posições. A ação
  aparece mesmo quando é impossível, com o motivo escrito, em vez de sumir do menu: quem clicou
  precisa entender por que não dá, e o que fazer em vez disso.
- **Papel se muda de onde a pessoa está.** "Gerenciar acesso", em Pessoas, lista as áreas da
  pessoa com o papel de cada uma. Papel continua valendo por área (ADR 0004); o que muda é só o
  ponto de entrada, que agora também é a pessoa, e não apenas a estrutura.
- **Conceder administrador pede etapa extra.** Administrador vê endereço, telefone e autorização
  de todas as crianças, convida gente, muda a estrutura e promove outros administradores. Não é
  um degrau acima de coordenação, é acesso a tudo, e na prática não tem desfazer: quem foi
  promovido já viu o que viu. A confirmação tem duas partes, as duas conferidas no servidor:
  1. **digitar o nome da pessoa**, que impede promover a linha errada de uma lista;
  2. **a senha de quem promove**, que impede que um computador destravado vire uma promoção.
  A senha é conferida num cliente efêmero, sem persistir sessão, para não sobrescrever o cookie
  de quem está logado.
- **Toda mudança de acesso e de cadastro de criança entra na auditoria** como sensível, incluindo
  desativar, excluir, mudar papel, promover e revogar.

## Consequências

- O produto deixa de precisar do painel do Supabase para operação normal, que era o único jeito
  de corrigir qualquer coisa e não deixava rastro na auditoria.
- A regra "quem já pontuou não se apaga" vive na server action, não no banco. O banco continua
  permitindo o delete para administrador; se algum dia houver outro caminho de exclusão, a
  checagem precisa ser repetida ou virar trigger.
- A etapa extra custa uma senha digitada por promoção. É raro o suficiente para não incomodar, e
  é exatamente o tipo de ação em que atrito é a função, não o defeito.
- Revogar administrador não pede senha: tira acesso, não concede. O único bloqueio é não poder
  revogar o próprio, senão o portal fica sem quem promove.
