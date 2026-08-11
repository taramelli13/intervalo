-- diagnostico_rls.sql — sonda por que papel_atual() devolve NULL.
-- Termina sempre em exceção DIAG (proposital): a mensagem carrega as
-- respostas e a exceção desfaz tudo. Nada fica no banco.

begin;

insert into auth.users (id, instance_id, aud, role, email)
values ('00000000-0000-4000-a000-0000000000d1', '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated', 'diag@x');
insert into perfis values ('00000000-0000-4000-a000-0000000000d1', 'profissional');

-- quantas linhas o papel do editor enxerga, antes de virar authenticated
select set_config('diag.perfis_editor',
  (select count(*)::text from perfis where user_id = '00000000-0000-4000-a000-0000000000d1'), true);
select set_config('diag.papel_editor', current_user, true);

set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub": "00000000-0000-4000-a000-0000000000d1", "role": "authenticated"}', true);

do $$
declare direto text; via_funcao text; rls_count int;
begin
  -- leitura direta: com RLS, a policy perfil_proprio deveria mostrar a própria linha
  select papel into direto from perfis where user_id = auth.uid();
  select count(*) into rls_count from perfis;
  via_funcao := papel_atual();
  raise exception E'DIAG:\n'
    'papel do editor ............... %\n'
    'linha vista pelo editor ....... %\n'
    'usuario apos set role ......... %\n'
    'auth.uid() .................... %\n'
    'linhas de perfis via RLS ...... %\n'
    'papel lido direto ............. %\n'
    'papel via papel_atual() ....... %\n'
    'dono da tabela perfis ......... %\n'
    'dono da funcao papel_atual .... %',
    current_setting('diag.papel_editor', true),
    current_setting('diag.perfis_editor', true),
    current_user,
    coalesce(auth.uid()::text, 'NULO'),
    rls_count,
    coalesce(direto, 'NULO'),
    coalesce(via_funcao, 'NULO'),
    (select r.rolname from pg_class c join pg_roles r on r.oid = c.relowner
      where c.relname = 'perfis' and c.relkind = 'r'),
    (select r.rolname from pg_proc p join pg_roles r on r.oid = p.proowner
      where p.proname = 'papel_atual');
end $$;

rollback;  -- inalcançável (a exceção já desfez), fica por clareza
