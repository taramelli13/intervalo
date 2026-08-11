import { createClient } from "@supabase/supabase-js";
import type { EventoFila } from "./fila.ts";

export const sb = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

/**
 * Envia o lote da fila. Duplicata de reenvio é resolvida pela chave primária:
 * on conflict do nothing — id que já estava lá conta como aceito (D-023).
 * O trigger de imutabilidade nunca dispara porque nada é atualizado.
 */
export async function enviarEventos(lote: EventoFila[]): Promise<string[]> {
  const { error } = await sb
    .from("eventos")
    .upsert(lote, { onConflict: "id", ignoreDuplicates: true });
  if (error) throw error;
  return lote.map((e) => e.id);
}

/** Sessão atual ou redireciona para o login. */
export async function exigeSessao() {
  const { data } = await sb.auth.getSession();
  if (!data.session) {
    location.href = "./index.html";
    throw new Error("sem sessão");
  }
  return data.session;
}

export async function papel(): Promise<string | null> {
  const { data } = await sb.from("perfis").select("papel").maybeSingle();
  return data?.papel ?? null;
}
