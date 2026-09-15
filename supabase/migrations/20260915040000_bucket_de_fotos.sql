-- ============================================================================
-- Bucket para foto de criança e de usuário.
--
-- Privado: `storage.objects` já vem com RLS ligado por padrão no Supabase, e
-- nenhuma policy é criada aqui de propósito. Sem policy nenhuma, `anon` e
-- `authenticated` não alcançam nada no bucket — a mesma decisão já tomada
-- para `convites` e `redefinicoes_senha`: o servidor mexe aqui inteiramente
-- pelo papel de serviço, com a autorização decidida em código, não em RLS.
--
-- Caminho do objeto não leva extensão (`criancas/<id>`, `perfis/<id>`): o
-- tipo da imagem vai no metadado `contentType` do próprio Storage, então
-- trocar de foto é sempre sobrescrever o mesmo caminho (`upsert`), nunca
-- acumular arquivo órfão de upload anterior num formato diferente.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', false)
on conflict (id) do nothing;
