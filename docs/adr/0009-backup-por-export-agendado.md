# ADR 0009: Backup por exportação agendada enquanto o plano for gratuito

- Status: aceito
- Data: 2026-09-14

## Contexto

Cerca de 100 crianças e 30 usuários cabem com folga no plano gratuito do Supabase.

O plano gratuito não faz backup automático. Hoje o cadastro existe numa planilha, que funciona como
cópia de fato. Quando a planilha for desativada após a migração, o banco passa a ser a única cópia
existente do cadastro, incluindo o registro das autorizações assinadas pelos responsáveis.

Perder esse banco não significa perder software, significa recadastrar 100 crianças e colher todas
as autorizações de novo.

## Decisão

Enquanto o projeto estiver no plano gratuito, uma tarefa agendada diária exporta os dados para
armazenamento externo, com retenção de 30 dias.

A planilha de origem é mantida em modo somente leitura por pelo menos 60 dias após a migração,
como rede de segurança independente.

A restauração é testada uma vez, de verdade, antes de a planilha ser desativada. Backup nunca
restaurado não é backup.

## Consequências

- O custo continua zero, com o trabalho concentrado em escrever a rotina uma vez.
- O arquivo exportado contém dado pessoal sensível e por isso não pode ir para o repositório, nem
  para armazenamento com link público. As credenciais do destino ficam em variável de ambiente.
- Se o instituto passar a pagar o plano Pro, esta decisão é revista e o backup gerenciado
  substitui a rotina.
- A data do teste de restauração fica registrada neste arquivo quando ele acontecer.
