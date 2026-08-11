/**
 * Trava o porte TypeScript ao escores.py: 2000 vetores gerados pelo Python
 * (app/ferramentas/gera_vetores.py) têm que bater aqui. Mesma aritmética em
 * dupla precisão — a tolerância é numérica, não estatística.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import vetores from "./vetores.json" with { type: "json" };
import { tfeq14, deasS, ecap, INST } from "../src/escores.ts";

const TOL = 1e-9;
const perto = (a: number, b: number, msg: string) =>
  assert.ok(Math.abs(a - b) <= TOL * Math.max(1, Math.abs(b)), `${msg}: ${a} != ${b}`);

test("tfeq14 bate com o Python nos 700 vetores", () => {
  for (const c of vetores.tfeq14) {
    const { escore, padrao } = tfeq14(c.respostas);
    perto(escore, c.escore, `tfeq14 ${JSON.stringify(c.respostas)}`);
    assert.equal(padrao, c.padrao);
  }
});

test("deas_s bate com o Python nos 700 vetores", () => {
  for (const c of vetores.deas_s) {
    const { theta, exibicao, disfuncional } = deasS(c.respostas);
    perto(theta, c.theta, `deas_s theta ${JSON.stringify(c.respostas)}`);
    perto(exibicao, c.exibicao, "deas_s exibicao");
    assert.equal(disfuncional, c.disfuncional);
  }
});

test("ecap bate com o Python nos 600 vetores", () => {
  for (const c of vetores.ecap) {
    const { soma, faixa } = ecap(c.escolhas);
    assert.equal(soma, c.soma);
    assert.equal(faixa, c.faixa);
  }
});

// os mesmos autochecks do _demo() do Python: as duas versões ficam presas
// aos valores publicados, não uma à outra
test("autochecks dos valores publicados", () => {
  const n = INST.tfeq14.itens.length;
  const piso = tfeq14(Array(n).fill(0));
  const meio = tfeq14(Array(n).fill(1));
  const teto = tfeq14(Array(n).fill(3));
  assert.ok(piso.escore < meio.escore && meio.escore < teto.escore, "TFEQ-14 nao e monotono");
  assert.equal(piso.padrao, "regulado");
  assert.equal(teto.padrao, "exagerado");
  const parcial = tfeq14([...Array(7).fill(2), ...Array(n - 7).fill(null)]);
  assert.ok(parcial.escore > 10 && parcial.escore < 90, "TFEQ-14 parcial fora da metrica");

  const itensD = INST.deas_s.itens;
  const baixo = deasS(Array(itensD.length).fill(0));
  const alto = deasS(itensD.map((i: { b: number[] }) => i.b.length));
  assert.ok(baixo.theta < alto.theta, "DEAS-s nao e monotono");
  assert.ok(!baixo.disfuncional && alto.disfuncional, "corte 1.5 do DEAS-s nao separa piso e teto");
  assert.ok(baixo.exibicao < alto.exibicao, "escala de exibicao nao acompanha o theta");

  const itensE = INST.ecap.itens;
  const zero = ecap(Array(itensE.length).fill(0));
  const max = ecap(itensE.map((i: { alternativas: unknown[] }) => i.alternativas.length - 1));
  assert.equal(zero.soma, 0);
  assert.equal(zero.faixa, "sem compulsão");
  assert.equal(max.faixa, "compulsão grave");
});
