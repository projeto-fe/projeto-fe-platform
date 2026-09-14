-- ============================================================================
-- Testes contra o banco real. Cada bloco falha alto se a garantia quebrar.
-- Dados fictícios.
-- ============================================================================
\set ON_ERROR_STOP on

-- helper de asserção
create or replace function espera(condicao boolean, descricao text)
returns void language plpgsql as $$
begin
  if condicao then
    raise notice 'ok    %', descricao;
  else
    raise exception 'FALHOU: %', descricao;
  end if;
end;
$$;

-- ---------------------------------------------------------------- massa
-- Os perfis nascem pelo trigger em auth.users, como acontece de verdade.
-- O primeiro usuário vira administrador pela regra de bootstrap.
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'admin@projetofe.org', '{"nome":"Admin Teste"}'),
  ('22222222-2222-2222-2222-222222222222', 'coord@projetofe.org', '{"nome":"Coord Teste"}'),
  ('33333333-3333-3333-3333-333333333333', 'volu@projetofe.org',  '{"nome":"Volu Teste"}');

select espera(
  (select is_admin from perfis where id = '11111111-1111-1111-1111-111111111111'),
  'primeiro usuário virou administrador pelo bootstrap'
);

select espera(
  (select count(*) from perfis where is_admin) = 1,
  'apenas o primeiro usuário é administrador'
);

select espera(
  (select nome from perfis where id = '22222222-2222-2222-2222-222222222222') = 'Coord Teste',
  'nome do perfil veio dos metadados do usuário'
);

insert into areas (id, nome, tipo) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Educacional', 'area');
insert into areas (id, nome, parent_id, tipo) values
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Inglês',
   'aaaaaaaa-0000-0000-0000-000000000001', 'atividade');

insert into area_membros (usuario_id, area_id, papel) values
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-0000-0000-0000-000000000001', 'coordenador'),
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-0000-0000-0000-000000000002', 'voluntario');

insert into criancas (id, nome_completo, data_nascimento) values
  ('cccccccc-0000-0000-0000-000000000001', 'Maria Fictícia Exemplo', '2016-05-10');

insert into criancas_dados_sensiveis (crianca_id, logradouro, telefone_principal) values
  ('cccccccc-0000-0000-0000-000000000001', 'Rua Inventada, 100', '(14) 90000-0000');

-- Os motivos vêm do catálogo criado por migration, não do teste.
select espera(
  (select count(*) from motivos_pontuacao where ativo) >= 2,
  'catálogo de motivos veio populado pela migration'
);

-- =============================================================== teste 1
-- Voluntário não lê dado sensível. Testado no banco, não na interface.
set role authenticated;
set "request.jwt.claim.sub" = '33333333-3333-3333-3333-333333333333';

select espera(
  (select count(*) from criancas_dados_sensiveis) = 0,
  'voluntário não enxerga nenhuma linha de criancas_dados_sensiveis'
);

select espera(
  (select count(*) from criancas) = 1,
  'voluntário enxerga o cadastro básico da criança'
);

-- =============================================================== teste 2
-- Coordenador lê dado sensível.
set "request.jwt.claim.sub" = '22222222-2222-2222-2222-222222222222';

select espera(
  (select count(*) from criancas_dados_sensiveis) = 1,
  'coordenador enxerga dado sensível'
);

-- =============================================================== teste 3
-- Valor do ponto vem do catálogo, nunca do cliente.
set "request.jwt.claim.sub" = '33333333-3333-3333-3333-333333333333';

insert into pontuacao_eventos (crianca_id, motivo_id, valor_aplicado, lancado_por)
values ('cccccccc-0000-0000-0000-000000000001',
        (select id from motivos_pontuacao where rotulo = 'Ajudou um colega'),
        999,
        '33333333-3333-3333-3333-333333333333');

select espera(
  (select valor_aplicado from pontuacao_eventos
    where crianca_id = 'cccccccc-0000-0000-0000-000000000001'
      and estorna_evento_id is null)
    = (select valor from motivos_pontuacao where rotulo = 'Ajudou um colega'),
  'valor 999 enviado pelo cliente foi substituído pelo valor do catálogo'
);

-- =============================================================== teste 4
-- Ninguém atualiza nem apaga evento de pontuação. Nem admin.
set "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';

do $$
declare deu_erro boolean := false;
begin
  begin
    update pontuacao_eventos set valor_aplicado = 100;
  exception when others then deu_erro := true;
  end;
  perform espera(deu_erro, 'admin NÃO consegue atualizar evento de pontuação');
end;
$$;

do $$
declare deu_erro boolean := false;
begin
  begin
    delete from pontuacao_eventos;
  exception when others then deu_erro := true;
  end;
  perform espera(deu_erro, 'admin NÃO consegue apagar evento de pontuação');
end;
$$;

-- =============================================================== teste 5
-- Lançar em nome de outra pessoa é recusado.
set "request.jwt.claim.sub" = '33333333-3333-3333-3333-333333333333';

do $$
declare deu_erro boolean := false;
begin
  begin
    insert into pontuacao_eventos (crianca_id, motivo_id, valor_aplicado, lancado_por)
    values ('cccccccc-0000-0000-0000-000000000001',
            (select id from motivos_pontuacao where rotulo = 'Ajudou um colega'), 5,
            '11111111-1111-1111-1111-111111111111');
  exception when others then deu_erro := true;
  end;
  perform espera(deu_erro, 'voluntário não lança ponto em nome de outra pessoa');
end;
$$;

-- =============================================================== teste 6
-- Voluntário não estorna.
do $$
declare deu_erro boolean := false; alvo uuid;
begin
  select id into alvo from pontuacao_eventos where estorna_evento_id is null limit 1;
  begin
    insert into pontuacao_eventos (crianca_id, valor_aplicado, lancado_por, estorna_evento_id)
    values ('cccccccc-0000-0000-0000-000000000001', 0,
            '33333333-3333-3333-3333-333333333333', alvo);
  exception when others then deu_erro := true;
  end;
  perform espera(deu_erro, 'voluntário não estorna lançamento');
end;
$$;

-- =============================================================== teste 7
-- Coordenador estorna, e o estorno zera o efeito.
set "request.jwt.claim.sub" = '22222222-2222-2222-2222-222222222222';

insert into pontuacao_eventos (crianca_id, valor_aplicado, lancado_por, estorna_evento_id)
select 'cccccccc-0000-0000-0000-000000000001', 0,
       '22222222-2222-2222-2222-222222222222', id
  from pontuacao_eventos where estorna_evento_id is null limit 1;

select espera(
  (select coalesce(sum(valor_aplicado), 0) from pontuacao_eventos
    where crianca_id = 'cccccccc-0000-0000-0000-000000000001') = 0,
  'estorno zera o efeito e mantém os dois eventos'
);

select espera(
  (select count(*) from pontuacao_eventos
    where crianca_id = 'cccccccc-0000-0000-0000-000000000001') = 2,
  'os dois eventos continuam visíveis no extrato'
);

-- =============================================================== teste 8
-- Mudar o catálogo não reescreve o passado.
set "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
update motivos_pontuacao set valor = 50 where rotulo = 'Ajudou um colega';

select espera(
  (select valor_aplicado from pontuacao_eventos
    where motivo_id = (select id from motivos_pontuacao where rotulo = 'Ajudou um colega')) = 5
    and (select valor from motivos_pontuacao where rotulo = 'Ajudou um colega') = 50,
  'catálogo mudou para 50 e o lançamento antigo continua valendo 5'
);

-- =============================================================== teste 9
-- Não-admin não se promove a admin.
set "request.jwt.claim.sub" = '33333333-3333-3333-3333-333333333333';

do $$
declare deu_erro boolean := false;
begin
  begin
    update perfis set is_admin = true
      where id = '33333333-3333-3333-3333-333333333333';
  exception when others then deu_erro := true;
  end;
  perform espera(deu_erro, 'voluntário não se promove a administrador');
end;
$$;

-- ============================================================== teste 10
-- Ciclo na árvore de áreas é recusado.
set "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';

do $$
declare deu_erro boolean := false;
begin
  begin
    update areas set parent_id = 'aaaaaaaa-0000-0000-0000-000000000002'
      where id = 'aaaaaaaa-0000-0000-0000-000000000001';
  exception when others then deu_erro := true;
  end;
  perform espera(deu_erro, 'mover área para dentro da própria descendência é recusado');
end;
$$;

-- ============================================================== teste 11
-- anon não alcança nada.
reset role;
set role anon;

do $$
declare deu_erro boolean := false;
begin
  begin
    perform count(*) from criancas;
  exception when others then deu_erro := true;
  end;
  perform espera(deu_erro, 'anon não lê criancas');
end;
$$;

do $$
declare deu_erro boolean := false;
begin
  begin
    perform count(*) from criancas_dados_sensiveis;
  exception when others then deu_erro := true;
  end;
  perform espera(deu_erro, 'anon não lê dado sensível');
end;
$$;

reset role;

-- ============================================================== teste 12
-- service_role alcança o necessário para a página pública e a auditoria,
-- e nada além disso.
reset role;
set role service_role;

select espera(
  (select count(*) from ranking_interno) >= 0,
  'service_role lê a view de ranking (página pública)'
);

do $$
declare deu_erro boolean := false;
begin
  begin
    insert into auditoria (acao, entidade, entidade_id, sensivel)
    values ('teste', 'nenhuma', 'x', false);
  exception when others then deu_erro := true;
  end;
  perform espera(not deu_erro, 'service_role grava no log de auditoria');
end;
$$;

do $$
declare deu_erro boolean := false;
begin
  begin
    perform count(*) from criancas_dados_sensiveis;
  exception when others then deu_erro := true;
  end;
  perform espera(deu_erro, 'service_role NÃO alcança dado sensível de criança');
end;
$$;

do $$
declare deu_erro boolean := false;
begin
  begin
    delete from auditoria;
  exception when others then deu_erro := true;
  end;
  perform espera(deu_erro, 'service_role não apaga log de auditoria');
end;
$$;

reset role;

-- ============================================================== teste 13
-- O nome que vai para a internet é derivado, nunca o nome completo.
select espera(
  nome_publico('Maria Fictícia Exemplo') = 'Maria E.',
  'nome público reduz "Maria Fictícia Exemplo" para "Maria E."'
);

select espera(
  nome_publico('Joana') = 'Joana',
  'nome com uma palavra só continua inteiro'
);

select espera(
  (select nome_publico from ranking_interno
    where crianca_id = 'cccccccc-0000-0000-0000-000000000001') = 'Maria E.',
  'a view de ranking expõe o nome derivado'
);

\echo ''
\echo 'Todos os testes passaram.'
