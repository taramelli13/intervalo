/**
 * Cálculo de adesão e taxa de registro — as fórmulas de MODELO-DE-DADOS.md.
 *
 * agendado:     adesao = feitos / (alvo_por_semana * semanas), limitado a 1
 * oportunistico: adesao = feitos / (feitos + nao_feitos), indefinida (null) se zero
 *
 * Adesão indefinida NÃO é zero: semana sem registro em comportamento
 * oportunista é gatilho não relatado, e aparece na taxa de registro.
 * Tratar como zero acionaria redução de meta em cima de quem fez o combinado.
 */

export type Evento = {
  prescricao_id: string | null;
  tipo: string;
  ocorrido_em: string; // ISO
  registrado_em: string; // ISO
};

export type Prescricao = {
  id: string;
  regime: "agendado" | "oportunistico";
  alvo_por_semana: number | null;
};

/** Adesão de uma prescrição na janela [inicio, fim). null = indefinida. */
export function adesao(
  p: Prescricao,
  eventos: Evento[],
  inicio: Date,
  fim: Date,
): number | null {
  const na = eventos.filter(
    (e) =>
      e.prescricao_id === p.id &&
      (e.tipo === "feito" || e.tipo === "nao_feito") &&
      new Date(e.ocorrido_em) >= inicio &&
      new Date(e.ocorrido_em) < fim,
  );
  const feitos = na.filter((e) => e.tipo === "feito").length;
  if (p.regime === "agendado") {
    const semanas = (fim.getTime() - inicio.getTime()) / (7 * 86400_000);
    if (p.alvo_por_semana == null || semanas <= 0)
      throw new Error("agendado exige alvo_por_semana e janela positiva");
    return Math.min(feitos / (p.alvo_por_semana * semanas), 1);
  }
  const total = na.length;
  return total === 0 ? null : feitos / total;
}

/** Dias distintos em que o paciente apareceu (registrado_em), no fuso local. */
export function diasComRegistro(eventos: Evento[], inicio: Date, fim: Date): number {
  const dias = new Set<string>();
  for (const e of eventos) {
    const d = new Date(e.registrado_em);
    if (d >= inicio && d < fim)
      dias.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }
  return dias.size;
}
