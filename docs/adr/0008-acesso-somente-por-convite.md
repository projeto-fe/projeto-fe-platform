# ADR 0008: Acesso apenas por convite do administrador

- Status: aceito
- Data: 2026-09-14

## Contexto

A plataforma guarda dado pessoal sensível de crianças. Quem entra é equipe do instituto: cerca de
30 pessoas, com rotatividade de voluntários ao longo do ano.

Cadastro aberto, mesmo restrito a um domínio de e-mail, significa que a porta de entrada é
controlada por quem consegue um endereço válido, e não por quem decide sobre a equipe.

## Decisão

Não existe tela pública de criação de conta. O registro no Supabase Auth fica desabilitado.

O administrador envia convite por e-mail (Resend), com papel e área já definidos. O convidado abre
o link, define a senha e entra. O convite tem prazo de validade e uso único.

Remoção de acesso é feita pelo administrador e tem efeito imediato na sessão.

Promover alguém a administrador exige confirmação adicional e fica registrada no log de auditoria,
por ser a ação que concede acesso a todo o dado sensível do sistema.

## Consequências

- A lista de quem tem acesso é sempre uma decisão explícita de alguém, com data e autor.
- Voluntário que sai do projeto é removido, e o registro de quem removeu fica no log.
- Existe dependência operacional de entrega de e-mail. O convite pendente aparece na tela de
  administração, então um e-mail que não chegou é visível em vez de silencioso.
- Segundo fator não entra agora. A decisão está registrada conscientemente: a barreira relevante
  neste momento é controlar quem recebe convite.
