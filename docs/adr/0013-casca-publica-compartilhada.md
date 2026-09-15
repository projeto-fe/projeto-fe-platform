# ADR 0013: Rotas públicas compartilham uma casca própria

- Status: aceito
- Data: 2026-09-15

## Contexto

`/ranking` é hoje a única página sem login do sistema (ADR 0006), e monta o próprio cabeçalho
(logo, botão "Entrar") direto no `page.tsx`, sem nenhuma casca compartilhada, porque não havia
com quem compartilhar.

A Spec 0005 adiciona uma segunda página pública, o calendário de atividades. Duas páginas
públicas com cabeçalho duplicado é o mesmo problema que o ADR 0011 já resolveu do lado
autenticado: cada tela decidindo sozinha como se parecer.

## Decisão

Rotas públicas vivem sob o grupo `app/(publico)`, com um `layout.tsx` próprio que resolve:

- Cabeçalho: logo e botão "Entrar", iguais em toda página pública.
- Navegação entre páginas públicas, quando houver mais de uma (a partir desta spec, Ranking e
  Agenda).
- Fundo e tipografia da casca pública (`bg-brand-canvas-deep`, `text-brand-canvas-ink`), hoje
  repetidos em cada `page.tsx`.

`/ranking` muda de `app/ranking/page.tsx` para `app/(publico)/ranking/page.tsx`, sem mudar de
endereço (grupo de rota não aparece na URL). A página deixa de montar o próprio cabeçalho e passa
a só cuidar do conteúdo.

Continua valendo o que o ADR 0006 já estabeleceu: renderização no servidor, sem credencial de
banco no cliente, sem caminho entre o visitante e tabela sensível. A casca não introduz nenhum
dado novo, só evita repetir o mesmo cabeçalho arquivo por arquivo.

## Consequências

- Terceira página pública é cabeçalho de graça; só implementa o conteúdo.
- `/ranking` muda de arquivo, não de URL. Nenhum link existente quebra.
- A casca pública e a casca autenticada (`app/(app)/layout.tsx`) continuam completamente
  separadas: nenhuma delas verifica sessão pela outra. Página pública nova só vira pública de
  fato quando alguém a coloca dentro de `(publico)` on purpose, e continua sem acesso a dado
  sensível por construção (usa `criarClienteAdministrativo` contra view já restrita, nunca a
  tabela base).
