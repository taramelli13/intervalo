-- 0002_policies_sem_funcao.sql — troca as funções security definer por subqueries inline.
--
-- Contexto: no editor hospedado, papel_atual() devolveu NULL no meio do teste de
-- RLS mesmo com a linha presente — e diagnostico_rls.sql provou a função íntegra
-- em isolamento. Comportamento instável não serve de fundação para segurança:
-- as policies passam a ler as tabelas diretamente. O RLS de perfis e pacientes
-- garante que cada um só lê a própria linha, então a subquery inline dá o mesmo
-- resultado sem depender de security definer.

drop policy prof_pacientes   on pacientes;
drop policy prof_ciclos      on ciclos;
drop policy prof_prescricoes on prescricoes;
drop policy prof_planos      on planos_enfrentamento;
drop policy prof_cardapio    on cardapio_itens;
drop policy prof_problemas   on problemas;
drop policy prof_revisoes    on problema_revisoes;
drop policy prof_aplicacoes  on aplicacoes_instrumento;
drop policy prof_eventos_sel on eventos;
drop policy prof_eventos_ins on eventos;
drop policy pac_proprio      on pacientes;
drop policy pac_prescricao   on prescricoes;
drop policy pac_planos       on planos_enfrentamento;
drop policy pac_cardapio     on cardapio_itens;
drop policy pac_eventos_sel  on eventos;
drop policy pac_eventos_ins  on eventos;
drop policy pac_autoaplicado on aplicacoes_instrumento;

drop function papel_atual();
drop function paciente_atual();

-- o profissional: quem tem linha 'profissional' em perfis (a própria, via RLS de perfis)
create policy prof_pacientes on pacientes for all
  using       (exists (select 1 from perfis where user_id = auth.uid() and papel = 'profissional'))
  with check  (exists (select 1 from perfis where user_id = auth.uid() and papel = 'profissional'));
create policy prof_ciclos on ciclos for all
  using       (exists (select 1 from perfis where user_id = auth.uid() and papel = 'profissional'))
  with check  (exists (select 1 from perfis where user_id = auth.uid() and papel = 'profissional'));
create policy prof_prescricoes on prescricoes for all
  using       (exists (select 1 from perfis where user_id = auth.uid() and papel = 'profissional'))
  with check  (exists (select 1 from perfis where user_id = auth.uid() and papel = 'profissional'));
create policy prof_planos on planos_enfrentamento for all
  using       (exists (select 1 from perfis where user_id = auth.uid() and papel = 'profissional'))
  with check  (exists (select 1 from perfis where user_id = auth.uid() and papel = 'profissional'));
create policy prof_cardapio on cardapio_itens for all
  using       (exists (select 1 from perfis where user_id = auth.uid() and papel = 'profissional'))
  with check  (exists (select 1 from perfis where user_id = auth.uid() and papel = 'profissional'));
create policy prof_problemas on problemas for all
  using       (exists (select 1 from perfis where user_id = auth.uid() and papel = 'profissional'))
  with check  (exists (select 1 from perfis where user_id = auth.uid() and papel = 'profissional'));
create policy prof_revisoes on problema_revisoes for all
  using       (exists (select 1 from perfis where user_id = auth.uid() and papel = 'profissional'))
  with check  (exists (select 1 from perfis where user_id = auth.uid() and papel = 'profissional'));
create policy prof_aplicacoes on aplicacoes_instrumento for all
  using       (exists (select 1 from perfis where user_id = auth.uid() and papel = 'profissional'))
  with check  (exists (select 1 from perfis where user_id = auth.uid() and papel = 'profissional'));
-- eventos: só leitura e inserção, o trigger imutavel barra o resto
create policy prof_eventos_sel on eventos for select
  using       (exists (select 1 from perfis where user_id = auth.uid() and papel = 'profissional'));
create policy prof_eventos_ins on eventos for insert
  with check  (exists (select 1 from perfis where user_id = auth.uid() and papel = 'profissional'));

-- o paciente: a própria linha, e o que aponta para ela
create policy pac_proprio on pacientes for select
  using (user_id = auth.uid());
create policy pac_prescricao on prescricoes for select
  using (paciente_id in (select id from pacientes where user_id = auth.uid()));
create policy pac_planos on planos_enfrentamento for select
  using (paciente_id in (select id from pacientes where user_id = auth.uid()));
create policy pac_cardapio on cardapio_itens for select
  using (paciente_id in (select id from pacientes where user_id = auth.uid()));
create policy pac_eventos_sel on eventos for select
  using (paciente_id in (select id from pacientes where user_id = auth.uid()));
create policy pac_eventos_ins on eventos for insert
  with check (paciente_id in (select id from pacientes where user_id = auth.uid()));
-- instrumentos autoaplicados: escreve, nunca lê (invariante 5)
create policy pac_autoaplicado on aplicacoes_instrumento for insert
  with check (paciente_id in (select id from pacientes where user_id = auth.uid())
              and instrumento in ('deas_s', 'srbai'));
