# Spec 0003: Estrutura, pessoas e acessos

- Status: pronta para implementar
- Data: 2026-09-14
- ADRs relacionados: [0004](../adr/0004-papel-por-area-nao-global.md),
  [0008](../adr/0008-acesso-somente-por-convite.md)

## Problema

O instituto organiza o trabalho em áreas, cada uma com atividades e responsáveis, e isso hoje só
existe no conhecimento das pessoas. Não há controle de quem acessa a plataforma, nem registro de
quem fez o quê com dado de criança.

## Não é objetivo

- Permissão granular por tela ou por campo, além dos três papéis.
- Segundo fator de autenticação.
- Autoatendimento de troca de papel.
- Escala e horário das atividades como agenda funcional (por ora são apenas texto descritivo).

## Fluxos

### Montar a estrutura

Administrador cria área, cria atividades dentro da área e pode criar subárea quando a estrutura
for mais profunda. A tela mostra a árvore, com ações explícitas de adicionar, mover e renomear.

Mover uma área para dentro da própria descendência é recusado com mensagem explicando o motivo.

### Alocar pessoas

Administrador atribui a uma pessoa um papel dentro de uma área. A mesma pessoa pode ser
coordenadora de uma área e voluntária em outra.

### Convidar

Administrador informa e-mail, papel e área, e envia convite. O convite vale 7 dias e é de uso
único. Enquanto não for aceito, aparece na lista como pendente.

### Remover acesso

Administrador desativa a pessoa. O efeito é imediato: a sessão ativa deixa de funcionar na próxima
requisição.

### Registro de atividade

Administrador consulta o log, com filtro por pessoa e por período. Ações sensíveis ficam
destacadas: estorno de pontuação, alteração de papel, edição de dado sensível de criança,
desativação de usuário e envio de convite.

## Modelo de dado

```
perfis
  id (= auth.users.id), nome, email, is_admin, ativo, criado_em

areas
  id, nome, parent_id (nulo na raiz), tipo ('area' | 'atividade'),
  descricao_horario, ativo

area_membros
  usuario_id, area_id, papel ('coordenador' | 'voluntario')

convites
  id, email, papel, area_id, token_hash, expira_em, aceito_em, convidado_por

auditoria
  id, ator_id, acao, entidade, entidade_id, detalhe (jsonb), sensivel, criado_em
```

## Segurança

- Papel lido sempre do banco, nunca de dado que o cliente controla.
- `auditoria`: inserção pelo sistema, leitura apenas por administrador, sem atualização nem
  exclusão por ninguém.
- `convites`: o token é guardado como hash, nunca em texto.
- Promover a administrador exige confirmação adicional na interface e gera registro marcado como
  sensível.
- Registro público no Supabase Auth desabilitado.

## Critérios de aceite

- [ ] Pessoa coordenadora da área Educacional e voluntária na Esportiva enxerga o que corresponde
      a cada papel, testado contra o banco.
- [ ] Mover uma área para dentro da própria descendência é recusado.
- [ ] Usuário desativado perde acesso na requisição seguinte, sem esperar a sessão expirar.
- [ ] Convite expirado não permite criar conta e mostra mensagem dizendo o que fazer.
- [ ] O mesmo convite não pode ser usado duas vezes.
- [ ] Editar endereço de uma criança gera registro de auditoria marcado como sensível.
- [ ] Administrador não consegue apagar nem alterar linha de auditoria por nenhum caminho.
