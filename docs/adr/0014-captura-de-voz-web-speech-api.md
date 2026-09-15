# ADR 0014: Captura de voz pela Web Speech API do navegador

- Status: aceito
- Data: 2026-09-15

## Contexto

O ADR 0007 decidiu que o voluntário dita o que aconteceu e um modelo classifica o texto num
motivo do catálogo. Antes de escolher esse modelo, é preciso escolher como o áudio vira texto.

Duas rotas: gravar o áudio e transcrever num serviço no servidor (exige provedor pago, chave de
API, e o áudio passando pela nossa infraestrutura antes de virar texto), ou usar o reconhecimento
de fala já embutido no navegador (`SpeechRecognition`), que transcreve no próprio aparelho ou no
serviço do fabricante do navegador, sem nunca passar pelo nosso servidor.

Como o ADR 0007 já exige que o texto ditado não contenha o nome da criança, o conteúdo sensível
nunca chega a existir no áudio. Isso libera escolher a rota mais simples sem reabrir a questão de
contrato de tratamento de dado.

## Decisão

A captura de voz usa `window.SpeechRecognition` (ou `webkitSpeechRecognition` no Safari/iOS), em
português (`pt-BR`), direto no navegador. Sem gravação, sem upload de áudio, sem provedor externo
contratado.

Consequência direta: nem todo navegador suporta a API da mesma forma. Onde não há suporte
(`window.SpeechRecognition` e `webkitSpeechRecognition` ausentes), o botão de ditado some e a
pessoa usa a escolha manual do motivo, que continua sendo o caminho principal por decisão do
próprio ADR 0007.

A primeira entrega cobre só a transcrição: o texto ditado aparece na tela para conferência, sem
nenhuma classificação automática de motivo ainda. A escolha de como classificar o texto (modelo de
linguagem, correspondência por palavra-chave, ou outra) fica em aberto, decidida depois de validar
em uso real se a transcrição funciona bem nos aparelhos da equipe.

## Consequências

- Nenhuma chave de API nova, nenhum custo por uso, nenhum áudio saindo do aparelho da pessoa.
- Qualidade da transcrição varia por navegador e conexão, porque cada fabricante implementa o
  reconhecimento à sua maneira (Chrome no Android tende a ser o caso mais maduro; Safari no iOS
  tem suporte parcial desde a versão 14.5).
- Se a transcrição não for confiável o suficiente em uso real, trocar para gravação e transcrição
  no servidor é decisão nova, que volta a exigir revisar contrato de tratamento de dado se o áudio
  passar a sair do aparelho.
- Escolher como o texto vira motivo (ADR 0007) continua pendente e não é decidido por este ADR.
