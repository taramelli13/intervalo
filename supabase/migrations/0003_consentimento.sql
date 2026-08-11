-- 0003_consentimento.sql — aceite e revogação de consentimento pelo próprio
-- paciente (LGPD, seção 13). O paciente não tem update em pacientes; estas
-- duas funções são o único caminho de escrita, e só tocam a própria linha.
--
-- Nota sobre D-025: aquela decisão tirou security definer das POLICIES, onde
-- o resultado dependia do estado da sessão. Aqui é chamada explícita (rpc),
-- determinística e testável — e uma policy de update daria ao paciente a
-- linha inteira, não só as colunas de consentimento.

create function aceitar_consentimento(versao text) returns void
  language sql security definer set search_path = public as $$
    update pacientes
       set consentimento_versao = versao,
           consentimento_em = now(),
           consentimento_revogado_em = null
     where user_id = auth.uid();
  $$;

create function revogar_consentimento() returns void
  language sql security definer set search_path = public as $$
    update pacientes
       set consentimento_revogado_em = now()
     where user_id = auth.uid();
  $$;

revoke execute on function aceitar_consentimento(text) from public, anon;
revoke execute on function revogar_consentimento() from public, anon;
grant execute on function aceitar_consentimento(text) to authenticated;
grant execute on function revogar_consentimento() to authenticated;
