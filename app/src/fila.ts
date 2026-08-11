/**
 * Fila local de eventos (D-023): grava primeiro no dispositivo, esvazia
 * quando a conexão volta. Promovida do protótipo validado em
 * prototipos/fila-local/ — modo avião, fechamento do navegador e sync
 * sem duplicar já foram testados no celular.
 *
 * O id do evento nasce aqui, no dispositivo. Duplicata no reenvio é
 * resolvida pela chave primária no banco: conflito de id = já aceito.
 */

export type EventoFila = {
  id: string;
  paciente_id: string;
  prescricao_id: string | null;
  tipo: string;
  dados: Record<string, unknown>;
  ocorrido_em: string;
  registrado_em: string;
};

export type Store = {
  put(e: EventoFila): Promise<void>;
  getAll(): Promise<EventoFila[]>;
  delete(id: string): Promise<void>;
};

/** Envia o lote; devolve os ids aceitos (incluindo os que o banco já tinha). */
export type Enviar = (lote: EventoFila[]) => Promise<string[]>;

export function criaFila(store: Store, enviar: Enviar) {
  let falhas = 0;
  let corrente: Promise<number> = Promise.resolve(0);

  async function passo(): Promise<number> {
    try {
      const fila = await store.getAll();
      if (!fila.length) return 0;
      const aceitos = await enviar(fila);
      for (const id of aceitos) await store.delete(id);
      falhas = 0;
      return aceitos.length;
    } catch {
      falhas++;
      return 0;
    }
  }

  return {
    get falhas() {
      return falhas;
    },
    pendentes: () => store.getAll(),

    async registrar(e: Omit<EventoFila, "id" | "registrado_em">): Promise<EventoFila> {
      const evento: EventoFila = {
        ...e,
        id: crypto.randomUUID(),
        registrado_em: new Date().toISOString(),
      };
      await store.put(evento); // no disco antes de qualquer rede
      this.sincronizar();
      return evento;
    },

    // sincronizações concorrentes entram na fila, não se atropelam nem se perdem
    sincronizar(): Promise<number> {
      corrente = corrente.then(passo);
      return corrente;
    },
  };
}

/** Adaptador IndexedDB — o mesmo esquema do protótipo. */
export async function storeIndexedDB(nome = "fila-eventos"): Promise<Store> {
  const db = await new Promise<IDBDatabase>((ok, erro) => {
    const req = indexedDB.open(nome, 1);
    req.onupgradeneeded = () => req.result.createObjectStore("fila", { keyPath: "id" });
    req.onsuccess = () => ok(req.result);
    req.onerror = () => erro(req.error);
  });
  const tx = (modo: IDBTransactionMode) => db.transaction("fila", modo).objectStore("fila");
  const espera = <T>(req: IDBRequest<T>) =>
    new Promise<T>((ok, erro) => {
      req.onsuccess = () => ok(req.result);
      req.onerror = () => erro(req.error);
    });
  return {
    put: async (e) => void (await espera(tx("readwrite").put(e))),
    getAll: () => espera(tx("readonly").getAll()) as Promise<EventoFila[]>,
    delete: async (id) => void (await espera(tx("readwrite").delete(id))),
  };
}

/** Religa a fila aos sinais do navegador: volta de conexão, volta à aba, e um laço com recuo. */
export function ligaSincronizacao(fila: ReturnType<typeof criaFila>) {
  addEventListener("online", () => fila.sincronizar());
  addEventListener("visibilitychange", () => !document.hidden && fila.sincronizar());
  (async function laco() {
    for (;;) {
      await new Promise((ok) => setTimeout(ok, Math.min(60, 5 * 2 ** fila.falhas) * 1000));
      fila.sincronizar();
    }
  })();
}
