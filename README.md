# Intervalo

> O que acontece entre uma consulta e a próxima.

App de mudança de comportamento alimentar que estende a presença do nutricionista entre os atendimentos. O profissional prescreve de um a três comportamentos na consulta, o app sustenta o intervalo, e na consulta seguinte o profissional chega com dados de adesão em vez de "e aí, como foi o mês?".

O agente de mudança é o profissional, não o app. Esse enquadramento resolve os dois defeitos que matam a categoria: a retenção, porque o paciente registra sabendo que tem consulta marcada com alguém que vai olhar, e a aquisição, porque quem paga já está pagando a consulta.

Sou nutricionista e construo este app para usar no meu próprio consultório. O protocolo clínico e o código são meus, e a primeira validação vai ser com meus pacientes.

## Estado

Protocolo clínico fechado na versão 1.3.0, e nenhuma linha de app escrita ainda. Isso é decisão, não atraso: modelo de dados, telas e stack derivam do protocolo, e decidir tela antes de protocolo é decidir no escuro.

| | |
|---|---|
| [`protocolo/protocolo.md`](protocolo/protocolo.md) | Fonte de verdade clínica, 15 seções |
| [`protocolo/seed.json`](protocolo/seed.json) | O mesmo conteúdo em forma que o app consome |
| [`protocolo/escores.py`](protocolo/escores.py) | Escores dos instrumentos, TRI e soma |
| [`protocolo/validate_seed.py`](protocolo/validate_seed.py) | Trava divergência entre documento e seed |
| [`DECISOES.md`](DECISOES.md) | Registro de decisões, D-001 a D-017 |
| [`ROADMAP.md`](ROADMAP.md) | Fases, pendências e o que está fora de escopo |

```bash
python protocolo/validate_seed.py
```

## O que o app nunca faz

Contar caloria ou macro. Usar peso como métrica de progresso. Exibir streak punitivo ou badge de dias perfeitos. Classificar alimento em bom ou ruim. Ranquear pacientes. Dar conselho clínico por conta própria.

Se o registro sinalizar sofrimento com comida, o app avisa o profissional em vez de aconselhar.

## Base

Automonitoramento do comportamento e não do resultado, intenções de implementação no formato quando/então, planejamento de enfrentamento, controle de estímulo, formação de hábito por repetição em contexto estável, e autocompaixão para quebrar o efeito de violação da abstinência.

O diagnóstico da barreira usa COM-B e a fase usa HAPA. A caracterização é feita pelo TFEQ-14, o rastreio de compulsão pela ECAP quando o corte é atingido, o desfecho pelo DEAS-s e a automaticidade pelo SRBAI. Referências completas em [`Fontes/FONTES.md`](Fontes/FONTES.md).

Duas leituras de fonte mudaram o projeto, e elas valem mais que o resultado final. A versão brasileira do TFEQ-R21 não é tridimensional, o que derrubou o eixo central do protocolo ([D-010](DECISOES.md)). E somar respostas Likert para comparar com o ponto de corte publicado dá um número plausível e errado ([D-015](DECISOES.md)).

## Aviso

Este repositório é material de trabalho clínico e de portfólio. Não é dispositivo médico e não substitui atendimento profissional. Os instrumentos referenciados pertencem a seus autores, e usá-los exige consultar as publicações originais.
