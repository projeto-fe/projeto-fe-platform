# ADR 0015: Ditado identifica criança, atividade e motivo via LLM

- Status: aceito
- Data: 2026-09-15
- Substitui: [ADR 0007](0007-voz-interpreta-humano-confirma.md)

## Contexto

O ADR 0007 escolheu manter a criança fora do ditado de propósito: selecionada por toque, nunca
falada, para que o texto enviado a um modelo de linguagem não carregasse dado pessoal de criança
sem antes verificar se o contrato do provedor cobre esse tratamento.

Em uso real, isso mostrou uma fricção que o ADR 0007 já previa como possível: preencher criança e
atividade antes de poder falar atrapalha exatamente o cenário que motivou o recurso, mãos ocupadas,
crianças em volta. O pedido agora é o fluxo original pensado desde o início do projeto: a pessoa
fala tudo (quem, o que aconteceu, e quando fizer sentido, durante qual atividade), e o sistema
identifica os três campos sozinho, sempre deixando a pessoa conferir antes de gravar.

O próprio ADR 0007 previa este caso: "Ampliar o papel do modelo (por exemplo, permitir ditar o nome
da criança) é nova decisão de arquitetura e exige rever este ADR, incluindo a verificação de
contrato de tratamento de dados." Esta é essa revisão. Antes de ativar em produção, o responsável
pelo produto confirmou que vai verificar (ou já verificou) se o contrato do provedor de LLM
escolhido cobre o tratamento de dado pessoal de criança.

## Decisão

O texto transcrito (ADR 0014), que agora pode conter o nome da criança, é enviado ao Gemini junto
com três listas: crianças ativas (id e nome completo), atividades ativas (id e nome) e o catálogo
de motivos (id, rótulo e valor). O modelo devolve no máximo um palpite por campo, cada um sendo
obrigatoriamente um dos ids fornecidos ou `null`. Qualquer id que não bater com um dos fornecidos é
descartado no código antes de chegar à tela, o modelo nunca decide um id livremente.

Regras do palpite:

- Campo sem menção no texto, ou menção ambígua (nome que combina com mais de uma criança
  cadastrada, por exemplo), volta `null`.
- `null` deixa o campo correspondente vazio na tela, pedindo escolha manual. Não há pergunta de
  desambiguação nesta primeira versão, só o campo em branco.
- O texto ditado continua visível para conferência, junto dos campos preenchidos ou vazios.
- Continua valendo o núcleo do ADR 0007: o modelo nunca grava nada sozinho. A pessoa sempre revisa
  os três campos, identificados ou não, e só o toque em "Lançar ponto" grava, com código
  determinístico de novo.

## Consequências

- O nome da criança agora pode sair do aparelho da pessoa em direção a um provedor de LLM externo
  a cada ditado. Isso é uma mudança real de superfície de exposição de dado pessoal de criança, que
  o ADR 0007 evitava deliberadamente.
- Cada ditado agora tem custo de chamada de API, o que não existia na fase só de transcrição.
- Criança errada pré-selecionada por engano (dois nomes parecidos, por exemplo) é um risco novo: a
  tela mostra o nome completo no campo de conferência, não só o primeiro nome, para reduzir a
  chance de confirmar sem perceber.
- Se o provedor de LLM mudar depois, ou o contrato de tratamento de dado deixar de cobrir esse uso,
  este ADR precisa ser revisto de novo antes de continuar em produção.
