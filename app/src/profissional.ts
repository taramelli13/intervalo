/**
 * Tela do profissional: pacientes, prescrição, aplicação de instrumentos e o
 * relatório pré-consulta. Rascunho funcional — o desenho definitivo é a
 * pendência de fase 1 do ROADMAP; aqui o objetivo é a consulta acontecer.
 */
import seed from "../../protocolo/seed.json" with { type: "json" };
import { sb, exigeSessao, papel } from "./supabase.ts";
import { tfeq14, ecap } from "./escores.ts";
import { relatorio } from "./relatorio.ts";

const S = seed as any;
const app = document.getElementById("app")!;

await exigeSessao().catch(() => new Promise(() => {}));
if ((await papel()) !== "profissional") location.href = "./index.html";

// ── lista de pacientes ──────────────────────────────────────────────
async function telaLista() {
  const { data: pacientes, error } = await sb.from("pacientes").select("*").order("nome");
  if (error) {
    app.innerHTML = `<p class="sinal">Sem conexão — esta tela consulta o banco.</p>`;
    return;
  }
  app.innerHTML = `
    <h1>Pacientes</h1>
    ${(pacientes ?? []).map((p) => `
      <div class="cartao"><b>${p.nome}</b>
        ${p.sem_numeros ? `<span class="mudo">· modo sem números</span>` : ""}
        ${p.consentimento_revogado_em ? `<span class="sinal" style="display:inline">consentimento revogado</span>` : ""}
        <br><button data-abre="${p.id}">Abrir</button></div>`).join("")}
    <h2>Novo paciente</h2>
    <form id="novo">
      <label>Nome <input name="nome" required></label>
      <label>Contato <input name="contato"></label>
      <button class="primario">Criar</button>
      <p><small>O acesso do paciente (e-mail e senha) é criado no painel do Supabase e
      vinculado em <code>pacientes.user_id</code> + <code>perfis</code> — duas linhas, uma vez por paciente.</small></p>
    </form>`;
  for (const b of app.querySelectorAll<HTMLButtonElement>("[data-abre]"))
    b.onclick = () => telaPaciente(b.dataset.abre!);
  (document.getElementById("novo") as HTMLFormElement).onsubmit = async (ev) => {
    ev.preventDefault();
    const f = new FormData(ev.target as HTMLFormElement);
    const { error } = await sb.from("pacientes").insert({ nome: f.get("nome"), contato: f.get("contato") });
    if (error) alert(error.message);
    else telaLista();
  };
}

// ── um paciente: ciclo, prescrições, instrumentos, relatório ────────
async function telaPaciente(id: string) {
  const [pac, ciclos, prescricoes] = await Promise.all([
    sb.from("pacientes").select("*").eq("id", id).single(),
    sb.from("ciclos").select("*").eq("paciente_id", id).order("consulta_em", { ascending: false }),
    sb.from("prescricoes").select("*").eq("paciente_id", id).order("iniciada_em"),
  ]);
  const p = pac.data;
  const cicloAberto = (ciclos.data ?? []).find((c: any) => !c.fechado_em);
  const ativas = (prescricoes.data ?? []).filter((x: any) => !x.encerrada_em);
  // invariante 6: o corte do modo sem números roda aqui, na montagem da biblioteca
  const biblioteca = S.comportamentos.filter((c: any) => !(p.sem_numeros && c.requer_numeros));

  app.innerHTML = `
    <p><button id="voltar">← pacientes</button></p>
    <h1>${p.nome}</h1>
    <p class="mudo">fase ${p.fase} · restrição rígida: ${p.restricao_rigida}
      ${p.sem_numeros ? "· <b>modo sem números</b>" : ""}
      ${p.consentimento_em ? "" : "· <b>sem consentimento ainda</b>"}</p>

    <h2>Ciclo</h2>
    ${cicloAberto
      ? `<p>Aberto desde ${cicloAberto.consulta_em} (${cicloAberto.tipo}, protocolo ${cicloAberto.protocolo_versao},
         barreira ${cicloAberto.barreira ?? "—"}, HAPA ${cicloAberto.hapa ?? "—"})</p>`
      : `<p class="aviso">Nenhum ciclo aberto — abra um na consulta.</p>`}
    <form id="novo-ciclo" class="cartao">
      <b>Nova consulta</b> <small>(fecha o ciclo anterior)</small><br>
      <label>Data <input type="date" name="consulta_em" required value="${new Date().toISOString().slice(0, 10)}"></label>
      <label>Tipo <select name="tipo"><option value="inicial">inicial</option><option value="retorno">retorno</option></select></label>
      <label>Barreira (COM-B) <select name="barreira"><option value="">—</option>
        <option>capacidade</option><option>oportunidade</option><option>motivacao</option></select></label>
      <label>Padrão (TFEQ) <select name="padrao"><option value="">—</option>
        <option>regulado</option><option>emocional</option><option>exagerado</option></select></label>
      <label>HAPA <select name="hapa"><option value="">—</option>
        <option>motivacional</option><option>volitiva</option></select></label>
      <button class="primario">Abrir ciclo</button>
    </form>

    <h2>Comportamentos ativos (${ativas.length}/${p.fase === "manutencao" ? 2 : 3})</h2>
    ${ativas.map((a: any) => `
      <div class="cartao"><b>${a.rotulo}</b>${a.reduzida ? " <small>(reduzida)</small>" : ""}<br>
        <span class="mudo">${a.meta_quando} → ${a.meta_entao} · ${a.regime}${a.alvo_por_semana ? ` ${a.alvo_por_semana}x/sem` : ""}
        · confiança ${a.confianca} · importância ${a.importancia}</span><br>
        <select data-motivo="${a.id}"><option value="">encerrar…</option>
          <option>consolidado</option><option>reduzida</option><option>trocada</option><option>fim_do_ciclo</option></select></div>`).join("")}

    ${cicloAberto ? `
    <form id="nova-prescricao" class="cartao">
      <b>Prescrever comportamento</b><br>
      <label>Comportamento <select name="comportamento_id" id="sel-comp">
        ${biblioteca.map((c: any) => `<option value="${c.id}">[${c.categoria}] ${c.rotulo}</option>`).join("")}
      </select></label>
      <label><input type="checkbox" name="reduzida" style="width:auto"> versão reduzida</label>
      <label>Quando <input name="meta_quando" required></label>
      <label>Então <input name="meta_entao" required></label>
      <label>Confiança (0–10) <input type="number" name="confianca" min="0" max="10" required></label>
      <label>Importância (0–10) <input type="number" name="importancia" min="0" max="10" required></label>
      <button class="primario">Prescrever</button>
      <p><small>Regime e alvo vêm do seed; a régua de confiança &lt; 7 pede meta menor.</small></p>
    </form>` : ""}

    <h2>Instrumentos</h2>
    <button data-inst="scoff">SCOFF</button>
    <button data-inst="tfeq14">TFEQ-14</button>
    <button data-inst="ecap">ECAP</button>
    ${ativas.map((a: any) => `<button data-srbai="${a.id}">SRBAI — ${a.rotulo}</button>`).join("")}
    <button disabled title="itens ainda sem redação em português (pendência de fase 0)">DEAS-s</button>
    <div id="form-inst"></div>

    <h2>Relatório pré-consulta</h2>
    <button class="primario" id="gerar">Gerar</button>
    <div id="relatorio"></div>`;

  document.getElementById("voltar")!.onclick = telaLista;

  (document.getElementById("novo-ciclo") as HTMLFormElement).onsubmit = async (ev) => {
    ev.preventDefault();
    const f = new FormData(ev.target as HTMLFormElement);
    if (cicloAberto)
      await sb.from("ciclos").update({ fechado_em: new Date().toISOString() }).eq("id", cicloAberto.id);
    const { error } = await sb.from("ciclos").insert({
      paciente_id: id,
      consulta_em: f.get("consulta_em"),
      tipo: f.get("tipo"),
      protocolo_versao: S.versao,
      barreira: f.get("barreira") || null,
      padrao: f.get("padrao") || null,
      hapa: f.get("hapa") || null,
    });
    if (error) alert(error.message);
    else telaPaciente(id);
  };

  for (const sel of app.querySelectorAll<HTMLSelectElement>("[data-motivo]"))
    sel.onchange = async () => {
      if (!sel.value) return;
      // reduzir abre prescrição nova depois — encerrar é só o primeiro passo
      const { error } = await sb.from("prescricoes")
        .update({ encerrada_em: new Date().toISOString(), motivo_encerramento: sel.value })
        .eq("id", sel.dataset.motivo!);
      if (error) alert(error.message);
      else telaPaciente(id);
    };

  const formPresc = document.getElementById("nova-prescricao") as HTMLFormElement | null;
  if (formPresc)
    formPresc.onsubmit = async (ev) => {
      ev.preventDefault();
      const f = new FormData(formPresc);
      const c = biblioteca.find((c: any) => c.id === f.get("comportamento_id"))!;
      const reduzida = f.get("reduzida") === "on";
      const { error } = await sb.from("prescricoes").insert({
        ciclo_id: cicloAberto!.id,
        paciente_id: id,
        comportamento_id: c.id,
        rotulo: reduzida ? c.versao_reduzida : c.rotulo, // congela o texto lido
        categoria: c.categoria,
        barreira: c.barreira,
        reduzida,
        regime: c.regime_padrao === "oportunistico" ? "oportunistico" : c.regime_padrao,
        alvo_por_semana: c.regime_padrao === "agendado"
          ? (reduzida ? c.reduzida_por_semana : c.alvo_por_semana)
          : null,
        meta_quando: f.get("meta_quando"),
        meta_entao: f.get("meta_entao"),
        confianca: Number(f.get("confianca")),
        importancia: Number(f.get("importancia")),
      });
      if (error) alert(error.message); // o teto de 3/2 é o trigger do banco reclamando
      else telaPaciente(id);
    };

  for (const b of app.querySelectorAll<HTMLButtonElement>("[data-inst]"))
    b.onclick = () => formInstrumento(id, b.dataset.inst!);
  for (const b of app.querySelectorAll<HTMLButtonElement>("[data-srbai]"))
    b.onclick = () => formInstrumento(id, "srbai", b.dataset.srbai!);

  document.getElementById("gerar")!.onclick = () => geraRelatorio(id, p);

  // pré-preenche o quando sugerido ao trocar de comportamento
  const selComp = document.getElementById("sel-comp") as HTMLSelectElement | null;
  if (selComp && formPresc) {
    const preenche = () => {
      const c = biblioteca.find((c: any) => c.id === selComp.value);
      (formPresc.elements.namedItem("meta_quando") as HTMLInputElement).value = c?.gatilho_sugerido ?? "";
      (formPresc.elements.namedItem("meta_entao") as HTMLInputElement).value = c?.rotulo ?? "";
    };
    selComp.onchange = preenche;
    preenche();
  }
}

// ── aplicação de instrumento: respostas item a item + escore derivado ──
function formInstrumento(pacienteId: string, nome: string, prescricaoId?: string) {
  const alvo = document.getElementById("form-inst")!;
  const inst = S.instrumentos[nome];
  let corpo = "";
  if (nome === "scoff")
    corpo = inst.itens.map((t: string, i: number) => `
      <p>${i + 1}. ${t}<br><label><input type="radio" name="i${i}" value="1" required style="width:auto"> Sim</label>
      <label><input type="radio" name="i${i}" value="0" style="width:auto"> Não</label></p>`).join("");
  else if (nome === "tfeq14")
    corpo = inst.itens.map((it: any, i: number) => `
      <p>${it.n}. ${it.texto}<br>${inst.opcoes_padrao.map((o: string, j: number) =>
        `<label><input type="radio" name="i${i}" value="${j}" required style="width:auto"> ${o}</label>`).join(" ")}</p>`).join("");
  else if (nome === "ecap")
    corpo = inst.itens.map((it: any, i: number) => `
      <p><b>Item ${it.n}</b><br>${it.alternativas.map((a: any, j: number) =>
        `<label style="display:block"><input type="radio" name="i${i}" value="${j}" required style="width:auto"> ${a.texto}</label>`).join("")}</p>`).join("");
  else if (nome === "srbai")
    corpo = `<p><i>${inst.enunciado}</i></p>` + inst.itens.map((t: string, i: number) => `
      <p>${t}: <select name="i${i}">${[1, 2, 3, 4, 5, 6, 7].map((v) =>
        `<option value="${v}">${v}</option>`).join("")}</select>
      <small>1 = discordo totalmente · 7 = concordo totalmente</small></p>`).join("");

  alvo.innerHTML = `<form class="cartao"><b>${nome.toUpperCase()}</b>${corpo}
    <button class="primario">Registrar aplicação</button></form>`;
  (alvo.querySelector("form") as HTMLFormElement).onsubmit = async (ev) => {
    ev.preventDefault();
    const f = new FormData(ev.target as HTMLFormElement);
    const n = nome === "scoff" || nome === "srbai" ? inst.itens.length : inst.itens.length;
    const respostas = [...Array(n)].map((_, i) => Number(f.get(`i${i}`)));
    let resultado: Record<string, unknown>;
    if (nome === "scoff") {
      const positivos = respostas.reduce((a, b) => a + b, 0);
      resultado = { positivos, positivo: positivos >= inst.limiar_positivo }; // o trigger liga o modo sem números
    } else if (nome === "tfeq14") {
      const { escore, padrao } = tfeq14(respostas);
      resultado = { escore, padrao, ecap_indicada: escore > inst.cortes[0].acima_de };
    } else if (nome === "ecap") {
      resultado = ecap(respostas) as any;
    } else {
      resultado = { media: respostas.reduce((a, b) => a + b, 0) / respostas.length };
    }
    const { error } = await sb.from("aplicacoes_instrumento").insert({
      paciente_id: pacienteId,
      prescricao_id: prescricaoId ?? null,
      instrumento: nome,
      protocolo_versao: S.versao,
      respostas,
      resultado,
    });
    if (error) alert(error.message);
    else {
      alvo.innerHTML = `<p class="on" style="padding:.5rem .8rem;border-radius:6px">
        Registrado: ${JSON.stringify(resultado)}</p>`;
    }
  };
}

// ── relatório pré-consulta ──────────────────────────────────────────
async function geraRelatorio(id: string, p: any) {
  const [presc, ev, apl, prob, card] = await Promise.all([
    sb.from("prescricoes").select("*").eq("paciente_id", id),
    sb.from("eventos").select("*").eq("paciente_id", id),
    sb.from("aplicacoes_instrumento").select("*").eq("paciente_id", id),
    sb.from("problemas").select("*, problema_revisoes(resultado)").eq("paciente_id", id),
    sb.from("cardapio_itens").select("estado").eq("paciente_id", id),
  ]);
  const r = relatorio({
    prescricoes: presc.data ?? [],
    eventos: ev.data ?? [],
    aplicacoes: apl.data ?? [],
    problemas: (prob.data ?? []).map((x: any) => ({
      frase: x.frase, escolhida: x.escolhida, resolvido_em: x.resolvido_em,
      revisoes: (x.problema_revisoes ?? []).map((r: any) => r.resultado),
    })),
    estadosComAlternativa: [...new Set((card.data ?? []).map((c: any) => c.estado))] as string[],
    restricaoRigida: p.restricao_rigida,
  });

  const pct = (v: number | null) => (v === null ? "—" : `${Math.round(v * 100)}%`);
  const medida = (a: any) => a ? `${JSON.stringify(a.resultado)} <small>(${a.aplicado_em.slice(0, 10)})</small>` : "—";
  const sinais: string[] = [];
  if (r.sinais.quedaDeRegistro)
    sinais.push(`Queda abrupta na taxa de registro: ${r.sinais.diasSemana[0]} dia(s) esta semana vs média ${(r.sinais.diasSemana.slice(1).reduce((a, b) => a + b, 0) / 3).toFixed(1)} nas anteriores`);
  for (const [s, n] of r.sinais.lapsosConcentrados) sinais.push(`Lapsos concentrados: ${n} em "${s}"`);
  for (const c of r.sinais.confiancaCaiu) sinais.push(`Confiança caiu em ${c.comportamento_id}: ${c.de} → ${c.para}`);
  for (const t of r.sinais.textosLivres) sinais.push(`Campo livre (${t.ocorrido_em.slice(0, 10)}): “${t.texto}”`);
  for (const e of r.sinais.estadosSemAlternativa) sinais.push(`${e.estado} relatado ${e.vezes}x sem alternativa no cardápio`);
  if (r.sinais.problemaTravado) sinais.push("Problema com 3 revisões sem solução — rediagnóstico COM-B");

  document.getElementById("relatorio")!.innerHTML = `
    <table><tr><th>Comportamento</th><th>2 sem</th><th>4 sem</th><th>Conduta</th><th>Confiança/Importância</th></tr>
    ${r.adesaoPorComportamento.map((a) => `
      <tr><td>${a.prescricao.rotulo}</td><td>${pct(a.semanas2)}</td><td>${pct(a.semanas4)}</td>
      <td><b>${a.conduta}</b></td><td>${a.prescricao.confianca} / ${a.prescricao.importancia}</td></tr>`).join("")}
    </table>
    <p><b>Lapsos por situação:</b> ${r.lapsosPorSituacao.map(([s, n]) => `${s}: ${n}`).join(" · ") || "nenhum"}</p>
    <p><b>Automaticidade (SRBAI):</b> ${r.automaticidade.map(([pid, serie]) =>
      `${pid.slice(0, 8)}: ${serie.map((s) => s.escore ?? (s as any).media).join(" → ")}`).join(" · ") || "sem série"}</p>
    <p><b>TFEQ-14:</b> ${medida(r.tfeq14[0])} ${r.tfeq14[1] ? `· anterior ${medida(r.tfeq14[1])}` : ""}</p>
    <p><b>DEAS-s:</b> ${medida(r.deasS[0])} · <b>restrição rígida:</b> ${r.restricaoRigida}</p>
    <p><b>Problemas abertos:</b> ${r.problemasAbertos.map((x) => x.frase).join(" · ") || "nenhum"}</p>
    ${sinais.length ? `<h2>Sinais</h2>${sinais.map((s) => `<div class="sinal">${s}</div>`).join("")}` : "<p class='mudo'>Sem sinais de atenção.</p>"}`;
}

telaLista();
