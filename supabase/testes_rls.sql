-- testes_rls.sql — prova que um paciente não enxerga o dado do outro.
-- Rodar no SQL Editor depois da 0001. Tudo dentro de uma transação que
-- desfaz no final: não deixa nada no banco. Sucesso termina com
-- "ok — nenhuma fuga" nas mensagens; falha para com exceção no meio.

begin;

-- ── massa de teste: dois pacientes e o profissional ─────────────────
insert into auth.users (id, instance_id, aud, role, email)
values
  ('00000000-0000-4000-a000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'teste-prof@x'),
  ('00000000-0000-4000-a000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'teste-pac-a@x'),
  ('00000000-0000-4000-a000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'teste-pac-b@x');

insert into perfis values
  ('00000000-0000-4000-a000-000000000001', 'profissional'),
  ('00000000-0000-4000-a000-000000000002', 'paciente'),
  ('00000000-0000-4000-a000-000000000003', 'paciente');

insert into pacientes (id, user_id, nome) values
  ('00000000-0000-4000-b000-00000000000a', '00000000-0000-4000-a000-000000000002', 'Paciente A'),
  ('00000000-0000-4000-b000-00000000000b', '00000000-0000-4000-a000-000000000003', 'Paciente B');

insert into ciclos (id, paciente_id, consulta_em, tipo, protocolo_versao) values
  ('00000000-0000-4000-c000-00000000000a', '00000000-0000-4000-b000-00000000000a', current_date, 'inicial', '1.4.0'),
  ('00000000-0000-4000-c000-00000000000b', '00000000-0000-4000-b000-00000000000b', current_date, 'inicial', '1.4.0');

insert into prescricoes (ciclo_id, paciente_id, comportamento_id, rotulo, categoria, barreira,
                         regime, alvo_por_semana, meta_quando, meta_entao, confianca, importancia)
values
  ('00000000-0000-4000-c000-00000000000a', '00000000-0000-4000-b000-00000000000a',
   'vegetal_almoco', 'Incluir um vegetal no almoço', 'composicao', 'oportunidade',
   'agendado', 7, 'Quando eu montar o prato do almoço', 'incluo um vegetal', 8, 9),
  ('00000000-0000-4000-c000-00000000000b', '00000000-0000-4000-b000-00000000000b',
   'surfar_desejo', 'Observar por dois minutos', 'consciencia', 'capacidade',
   'oportunistico', null, 'Quando bater uma vontade forte', 'observo dois minutos', 7, 8);

insert into eventos (id, paciente_id, ocorrido_em, tipo) values
  ('00000000-0000-4000-e000-00000000000a', '00000000-0000-4000-b000-00000000000a', now(), 'feito'),
  ('00000000-0000-4000-e000-00000000000b', '00000000-0000-4000-b000-00000000000b', now(), 'lapso');

insert into aplicacoes_instrumento (paciente_id, instrumento, protocolo_versao, respostas, resultado)
values ('00000000-0000-4000-b000-00000000000a', 'tfeq14', '1.4.0', '[3,3,3]', '{"escore": 82.2}');

-- ── vira o paciente A e tenta enxergar o mundo ──────────────────────
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub": "00000000-0000-4000-a000-000000000002", "role": "authenticated"}', true);

do $$
begin
  -- vê exatamente um paciente: ele mesmo
  if (select count(*) from pacientes) <> 1
     or not exists (select 1 from pacientes where nome = 'Paciente A') then
    raise exception 'FUGA: paciente A enxerga cadastro alheio';
  end if;
  -- só os próprios eventos e prescrições
  if (select count(*) from eventos) <> 1 or (select count(*) from prescricoes) <> 1 then
    raise exception 'FUGA: paciente A enxerga registro alheio';
  end if;
  -- escore de instrumento é invisível até para o dono (invariante 5)
  if (select count(*) from aplicacoes_instrumento) <> 0 then
    raise exception 'FUGA: paciente enxerga escore de instrumento';
  end if;
  -- e ciclos, planos, problemas do outro: nada
  if (select count(*) from ciclos) <> 0 then
    raise exception 'FUGA: paciente enxerga ciclos (nao ha policy de select para ele)';
  end if;
end $$;

-- não consegue gravar evento em nome do outro
do $$
begin
  insert into eventos (id, paciente_id, ocorrido_em, tipo)
  values (gen_random_uuid(), '00000000-0000-4000-b000-00000000000b', now(), 'feito');
  raise exception 'FUGA: paciente A gravou evento no paciente B';
exception when insufficient_privilege or check_violation then null;
end $$;

-- não consegue apagar nem editar o próprio evento (append-only, D-020)
do $$
begin
  delete from eventos where id = '00000000-0000-4000-e000-00000000000a';
  if found then raise exception 'FUGA: delete de evento passou'; end if;
  update eventos set tipo = 'lapso' where id = '00000000-0000-4000-e000-00000000000a';
  if found then raise exception 'FUGA: update de evento passou'; end if;
exception when raise_exception then
  if sqlerrm like 'FUGA%' then raise; end if;  -- o trigger barrando é o esperado
end $$;

-- não consegue gravar instrumento que não é autoaplicado
do $$
begin
  insert into aplicacoes_instrumento (paciente_id, instrumento, protocolo_versao, respostas, resultado)
  values ('00000000-0000-4000-b000-00000000000a', 'scoff', '1.4.0', '[1]', '{"positivo": true}');
  raise exception 'FUGA: paciente aplicou SCOFF em si mesmo';
exception when insufficient_privilege or check_violation then null;
end $$;

-- ── vira anônimo: não enxerga absolutamente nada ────────────────────
select set_config('request.jwt.claims', '{"role": "anon"}', true);
set local role anon;

do $$
begin
  if (select count(*) from pacientes) + (select count(*) from eventos)
     + (select count(*) from prescricoes) + (select count(*) from aplicacoes_instrumento) <> 0 then
    raise exception 'FUGA: anonimo enxerga dados';
  end if;
end $$;

-- ── vira o profissional: enxerga os dois pacientes ──────────────────
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub": "00000000-0000-4000-a000-000000000001", "role": "authenticated"}', true);

do $$
begin
  if (select count(*) from pacientes) <> 2 or (select count(*) from eventos) <> 2
     or (select count(*) from aplicacoes_instrumento) <> 1 then
    raise exception 'ERRO: profissional nao enxerga a carteira inteira';
  end if;
end $$;

reset role;
do $$ begin raise notice 'ok — nenhuma fuga: paciente so ve o proprio dado, escore invisivel, evento imutavel'; end $$;

rollback;  -- nada disso fica no banco
