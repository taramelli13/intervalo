"""Aplica os instrumentos da consulta 1 e devolve a conduta.

    python consulta.py          fluxo completo
    python consulta.py --demo   caso canonico, sem interacao

O TFEQ-14 nao pode ser somado a mao: o escore e TRI. Este script existe para
dar o numero na mesa, a tempo de decidir se a ECAP entra.
"""
import sys

import escores

TFEQ_OPCOES = "0 = totalmente falso · 1 = falso na maioria · 2 = verdade na maioria · 3 = totalmente verdade"


def pergunta(texto, validos):
    """Le do teclado ate vir resposta valida. Enter vazio nao conta."""
    while True:
        r = input(f"{texto} ").strip().lower()
        if r in validos:
            return validos[r]
        print(f"   resposta invalida, esperado: {'/'.join(sorted(validos))}")


SIM_NAO = {"s": True, "n": False, "sim": True, "nao": False, "não": False}


def bloco_scoff():
    print("\n=== SCOFF, porta de seguranca ===")
    itens = escores.INST["scoff"]["itens"]
    pontos = 0
    for i, item in enumerate(itens, 1):
        r = pergunta(f"{i}. {item} (s/n)", SIM_NAO)
        if r and i == 3:
            # perda intencional e supervisionada e o desfecho pretendido, nao sinal de risco
            if pergunta("   a perda foi intencional e acompanhada? (s/n)", SIM_NAO):
                print("   -> nao pontua")
                continue
        pontos += int(r)

    extra = pergunta("Ha historico de TA, comportamento compensatorio, restricao severa ou IMC muito baixo? (s/n)", SIM_NAO)
    positivo = pontos >= escores.INST["scoff"]["limiar_positivo"] or extra
    print(f"\nSCOFF {pontos}/5 -> {'POSITIVO, ligar modo sem numeros' if positivo else 'negativo'}")
    return pontos, positivo


def bloco_tfeq():
    print("\n=== TFEQ-14, caracterizacao ===")
    print(TFEQ_OPCOES)
    validos = {str(k): k for k in range(4)}
    respostas = []
    for item in escores.INST["tfeq14"]["itens"]:
        if item.get("opcoes"):
            print("  opcoes: " + " · ".join(f"{i} = {o}" for i, o in enumerate(item["opcoes"])))
        respostas.append(pergunta(f"{item['n']:2}. {item['texto']}", validos))

    escore, padrao = escores.tfeq14(respostas)
    print(f"\nTFEQ-14 = {escore:.1f} -> {padrao}")
    if padrao == "emocional":
        print("   sinal fraco: a faixa 45-70 separa pouco neste publico")
    return escore, padrao


def bloco_ecap():
    print("\n=== ECAP, compulsao ===")
    escolhas = []
    for item in escores.INST["ecap"]["itens"]:
        alts = item["alternativas"]
        print(f"\n#{item['n']}")
        for i, a in enumerate(alts):
            print(f"  {i}. {a['texto']}")
        escolhas.append(pergunta("  escolha:", {str(i): i for i in range(len(alts))}))

    total, faixa = escores.ecap(escolhas)
    print(f"\nECAP = {total} -> {faixa}")
    return total, faixa


def ficha(scoff, sem_numeros, tfeq, padrao, ecap_res, restricao):
    print("\n" + "=" * 58)
    print("FICHA  (protocolo " + escores.SEED["versao"] + ")")
    print("=" * 58)
    print(f"SCOFF ............ {scoff}/5" + ("   MODO SEM NUMEROS" if sem_numeros else ""))
    print(f"TFEQ-14 .......... {tfeq:.1f}   padrao: {padrao}")
    print(f"ECAP ............. {ecap_res[0]} ({ecap_res[1]})" if ecap_res else "ECAP ............. nao aplicada")
    print(f"Restricao rigida . {restricao}")

    cats = [c["rotulo"] for c in escores.SEED["categorias"] if padrao in c["padroes"]]
    if restricao == "sim":
        cats += [c["rotulo"] for c in escores.SEED["categorias"]
                 if "restricao_rigida" in c["padroes"] and c["rotulo"] not in cats]
    print(f"\nBiblioteca ....... {' · '.join(cats)}")
    if sem_numeros:
        print("Bloqueado ........ escala de fome/saciedade, grafico, contagem de dias, peso")
    if ecap_res and ecap_res[0] > 17:
        print("Conduta .......... encaminhar ou co-manejar com psicologia; sem checagem de meio de prato")
    print("\nProximo: barreira COM-B, escolha do comportamento, meta quando/entao.")


def main():
    print("Consulta 1 · protocolo", escores.SEED["versao"])
    scoff, sem_numeros = bloco_scoff()
    tfeq, padrao = bloco_tfeq()

    ecap_res = None
    gatilho = escores.INST["ecap"]["gatilho"]["acima_de"]
    if tfeq > gatilho:
        print(f"\nTFEQ acima de {gatilho}: a ECAP entra.")
        if pergunta("aplicar agora? (s/n)", SIM_NAO):
            ecap_res = bloco_ecap()

    # tres valores, nao dois: "nao avaliada" nao e a mesma coisa que "nao"
    restricao = pergunta("\nRestricao rigida na conversa? (s/n/na)",
                         {"s": "sim", "n": "nao", "na": "nao_avaliada"})
    ficha(scoff, sem_numeros, tfeq, padrao, ecap_res, restricao)


def _demo():
    """Caso canonico: paciente com desregulacao alta, sem risco restritivo."""
    escore, padrao = escores.tfeq14([3] * 14)
    assert padrao == "exagerado" and escore > escores.INST["ecap"]["gatilho"]["acima_de"]
    total, faixa = escores.ecap([len(i["alternativas"]) - 1 for i in escores.INST["ecap"]["itens"]])
    assert faixa == "compulsão grave"
    ficha(1, False, escore, padrao, (total, faixa), "sim")
    print("\nok — fluxo canonico fecha e a biblioteca nao sai vazia")


if __name__ == "__main__":
    try:
        _demo() if "--demo" in sys.argv else main()
    except (KeyboardInterrupt, EOFError):
        print("\ninterrompido, nada foi gravado")
