# Intervalo

> O que acontece entre uma consulta e a próxima.

App de mudança de comportamento alimentar que estende a presença do nutricionista **entre** os atendimentos. O profissional prescreve 1 a 3 comportamentos na consulta; o app sustenta o intervalo; o profissional chega na consulta seguinte com dados de adesão em vez de "e aí, como foi o mês?".

**O app não é o agente de mudança — o profissional é.** Esse enquadramento resolve os dois defeitos que matam a categoria: retenção (o paciente registra porque tem consulta marcada com um humano que vai olhar) e aquisição (quem paga já está pagando a consulta).

## Estado

**Protocolo clínico fechado na versão 1.3.0. Nenhuma linha de app escrita ainda** — por decisão, não por atraso: modelo de dados, telas e stack derivam do protocolo, e decidir tela antes de protocolo é decidir no escuro.

| | |
|---|---|
| [`protocolo/protocolo.md`](protocolo/protocolo.md) | Fonte de verdade clínica, 15 seções |
| [`protocolo/seed.json`](protocolo/seed.json) | O mesmo conteúdo em forma que o app consome |
| [`protocolo/escores.py`](protocolo/escores.py) | Escores dos instrumentos, TRI e soma |
| [`protocolo/validate_seed.py`](protocolo/validate_seed.py) | Trava divergência entre documento e seed |
| [`DECISOES.md`](DECISOES.md) | Registro de decisões, D-001 a D-016 |
| [`ROADMAP.md`](ROADMAP.md) | Fases, pendências e o que está fora de escopo |

```bash
python protocolo/validate_seed.py
```

## O que o app nunca faz

Contar caloria ou macro. Usar peso como métrica de progresso. Streak punitivo ou badge de dias perfeitos. Classificar alimento em bom ou ruim. Ranquear pacientes. Dar conselho clínico por conta própria.

Se o registro sinalizar sofrimento com comida, o app avisa o profissional. Não aconselha.

## Base

Automonitoramento do comportamento (não do resultado), intenções de implementação no formato quando/então, planejamento de enfrentamento, controle de estímulo, formação de hábito por repetição em contexto estável, e autocompaixão para quebrar o efeito de violação da abstinência.

Diagnóstico da barreira por **COM-B**; fase por **HAPA**; caracterização por **TFEQ-14**; rastreio de compulsão por **ECAP**, condicional; desfecho por **DEAS-s**; automaticidade por **SRBAI**. Referências completas em [`Fontes/FONTES.md`](Fontes/FONTES.md).

Duas coisas que a leitura das fontes mudou no projeto, e que valem mais que o resultado final: a versão brasileira do TFEQ-R21 **não é tridimensional**, o que derrubou o eixo central do protocolo ([D-010](DECISOES.md)); e somar respostas Likert para comparar com o ponto de corte publicado dá um número plausível e errado ([D-015](DECISOES.md)).

## Aviso

Este repositório é material de trabalho clínico e de portfólio. Não é dispositivo médico, não substitui atendimento profissional, e os instrumentos aqui referenciados pertencem a seus autores — o uso exige consultar as publicações originais.
