import { sb, papel } from "./supabase.ts";

async function encaminha() {
  const p = await papel();
  if (p) location.href = p === "profissional" ? "./profissional.html" : "./paciente.html";
}

// já logado? segue direto
sb.auth.getSession().then(({ data }) => data.session && encaminha());

document.getElementById("login")!.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const f = new FormData(ev.target as HTMLFormElement);
  const erro = document.getElementById("erro")!;
  erro.hidden = true;
  const { error } = await sb.auth.signInWithPassword({
    email: f.get("email") as string,
    password: f.get("senha") as string,
  });
  if (error) {
    erro.textContent = "Não foi possível entrar. Confira e-mail e senha.";
    erro.hidden = false;
    return;
  }
  await encaminha();
});
