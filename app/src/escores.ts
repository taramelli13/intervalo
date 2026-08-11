/**
 * Escores dos instrumentos — porte de protocolo/escores.py (D-024).
 *
 * NÃO edite a lógica aqui sem editar o Python junto: as duas versões ficam
 * presas uma à outra pelo fuzzing em test/escores.test.ts, e aos valores
 * publicados pelos autochecks. Soma de Likert comparada com corte publicado
 * dá número plausível e errado (D-015) — por isso isto é código testado.
 */
import seed from "../../protocolo/seed.json" with { type: "json" };

export const INST = (seed as any).instrumentos;

type Item = { n: number; a: number; b: number[] };
export type Resposta = number | null;

/** P(resposta = k) sob o modelo gradual: P(X>=k) - P(X>=k+1). */
function probCategoria(a: number, bs: number[], k: number, theta: number): number {
  const acima = (j: number): number => {
    if (j <= 0) return 1;
    if (j > bs.length) return 0;
    return 1 / (1 + Math.exp(-a * (theta - bs[j - 1])));
  };
  return Math.max(acima(k) - acima(k + 1), 1e-12);
}

/** Escore esperado a posteriori sobre quadratura fixa, prior N(media, desvio). */
function eap(itens: Item[], respostas: Resposta[], media: number, desvio: number): number {
  if (respostas.length !== itens.length)
    throw new Error(`esperados ${itens.length} itens, recebidos ${respostas.length}`);
  if (respostas.every((r) => r === null)) throw new Error("nenhum item respondido");

  // ponytail: quadratura fixa em vez de otimizador — +-4 desvios cobrem a metrica
  const passo = (8 * desvio) / 320;
  let num = 0, den = 0;
  for (let i = 0; i <= 320; i++) {
    const theta = media - 4 * desvio + passo * i;
    const z = (theta - media) / desvio;
    let p = Math.exp(-0.5 * z * z);
    for (let j = 0; j < itens.length; j++) {
      const r = respostas[j];
      if (r === null) continue;
      const item = itens[j];
      if (!(r >= 0 && r <= item.b.length))
        throw new Error(`resposta ${r} fora das categorias do item ${item.n}`);
      p *= probCategoria(item.a, item.b, r, theta);
    }
    num += theta * p;
    den += p;
  }
  return num / den;
}

/** 14 respostas 0..3 (3 = "Totalmente verdade"). */
export function tfeq14(respostas: Resposta[]): { escore: number; padrao: string } {
  const inst = INST.tfeq14;
  const escore = eap(inst.itens, respostas, inst.metrica.media, inst.metrica.desvio);
  for (const corte of inst.cortes)
    if (corte.acima_de === null || escore > corte.acima_de)
      return { escore, padrao: corte.padrao };
  throw new Error("cortes do TFEQ nao cobrem todo o intervalo");
}

/** 17 respostas, cada uma 0..(n_categorias-1). */
export function deasS(respostas: Resposta[]): {
  theta: number; exibicao: number; disfuncional: boolean;
} {
  const inst = INST.deas_s;
  const theta = eap(inst.itens, respostas, inst.metrica.media, inst.metrica.desvio);
  return { theta, exibicao: exibicaoDeas(theta), disfuncional: theta >= inst.corte.acima_ou_igual };
}

/** Converte theta para a escala de exibição publicada, interpolando entre as âncoras. */
function exibicaoDeas(theta: number): number {
  const pares: [number, number][] = INST.deas_s.escala_de_exibicao.pares;
  if (theta <= pares[0][0]) return pares[0][1];
  for (let i = 1; i < pares.length; i++) {
    const [t0, v0] = pares[i - 1];
    const [t1, v1] = pares[i];
    if (theta <= t1) return v0 + ((v1 - v0) * (theta - t0)) / (t1 - t0);
  }
  return pares[pares.length - 1][1];
}

/** 16 escolhas, índice da alternativa marcada em cada item. */
export function ecap(escolhas: number[]): { soma: number; faixa: string } {
  const itens = INST.ecap.itens;
  if (escolhas.length !== itens.length)
    throw new Error(`esperados ${itens.length} itens, recebidos ${escolhas.length}`);
  let soma = 0;
  for (let j = 0; j < itens.length; j++) {
    const item = itens[j], escolha = escolhas[j];
    if (!(escolha >= 0 && escolha < item.alternativas.length))
      throw new Error(`alternativa ${escolha} nao existe no item ${item.n}`);
    soma += item.alternativas[escolha].pontos;
  }
  for (const faixa of INST.ecap.faixas)
    if (faixa.acima_de === null || soma > faixa.acima_de)
      return { soma, faixa: faixa.rotulo };
  throw new Error("faixas da ECAP nao cobrem todo o intervalo");
}
