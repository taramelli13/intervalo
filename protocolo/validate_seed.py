"""Trava divergência entre protocolo.md e seed.json. Roda com: python validate_seed.py"""
import json
import re
from pathlib import Path

import escores

AQUI = Path(__file__).parent
seed = json.loads((AQUI / "seed.json").read_text(encoding="utf-8"))


def norm(s):
    """Aspas e travessões tipográficos viram ASCII — o documento e o seed não podem
    divergir só por causa de autoformatação de editor."""
    for a, b in [("“", '"'), ("”", '"'), ("‘", "'"), ("’", "'"),
                 ("—", "-"), ("–", "-")]:
        s = s.replace(a, b)
    return s


doc = norm((AQUI / "protocolo.md").read_text(encoding="utf-8"))


def no_doc(texto, contexto):
    assert norm(texto) in doc, f"{contexto}: ausente do protocolo.md -> {texto[:60]}"


def ids(lista):
    return {item["id"] for item in lista}


def unicos(lista, nome):
    vistos = [item["id"] for item in lista]
    assert len(vistos) == len(set(vistos)), f"ids duplicados em {nome}"


# versão semver, e a mesma nos dois arquivos
assert re.fullmatch(r"\d+\.\d+\.\d+", seed["versao"]), f"versao invalida: {seed['versao']}"
no_doc(f"Versão {seed['versao']}", "versao")

for nome in ("tecnicas", "barreiras", "categorias", "comportamentos", "situacoes_ancora", "padroes"):
    unicos(seed[nome], nome)

tecnicas, barreiras = ids(seed["tecnicas"]), ids(seed["barreiras"])
categorias, padroes = ids(seed["categorias"]), ids(seed["padroes"])

for b in seed["barreiras"]:
    no_doc(b["pergunta_discriminadora"], f"barreira {b['id']}")
    for t in b["tecnicas"]:
        assert t in tecnicas, f"barreira {b['id']} cita tecnica inexistente: {t}"

for t in seed["tecnicas"]:
    no_doc(t["rotulo"], "tecnica")

for c in seed["categorias"]:
    no_doc(c["rotulo"], "categoria")
    assert c["padroes"], f"categoria {c['id']} sem padrao TFEQ — nao entra em filtro nenhum"
    for p in c["padroes"]:
        assert p in padroes, f"categoria {c['id']} cita padrao inexistente: {p}"

for c in seed["comportamentos"]:
    ctx = f"comportamento {c['id']}"
    assert c["barreira"] in barreiras, f"{ctx}: barreira inexistente {c['barreira']}"
    assert c["categoria"] in categorias, f"{ctx}: categoria inexistente {c['categoria']}"
    # sem versao_reduzida a regra de confianca < 7 nao tem para onde recuar
    assert c["gatilho_sugerido"].strip(), f"{ctx}: gatilho_sugerido vazio"
    assert c["versao_reduzida"].strip(), f"{ctx}: versao_reduzida vazia"
    for flag in c["bloqueado_por"]:
        assert flag in padroes or flag == "compulsao", f"{ctx}: bloqueio desconhecido {flag}"
    no_doc(c["rotulo"], ctx)

for s in seed["situacoes_ancora"]:
    no_doc(s["rotulo"], "situacao-ancora")

for e in seed["cardapio_regulacao"]["estados"]:
    no_doc(e["pergunta"], f"cardapio {e['id']}")

# o protocolo manda apresentar de 3 a 5 opcoes filtradas pela barreira: toda barreira
# precisa ter pelo menos 3, e continuar tendo 3 quando o modo sem numeros corta os numericos
for b in barreiras:
    da_barreira = [c for c in seed["comportamentos"] if c["barreira"] == b]
    sem_numeros = [c for c in da_barreira if not c["requer_numeros"]]
    assert len(da_barreira) >= 3, f"barreira {b}: so {len(da_barreira)} comportamentos, protocolo exige 3+"
    assert len(sem_numeros) >= 3, f"barreira {b}: so {len(sem_numeros)} comportamentos em modo sem numeros"

# a tabela do filtro duplo (secao 4) tem que listar exatamente as categorias que o seed
# associa ao padrao — foi por aqui que documento e seed divergiram na 1.2
for p in seed["padroes"]:
    linha = next((l for l in doc.splitlines()
                  if l.startswith("| **") and norm(p["rotulo"]) in l and "·" in l), None)
    assert linha, f"padrao {p['id']}: sem linha na tabela do filtro duplo"
    esperadas = {c["rotulo"] for c in seed["categorias"] if p["id"] in c["padroes"]}
    # a celula pode trazer anotacao entre parenteses: "Composicao (incluir, nao excluir)"
    listadas = {re.sub(r"\(.*?\)", "", t).strip() for t in linha.split("|")[3].split("·")}
    assert esperadas == listadas, (
        f"filtro duplo do padrao {p['id']} diverge — seed {sorted(esperadas)} "
        f"x documento {sorted(listadas)}")

# todo padrao TFEQ precisa ter biblioteca propria, senao o filtro duplo trava
for p in padroes:
    cats = [c["id"] for c in seed["categorias"] if p in c["padroes"]]
    disponiveis = [c for c in seed["comportamentos"] if c["categoria"] in cats and p not in c["bloqueado_por"]]
    assert len(disponiveis) >= 3, f"padrao {p}: so {len(disponiveis)} comportamentos disponiveis"

# regras de revisao: faixas decrescentes, sem buraco e sem sobreposicao, cobrindo ate 0
regras = seed["regras_revisao"]
minimos = [r["adesao_min"] for r in regras]
assert minimos == sorted(minimos, reverse=True), "regras_revisao fora de ordem decrescente"
assert len(set(minimos)) == len(minimos), "regras_revisao com faixas sobrepostas"
assert minimos[-1] == 0.0, "regras_revisao nao cobre a faixa ate 0"
assert all(0.0 <= m <= 1.0 for m in minimos), "adesao_min fora de 0..1"

# modo sem numeros precisa esconder tudo que e numerico
numericos = [c["id"] for c in seed["comportamentos"] if c["requer_numeros"]]
assert numericos, "nenhum comportamento marcado requer_numeros — schema provavelmente quebrado"
for chave in ("comportamentos_requer_numeros", "regua_fome_saciedade", "escore_tfeq14", "peso"):
    assert chave in seed["modo_sem_numeros"]["oculta"], f"modo_sem_numeros nao oculta {chave}"
assert seed["peso"]["bloqueado_em_modo_sem_numeros"], "peso liberado em modo sem numeros"
assert not seed["peso"]["usado_em_calculo"], "peso nao pode alimentar calculo nenhum"

inst = seed["instrumentos"]

# SCOFF: porta de seguranca
scoff = inst["scoff"]
assert 1 <= scoff["limiar_positivo"] <= len(scoff["itens"]), "limiar do SCOFF fora do numero de itens"
assert scoff["desvio_deliberado"], "o ajuste do item 3 precisa ficar registrado como desvio"
for item in scoff["itens"]:
    no_doc(item, "item do SCOFF")

# TFEQ-14: parametros, cortes e itens
tfeq = inst["tfeq14"]
assert len(tfeq["itens"]) == 14, f"TFEQ-14 com {len(tfeq['itens'])} itens"
vistos = set()
for item in tfeq["itens"]:
    ctx = f"TFEQ item {item['n']}"
    assert item["n"] not in vistos, f"{ctx}: numero repetido"
    vistos.add(item["n"])
    assert item["a"] > 0, f"{ctx}: discriminacao nao positiva"
    assert len(item["b"]) == 3, f"{ctx}: precisa de 3 limiares para 4 categorias"
    assert item["b"] == sorted(item["b"]), f"{ctx}: limiares fora de ordem crescente"
    no_doc(item["texto"], ctx)
assert len(inst["tfeq14"]["opcoes_padrao"]) == 4, "TFEQ-14 precisa de 4 opcoes de resposta"

cortes = tfeq["cortes"]
assert cortes[-1]["acima_de"] is None, "cortes do TFEQ nao cobrem a faixa de baixo"
acima = [c["acima_de"] for c in cortes[:-1]]
assert acima == sorted(acima, reverse=True), "cortes do TFEQ fora de ordem decrescente"
for c in cortes:
    assert c["padrao"] in padroes, f"corte cita padrao inexistente: {c['padrao']}"

# as faixas declaradas em padroes tem que bater com os cortes do instrumento
for c in cortes:
    p = next(p for p in seed["padroes"] if p["id"] == c["padrao"])
    assert p["origem"] == "tfeq14", f"padrao {p['id']} usado como corte mas nao vem do tfeq14"
    assert p["faixa"]["min"] == c["acima_de"], f"padrao {p['id']}: faixa diverge do corte"

# ECAP e condicional ao corte alto do TFEQ, nao rotina
ecap = inst["ecap"]
assert ecap["quando"] == "condicional", "ECAP voltou a ser rotina na consulta 1"
assert ecap["gatilho"]["instrumento"] == "tfeq14"
assert ecap["gatilho"]["acima_de"] in acima, "gatilho da ECAP nao corresponde a nenhum corte do TFEQ"
assert len(ecap["itens"]) == 16, f"ECAP com {len(ecap['itens'])} itens"
faixas = [f["acima_de"] for f in ecap["faixas"]]
assert faixas[-1] is None, "faixas da ECAP nao cobrem a base"
assert faixas[:-1] == sorted(faixas[:-1], reverse=True), "faixas da ECAP fora de ordem"
for item in ecap["itens"]:
    alts = item["alternativas"]
    assert 3 <= len(alts) <= 4, f"ECAP item {item['n']}: {len(alts)} alternativas"
    for a in alts:
        no_doc_ou_fonte = a["texto"].strip()
        assert no_doc_ou_fonte, f"ECAP item {item['n']}: alternativa vazia"

# DEAS-s e desfecho, nunca triagem
deas = inst["deas_s"]
assert deas["papel"] == "desfecho", "DEAS-s so entra como medida de desfecho"
assert "consulta_1" not in deas["quando"], "DEAS-s nao entra no bloco de triagem"
assert len(deas["itens"]) == 17, f"DEAS-s com {len(deas['itens'])} itens"
for item in deas["itens"]:
    ctx = f"DEAS-s item {item['n']}"
    assert item["a"] > 0, f"{ctx}: discriminacao nao positiva"
    assert item["b"] == sorted(item["b"]), f"{ctx}: limiares fora de ordem"
    assert len(item["opcoes_en"]) == len(item["b"]) + 1, f"{ctx}: opcoes nao batem com os limiares"
pares = deas["escala_de_exibicao"]["pares"]
assert [p[0] for p in pares] == sorted(p[0] for p in pares), "ancoras do DEAS-s fora de ordem"
assert [p[1] for p in pares] == sorted(p[1] for p in pares), "exibicao do DEAS-s nao e monotona"
# enquanto a redacao em portugues nao vier do DEAS original, a pendencia tem que estar visivel
if any("texto_en" in i for i in deas["itens"]):
    assert deas.get("traducao_pendente"), "DEAS-s em ingles sem pendencia de traducao registrada"

# instrumento sem itens transcritos tem que estar marcado como pendente, e vice-versa
for nome, i in inst.items():
    tem_itens = bool(i.get("itens"))
    assert tem_itens != bool(i.get("pendencia")), f"instrumento {nome}: itens e pendencia inconsistentes"

for item in inst["srbai"]["itens"]:
    no_doc(item, "item do SRBAI")

# restricao rigida e julgamento clinico, nunca escore
r = seed["restricao_rigida"]
assert not r["pontuado"], "restricao rigida nao pode virar escore"
assert r["origem"] == "julgamento_clinico"
for p in r["perguntas_de_conversa"]:
    no_doc(p, "pergunta de restricao")

reg = seed["reguas"]["confianca"]
assert reg["min"] < reg["limiar_reducao"] <= reg["max"], "limiar de confianca fora da regua"
assert seed["limite_comportamentos_simultaneos"] >= 1

print(f"ok — protocolo {seed['versao']}: "
      f"{len(seed['comportamentos'])} comportamentos em {len(categorias)} categorias, "
      f"{len(padroes)} padroes, {len(inst)} instrumentos, "
      f"{len(numericos)} exigem modo com numeros")

escores._demo()
