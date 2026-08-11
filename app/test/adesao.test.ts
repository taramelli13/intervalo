import { test } from "node:test";
import assert from "node:assert/strict";
import { adesao, diasComRegistro, type Evento, type Prescricao } from "../src/adesao.ts";

const dia = (n: number, h = 12) =>
  new Date(Date.UTC(2026, 0, n, h)).toISOString();
const ev = (prescricao_id: string, tipo: string, n: number): Evento => ({
  prescricao_id, tipo, ocorrido_em: dia(n), registrado_em: dia(n),
});
const janela: [Date, Date] = [new Date(Date.UTC(2026, 0, 1)), new Date(Date.UTC(2026, 0, 15))];

const agendado: Prescricao = { id: "p1", regime: "agendado", alvo_por_semana: 7 };
const oportunista: Prescricao = { id: "p2", regime: "oportunistico", alvo_por_semana: null };

test("agendado: feitos sobre alvo x semanas, limitado a 1", () => {
  const eventos = [...Array(7)].map((_, i) => ev("p1", "feito", i + 1));
  assert.equal(adesao(agendado, eventos, ...janela), 0.5); // 7 feitos / (7*2 semanas)
  const cheio = [...Array(20)].flatMap((_, i) => [ev("p1", "feito", i + 1), ev("p1", "feito", i + 1)]);
  assert.equal(adesao(agendado, cheio, ...janela), 1); // limitado a 1
});

test("oportunista: feitos sobre relatados; sem registro e indefinida, nao zero", () => {
  assert.equal(adesao(oportunista, [], ...janela), null);
  const eventos = [ev("p2", "feito", 2), ev("p2", "feito", 3), ev("p2", "nao_feito", 4)];
  assert.equal(adesao(oportunista, eventos, ...janela), 2 / 3);
});

test("so conta feito/nao_feito da prescricao certa, dentro da janela", () => {
  const eventos = [
    ev("p1", "feito", 2),
    ev("p1", "lapso", 3),        // lapso nao entra
    ev("p9", "feito", 4),        // outra prescricao
    ev("p1", "feito", 20),       // fora da janela
  ];
  assert.equal(adesao(agendado, eventos, ...janela), 1 / 14);
});

test("taxa de registro conta dias distintos de registrado_em", () => {
  const eventos = [ev("p1", "feito", 2), ev("p2", "lapso", 2), ev("p1", "nao_feito", 5)];
  assert.equal(diasComRegistro(eventos, ...janela), 2);
});
