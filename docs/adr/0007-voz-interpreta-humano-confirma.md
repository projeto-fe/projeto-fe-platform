# ADR 0007: Ditado escolhe o motivo, pessoa confirma, código grava

- Status: substituído pelo [ADR 0015](0015-ditado-identifica-crianca-atividade-motivo.md)
- Data: 2026-09-14

## Contexto

Voluntário lança pontos pelo celular durante a atividade, com as mãos ocupadas e crianças em
volta. Ditar é mais rápido que navegar por menus.

Duas restrições pesam aqui. A primeira é de arquitetura: modelo de linguagem interpreta entrada
livre, mas decisão que gera compromisso não pode ser gerada livremente por ele. A segunda é legal:
enviar dado pessoal de criança para API de terceiro exige verificar se o contrato de tratamento de
dados cobre aquele uso.

## Decisão

O fluxo é:

1. A criança já está **selecionada na tela**, por toque. O nome não é ditado.
2. O voluntário fala apenas o que aconteceu ("ele ajudou o colega a guardar as bolas").
3. A fala vira texto e o modelo classifica o texto em um dos motivos do catálogo, devolvendo
   apenas o identificador do motivo.
4. A tela mostra o motivo e o valor correspondente. **Nada foi gravado.**
5. A pessoa confirma, e o lançamento é feito por código determinístico, com o valor vindo do
   catálogo.

O modelo nunca define quantos pontos, nunca escolhe a criança e nunca escreve no banco.

## Consequências

- O áudio e o texto enviados não identificam ninguém, porque o nome da criança não faz parte do
  ditado. Isso mantém o recurso fora do escopo de tratamento de dado pessoal por terceiro.
- Um erro de interpretação custa um toque em "Corrigir", nunca um ponto indevido no histórico.
- A escolha manual do motivo continua disponível e é o caminho principal. O ditado é atalho, não
  substituto, e a tela funciona inteira sem ele.
- Ampliar o papel do modelo (por exemplo, permitir ditar o nome da criança) é nova decisão de
  arquitetura e exige rever este ADR, incluindo a verificação de contrato de tratamento de dados.
