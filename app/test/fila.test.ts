import { test } from "node:test";
import assert from "node:assert/strict";
import { criaFila, type EventoFila, type Store } from "../src/fila.ts";

function storeMemoria(): Store & { mapa: Map<string, EventoFila> } {
  const mapa = new Map<string, EventoFila>();
  return {
    mapa,
    put: async (e) => void mapa.set(e.id, e),
    getAll: async () => [...mapa.values()],
    delete: async (id) => void mapa.delete(id),
  };
}

const base = { paciente_id: "pac", prescricao_id: "p1", tipo: "feito", dados: {}, ocorrido_em: "2026-01-01T12:00:00Z" };

test("registrar grava local antes da rede e sincroniza quando ela responde", async () => {
  const store = storeMemoria();
  let rede = false;
  const fila = criaFila(store, async (lote) => {
    if (!rede) throw new Error("offline");
    return lote.map((e) => e.id);
  });

  await fila.registrar(base);
  await fila.registrar(base);
  assert.equal(store.mapa.size, 2); // sobreviveu offline
  assert.equal(fila.falhas >= 1, true);

  rede = true;
  // o retorno é do passo desta chamada; um passo já na corrente pode ter
  // esvaziado antes — o contrato é "depois do await, a fila está vazia"
  await fila.sincronizar();
  assert.equal(store.mapa.size, 0);
  assert.equal(fila.falhas, 0);
});

test("aceito parcial: so sai da fila o que o servidor confirmou", async () => {
  const store = storeMemoria();
  const fila = criaFila(store, async (lote) => lote.slice(0, 1).map((e) => e.id));
  // direto no store, sem o auto-sync do registrar: um envio, aceite parcial
  await store.put({ ...base, id: "a", registrado_em: base.ocorrido_em });
  await store.put({ ...base, id: "b", registrado_em: base.ocorrido_em });
  const enviados = await fila.sincronizar();
  assert.equal(enviados, 1);
  assert.deepEqual([...store.mapa.keys()], ["b"]);
  assert.equal(fila.falhas, 0);
});
