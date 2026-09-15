# Spec 0005: Calendário de atividades e presença

- Status: pronta para implementar
- Data: 2026-09-15
- ADRs relacionados: [0013](../adr/0013-casca-publica-compartilhada.md),
  [0004](../adr/0004-papel-por-area-nao-global.md)

## Problema

Hoje o horário de cada atividade é um texto livre (`descricao_horario`), sem estrutura: ninguém
enxerga um calendário do instituto, e não há registro de quem esteve numa atividade em cada dia.
A Spec 0003 deixou isso de fora de propósito ("escala e horário como agenda funcional, por ora
apenas texto descritivo"); esta spec assume esse escopo.

## Não é objetivo

- Escala de voluntário (quem deveria estar naquele dia). Presença registra quem esteve, não
  substitui a escala de responsabilidade.
- Check-in automático: QR code, geolocalização, biometria.
- Notificação de falta para responsável.
- Recorrência além de "toda semana neste dia e horário" (sem quinzenal, mensal, etc.).
- Relatório exportável (PDF, planilha) de frequência.
- Edição em lote de várias datas de uma vez (ex.: cancelar todas as terças de julho).
- Histórico de alteração de uma presença (quem mudou de falta para presente e quando). Guarda-se
  só o estado atual.

## Depende de

A edição do cronograma precisa de um lugar para viver. A página dedicada de atividade (ainda sem
spec própria) é o destino natural. Enquanto ela não existe, o cronograma (horário fixo) se edita
por um diálogo próprio em `/estrutura`, e a exceção (cancelar data, evento extra) se registra por
um diálogo em `/calendario`. Quando a página dedicada existir, as duas migram para lá.

## Fluxos

### Montar o cronograma da atividade

Administrador define um ou mais horários recorrentes por atividade: dia da semana, hora de
início, hora de fim, local. Pode desativar um horário sem apagar o histórico associado a ele.

### Registrar exceção

Administrador ou coordenador da área marca uma data específica como cancelada (a atividade some
do calendário naquele dia, sem afetar as outras semanas), ou lança um evento extra fora do padrão
semanal — um passeio, um evento especial — com título e horário próprios.

### Ver calendário interno

Qualquer pessoa autenticada abre `/calendario` e vê o mês inteiro, com todas as atividades,
filtro por atividade e por área. A grade do mês é montada no servidor cruzando o cronograma
recorrente com as exceções do período; nenhuma tabela guarda "ocorrência do dia" pré-calculada.

### Ver calendário público

Mesma grade, em `/agenda`, sob a casca pública (ADR 0013). Mostra apenas nome da atividade, área,
horário e local. Nenhum nome de criança, nome de voluntário ou dado de presença aparece aqui.

### Abrir a chamada

Voluntário ou coordenador vinculado à área abre a chamada de uma atividade numa data. A tela
lista as crianças inscritas na atividade e os voluntários vinculados à área, cada um com
presente/falta. Abrir a chamada de novo para a mesma atividade e data reaproveita a chamada já
existente, sem duplicar.

### Corrigir presença

Quem abriu a chamada, o coordenador da área ou o administrador corrige um lançamento direto,
sobrescrevendo o valor anterior. Diferente da pontuação (ADR 0003), presença não é evento
imutável: é um estado que se corrige.

### Painel de presença da criança

Na página da criança, uma seção mostra a frequência por atividade em que ela está inscrita:
quantas chamadas houve no período, quantas ela teve presença.

### Painel de presença do voluntário

Na página da pessoa mostra a frequência do voluntário nas atividades em que atua.

## Modelo de dado

```
atividade_horarios
  id, atividade_id (-> areas, tipo='atividade'), dia_semana (0-6), hora_inicio, hora_fim,
  local, ativo

atividade_eventos
  id, atividade_id, data, tipo ('extra' | 'cancelado'), hora_inicio, hora_fim,
  titulo, local, criado_por, criado_em

chamadas
  id, atividade_id, data, aberta_por, aberta_em
  únique (atividade_id, data)

presencas
  id, chamada_id, crianca_id (nulo se for voluntário), usuario_id (nulo se for criança),
  status ('presente' | 'falta' | 'falta_justificada'), observacao,
  registrado_por, registrado_em, atualizado_em
  constraint: exatamente um entre crianca_id e usuario_id preenchido
  único (chamada_id, crianca_id), único (chamada_id, usuario_id)
```

`descricao_horario` em `areas` continua existindo para casos que não cabem no padrão semanal;
`atividade_horarios` é a fonte estruturada usada pelo calendário.

## Segurança

- `atividade_horarios`, `atividade_eventos`: escrita apenas por administrador (mesma regra hoje
  aplicada a `areas`). Leitura por qualquer pessoa autenticada e pela view pública, que expõe só
  os campos de horário e local.
- `chamadas`, `presencas`: leitura e escrita por voluntário ou coordenador vinculado à área da
  atividade, e por administrador. Sem vínculo com a área, sem acesso, testado contra o banco.
- Correção de presença é permitida a quem já tem acesso de escrita, sem etapa extra de
  confirmação — o dado não é público nem afeta ranking, então não herda o rigor do ADR 0012.
- Nenhuma rota pública expõe presença, inscrição de criança em atividade ou vínculo de voluntário.
- Painel de presença da criança: voluntário vê apenas a atividade em que atua; visão completa
  entre todas as atividades da criança é restrita a quem já pode ver dado sensível dela
  (administrador ou coordenador de alguma área, mesma regra do cadastro).

## Critérios de aceite

- [ ] Cancelar uma data não apaga o horário recorrente: a atividade volta a aparecer no dia
      seguinte da semana normalmente.
- [ ] A página `/agenda` não expõe nome de criança, nome de voluntário nem presença, testado no
      HTML enviado ao navegador.
- [ ] Abrir a chamada duas vezes na mesma atividade e data reaproveita a mesma chamada.
- [ ] Corrigir uma presença já lançada atualiza o registro existente, sem linha duplicada.
- [ ] Pessoa sem vínculo com a área não abre nem edita chamada daquela área, testado contra o
      banco.
- [ ] O painel de presença da criança mostra apenas atividades em que ela está inscrita.
- [ ] Mover `/ranking` para a casca pública (ADR 0013) não muda a URL nem quebra o link já
      publicado.
