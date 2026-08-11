import { test } from "node:test";
import assert from "node:assert/strict";
import { relatorio, condutaCalculada, type Prescricao, type Evento } from "../src/relatorio.ts";

const agora = new Date("2026-02-01T12:00:00Z");
const diasAtras = (n: number, extra: Partial<Evento> = {}): Evento => ({
  prescricao_id: "p1", tipo: "feito", dados: {},
  ocorrido_em: new Date(agora.getTime() - n * 86400_000).toISOString(),
  registrado_em: new Date(agora.getTime() - n * 86400_000).toISOString(),
  ...extra,
});
const presc = (extra: Partial<Prescricao> = {}): Prescricao => ({
  id: "p1", comportamento_id: "talher_pousado", rotulo: "Pousar o talher",
  regime: "agendado", alvo_por_semana: 7, confianca: 8, importancia: 9,
  iniciada_em: "2026-01-01T00:00:00Z", encerrada_em: null, ...extra,
});
const vazio = {
  prescricoes: [] as Prescricao[], eventos: [] as Evento[], aplicacoes: [],
  problemas: [], estadosComAlternativa: [] as string[], restricaoRigida: "nao_avaliada", agora,
};

test("conduta segue as regras_revisao do seed; indefinida nao reduz", () => {
  assert.equal(condutaCalculada(0.9), "progredir");
  assert.equal(condutaCalculada(0.6), "manter");
  assert.equal(condutaCalculada(0.1), "reduzir");
  assert.match(condutaCalculada(null), /nao reduzir/);
});

test("adesao 2 e 4 semanas com conduta, so de prescricao ativa", () => {
  const eventos = [...Array(14)].map((_, i) => diasAtras(i + 1));
  const r = relatorio({ ...vazio, prescricoes: [presc(), presc({ id: "p2", encerrada_em: "2026-01-20T00:00:00Z" })], eventos });
  assert.equal(r.adesaoPorComportamento.length, 1);
  assert.equal(r.adesaoPorComportamento[0].semanas2, 1);
  assert.equal(r.adesaoPorComportamento[0].semanas4, 0.5);
  assert.equal(r.adesaoPorComportamento[0].conduta, "progredir");
});

test("prescricao mais nova que a janela da regra nao recebe conduta de reducao", () => {
  const r = relatorio({
    ...vazio,
    prescricoes: [presc({ iniciada_em: "2026-01-25T00:00:00Z" })], // 1 semana antes de `agora`
  });
  assert.match(r.adesaoPorComportamento[0].conduta, /recem-prescrita/);
});

test("sinal 7b: metade ou mais dos lapsos na mesma situacao", () => {
  const eventos = [
    diasAtras(1, { tipo: "lapso", dados: { situacao_id: "fome_noite" } }),
    diasAtras(2, { tipo: "lapso", dados: { situacao_id: "fome_noite" } }),
    diasAtras(3, { tipo: "lapso", dados: { situacao_id: "fim_de_semana" } }),
  ];
  const r = relatorio({ ...vazio, eventos });
  assert.deepEqual(r.sinais.lapsosConcentrados, [["fome_noite", 2]]);
});

test("sinal 7a: semana atual com metade da media das tres anteriores", () => {
  // 5 dias/semana nas semanas 2-4, nenhum na semana atual
  const eventos = [8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26].map((n) => diasAtras(n));
  const r = relatorio({ ...vazio, eventos });
  assert.equal(r.sinais.quedaDeRegistro, true);
});

test("sinal 7c: confianca caiu entre prescricoes do mesmo comportamento", () => {
  const r = relatorio({
    ...vazio,
    prescricoes: [
      presc({ encerrada_em: "2026-01-15T00:00:00Z" }),
      presc({ id: "p2", confianca: 5, iniciada_em: "2026-01-15T00:00:00Z" }),
    ],
  });
  assert.deepEqual(r.sinais.confiancaCaiu, [{ comportamento_id: "talher_pousado", de: 8, para: 5 }]);
});

test("sinal 7e: estado recorrente sem alternativa no cardapio", () => {
  const eventos = [
    diasAtras(1, { tipo: "fome_ou_gatilho", dados: { resposta: "tedio", comeu: true } }),
    diasAtras(2, { tipo: "fome_ou_gatilho", dados: { resposta: "tedio", comeu: false } }),
    diasAtras(3, { tipo: "fome_ou_gatilho", dados: { resposta: "ansiedade", comeu: true } }),
    diasAtras(4, { tipo: "fome_ou_gatilho", dados: { resposta: "fome", comeu: true } }),
  ];
  const r = relatorio({ ...vazio, eventos, estadosComAlternativa: ["ansiedade"] });
  assert.deepEqual(r.sinais.estadosSemAlternativa, [{ estado: "tedio", vezes: 2 }]);
});

test("problema com tres nao_funcionou aciona rediagnostico", () => {
  const r = relatorio({
    ...vazio,
    problemas: [{ frase: "x", escolhida: "y", resolvido_em: null, revisoes: ["nao_funcionou", "nao_funcionou", "nao_funcionou"] }],
  });
  assert.equal(r.sinais.problemaTravado, true);
});
