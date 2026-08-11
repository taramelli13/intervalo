/**
 * Tela do paciente: registrar em poucos toques, no momento do gatilho.
 * A fila local grava antes de qualquer rede (D-023); o texto quando/então da
 * prescrição é a "notificação" da v1 — contextual, sem push, sem cobrança.
 */
import seed from "../../protocolo/seed.json" with { type: "json" };
import { sb, enviarEventos, exigeSessao } from "./supabase.ts";
import { criaFila, storeIndexedDB, ligaSincronizacao } from "./fila.ts";
import { CONSENTIMENTO_VERSAO, CONSENTIMENTO_TEXTO } from "./consentimento.ts";

const SITUACOES: { id: string; rotulo: string }[] = (seed as any).situacoes_ancora;
const app = document.getElementById("app")!;
const barra = document.getElementById("estado")!;

type Boot = {
  paciente: any;
  prescricoes: any[];
  cardapio: any[];
  planos: any[];
};

// bootstrap com cache: se a rede faltar na abertura, registra-se com o que
// foi visto da última vez — consultar histórico é que exige conexão (D-023)
async function carrega(): Promise<Boot> {
  try {
    const [pac, presc, card, planos] = await Promise.all([
      sb.from("pacientes").select("*").single(),
      sb.from("prescricoes").select("*").is("encerrada_em", null).order("iniciada_em"),
      sb.from("cardapio_itens").select("*"),
      sb.from("planos_enfrentamento").select("*").is("encerrado_em", null),
    ]);
    if (pac.error) throw pac.error;
    const boot: Boot = {
      paciente: pac.data,
      prescricoes: presc.data ?? [],
      cardapio: card.data ?? [],
      planos: planos.data ?? [],
    };
    localStorage.setItem("boot", JSON.stringify(boot));
    return boot;
  } catch (e) {
    const cache = localStorage.getItem("boot");
    if (!cache) throw e;
    return JSON.parse(cache);
  }
}

const fila = criaFila(await storeIndexedDB(), enviarEventos);
await exigeSessao().catch(() => new Promise(() => {})); // redirecionando: para tudo
const boot = await carrega();
ligaSincronizacao(fila);

async function registra(tipo: string, dados: Record<string, unknown> = {}, prescricao_id: string | null = null) {
  await fila.registrar({
    paciente_id: boot.paciente.id,
    prescricao_id,
    tipo,
    dados,
    ocorrido_em: new Date().toISOString(),
  });
  toque();
  atualizaBarra();
}

function toque() {
  const t = document.createElement("div");
  t.className = "on";
  t.id = "estado";
  t.textContent = "registrado ✓";
  t.style.cssText = "position:fixed;bottom:1rem;left:50%;transform:translateX(-50%);padding:.5rem 1rem;border-radius:8px;";
  document.body.append(t);
  setTimeout(() => t.remove(), 1500);
}

async function atualizaBarra() {
  const pendentes = (await fila.pendentes()).length;
  const on = navigator.onLine;
  barra.className = on ? "on" : "off";
  barra.textContent = on
    ? pendentes
      ? `conectado — enviando ${pendentes} registro(s)`
      : "conectado"
    : `sem conexão — ${pendentes} registro(s) guardado(s) no aparelho`;
}
setInterval(atualizaBarra, 3000);
atualizaBarra();

// ── consentimento primeiro (LGPD, seção 13) ─────────────────────────
function telaConsentimento() {
  app.innerHTML = `
    <h1>Antes de começar</h1>
    ${CONSENTIMENTO_TEXTO.split("\n\n").map((p) => `<p>${p}</p>`).join("")}
    <button class="primario" id="aceitar">Li e aceito</button>
    <p><small>Versão ${CONSENTIMENTO_VERSAO}. Você pode revogar quando quiser, nesta tela.</small></p>`;
  document.getElementById("aceitar")!.onclick = async () => {
    const { error } = await sb.rpc("aceitar_consentimento", { versao: CONSENTIMENTO_VERSAO });
    if (error) return alert("Sem conexão — o aceite precisa de internet. Tente de novo.");
    boot.paciente.consentimento_em = new Date().toISOString();
    boot.paciente.consentimento_revogado_em = null;
    telaPrincipal();
  };
}

function telaRevogado() {
  app.innerHTML = `
    <h1>Registro encerrado</h1>
    <p>Você revogou o consentimento, então o app não registra mais nada.
    Isso não afeta o seu atendimento em consulta.</p>
    <button id="voltar">Voltar a usar o app</button>`;
  document.getElementById("voltar")!.onclick = telaConsentimento;
}

// ── a tela de registro ──────────────────────────────────────────────
function telaPrincipal() {
  const semNumeros = boot.paciente.sem_numeros;
  app.innerHTML = `
    ${boot.prescricoes.length ? "" : `<p class="aviso">Nenhum comportamento combinado ainda — isso acontece na consulta.</p>`}
    ${boot.prescricoes.map((p) => `
      <div class="cartao">
        <p class="quando">${p.meta_quando}…</p>
        <p><b>${p.meta_entao}</b></p>
        <button class="primario" data-feito="${p.id}">Feito</button>
        <button data-nao="${p.id}">Não foi</button>
      </div>`).join("")}

    <h2>Momentos</h2>
    <button id="lapso">Saí do combinado</button>
    <button id="fome">Fome ou vontade?</button>
    <button id="surfar">Surfar o desejo (2 min)</button>
    ${semNumeros ? "" : `<button id="escala">Fome antes/depois</button>`}
    ${boot.paciente.peso_liberado && !semNumeros ? `<button id="peso">Peso</button>` : ""}

    ${boot.cardapio.length ? `
      <h2>Suas alternativas</h2>
      ${boot.cardapio.map((c) => `
        <div class="cartao"><span class="mudo">${c.estado}:</span> ${c.texto}
        <button data-cardapio="${c.id}" data-estado="${c.estado}">Usei</button></div>`).join("")}` : ""}

    ${boot.planos.length ? `
      <h2>Seus planos</h2>
      ${boot.planos.map((p) => `<div class="cartao"><span class="mudo">Se</span> ${p.situacao_texto ?? rotuloSituacao(p.situacao_id)} <span class="mudo">então</span> ${p.plano}</div>`).join("")}` : ""}

    <h2>Seus dados</h2>
    <button id="exportar">Exportar meus dados</button>
    <button id="revogar">Revogar consentimento</button>
    <p><small>Exclusão definitiva: peça ao seu nutricionista, que apaga tudo, inclusive respostas de questionários.</small></p>
    <div id="dialogo"></div>`;

  for (const b of app.querySelectorAll<HTMLButtonElement>("[data-feito]"))
    b.onclick = () => registra("feito", {}, b.dataset.feito!);
  for (const b of app.querySelectorAll<HTMLButtonElement>("[data-nao]"))
    b.onclick = () => registra("nao_feito", {}, b.dataset.nao!);
  for (const b of app.querySelectorAll<HTMLButtonElement>("[data-cardapio]"))
    b.onclick = () => registra("cardapio_usado", { estado: b.dataset.estado, item: b.dataset.cardapio });

  document.getElementById("lapso")!.onclick = dialogoLapso;
  document.getElementById("fome")!.onclick = dialogoFome;
  document.getElementById("surfar")!.onclick = dialogoSurfar;
  document.getElementById("escala")?.addEventListener("click", dialogoEscala);
  document.getElementById("peso")?.addEventListener("click", dialogoPeso);
  document.getElementById("exportar")!.onclick = exporta;
  document.getElementById("revogar")!.onclick = revoga;
}

const rotuloSituacao = (id: string | null) =>
  SITUACOES.find((s) => s.id === id)?.rotulo ?? id ?? "";

function abreDialogo(html: string): HTMLDialogElement {
  const alvo = document.getElementById("dialogo")!;
  alvo.innerHTML = `<dialog>${html}<p><button class="fechar">Fechar</button></p></dialog>`;
  const d = alvo.querySelector("dialog")!;
  d.querySelector<HTMLButtonElement>(".fechar")!.onclick = () => d.close();
  d.showModal();
  return d;
}

// lapso: situação e texto opcionais — pular não gera cobrança
function dialogoLapso() {
  const d = abreDialogo(`
    <h2>Aconteceu, e tudo bem</h2>
    <p>Um episódio não desfaz o caminho. Se quiser, marque onde foi:</p>
    <select id="sit"><option value="">— prefiro não marcar —</option>
      ${SITUACOES.map((s) => `<option value="${s.id}">${s.rotulo}</option>`).join("")}</select>
    <textarea id="txt" rows="2" placeholder="Se quiser, escreva o que percebeu (opcional)"></textarea>
    <button class="primario" id="ok">Registrar</button>`);
  d.querySelector<HTMLButtonElement>("#ok")!.onclick = () => {
    const situacao = (d.querySelector("#sit") as HTMLSelectElement).value;
    const texto = (d.querySelector("#txt") as HTMLTextAreaElement).value.trim();
    registra("lapso", {
      ...(situacao && { situacao_id: situacao }),
      ...(texto && { texto }),
    });
    d.close();
  };
}

function dialogoFome() {
  const opcoes = ["fome", "ansiedade", "tedio", "cansaco", "raiva", "comemoracao", "nao_sei"];
  const rotulos: Record<string, string> = {
    fome: "Fome mesmo", ansiedade: "Ansiedade", tedio: "Tédio", cansaco: "Cansaço",
    raiva: "Raiva", comemoracao: "Comemoração", nao_sei: "Não sei",
  };
  const d = abreDialogo(`
    <h2>O que é agora?</h2>
    ${opcoes.map((o) => `<button data-r="${o}">${rotulos[o]}</button>`).join("")}
    <p id="comeu" hidden>E aí: <button data-c="true">Comi</button> <button data-c="false">Não comi</button></p>`);
  let resposta = "";
  for (const b of d.querySelectorAll<HTMLButtonElement>("[data-r]"))
    b.onclick = () => {
      resposta = b.dataset.r!;
      (d.querySelector("#comeu") as HTMLElement).hidden = false;
    };
  for (const b of d.querySelectorAll<HTMLButtonElement>("[data-c]"))
    b.onclick = () => {
      // a resposta é o dado, não o freio: as duas saídas são registradas igual
      registra("fome_ou_gatilho", { resposta, comeu: b.dataset.c === "true" });
      d.close();
    };
}

function dialogoSurfar() {
  const d = abreDialogo(`
    <h2>Surfar o desejo</h2>
    <p>A vontade sobe, faz pico e desce sozinha. Dois minutos observando, sem lutar.</p>
    <p style="font-size:2rem;text-align:center" id="tempo">2:00</p>
    <p id="fim" hidden>O que você decidiu? <button data-d="comi">Comi</button> <button data-d="passou">Passou</button></p>`);
  let restante = 120;
  const timer = setInterval(() => {
    restante--;
    d.querySelector("#tempo")!.textContent =
      `${Math.floor(restante / 60)}:${String(restante % 60).padStart(2, "0")}`;
    if (restante <= 0) {
      clearInterval(timer);
      (d.querySelector("#fim") as HTMLElement).hidden = false;
    }
  }, 1000);
  d.addEventListener("close", () => clearInterval(timer));
  for (const b of d.querySelectorAll<HTMLButtonElement>("[data-d]"))
    b.onclick = () => {
      // as duas decisões aceitas sem comentário
      registra("surfar_desejo", { concluiu: restante <= 0, decisao: b.dataset.d });
      d.close();
    };
}

function dialogoEscala() {
  const d = abreDialogo(`
    <h2>Fome de 0 a 10</h2>
    <p><label><input type="radio" name="m" value="antes" checked> Antes de comer</label>
       <label><input type="radio" name="m" value="depois"> Depois de comer</label></p>
    <input type="range" id="v" min="0" max="10" value="5" list="marcas">
    <p style="text-align:center" id="mostra">5</p>
    <button class="primario" id="ok">Registrar</button>`);
  const faixa = d.querySelector("#v") as HTMLInputElement;
  faixa.oninput = () => (d.querySelector("#mostra")!.textContent = faixa.value);
  d.querySelector<HTMLButtonElement>("#ok")!.onclick = () => {
    const momento = (d.querySelector("input[name=m]:checked") as HTMLInputElement).value;
    registra("fome_saciedade", { momento, valor: Number(faixa.value) });
    d.close();
  };
}

function dialogoPeso() {
  const d = abreDialogo(`
    <h2>Peso</h2>
    <input type="number" id="v" step="0.1" min="20" max="400" placeholder="kg">
    <button class="primario" id="ok">Registrar</button>`);
  d.querySelector<HTMLButtonElement>("#ok")!.onclick = () => {
    const v = Number((d.querySelector("#v") as HTMLInputElement).value);
    if (!v) return;
    registra("peso", { valor: v }); // nunca entra em cálculo de adesão
    d.close();
  };
}

// ── LGPD: exportação e revogação ────────────────────────────────────
async function exporta() {
  const [eventos] = await Promise.all([sb.from("eventos").select("*").order("ocorrido_em")]);
  if (eventos.error) return alert("Exportar precisa de conexão.");
  const tudo = { exportado_em: new Date().toISOString(), ...boot, eventos: eventos.data };
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(tudo, null, 1)], { type: "application/json" }));
  a.download = "meus-dados-intervalo.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

async function revoga() {
  if (!confirm("Revogar o consentimento encerra os registros no app. Seu atendimento em consulta continua normal. Revogar?")) return;
  const { error } = await sb.rpc("revogar_consentimento");
  if (error) return alert("Revogar precisa de conexão. Tente de novo.");
  boot.paciente.consentimento_revogado_em = new Date().toISOString();
  telaRevogado();
}

// ── entrada ─────────────────────────────────────────────────────────
if (boot.paciente.consentimento_revogado_em) telaRevogado();
else if (!boot.paciente.consentimento_em) telaConsentimento();
else telaPrincipal();
