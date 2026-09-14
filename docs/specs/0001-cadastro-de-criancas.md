# Spec 0001: Cadastro de crianças

- Status: pronta para implementar
- Data: 2026-09-14
- ADRs relacionados: [0004](../adr/0004-papel-por-area-nao-global.md),
  [0005](../adr/0005-dado-sensivel-em-tabela-separada.md),
  [0009](../adr/0009-backup-por-export-agendado.md)

## Problema

O cadastro das cerca de 100 crianças atendidas vive numa planilha. Não há controle de quem vê ou
edita, não há histórico de alteração, e o dado inclui endereço residencial e condição de saúde de
menores. Consultar durante a atividade é inviável pelo celular.

## Não é objetivo

- Autoatendimento pelos responsáveis. Quem digita é voluntário ou coordenador.
- Upload de documento ou foto da criança.
- Controle de frequência e presença (fica para depois).
- Funcionamento sem internet.

## Fluxos

### Cadastrar criança

Voluntário ou coordenador abre "Nova criança" e preenche as seções: identificação, endereço,
contato e responsáveis, saúde, medidas e uniforme, autorização.

O CEP preenche endereço, bairro, cidade e UF automaticamente. Os campos preenchidos ficam apenas
para leitura, exceto número e complemento.

Ao salvar, a criança nasce sem inscrição em atividade. A inscrição é feita em seguida e aceita
várias atividades.

### Editar criança

Mesma tela, carregada com os dados. Alterações em campos da tabela sensível ficam registradas no
log de auditoria com autor e data.

### Buscar

Lista com busca por nome ou por responsável, filtro por atividade. A lista mostra nome, idade,
atividades, responsável e condição de saúde. Endereço e telefone não aparecem na lista.

### Registrar autorização

O termo é assinado em papel. O sistema registra quem autorizou, quando, e quem colheu a
assinatura. Criança sem autorização registrada aparece destacada no início, e o número aparece na
tela inicial.

## Modelo de dado

```
criancas
  id, nome_completo, nome_jogador (único), data_nascimento,
  tem_problema_saude, observacao_saude,
  peso_kg, altura_m, numero_calcado, tamanho_uniforme,
  observacoes_gerais, ativo, criado_em, criado_por

criancas_dados_sensiveis
  crianca_id (1:1), cep, logradouro, numero, complemento, bairro, cidade, uf,
  telefone_principal, telefone_secundario, nome_mae, nome_pai,
  autorizacao_responsavel_nome, autorizacao_data, autorizacao_colhida_por

crianca_atividades
  crianca_id, atividade_id, inscrita_em    -- N:N
```

Peso e altura em inteiro (gramas e centímetros), nunca ponto flutuante.

## Segurança

- As duas tabelas nascem com Row Level Security ligada na mesma migração que as cria.
- `criancas`: leitura para qualquer usuário autenticado ativo. Escrita para voluntário,
  coordenador e administrador.
- `criancas_dados_sensiveis`: leitura e escrita apenas para coordenador e administrador.
- Toda escrita em `criancas_dados_sensiveis` gera entrada no log de auditoria.
- Nenhum dado real em arquivo de semente ou teste. O repositório é público.

## Critérios de aceite

- [ ] Voluntário autenticado não consegue ler `criancas_dados_sensiveis`, testado contra o banco,
      não apenas escondido na interface.
- [ ] Buscar pelo nome do responsável encontra a criança.
- [ ] Criança pode ser inscrita em duas atividades e aparece nas duas listagens.
- [ ] Salvar cadastro sem autorização registrada é permitido, mas a criança aparece na lista de
      pendências da tela inicial.
- [ ] CEP inválido mostra mensagem dizendo o que fazer, e não trava o restante do formulário.
- [ ] A tela funciona em largura de 390 pixels sem rolagem horizontal.
- [ ] Nome de jogador duplicado é recusado com mensagem clara.
