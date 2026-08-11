/**
 * Relatório pré-consulta — os itens 1 a 7e da seção 12, cada um nascendo
 * do campo que a tabela de rastreabilidade de MODELO-DE-DADOS.md aponta.
 * Módulo puro: recebe as linhas consultadas, devolve o relatório montado.
 */
import seed from "../../protocolo/seed.json" with { type: "json" };
import { adesao, diasComRegistro, type Evento as EventoAdesao } from "./adesao.ts";

export type Evento = EventoAdesao & { dados: Record<string, any> };
export type Prescricao = {
  id: string;
  comportamento_id: string;
  rotulo: string;
  regime: "agendado" | "oportunistico";
  alvo_por_semana: number | null;
  confianca: number;
  importancia: number;
  iniciada_em: string;
  encerrada_em: string | null;
};
export type Aplicacao = {
  prescricao_id: string | null;
  instrumento: string;
  aplicado_em: string;
  resultado: Record<string, any>;
};
export type Problema = {
  frase: string;
  escolhida: string | null;
  resolvido_em: string | null;
  revisoes: string[]; // resultados, em ordem
};

const REGRAS: { adesao_min: number; semanas: number; acao: string }[] =
  (seed as any).regras_revisao;

export function condutaCalculada(valor: number | null): string {
  if (valor === null) return "sem registro — verificar taxa de registro, nao reduzir";
  for (const r of REGRAS) if (valor >= r.adesao_min) return r.acao;
  return REGRAS[REGRAS.length - 1].acao;
}

export function relatorio(dados: {
  prescricoes: Prescricao[];
  eventos: Evento[];
  aplicacoes: Aplicacao[];
  problemas: Problema[];
  estadosComAlternativa: string[]; // estados presentes em cardapio_itens
  restricaoRigida: string;
  agora?: Date;
}) {
  const agora = dados.agora ?? new Date();
  const semanasAtras = (n: number) => new Date(agora.getTime() - n * 7 * 86400_000);
  const ativas = dados.prescricoes.filter((p) => !p.encerrada_em);

  // 1 — adesão por comportamento, 2 e 4 semanas, com conduta calculada.
  // A regra do seed revisa APÓS as semanas da janela: prescrição mais nova
  // que isso ainda não tem o que revisar, e "reduzir" seria ruído.
  const janelaRegra = Math.max(...REGRAS.map((r) => r.semanas));
  const adesaoPorComportamento = ativas.map((p) => {
    const a2 = adesao(p, dados.eventos, semanasAtras(2), agora);
    const a4 = adesao(p, dados.eventos, semanasAtras(4), agora);
    const idadeSemanas = (agora.getTime() - new Date(p.iniciada_em).getTime()) / (7 * 86400_000);
    const conduta = idadeSemanas < janelaRegra
      ? "recem-prescrita — revisar apos 2 semanas"
      : condutaCalculada(a2);
    return { prescricao: p, semanas2: a2, semanas4: a4, conduta };
  });

  // 2 e 7b — lapsos agrupados por situação; concentração é sinal
  const lapsos = dados.eventos.filter((e) => e.tipo === "lapso");
  const lapsosPorSituacao = new Map<string, number>();
  for (const e of lapsos) {
    const s = e.dados.situacao_id ?? "sem_situacao";
    lapsosPorSituacao.set(s, (lapsosPorSituacao.get(s) ?? 0) + 1);
  }
  const lapsosConcentrados = [...lapsosPorSituacao.entries()].filter(
    ([s, n]) => s !== "sem_situacao" && lapsos.length >= 3 && n / lapsos.length >= 0.5,
  );

  // 3 — tendência de automaticidade: série do SRBAI por prescrição
  const srbai = new Map<string, { aplicado_em: string; escore: number }[]>();
  for (const a of dados.aplicacoes.filter((a) => a.instrumento === "srbai" && a.prescricao_id)) {
    const serie = srbai.get(a.prescricao_id!) ?? [];
    serie.push({ aplicado_em: a.aplicado_em, escore: a.resultado.escore ?? a.resultado.media });
    srbai.set(a.prescricao_id!, serie.sort((x, y) => x.aplicado_em.localeCompare(y.aplicado_em)));
  }

  // 5 — TFEQ-14 e DEAS-s com a medida anterior ao lado
  const serieInstrumento = (nome: string) =>
    dados.aplicacoes
      .filter((a) => a.instrumento === nome)
      .sort((x, y) => y.aplicado_em.localeCompare(x.aplicado_em))
      .slice(0, 2); // atual e anterior

  // 7a — queda abrupta na taxa de registro: semana atual vs média das 3 anteriores
  const diasSemana = [0, 1, 2, 3].map((i) =>
    diasComRegistro(dados.eventos, semanasAtras(i + 1), semanasAtras(i)),
  );
  const mediaAnteriores = (diasSemana[1] + diasSemana[2] + diasSemana[3]) / 3;
  const quedaDeRegistro = mediaAnteriores >= 3 && diasSemana[0] <= mediaAnteriores / 2;

  // 7c — confiança que caiu entre prescrições sucessivas do mesmo comportamento
  const confiancaCaiu: { comportamento_id: string; de: number; para: number }[] = [];
  const porComportamento = new Map<string, Prescricao[]>();
  for (const p of dados.prescricoes) {
    const lista = porComportamento.get(p.comportamento_id) ?? [];
    lista.push(p);
    porComportamento.set(p.comportamento_id, lista);
  }
  for (const [cid, lista] of porComportamento) {
    lista.sort((x, y) => x.iniciada_em.localeCompare(y.iniciada_em));
    for (let i = 1; i < lista.length; i++)
      if (lista[i].confianca < lista[i - 1].confianca)
        confiancaCaiu.push({ comportamento_id: cid, de: lista[i - 1].confianca, para: lista[i].confianca });
  }

  // 7d — campo livre de lapso com texto: vai inteiro, quem julga é o profissional
  const textosLivres = lapsos
    .filter((e) => e.dados.texto)
    .map((e) => ({ ocorrido_em: e.ocorrido_em, texto: e.dados.texto as string }));

  // 7e — estado emocional recorrente sem alternativa no cardápio
  const estadosRelatados = new Map<string, number>();
  for (const e of dados.eventos.filter((e) => e.tipo === "fome_ou_gatilho")) {
    const r = e.dados.resposta;
    if (r && r !== "fome" && r !== "nao_sei")
      estadosRelatados.set(r, (estadosRelatados.get(r) ?? 0) + 1);
  }
  const estadosSemAlternativa = [...estadosRelatados.entries()]
    .filter(([estado, n]) => n >= 2 && !dados.estadosComAlternativa.includes(estado))
    .map(([estado, vezes]) => ({ estado, vezes }));

  return {
    adesaoPorComportamento,                                   // 1
    lapsosPorSituacao: [...lapsosPorSituacao.entries()],      // 2
    automaticidade: [...srbai.entries()],                     // 3
    reguas: ativas.map((p) => ({                              // 4
      prescricao_id: p.id, rotulo: p.rotulo,
      confianca: p.confianca, importancia: p.importancia,
    })),
    tfeq14: serieInstrumento("tfeq14"),                       // 5
    deasS: serieInstrumento("deas_s"),
    restricaoRigida: dados.restricaoRigida,
    problemasAbertos: dados.problemas.filter((p) => !p.resolvido_em), // 6
    sinais: {                                                 // 7
      quedaDeRegistro, diasSemana,                            // 7a
      lapsosConcentrados,                                     // 7b
      confiancaCaiu,                                          // 7c
      textosLivres,                                           // 7d
      estadosSemAlternativa,                                  // 7e
      // três revisões sem solução aciona rediagnóstico COM-B (seção 8)
      problemaTravado: dados.problemas.some(
        (p) => !p.resolvido_em && p.revisoes.filter((r) => r === "nao_funcionou").length >= 3,
      ),
    },
  };
}
