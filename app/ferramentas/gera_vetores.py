"""Gera os vetores de fuzzing que travam o porte TypeScript ao escores.py (D-024).

Determinístico: mesma semente, mesmo arquivo. O resultado vai commitado em
app/test/vetores.json para o teste do porte rodar sem Python instalado.

    python app/ferramentas/gera_vetores.py
"""
import json
import random
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ / "protocolo"))
import escores  # noqa: E402

rng = random.Random(1404)  # versão do protocolo como semente
INST = escores.INST

casos = {"tfeq14": [], "deas_s": [], "ecap": []}

itens_t = INST["tfeq14"]["itens"]
for i in range(700):
    r = [rng.randrange(0, len(item["b"]) + 1) for item in itens_t]
    if i >= 600:  # 100 vetores parciais: item pulado é None
        for j in rng.sample(range(len(r)), rng.randrange(1, len(r))):
            r[j] = None
    escore, padrao = escores.tfeq14(r)
    casos["tfeq14"].append({"respostas": r, "escore": escore, "padrao": padrao})

itens_d = INST["deas_s"]["itens"]
for i in range(700):
    r = [rng.randrange(0, len(item["b"]) + 1) for item in itens_d]
    theta, exibicao, disfuncional = escores.deas_s(r)
    casos["deas_s"].append({"respostas": r, "theta": theta,
                            "exibicao": exibicao, "disfuncional": disfuncional})

itens_e = INST["ecap"]["itens"]
for i in range(600):
    r = [rng.randrange(0, len(item["alternativas"])) for item in itens_e]
    soma, faixa = escores.ecap(r)
    casos["ecap"].append({"escolhas": r, "soma": soma, "faixa": faixa})

destino = RAIZ / "app" / "test" / "vetores.json"
destino.parent.mkdir(parents=True, exist_ok=True)
destino.write_text(json.dumps(casos, ensure_ascii=False), encoding="utf-8")
print(f"ok — {sum(len(v) for v in casos.values())} vetores em {destino}")
