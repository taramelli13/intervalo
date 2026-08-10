"""Escores dos instrumentos do protocolo.

TFEQ-14 e DEAS-s usam o modelo de resposta gradual de Samejima com escore EAP —
o mesmo cálculo, métricas diferentes. ECAP é soma simples com grade de pontos.

NENHUM dos dois escores TRI é soma de respostas: os cortes só valem para o EAP.
Respostas são índices 0..k-1 na ordem em que o item lista as categorias, do menor
para o maior nível do traço.
"""
import json
import math
from pathlib import Path

SEED = json.loads((Path(__file__).parent / "seed.json").read_text(encoding="utf-8"))
INST = SEED["instrumentos"]


def _prob_categoria(a, bs, k, theta):
    """P(resposta = k) sob o modelo gradual: P(X>=k) - P(X>=k+1)."""
    def acima(j):
        if j <= 0:
            return 1.0
        if j > len(bs):
            return 0.0
        return 1.0 / (1.0 + math.exp(-a * (theta - bs[j - 1])))

    return max(acima(k) - acima(k + 1), 1e-12)


def _eap(itens, respostas, media, desvio):
    """Escore esperado a posteriori sobre quadratura fixa, prior N(media, desvio)."""
    if len(respostas) != len(itens):
        raise ValueError(f"esperados {len(itens)} itens, recebidos {len(respostas)}")
    if all(r is None for r in respostas):
        raise ValueError("nenhum item respondido")

    # ponytail: quadratura fixa em vez de otimizador — +-4 desvios cobrem a metrica
    passo = 8 * desvio / 320
    num = den = 0.0
    for i in range(321):
        theta = media - 4 * desvio + passo * i
        z = (theta - media) / desvio
        p = math.exp(-0.5 * z * z)
        for item, r in zip(itens, respostas):
            if r is None:
                continue
            if not 0 <= r <= len(item["b"]):
                raise ValueError(f"resposta {r} fora das categorias do item {item['n']}")
            p *= _prob_categoria(item["a"], item["b"], r, theta)
        num += theta * p
        den += p
    return num / den


def tfeq14(respostas):
    """14 respostas 0..3 (3 = 'Totalmente verdade'). Devolve (escore, padrao)."""
    inst = INST["tfeq14"]
    e = _eap(inst["itens"], respostas, inst["metrica"]["media"], inst["metrica"]["desvio"])
    for corte in inst["cortes"]:
        if corte["acima_de"] is None or e > corte["acima_de"]:
            return e, corte["padrao"]
    raise AssertionError("cortes do TFEQ nao cobrem todo o intervalo")


def deas_s(respostas):
    """17 respostas, cada uma 0..(n_categorias-1). Devolve (theta, exibicao, disfuncional)."""
    inst = INST["deas_s"]
    theta = _eap(inst["itens"], respostas, inst["metrica"]["media"], inst["metrica"]["desvio"])
    return theta, _exibicao_deas(theta), theta >= inst["corte"]["acima_ou_igual"]


def _exibicao_deas(theta):
    """Converte theta para a escala de exibição publicada, interpolando entre as âncoras."""
    pares = INST["deas_s"]["escala_de_exibicao"]["pares"]
    if theta <= pares[0][0]:
        return pares[0][1]
    for (t0, v0), (t1, v1) in zip(pares, pares[1:]):
        if theta <= t1:
            return v0 + (v1 - v0) * (theta - t0) / (t1 - t0)
    return pares[-1][1]


def ecap(escolhas):
    """16 escolhas, índice da alternativa marcada em cada item. Devolve (soma, faixa)."""
    itens = INST["ecap"]["itens"]
    if len(escolhas) != len(itens):
        raise ValueError(f"esperados {len(itens)} itens, recebidos {len(escolhas)}")
    total = 0
    for item, escolha in zip(itens, escolhas):
        if not 0 <= escolha < len(item["alternativas"]):
            raise ValueError(f"alternativa {escolha} nao existe no item {item['n']}")
        total += item["alternativas"][escolha]["pontos"]
    for faixa in INST["ecap"]["faixas"]:
        if faixa["acima_de"] is None or total > faixa["acima_de"]:
            return total, faixa["rotulo"]
    raise AssertionError("faixas da ECAP nao cobrem todo o intervalo")


def _demo():
    n = len(INST["tfeq14"]["itens"])
    piso, _ = tfeq14([0] * n)
    meio, _ = tfeq14([1] * n)
    teto, _ = tfeq14([3] * n)
    assert piso < meio < teto, "TFEQ-14 nao e monotono"
    assert tfeq14([0] * n)[1] == "regulado" and tfeq14([3] * n)[1] == "exagerado"
    crescente = [tfeq14([3] * k + [0] * (n - k))[0] for k in range(n + 1)]
    assert crescente == sorted(crescente), "TFEQ-14 cai ao subir uma resposta"
    parcial, _ = tfeq14([2] * 7 + [None] * (n - 7))
    assert 10 < parcial < 90, f"TFEQ-14 parcial fora da metrica: {parcial}"

    itens_d = INST["deas_s"]["itens"]
    baixo, exib_baixo, disf_baixo = deas_s([0] * len(itens_d))
    alto, exib_alto, disf_alto = deas_s([len(i["b"]) for i in itens_d])
    assert baixo < alto, "DEAS-s nao e monotono"
    assert not disf_baixo and disf_alto, "corte 1.5 do DEAS-s nao separa piso e teto"
    assert exib_baixo < exib_alto, "escala de exibicao do DEAS-s nao acompanha o theta"

    itens_e = INST["ecap"]["itens"]
    zero, faixa_zero = ecap([0] * len(itens_e))
    maximo, faixa_max = ecap([len(i["alternativas"]) - 1 for i in itens_e])
    assert zero == 0 and faixa_zero == "sem compulsão", f"piso da ECAP: {zero}"
    assert faixa_max == "compulsão grave", f"teto da ECAP caiu em {faixa_max}"
    # a grade de pontos e a fonte de verdade: nenhum item pode passar de 3
    for item in itens_e:
        pontos = [a["pontos"] for a in item["alternativas"]]
        assert max(pontos) <= 3 and min(pontos) == 0, f"ECAP item {item['n']}: pontos fora de 0..3"
        assert pontos == sorted(pontos), f"ECAP item {item['n']}: pontos nao crescentes"

    print(f"ok — TFEQ-14 {piso:.1f}..{teto:.1f} (meio {meio:.1f}) · "
          f"DEAS-s {baixo:.2f}..{alto:.2f} theta / {exib_baixo:.1f}..{exib_alto:.1f} exibido · "
          f"ECAP 0..{maximo}")


if __name__ == "__main__":
    _demo()
