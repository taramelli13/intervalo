-- 0001_esquema.sql — derivado de MODELO-DE-DADOS.md, protocolo 1.4.0
-- Aplicar no SQL Editor do Supabase (ou via CLI, quando ela entrar).

-- ── papéis ──────────────────────────────────────────────────────────
-- um profissional (D-022); todo mundo que loga tem uma linha aqui
create table perfis (
  user_id uuid primary key references auth.users (id) on delete cascade,
  papel   text not null check (papel in ('profissional', 'paciente'))
);

create function papel_atual() returns text
  language sql stable security definer set search_path = public
  as $$ select papel from perfis where user_id = auth.uid() $$;

-- ── paciente ────────────────────────────────────────────────────────
create table pacientes (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid unique references auth.users (id),
  nome      text not null,
  contato   text,
  criado_em timestamptz not null default now(),
  fase      text not null default 'mudanca' check (fase in ('mudanca', 'manutencao')),
  -- derivado da triagem: escrito por trigger, nunca por edição direta (invariante 3)
  sem_numeros        boolean not null default false,
  sem_numeros_origem uuid,
  sem_numeros_desde  timestamptz,
  -- três valores: não avaliada não é o mesmo que não (consulta.py já trata assim)
  restricao_rigida text not null default 'nao_avaliada'
    check (restricao_rigida in ('sim', 'nao', 'nao_avaliada')),
  peso_liberado      boolean not null default false,
  peso_justificativa text,
  consentimento_versao      text,
  consentimento_em          timestamptz,
  consentimento_revogado_em timestamptz,
  constraint peso_exige_justificativa check (not peso_liberado or peso_justificativa is not null)
);

create function paciente_atual() returns uuid
  language sql stable security definer set search_path = public
  as $$ select id from pacientes where user_id = auth.uid() $$;

-- ── ciclo: o intervalo entre duas consultas ─────────────────────────
create table ciclos (
  id          uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes (id),
  consulta_em date not null,
  tipo        text not null check (tipo in ('inicial', 'retorno')),
  protocolo_versao text not null,  -- o campo que D-004 exige
  barreira text check (barreira in ('capacidade', 'oportunidade', 'motivacao')),
  padrao   text check (padrao in ('regulado', 'emocional', 'exagerado')),
  hapa     text check (hapa in ('motivacional', 'volitiva')),
  fechado_em timestamptz
);

-- ── prescrição: comportamento ativo, com instantâneo do texto ───────
create table prescricoes (
  id          uuid primary key default gen_random_uuid(),
  ciclo_id    uuid not null references ciclos (id),
  paciente_id uuid not null references pacientes (id),
  comportamento_id text not null,          -- id do seed; integridade é do validador (D-019)
  rotulo    text not null,                 -- congelado no momento da prescrição
  categoria text not null,
  barreira  text not null,
  reduzida  boolean not null default false,
  regime    text not null check (regime in ('agendado', 'oportunistico')),
  alvo_por_semana numeric check (
    (regime = 'agendado' and alvo_por_semana > 0 and alvo_por_semana <= 7)
    or (regime = 'oportunistico' and alvo_por_semana is null)),
  meta_quando text not null,               -- dois campos: meta sem gatilho não é salvável
  meta_entao  text not null,
  confianca   int not null check (confianca between 0 and 10),
  importancia int not null check (importancia between 0 and 10),
  iniciada_em  timestamptz not null default now(),
  encerrada_em timestamptz,
  motivo_encerramento text check (motivo_encerramento in
    ('consolidado', 'reduzida', 'trocada', 'fim_do_ciclo'))
);

-- invariante 1: teto de 3 na mudança, 2 na manutenção
create function checa_teto() returns trigger
  language plpgsql security definer set search_path = public as $$
declare teto int;
begin
  select case fase when 'manutencao' then 2 else 3 end into teto
    from pacientes where id = new.paciente_id;
  if (select count(*) from prescricoes
      where paciente_id = new.paciente_id and encerrada_em is null) >= teto then
    raise exception 'teto de % comportamentos simultaneos atingido', teto;
  end if;
  return new;
end $$;
create trigger teto before insert on prescricoes for each row execute function checa_teto();

-- ── plano de enfrentamento, cardápio, problema ──────────────────────
create table planos_enfrentamento (
  id          uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes (id),
  situacao_id    text,   -- do catálogo do seed…
  situacao_texto text,   -- …ou escrita pelo paciente
  plano       text not null,
  criado_em   timestamptz not null default now(),
  encerrado_em timestamptz,
  constraint situacao_de_um_jeito check (situacao_id is not null or situacao_texto is not null)
);

create table cardapio_itens (
  id          uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes (id),
  estado      text not null check (estado in ('ansiedade', 'tedio', 'cansaco', 'raiva', 'tristeza')),
  texto       text not null,
  criado_em   timestamptz not null default now()
);

create table problemas (
  id          uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes (id),
  frase       text not null,   -- concreta: "nas terças chego 21h sem ter almoçado" serve
  opcoes      jsonb not null default '[]',
  escolhida   text,
  criado_em   timestamptz not null default now(),
  resolvido_em timestamptz
);

create table problema_revisoes (
  id          uuid primary key default gen_random_uuid(),
  problema_id uuid not null references problemas (id),
  ciclo_id    uuid not null references ciclos (id),
  resultado   text not null check (resultado in ('funcionou', 'nao_funcionou', 'sem_oportunidade')),
  unique (problema_id, ciclo_id)   -- uma revisão por ciclo (seção 8)
);

-- ── aplicação de instrumento ────────────────────────────────────────
-- resposta item a item é o dado; escore é derivado e recalculável (D-015)
create table aplicacoes_instrumento (
  id          uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes (id),
  prescricao_id uuid references prescricoes (id),   -- só o SRBAI aponta para uma
  instrumento text not null check (instrumento in ('scoff', 'tfeq14', 'ecap', 'deas_s', 'srbai')),
  aplicado_em timestamptz not null default now(),
  protocolo_versao text not null,
  respostas jsonb not null,
  resultado jsonb not null
);

alter table pacientes add constraint sem_numeros_origem_fk
  foreign key (sem_numeros_origem) references aplicacoes_instrumento (id);

-- invariante 3: sem_numeros só muda por aplicação de SCOFF
create function aplica_scoff() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if new.instrumento = 'scoff' then
    update pacientes set
      sem_numeros        = (new.resultado ->> 'positivo')::boolean,
      sem_numeros_origem = new.id,
      sem_numeros_desde  = new.aplicado_em
    where id = new.paciente_id;
  end if;
  return new;
end $$;
create trigger scoff after insert on aplicacoes_instrumento for each row execute function aplica_scoff();

-- ── evento: o log append-only (D-020) ───────────────────────────────
create table eventos (
  id            uuid primary key,        -- gerado no dispositivo: a fila local grava antes de ter conexão (D-023)
  paciente_id   uuid not null references pacientes (id),
  prescricao_id uuid references prescricoes (id),
  ocorrido_em   timestamptz not null,    -- quando aconteceu (relógio do paciente, D-023 manda tolerar)
  registrado_em timestamptz not null default now(),
  tipo  text not null check (tipo in ('feito', 'nao_feito', 'lapso', 'fome_saciedade',
                                      'fome_ou_gatilho', 'surfar_desejo', 'cardapio_usado', 'peso')),
  dados jsonb not null default '{}'
);

-- invariante 4: correção é evento novo. Trigger segura até service_role
create function evento_imutavel() returns trigger
  language plpgsql as $$
begin
  raise exception 'evento e append-only: correcao e evento novo (D-020)';
end $$;
create trigger imutavel before update or delete on eventos for each row execute function evento_imutavel();

-- peso só existe liberado, e nunca em modo sem números (D-007)
create function checa_peso() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if new.tipo = 'peso' and not exists (
      select 1 from pacientes
      where id = new.paciente_id and peso_liberado and not sem_numeros) then
    raise exception 'peso nao esta liberado para este paciente';
  end if;
  return new;
end $$;
create trigger peso before insert on eventos for each row execute function checa_peso();

-- ── RLS: a única coisa entre um paciente e os dados do outro ────────
alter table perfis                 enable row level security;
alter table pacientes              enable row level security;
alter table ciclos                 enable row level security;
alter table prescricoes            enable row level security;
alter table planos_enfrentamento   enable row level security;
alter table cardapio_itens         enable row level security;
alter table problemas              enable row level security;
alter table problema_revisoes      enable row level security;
alter table aplicacoes_instrumento enable row level security;
alter table eventos                enable row level security;

-- cada um lê o próprio papel
create policy perfil_proprio on perfis for select using (user_id = auth.uid());

-- o profissional opera tudo…
create policy prof_pacientes    on pacientes            for all using (papel_atual() = 'profissional') with check (papel_atual() = 'profissional');
create policy prof_ciclos       on ciclos               for all using (papel_atual() = 'profissional') with check (papel_atual() = 'profissional');
create policy prof_prescricoes  on prescricoes          for all using (papel_atual() = 'profissional') with check (papel_atual() = 'profissional');
create policy prof_planos       on planos_enfrentamento for all using (papel_atual() = 'profissional') with check (papel_atual() = 'profissional');
create policy prof_cardapio     on cardapio_itens       for all using (papel_atual() = 'profissional') with check (papel_atual() = 'profissional');
create policy prof_problemas    on problemas            for all using (papel_atual() = 'profissional') with check (papel_atual() = 'profissional');
create policy prof_revisoes     on problema_revisoes    for all using (papel_atual() = 'profissional') with check (papel_atual() = 'profissional');
create policy prof_aplicacoes   on aplicacoes_instrumento for all using (papel_atual() = 'profissional') with check (papel_atual() = 'profissional');
-- …menos alterar evento: só select e insert, o trigger barra o resto
create policy prof_eventos_sel  on eventos for select using (papel_atual() = 'profissional');
create policy prof_eventos_ins  on eventos for insert with check (papel_atual() = 'profissional');

-- o paciente lê o que é dele
create policy pac_proprio    on pacientes            for select using (id = paciente_atual());
create policy pac_prescricao on prescricoes          for select using (paciente_id = paciente_atual());
create policy pac_planos     on planos_enfrentamento for select using (paciente_id = paciente_atual());
create policy pac_cardapio   on cardapio_itens       for select using (paciente_id = paciente_atual());
create policy pac_eventos_sel on eventos             for select using (paciente_id = paciente_atual());

-- e escreve: eventos, e as respostas dos instrumentos autoaplicados.
-- aplicacoes_instrumento NÃO tem select de paciente: escore não é exibido (invariante 5)
create policy pac_eventos_ins on eventos for insert
  with check (paciente_id = paciente_atual());
create policy pac_autoaplicado on aplicacoes_instrumento for insert
  with check (paciente_id = paciente_atual() and instrumento in ('deas_s', 'srbai'));
