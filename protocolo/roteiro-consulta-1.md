# Roteiro da consulta 1

Protocolo 1.3.0. Para uso na mesa, com o paciente. Ordem fixa: cada etapa produz um dado que a etapa seguinte usa.

Tempo estimado: 8 a 12 minutos para os blocos 1 a 4, mais 10 a 15 se a ECAP for acionada. O resto acompanha a consulta normal.

Anote o horário de início e de fim de cada bloco. Se a consulta 1 não couber no tempo real de atendimento, o roteiro está longo demais e corta antes de virar tela.

---

## 0. Antes de começar: este paciente serve de piloto?

Não pergunte, observe. Serve se: volta em consulta marcada, tem smartphone de uso diário, e não está em crise aguda que domine o atendimento.

`[ ] serve como piloto   [ ] não serve, atender normal`

---

## 1. Script de abertura

Ler, não improvisar. É o que separa "meu nutricionista faz isso com todo mundo" de "meu nutricionista acha que eu tenho um problema".

> "Antes de a gente combinar qualquer coisa, eu faço um bloco de perguntas padrão com todo mundo. Leva uns três minutos. Não é sobre você especificamente, é o que me diz que tipo de acompanhamento faz sentido pro seu caso e o que eu preciso evitar."

---

## 2. Porta de segurança: SCOFF

Cinco perguntas. Marque sim ou não.

| | Pergunta | Sim | Não |
|---|---|---|---|
| 1 | Você provoca vômito porque se sente desconfortavelmente cheio(a)? | ( ) | ( ) |
| 2 | Você se preocupa por ter perdido o controle sobre o quanto come? | ( ) | ( ) |
| 3 | Você perdeu mais de 6 kg em um período de três meses recentemente? | ( ) | ( ) |
| 4 | Você acredita estar gordo(a) mesmo quando os outros dizem que você está magro(a)? | ( ) | ( ) |
| 5 | Você diria que a comida domina sua vida? | ( ) | ( ) |

**Ajuste obrigatório no item 3.** Se respondeu sim, pergunte se a perda foi intencional e acompanhada. Se foi, **não pontua**. Se foi não intencional, não acompanhada, ou não sabe explicar, pontua.

**Duas ou mais respostas afirmativas = positivo.**

Independente do escore, também é positivo se houver: histórico de transtorno alimentar, vômito, laxante ou exercício compensatório atuais, restrição severa em curso, IMC muito baixo.

`Total: ___   [ ] negativo   [ ] POSITIVO → modo sem números`

Se positivo: o paciente continua sendo atendido normalmente. O que muda é que ele fica fora de qualquer registro numérico. Nada de escala de fome e saciedade, gráfico de adesão, contagem de dias ou peso. Anote no prontuário e reavalie em 12 semanas.

---

## 3. Caracterização: TFEQ-14

Quatro opções nos itens 1 a 12. Marque a coluna.

| | | TF | FM | VM | TV |
|---|---|---|---|---|---|
| 1 | Eu começo a comer quando me sinto ansioso. | ( ) | ( ) | ( ) | ( ) |
| 2 | Às vezes, quando começo a comer, parece-me que não conseguirei parar. | ( ) | ( ) | ( ) | ( ) |
| 3 | Quando me sinto triste, frequentemente como demais. | ( ) | ( ) | ( ) | ( ) |
| 4 | Estar com alguém que está comendo, me dá frequentemente vontade de comer também. | ( ) | ( ) | ( ) | ( ) |
| 5 | Quando me sinto tenso ou estressado, frequentemente sinto que preciso comer. | ( ) | ( ) | ( ) | ( ) |
| 6 | Frequentemente sinto tanta fome que meu estômago parece um poço sem fundo. | ( ) | ( ) | ( ) | ( ) |
| 7 | Eu sempre estou com tanta fome, que me é difícil parar de comer antes de terminar toda a comida que está no prato. | ( ) | ( ) | ( ) | ( ) |
| 8 | Quando me sinto solitário(a), me consolo comendo. | ( ) | ( ) | ( ) | ( ) |
| 9 | Estou sempre com fome o bastante para comer a qualquer hora. | ( ) | ( ) | ( ) | ( ) |
| 10 | Se eu me sinto nervoso(a), tento me acalmar comendo. | ( ) | ( ) | ( ) | ( ) |
| 11 | Quando vejo algo que me parece muito delicioso, eu frequentemente fico com tanta fome que tenho que comer imediatamente. | ( ) | ( ) | ( ) | ( ) |
| 12 | Quando me sinto depressivo(a), eu quero comer. | ( ) | ( ) | ( ) | ( ) |

TF = totalmente falso · FM = falso na maioria das vezes · VM = verdade na maioria das vezes · TV = totalmente verdade

**13. Você comete excessos alimentares, mesmo quando não está com fome?**
`( ) nunca   ( ) raramente   ( ) às vezes   ( ) pelo menos 1 vez por semana`

**14. Com qual frequência você fica com fome?**
`( ) só nos horários das refeições   ( ) às vezes entre as refeições   ( ) frequentemente entre as refeições   ( ) quase sempre`

**Não some as respostas.** O escore é TRI e precisa ser calculado. Rode `python protocolo/consulta.py` e digite as 14 respostas para obter escore e conduta.

`Escore: ______   [ ] ≤45 regulado   [ ] >45 emocional   [ ] >70 exagerado → aplicar ECAP`

---

## 4. Restrição rígida: conversa, sem pontuar

Seis perguntas, em conversa. **Não some, não pontue, não mostre como teste.** Você está ouvindo se a regra dele é rígida ou flexível.

1. Você diminui as porções de propósito para controlar o peso?
2. Tem algum alimento que você não come porque acha que engorda?
3. Você se segura nas refeições para não ganhar peso?
4. Você evita ter em casa as comidas que te tentam?
5. O quanto você toparia se esforçar para comer menos do que tem vontade?
6. De 1 a 8, quanta restrição alimentar você diria que se impõe hoje?

Procure por regra absoluta ("nunca mais como pão"), lista de proibidos, e o ciclo de segurar a semana e desandar no fim de semana.

`Restrição rígida:  [ ] sim   [ ] não   [ ] não avaliada`

Se sim: o trabalho é flexibilizar regra e trocar exclusão por inclusão. Não prescreva comportamento que vire mais uma proibição.

---

## 5. ECAP, só se o TFEQ passou de 70

16 itens, de 10 a 15 minutos. Se a escolaridade for baixa, leia em voz alta em vez de entregar o formulário.

Escore é soma simples: `≤17 sem compulsão · 18 a 26 moderada · ≥27 grave`

`Escore: ______   [ ] flag de compulsão no prontuário   [ ] encaminhar/co-manejar com psicologia`

Compulsão **não** aciona o modo sem números. Se houver compulsão com comportamento compensatório, aí sim vale a regra do bloco 2.

---

## 6. Contexto de vida e rotina

Como é um dia comum dele. Quem cozinha, quem faz compra, quantas refeições fora, horário de trabalho, quantas horas dorme.

---

## 7. Onde a adesão quebra hoje

> "Do que a gente já conversou, o que você tentou e não durou?"

Essa resposta é a matéria-prima do próximo bloco. Anote literal.

---

## 8. Fase: ele quer, ou ainda está decidindo?

Antes de prescrever qualquer coisa, cheque se ele já formou a intenção ou ainda está formando.

`[ ] fase motivacional → trabalhar valores e importância, NÃO prescrever comportamento neste ciclo`
`[ ] fase volitiva → segue para o bloco 9`

Prescrever comportamento a quem está na fase motivacional é o erro padrão dos apps.

---

## 9. Diagnóstico da barreira

Uma pergunta discrimina cada uma. Se aparecer mais de uma, trate na ordem: capacidade, depois oportunidade, depois motivação.

| Barreira | Pergunta |
|---|---|
| Capacidade | "Se eu te pedisse pra fazer isso amanhã, você saberia exatamente como?" |
| Oportunidade | "O que na sua rotina ou na sua casa atrapalha isso?" |
| Motivação | "Numa semana comum, isso entra nas suas três prioridades?" |

`Barreira: [ ] capacidade   [ ] oportunidade   [ ] motivação`

---

## 10. Escolha do comportamento

Filtre por dois eixos e ofereça de 3 a 5 opções. **O paciente escolhe.**

| Padrão dele | Categorias de onde tirar |
|---|---|
| Comer exagerado, >70 | Ambiente · Estrutura e porção · Contexto |
| Comer emocional, >45 | Regulação emocional · Sono e energia · Consciência |
| Comer regulado, ≤45 | Ritmo · Ambiente · Composição · Estrutura e porção · Contexto · Movimento |
| Restrição rígida | Composição, incluindo e não excluindo · Consciência · Regulação emocional |

A flag de restrição **soma** ao padrão do TFEQ, não substitui. Lista completa dos 42 comportamentos na seção 4 do `protocolo.md`.

Máximo 3 comportamentos. Hoje, com um paciente novo, comece com 1.

---

## 11. Formulação da meta

Formato obrigatório, sem exceção:

> **Quando [situação concreta], então eu [ação].**

O gatilho tem que ser algo que ele reconhece quando acontece: horário, lugar, ou evento da rotina. Meta abstrata como "comer melhor" não vale.

`Meta: Quando _________________________________, então eu _________________________________`

Duas réguas, 0 a 10:

- **Importância.** "De 0 a 10, o quanto é importante pra você fazer isso nas próximas semanas?" `___`
- **Confiança.** "De 0 a 10, o quanto você se sente capaz de fazer isso?" `___`

**Confiança abaixo de 7:** ofereça a versão reduzida do mesmo comportamento e pergunte a confiança de novo. Se continuar abaixo de 7 na versão reduzida, troque o comportamento, e isso é sinal de que a barreira foi mal diagnosticada.

---

## 12. Plano de enfrentamento

As 2 a 3 situações que **já** derrubaram ele, não hipotéticas.

Catálogo, ele escolhe ou escreve a dele: chegar em casa faminto à noite · ansiedade depois que a casa silencia · churrasco ou almoço de família · viagem ou dia fora · restaurante com outras pessoas · dia de estresse ou briga · cansaço extremo · período pré-menstrual · tédio em casa · comemoração.

`Se _________________________________, então eu _________________________________`

`Se _________________________________, então eu _________________________________`

---

## 13. Cardápio de regulação

Só se o padrão for emocional. Uma coluna por estado, com o que **ele já sabe** que funciona, não sugestão sua. Mínimo duas opções por estado, executáveis em menos de 10 minutos e sem preparo.

| Estado | Pergunta que preenche |
|---|---|
| Ansiedade | "Numa noite ansiosa em que você não comeu, o que você fez?" |
| Tédio | "O que te tira do tédio sem sair de casa e sem custar nada?" |
| Cansaço | "Quando você está exausto, o que efetivamente descansa você?" |
| Raiva | "Depois de uma briga, o que te acalma?" |
| Tristeza | "Quem ou o que você procura quando está pra baixo?" |

O cardápio não proíbe comer. Ele pode usar uma alternativa, comer, ou as duas coisas.

---

## 14. Consentimento

O app ainda não existe, então hoje o registro é seu, em papel ou prontuário. Mesmo assim, alinhe agora, porque é mais fácil do que pedir depois:

- para que serve o acompanhamento entre as consultas
- que os dados são de saúde e ficam com você e com ele, mais ninguém
- que ele pode pedir para parar a qualquer momento, sem afetar o atendimento

`[ ] alinhado verbalmente   [ ] termo assinado`

---

## Ficha de fechamento

```
Paciente: ____________________  Data: ___/___/______
Protocolo: 1.3.0

SCOFF ........... ___ / 5      [ ] modo sem números
TFEQ-14 ......... ______       padrão: ________________
ECAP ............ ______       [ ] não aplicada
Restrição rígida  [ ] sim [ ] não [ ] não avaliada
Fase HAPA ....... [ ] motivacional [ ] volitiva
Barreira COM-B .. ________________

Comportamento: ______________________________________
Quando ______________________________________________
então eu ____________________________________________
Importância ___   Confiança ___   [ ] versão reduzida

Enfrentamento 1: ____________________________________
Enfrentamento 2: ____________________________________

Tempo dos blocos 1 a 4: ______ min
O que travou no roteiro: ____________________________
```

---

## Depois da consulta

Anote o que travou. Pergunta que soou estranha, bloco que demorou mais que o previsto, momento em que você improvisou. Isso vira a próxima versão do protocolo, e é o motivo de rodar hoje mesmo sem app.

O DEAS-s não entra hoje: a redação em português ainda está pendente. Ele é medida de desfecho de 12 semanas, então não perde nada em ficar para a próxima.
