# Protocolo clínico — mudança de comportamento alimentar

**Versão 1.3.0** — mantida em sincronia com `seed.json`. Toda mudança clínica sobe a versão nos dois arquivos.

Este documento é o que o app implementa. Quando os dois discordarem, este documento vence e o `seed.json` é corrigido.

> **Mudanças da 1.2.0 → 1.3.0.** **ECAP e DEAS-s deixam de ser esqueleto:** itens, alternativas, grades de pontuação e parâmetros TRI transcritos das publicações originais. Os três escores estão implementados e testados em `escores.py`. Restam duas pendências, ambas registradas na seção 15. Changelog completo lá.

---

## 0. Princípios e limites

O agente de mudança é o profissional. O app sustenta o intervalo entre as consultas: registra o que foi combinado, coleta o contexto de quando não deu, e devolve isso na forma de um relatório antes da próxima consulta.

**O app nunca:**
- conta caloria ou macronutriente
- usa peso como métrica de progresso (ver decisão registrada abaixo)
- exibe streak punitivo, badge de "dias perfeitos" ou dia marcado em vermelho
- classifica alimento em bom/ruim, permitido/proibido
- compara ou ranqueia pacientes entre si
- dá conselho clínico por conta própria

Se o registro sinalizar sofrimento com comida, o app **avisa o profissional**. Não aconselha, não intervém, não sugere conduta.

**Tom.** Sem reflexo corretivo. Nada de "você falhou", "você está atrasado", alerta de peso ou notificação que cobra. O paciente escolhe entre opções — menu, não prescrição.

**Enquadramento do módulo de consciência.** Melhora de regulação e de relação com a comida. Não é ferramenta de emagrecimento, e o texto que o paciente lê diz isso com todas as letras.

### Decisão registrada — peso

Existe tensão real entre o princípio acima e a evidência. Automonitoramento de peso é um dos preditores mais consistentes de manutenção do peso perdido. Ignorar isso seria descartar um componente eficaz; adotá-lo sem trava reintroduz o gatilho que o protocolo inteiro tenta evitar.

**Conduta adotada:**
- peso fica **fora por padrão**
- pode ser liberado pelo profissional, caso a caso, com justificativa no prontuário do app
- quando liberado, aparece **apenas como tendência em janela de semanas** — nunca o número do dia isolado, nunca variação diária
- permanece **bloqueado no modo sem números**, sem exceção
- o app **não usa peso para nada**: não dispara notificação, não calcula adesão, não entra em nenhum feedback ao paciente

Registrado como decisão consciente para não voltar como discussão a cada ciclo. Revisar na versão 2.0.

---

## 1. Triagem e caracterização — obrigatórias na consulta 1

A versão 1.0 tinha um instrumento só fazendo dois trabalhos diferentes. Rastreio de segurança e caracterização do comportamento alimentar têm finalidades, instrumentos e consequências distintas.

| Etapa | Pergunta que responde | Instrumento | Itens | O que decide |
|---|---|---|---|---|
| **1a** | Registro numérico é seguro para esta pessoa? | SCOFF ajustado | 5 | Liga ou não o modo sem números |
| **1b** | Como esta pessoa come? | TFEQ-14 | 14 | Qual eixo comportamental tratar |
| **1c** | Há compulsão? | ECAP, só se TFEQ-14 > 70 | 16 | Aciona co-manejo, não o modo sem números |
| **1d** | A regra é rígida? | Conversa, sem escore | 6 | Marca a flag de restrição rígida |
| **Seção 3** | Por que a adesão quebra? | COM-B | — | Qual técnica usar |

**Custo real da consulta 1: 19 itens de formulário no caso típico** (SCOFF + TFEQ-14), 35 quando o TFEQ passa de 70. A 1d é conversa, não formulário.

Tudo acontece **antes** de qualquer meta ser definida.

### 1.0 Script de abertura — obrigatório

Sem enquadramento, a triagem soa acusatória e o paciente responde defensivamente.

> "Antes de a gente combinar qualquer coisa, eu faço um bloco de perguntas padrão com todo mundo. Leva uns três minutos. Não é sobre você especificamente — é o que me diz que tipo de acompanhamento faz sentido pro seu caso e o que eu preciso evitar."

Não pular. Não improvisar. É o que separa "meu nutricionista faz isso com todo mundo" de "meu nutricionista acha que eu tenho um problema".

### 1a. Porta de segurança — SCOFF ajustado

Registro alimentar e escalas numéricas são gatilho conhecido para comportamento alimentar disfuncional em parte das pessoas. Instrumento de rastreio tem sensibilidade alta e especificidade baixa de propósito: ele **deve** parecer irrelevante para a maioria. Se a maior parte dos pacientes zerar, o instrumento está funcionando.

1. Você provoca vômito porque se sente desconfortavelmente cheio(a)?
2. Você se preocupa por ter perdido o controle sobre o quanto come?
3. Você perdeu mais de 6 kg em um período de três meses recentemente?
4. Você acredita estar gordo(a) mesmo quando os outros dizem que você está magro(a)?
5. Você diria que a comida domina sua vida?

**Duas ou mais respostas afirmativas = triagem positiva.**

**Ajuste obrigatório no item 3.** Em serviço de emagrecimento, perda intencional e supervisionada é o desfecho pretendido, não sinal de risco. O item **não pontua** quando a perda foi intencional e acompanhada por profissional. Pontua normalmente quando foi não intencional, não acompanhada, ou o paciente não sabe explicar. Sem esse ajuste, boa parte dos pacientes bem-sucedidos cai no modo sem números por motivo errado.

**Limitações conhecidas, a considerar na interpretação:** o SCOFF foi validado sobretudo em mulheres jovens na atenção primária, tem desempenho pior em homens e em populações com IMC mais alto, e é fraco para compulsão alimentar — que é justamente o quadro mais prevalente neste público. Daí a etapa 1c.

### Sinais adicionais que valem como triagem positiva

Independente do escore: histórico de transtorno alimentar, comportamento compensatório atual (vômito, laxante, exercício compensatório), restrição severa em curso, IMC muito baixo.

### Conduta na triagem positiva

O paciente **não é excluído do atendimento**. É excluído do registro quantitativo. O app entra em **modo sem números**:

| Some | Permanece |
|---|---|
| Régua de fome e saciedade | Registro feito / não feito |
| Gráfico de adesão | Tela de contexto do dia furado |
| Percentual de adesão | Plano de enfrentamento |
| Contagem de dias | Observar a vontade por dois minutos |
| Peso (mesmo se liberado) | Cardápio de regulação alternativa |

Comportamentos marcados com `requer_numeros` não aparecem na biblioteca deste paciente.

O modo sem números é decisão do profissional, gravada no prontuário do app, e **não pode ser desativado pelo paciente**. Reavaliação a cada 12 semanas.

### 1b. Caracterização do padrão alimentar — TFEQ-14

O que a porta de segurança não faz: descrever *como* a pessoa come.

**Por que 14 itens e não 21.** A reanálise da versão brasileira do TFEQ-R21 por Teoria de Resposta ao Item (Quiles, 2024, USP) mostrou que o instrumento **não é tridimensional em português — é unidimensional**. Alimentação emocional e descontrole alimentar se fundem num construto só, "desregulação do comer". Os seis itens de restrição cognitiva apontaram na direção oposta dos demais (carga fatorial negativa nos itens 1, 5, 11 e 21; abaixo de 0,40 nos itens 17 e 18) e o alfa desse domínio foi 0,68. Retirados esses itens mais o 12, sobra um questionário de 14 itens com alfa 0,92 e variância explicada de 56,3%.

Conclusão prática: **os três domínios não existem nos dados brasileiros.** Insistir neles é reportar um perfil que o instrumento não mede.

#### Os 14 itens

Quatro opções para os itens 1 a 12: *Totalmente falso · Falso, na maioria das vezes · Verdade, na maioria das vezes · Totalmente verdade*.

1. Eu começo a comer quando me sinto ansioso.
2. Às vezes, quando começo a comer, parece-me que não conseguirei parar.
3. Quando me sinto triste, frequentemente como demais.
4. Estar com alguém que está comendo, me dá frequentemente vontade de comer também.
5. Quando me sinto tenso ou estressado, frequentemente sinto que preciso comer.
6. Frequentemente sinto tanta fome que meu estômago parece um poço sem fundo.
7. Eu sempre estou com tanta fome, que me é difícil parar de comer antes de terminar toda a comida que está no prato.
8. Quando me sinto solitário(a), me consolo comendo.
9. Estou sempre com fome o bastante para comer a qualquer hora.
10. Se eu me sinto nervoso(a), tento me acalmar comendo.
11. Quando vejo algo que me parece muito delicioso, eu frequentemente fico com tanta fome que tenho que comer imediatamente.
12. Quando me sinto depressivo(a), eu quero comer.
13. Você comete excessos alimentares, mesmo quando não está com fome? — *Nunca · Raramente · Às vezes · Pelo menos 1 vez por semana*
14. Com qual frequência você fica com fome? — *Somente nos horários das refeições · Às vezes entre as refeições · Frequentemente entre as refeições · Quase sempre*

#### Escore e faixas

**O escore não é a soma das respostas.** É escore TRI pelo modelo de resposta gradual de Samejima, na métrica média 50 / desvio 10, calculado com os parâmetros por item. Somar Likert e comparar com 45 dá resultado errado. A implementação está em `escores.py`; os parâmetros ficam no `seed.json`. Faixa alcançável do escore: **26,9 a 82,2**.

| Escore | Padrão | Leitura |
|---|---|---|
| ≤ 45 | **Comer regulado** | A dificuldade não é emocional nem de descontrole |
| > 45 | **Comer emocional** | Come em situações emocionalmente desafiadoras |
| > 70 | **Comer exagerado** | Além da emoção, sente fome com mais intensidade e frequência |

Reaplicado a cada 12 semanas.

#### Como ler no seu consultório

Num serviço de emagrecimento, o resultado ≤ 45 **não é achado negativo** — é informação. Significa que a dificuldade de perder peso está em rotina, organização, ambiente e porção, não em desregulação. Esse paciente vai direto ao COM-B, sem instrumento adicional.

**Limitações a considerar.** A amostra do estudo teve 172 pessoas, das quais só 35 com obesidade e 61 com sobrepeso — a maioria tinha peso normal, com autosseleção online e predomínio de mulheres. A curva do teste tem maior precisão entre −1 e +2 desvios padrão: **escore alto é mais confiável que escore baixo.** E a régua é sensível na ponta de baixo — responder "falso, na maioria das vezes" em todos os 14 itens já resulta em ~49, dentro da faixa emocional. Trate a faixa 45–70 como sinal fraco, e a faixa acima de 70 como sinal forte.

### 1c. Rastreio de compulsão — condicional ao corte alto

O SCOFF não cobre compulsão de forma confiável, e compulsão é mais prevalente neste público do que anorexia ou bulimia.

**Instrumento adotado: ECAP** (Escala de Compulsão Alimentar Periódica), tradução e adaptação brasileira da Binge Eating Scale por Freitas, Lopes, Coutinho e Appolinario (*Rev Bras Psiquiatr* 2001;23(4):215-20), sobre o original de Gormally et al. (1982).

**16 itens, 62 alternativas.** O paciente escolhe uma alternativa por item; cada uma vale de 0 a 3 pontos pela grade de correção publicada. Escore é **soma simples** — diferente do TFEQ-14 — variando de 0 a 46.

| Escore | Leitura |
|---|---|
| ≤ 17 | Sem compulsão |
| 18 a 26 | Compulsão moderada |
| ≥ 27 | Compulsão grave |

Leva de 10 a 15 minutos. Os autores registram que pacientes com baixa escolaridade acharam a escala extensa ou complexa — se for o caso, conduzir lendo em voz alta em vez de entregar o formulário.

**Aplicada só quando o TFEQ-14 passa de 70.** A faixa "comer exagerado" já descreve o quadro que a ECAP caracteriza — usá-la como porta evita aplicar 16 itens em todo mundo. Abaixo de 70, a ECAP não é aplicada; se o quadro clínico contradisser o escore, o profissional aplica assim mesmo e registra o motivo.

**Sobre o BEDS-7** — considerado e não adotado. Avaliação registrada:

- *A favor:* 7 itens, aplicação em cerca de um minuto, com item-porta de perda de controle; mira exatamente a lacuna do SCOFF.
- *Contra:* sensibilidade altíssima com especificidade baixa por construção — num serviço de emagrecimento, onde comer com perda de controle é comum, isso significa volume alto de positivos; foi desenvolvido com patrocínio da indústria farmacêutica no contexto de identificar candidatos a tratamento medicamentoso, o que enviesa o desenho na direção da sobreinclusão; e não há validação brasileira publicada de que se tenha notícia.
- *Decisão:* dispensado. O corte de 70 do TFEQ-14 faz o papel de porta que o BEDS-7 faria, sem instrumento adicional.

### 1d. Restrição rígida — julgamento clínico, sem escore

Os seis itens de restrição cognitiva do TFEQ-R21 não sustentam escala válida em português, mas continuam sendo **boas perguntas de consulta** — e o construto é altamente relevante aqui, porque mentalidade de dieta é quase universal em quem procura emagrecimento. Restrição rígida ("nunca mais como pão") anda junto com descontrole e prediz pior desfecho; restrição flexível prediz melhor.

Perguntadas em conversa, **nunca pontuadas**:

1. Eu deliberadamente consumo pequenas porções para controlar meu peso.
2. Eu não como alguns alimentos porque eles me engordam.
3. Eu conscientemente me controlo nas refeições para evitar ganhar peso.
4. O quanto frequentemente você evita "estocar" comidas tentadoras?
5. O quanto você estaria disposto(a) a fazer um esforço para comer menos do que deseja?
6. Numa escala de 1 a 8, quanta restrição alimentar você atribuiria a si mesmo?

O profissional registra no prontuário do app: `restrição rígida = sim | não | não avaliada`. É flag, não escore, e o app trata como tal — filtra a biblioteca e bloqueia comportamentos que viram mais uma regra de proibição.

**Restrição rígida alta + TFEQ alto não pede mais controle — pede outro tipo de controle.** Nesse perfil o trabalho é flexibilizar regra, trocar exclusão por inclusão e desmontar o "já que estraguei". Este é o único cruzamento do protocolo que depende de julgamento clínico e não de instrumento; está assim porque não existe instrumento curto e validado no Brasil para o construto (a adaptação do controle rígido/flexível de Westenhoefer é portuguesa e tem 25 itens).

### 1e. DEAS-s — medida de desfecho, não de triagem

O protocolo diz que persegue **melhora de regulação e de relação com a comida, não emagrecimento** (seção 0 e seção 7), e até a 1.1 não havia nenhuma medida disso.

**DEAS-s**, forma curta do Disordered Eating Attitude Scale (Alvarenga, Santos e Andrade, *Cad. Saúde Pública* 2020;36(2)), 17 itens, unidimensional, validado no Brasil por TRI em amostra de 2.902 pessoas — inclusive pacientes com transtorno alimentar e mulheres com obesidade sem sintomas. Alfa 0,88; RMSEA 0,05; CFI e TLI 0,98. Mede atitudes alimentares disfuncionais: crenças, pensamentos, sentimentos e relação com a comida.

**Escore e corte.** Também é TRI pelo modelo gradual, mas na métrica θ do próprio estudo (média 0, desvio 1). **θ ≥ 1,5 indica atitudes alimentares disfuncionais importantes.** Para exibição existe uma escala ancorada publicada (44,6 a 76,8); ela **não é 50 + 10θ** — usar os pares publicados, que estão no `seed.json`, e não recalcular.

Os itens misturam formatos: sete são sim/não, um tem três níveis de compensação, e os demais são *nunca / às vezes / frequentemente / sempre*. O número de categorias por item vem da recategorização do estudo, não do questionário original.

**Onde entra:** baseline e a cada 12 semanas, **autoaplicado no app entre a consulta 1 e a 2**. Não entra no bloco de triagem e não pesa na consulta.

**Onde não entra:** não é porta de segurança (esse papel é do SCOFF, com 5 itens em vez de 17), não mede restrição cognitiva, e não decide conduta sozinho.

> **Pendência aberta.** Os enunciados no `seed.json` estão em inglês, como publicados no artigo. A redação validada em português está no DEAS original (Alvarenga, Scagliusi e Philippi, 2010) e precisa substituí-los **antes do uso com paciente**. O validador falha se essa pendência for removida enquanto os textos em inglês continuarem lá.

**Conduta na triagem positiva de compulsão — e este é o ponto crítico do desenho:**

Compulsão **não aciona o modo sem números**. O perfil de risco é diferente do espectro restritivo, e o tratamento de referência para compulsão (TCC, incluindo formatos de autoajuda guiada) usa automonitoramento estruturado. Retirar todos os números aqui removeria uma ferramenta útil.

O que acontece:
- flag própria no prontuário do app, distinta da flag de risco restritivo
- **encaminhamento ou co-manejo com psicologia**, registrado
- biblioteca filtrada para regulação emocional, estrutura de refeições e ambiente
- comportamentos da categoria Consciência que envolvem checagem de saciedade no meio do prato ficam indisponíveis
- o profissional decide caso a caso sobre a régua de fome e saciedade

Se houver **compulsão com comportamento compensatório**, vale a regra da 1a: modo sem números, e a conduta é clínica antes de ser de produto.

---

## 2. Consulta inicial — roteiro

Ordem fixa. Cada etapa produz um dado que o app precisa.

1. **Script de abertura** (seção 1.0).
2. **Porta de segurança** (1a) — define o modo do app.
3. **Caracterização do padrão** (1b) — TFEQ-14, define o eixo comportamental.
4. **Rastreio de compulsão** (1c) — só se o TFEQ-14 passar de 70. Define encaminhamento e restrições de biblioteca.
5. **Restrição rígida** (1d) — conversa, marca a flag no prontuário.
6. **Contexto de vida e rotina.** Como é um dia comum. Quem cozinha, quem faz compra, quantas refeições fora, horário de trabalho, quantas horas dorme.
7. **Onde a adesão quebra hoje.** "Do que a gente já conversou, o que você tentou e não durou?" — a resposta é matéria-prima do diagnóstico.
8. **Fase HAPA.** Antes de prescrever qualquer coisa, checar se a pessoa está na fase motivacional (ainda formando a intenção) ou volitiva (já quer, precisa de plano). Prescrever comportamento a quem está na fase motivacional é o erro padrão dos apps — nesse caso a consulta trabalha valores e importância, e o app fica de fora deste ciclo.
9. **Diagnóstico da barreira** (seção 3).
10. **Escolha do comportamento** (seção 4) — o paciente escolhe entre 3 a 5 opções filtradas por barreira e por padrão.
11. **Formulação da meta** (seção 5) — quando/então e régua de confiança.
12. **Plano de enfrentamento e cardápio de regulação** (seção 6).
13. **Consentimento de dados** (seção 13) — assinado antes do primeiro registro.
14. **DEAS-s** (seção 1e) — liberado no app para o paciente responder em casa, depois da consulta.

---

## 3. Diagnóstico COM-B

Todo comportamento exige Capacidade, Oportunidade e Motivação. A técnica certa depende de qual está faltando — e a pergunta abaixo é a que discrimina.

| Barreira | Pergunta que discrimina | Técnicas |
|---|---|---|
| **Capacidade** | "Se eu te pedisse pra fazer isso amanhã, você saberia exatamente como?" | Instrução sobre como executar · Demonstração do comportamento · Prática guiada na consulta |
| **Oportunidade** | "O que na sua rotina ou na sua casa atrapalha isso?" | Controle de estímulo · Planejamento de contexto · Apoio social |
| **Motivação** | "Numa semana comum, isso entra nas suas três prioridades?" | Clarificação de valores · Feedback sobre o comportamento · Planejamento de enfrentamento |

**Regra de desempate:** se mais de uma barreira aparecer, tratar primeiro Capacidade, depois Oportunidade, por último Motivação. Não adianta trabalhar motivação para algo que a pessoa não sabe fazer nem tem condição de fazer.

O diagnóstico é refeito a cada consulta de retorno, usando o contexto dos lapsos coletado pelo app (seção 10). Barreira não é traço fixo do paciente — muda com a vida dele.

---

## 4. Biblioteca de comportamentos-alvo

O paciente escolhe. O profissional filtra por **dois eixos** e apresenta de 3 a 5 opções.

### Filtro duplo

**Eixo 1 — barreira COM-B** (seção 3): define *que tipo de técnica* funciona.
**Eixo 2 — padrão** (seções 1b e 1d): define *em que terreno* trabalhar.

| Padrão | Origem | Categorias prioritárias |
|---|---|---|
| **Comer exagerado** (> 70) | TFEQ-14 | Ambiente · Estrutura e porção · Contexto |
| **Comer emocional** (> 45) | TFEQ-14 | Regulação emocional · Sono e energia · Consciência |
| **Comer regulado** (≤ 45) | TFEQ-14 | Ritmo · Ambiente · Composição · Estrutura e porção · Contexto · Movimento |
| **Restrição rígida** | Julgamento clínico | Composição (incluir, não excluir) · Consciência · Regulação emocional |

Restrição rígida é flag independente e **se soma** ao padrão do TFEQ — não substitui. O paciente com restrição rígida e comer exagerado recebe o filtro dos dois, e os comportamentos que viram mais uma regra de proibição ficam bloqueados (marcados em `bloqueado_por` no seed).

**Nunca abrir duas frentes no mesmo ciclo.** Quando os filtros se somam, começar pelo mais forte — e o corte de 70 é sinal mais confiável que o de 45.

### Ritmo

| Comportamento | Barreira |
|---|---|
| Pousar o talher entre as garfadas | Capacidade |
| Levar pelo menos 20 minutos na refeição principal | Capacidade |
| Mastigar até a comida ficar bem desfeita antes de engolir | Capacidade |
| Tomar café da manhã | Oportunidade |
| Fazer um lanche à tarde antes de chegar em casa | Oportunidade |

### Ambiente

| Comportamento | Barreira |
|---|---|
| Deixar a fruta lavada e visível na bancada | Oportunidade |
| Tirar da bancada o que eu como sem perceber | Oportunidade |
| Ir ao mercado com lista e depois de ter comido | Oportunidade |
| Servir no prato e guardar a panela antes de sentar | Oportunidade |
| Deixar uma opção pronta na geladeira para o dia difícil | Oportunidade |
| Deixar à vista o motivo que me fez começar | Motivação |

### Composição

| Comportamento | Barreira |
|---|---|
| Incluir um vegetal no almoço | Oportunidade |
| Incluir um vegetal no jantar | Oportunidade |
| Incluir uma fonte de proteína no café da manhã | Capacidade |
| Incluir uma fruta no lanche da tarde | Oportunidade |
| Beber água ao longo do dia | Oportunidade |

### Estrutura e porção

Categoria nova. Preenche o vazio entre "não conta caloria" e "nenhuma noção de quantidade". São regras simples e visuais, sem número e sem cálculo.

| Comportamento | Barreira |
|---|---|
| Montar o prato começando por vegetal e proteína | Capacidade |
| Servir uma vez só e não repetir sem esperar | Capacidade |
| Comer nas refeições, sentado, e não ao longo do dia | Oportunidade |
| Manter horários parecidos de refeição nos dias de semana | Oportunidade |
| Não deixar passar mais de um intervalo longo sem comer | Capacidade |

### Contexto

| Comportamento | Barreira |
|---|---|
| Comer sentado à mesa, não em pé nem andando | Oportunidade |
| Fazer pelo menos uma refeição por dia sem tela | Oportunidade |
| Levar marmita para o trabalho | Oportunidade |
| Contar para uma pessoa da casa o que estou tentando mudar | Oportunidade |
| Escolher no domingo o que vai ser o jantar de três dias da semana | Motivação |
| Olhar no domingo como foi a semana e escolher a meta da próxima | Motivação |

### Regulação emocional

Categoria nova. Comer emocional é estratégia de enfrentamento — não se retira uma estratégia sem oferecer substituto.

| Comportamento | Barreira | Observação |
|---|---|---|
| Nomear a emoção antes de decidir comer | Capacidade | |
| Usar uma alternativa do meu cardápio de regulação antes de ir à cozinha | Oportunidade | Exige seção 6 preenchida |
| Fazer uma pausa de dois minutos antes da refeição em dia de estresse | Capacidade | |
| Agir pelo que eu decidi, não pelo que estou sentindo naquele minuto | Motivação | Base em ACT — valores acima de estado interno |

### Sono e energia

Categoria nova. Privação de sono altera apetite e piora comer emocional. Às vezes é o comportamento de maior efeito da lista.

| Comportamento | Barreira |
|---|---|
| Deitar até um horário combinado nos dias de semana | Oportunidade |
| Desligar tela um tempo antes de dormir | Oportunidade |
| Ter um horário fixo para acordar, inclusive fim de semana | Capacidade |

### Movimento

Categoria nova. Enquadramento honesto: **movimento prediz manutenção do peso perdido muito mais do que a perda em si.** O texto que o paciente lê diz isso — não é "queimar o que comeu".

| Comportamento | Barreira |
|---|---|
| Caminhar em um horário fixo do dia | Oportunidade |
| Fazer uma atividade que eu gosto, no dia combinado | Motivação |
| Subir escada / descer um ponto antes, na rotina que já existe | Capacidade |

### Consciência

| Comportamento | Barreira | Observação |
|---|---|---|
| Marcar o nível de fome antes da refeição | Capacidade | Indisponível em modo sem números |
| Marcar o nível de saciedade depois da refeição | Capacidade | Indisponível em modo sem números |
| Parar no meio do prato e checar se ainda estou com fome | Capacidade | Bloqueado com flag de compulsão e com restrição rígida |
| Antes de comer fora do horário, perguntar se é fome ou outra coisa | Motivação | |
| Quando bater a vontade forte, observar por dois minutos antes de decidir | Capacidade | Serve também ao eixo emocional |

Cada comportamento carrega no `seed.json` seu gatilho sugerido, sua versão reduzida, sua contraindicação e os bloqueios por flag. O **padrão fica na categoria**, não repetido comportamento a comportamento — a tabela do filtro acima é a fonte. A **versão reduzida é obrigatória** — é ela que a régua de confiança usa (seção 5).

---

## 5. Formulação da meta

### Formato quando/então, obrigatório

Toda meta é salva como **"Quando [situação concreta], então eu [ação]"**. O app não oferece campo livre sem gatilho: meta abstrata ("comer melhor", "me cuidar mais") não é salvável. O gatilho tem que ser uma situação que a pessoa reconhece quando acontece — horário, lugar, ou evento da rotina.

### Régua de confiança

Antes de salvar, duas perguntas de 0 a 10:

- **Importância:** "de 0 a 10, o quanto é importante pra você fazer isso nas próximas semanas?"
- **Confiança:** "de 0 a 10, o quanto você se sente capaz de fazer isso?"

**Confiança abaixo de 7 → o app oferece a versão reduzida do mesmo comportamento**, não um comportamento diferente. Repergunta a confiança. Se ainda ficar abaixo de 7 na versão reduzida, o comportamento é trocado — e isso é sinal de que a barreira foi mal diagnosticada.

Importância baixa não bloqueia o salvamento, mas entra no relatório: importância baixa com confiança alta costuma ser fase motivacional mal identificada.

### Teto

**Máximo 3 comportamentos simultâneos.** Sem exceção. O app não deixa adicionar o quarto.

---

## 6. Plano de enfrentamento e cardápio de regulação

Sem isto o app só funciona em semana boa. Mapear com o paciente as **2 a 3 situações que sempre derrubam ele** — não situações hipotéticas, situações que já aconteceram.

### Situações-âncora

Catálogo de partida (o paciente escolhe as dele ou escreve a própria):

- Chegar em casa faminto à noite
- Ansiedade depois que a casa silencia
- Churrasco ou almoço de família no fim de semana
- Viagem ou dia inteiro fora de casa
- Restaurante ou refeição com outras pessoas
- Dia de estresse ou briga
- Cansaço extremo, sem energia para cozinhar
- Período pré-menstrual
- Tédio ou ócio em casa
- Comemoração, aniversário, data especial

Cada situação vira **"Se [situação], então eu [plano]"**. O plano precisa ser uma ação que a pessoa consegue executar no momento em que a situação está acontecendo — não uma intenção genérica de resistir.

### Cardápio de regulação alternativa

Seção nova, e é o que dá matéria-prima ao plano acima. O erro comum é tratar todo comer emocional como ansiedade — **ansiedade, tédio, cansaço e raiva pedem respostas diferentes**, e o que funciona é específico da pessoa.

Construir na consulta, uma coluna por estado, com **coisas que o paciente já sabe que funcionam para ele** — não sugestões genéricas do profissional:

| Estado | Pergunta que preenche a coluna |
|---|---|
| Ansiedade | "Numa noite ansiosa em que você não comeu, o que você fez?" |
| Tédio | "O que te tira do tédio sem sair de casa e sem custar nada?" |
| Cansaço | "Quando você está exausto, o que efetivamente descansa você?" |
| Raiva / frustração | "Depois de uma briga, o que te acalma?" |
| Tristeza | "Quem ou o que você procura quando está pra baixo?" |

Mínimo de duas opções por estado, todas executáveis em menos de 10 minutos e sem preparo. O cardápio fica visível no app e é o que a tela de "surfar o desejo" oferece ao final dos dois minutos — **como opção, nunca como cobrança.**

Regra: **o cardápio não proíbe comer.** A pessoa pode usar uma alternativa, comer, ou as duas coisas. Registrar o que ela fez é o dado; impedir não é função do app.

---

## 7. Módulo de comer consciente

Evidência mais consistente para compulsão, comer emocional e relação com a comida do que para peso. É tratado como **melhora de regulação, não emagrecimento**, e o paciente lê isso na abertura do módulo.

**Indisponível por completo em modo sem números** — exceto observar a vontade por dois minutos, que permanece.

### Escala de fome e saciedade

0 a 10, antes e depois da refeição, dois toques. Registro sem julgamento e sem meta: não existe número certo. O objetivo é a pessoa voltar a perceber a diferença, não acertar um alvo.

### Ritmo

Pousar o talher, mastigar mais, duração mínima da refeição. São os comportamentos da categoria Ritmo (seção 4), aplicados pelo módulo.

### Refeição sem tela

Pelo menos uma por dia. É o comportamento de maior efeito percebido e menor custo de execução — bom candidato para o primeiro ciclo.

### Fome física ou gatilho

Uma pergunta antes de comer fora do horário: *é fome ou é outra coisa?* Com opções de contexto (ansiedade, tédio, cansaço, raiva, comemoração, não sei). **Sem proibir nada, sem bloquear nada** — a pessoa responde e come do mesmo jeito se quiser. A resposta é o dado, não o freio.

A resposta alimenta o cardápio de regulação (seção 6): estado que aparece muito e não tem alternativa listada é lacuna a preencher na próxima consulta.

### Surfar o desejo

Tela de dois minutos. Observar a vontade em vez de brigar com ela: onde ela aparece no corpo, se cresce, se muda. No fim, a pessoa decide — e as duas decisões são aceitas pelo app sem comentário. Ao final, o cardápio de regulação aparece como opção, sem texto persuasivo.

---

## 8. Resolução estruturada de problemas

Seção nova. É um dos componentes mais bem estabelecidos em programa comportamental de peso e o único que ensina o paciente a lidar com o que o protocolo não previu.

Acontece **na consulta de retorno**, sobre a situação que mais apareceu nos lapsos (seção 10). Cinco passos, nesta ordem:

1. **Definir o problema em uma frase concreta.** "Eu como demais à noite" não serve. "Nas terças e quintas eu chego 21h sem ter almoçado direito" serve.
2. **Listar opções sem julgar.** Todas, inclusive as ruins. O profissional não filtra nesta etapa.
3. **Escolher uma**, pelo critério de menor esforço, não de maior efeito.
4. **Transformar em "se/então"** e salvar como plano de enfrentamento.
5. **Revisar na consulta seguinte** — funcionou, não funcionou, ou não teve oportunidade de testar. Não funcionou volta ao passo 2, não ao passo 1.

O app guarda o problema, a opção escolhida e o resultado da revisão. Três ciclos com o mesmo problema sem solução = rediagnóstico COM-B, não mais uma tentativa.

---

## 9. Consulta de retorno — revisão e recalibragem

### Limiares de adesão, por comportamento, em janela de 2 semanas

| Adesão | Conduta |
|---|---|
| ≥ 80% por 2 semanas | Progredir o comportamento, ou adicionar um novo respeitando o teto de 3 |
| 50% a 79% | Manter, sem mudança |
| < 50% por 2 semanas | **Reduzir** |

**Regra inegociável:** meta não cumprida por duas semanas seguidas é sinal de meta mal calibrada, não de paciente relapso. Reduzir, nunca insistir na mesma meta, e nunca apresentar isso ao paciente como fracasso — a formulação é "essa meta estava grande demais pro momento".

Se a versão reduzida também ficar abaixo de 50%, o problema é diagnóstico: refazer o COM-B com o contexto dos lapsos em mãos.

### Automaticidade — SRBAI, a cada 4 semanas

*"O comportamento que combinamos é algo que..."* — escala de 1 a 7:

1. faço automaticamente
2. faço sem ter que lembrar conscientemente
3. faço sem pensar a respeito
4. começo a fazer antes de perceber que estou fazendo

**A métrica de sucesso do hábito é a automaticidade, não o peso.** Automaticidade alta com adesão alta = comportamento consolidado, pode sair da lista ativa e abrir vaga.

### Recaracterização — a cada 12 semanas

Reaplicar **TFEQ-14** (1b) e **DEAS-s** (1e), reavaliar o modo sem números (1a) e a flag de restrição rígida (1d). Mudança de padrão muda o filtro da biblioteca.

**O desfecho mais relevante deste protocolo não aparece na balança:** queda no escore do TFEQ-14 acompanhada de queda no DEAS-s — desregulação menor e relação com a comida melhor. Se a flag de restrição rígida também sair, melhor ainda; mas isso é leitura clínica, não número.

---

## 10. Protocolo do lapso — o "dia furado"

A tela mais importante do produto.

O paciente que precisa mudar não abre o app justamente no dia em que mais precisa. Dia bom fica tudo verde; dia furado ele não abre, e nunca mais volta. O objetivo clínico aqui é quebrar o efeito de violação da abstinência — o "já que estraguei, estraguei de vez", que destrói mais progresso que qualquer escolha alimentar isolada.

**Como a tela se comporta:**
- sem vermelho, sem som, sem streak quebrado com estrondo
- uma pergunta: **"o que estava acontecendo?"**, com as situações-âncora da seção 6 como opções e campo livre opcional
- resposta é opcional; pular não gera cobrança
- retorno imediato ao plano: a próxima ocorrência do gatilho já aparece como nova chance, sem penalidade acumulada
- nenhuma frase de superação, nenhum conselho

**Efeito secundário, e é o principal para o profissional:** o contexto coletado aqui alimenta o rediagnóstico COM-B da próxima consulta e a seleção do problema da seção 8. Lapsos concentrados numa mesma situação são barreira de Oportunidade; lapsos espalhados em qualquer situação são barreira de Motivação ou meta mal calibrada.

---

## 11. Fase de manutenção

Seção nova. O padrão da literatura é perda seguida de reganho — a fase difícil não é perder. Este app, por ser baseado em automaticidade e contato continuado, é estruturalmente mais adequado à manutenção do que à perda, e isso deve ser dito ao paciente.

**Entrada na fase:** quando o objetivo de mudança de composição corporal for considerado atingido pelo profissional, **ou** quando três comportamentos consecutivos consolidarem (automaticidade alta + adesão alta).

**O que muda:**

| Item | Fase de mudança | Fase de manutenção |
|---|---|---|
| Frequência de consulta | Conforme o plano | Espaçada, mas **nunca interrompida** |
| Comportamentos ativos | Até 3, em progressão | 1 a 2, de sustentação |
| Foco da biblioteca | Composição, ambiente, estrutura | Movimento, contexto, sono |
| Métrica principal | Adesão e automaticidade | Manutenção da automaticidade e taxa de registro |
| Gatilho de reativação | — | Queda sustentada de automaticidade ou sumiço do registro |

**O erro a evitar:** dar alta. Contato continuado, mesmo espaçado, é o preditor mais consistente de manutenção. O app existe justamente para tornar esse contato barato.

---

## 12. Relatório pré-consulta

O que o profissional lê nos três minutos antes de atender:

1. **Adesão por comportamento** nas últimas 2 e 4 semanas, com a conduta sugerida pela seção 9 já calculada.
2. **Contexto agregado dos lapsos** — quais situações mais aparecem, em ordem.
3. **Tendência de automaticidade** (SRBAI) por comportamento.
4. **Réguas** de confiança e importância no momento em que a meta foi definida.
5. **Escore TFEQ-14** e faixa atual, com a medida anterior ao lado. **DEAS-s** na mesma linha do tempo, quando houver. Flag de restrição rígida.
6. **Estado do problema aberto** (seção 8) — qual é, que opção foi testada, qual foi o resultado.
7. **Sinais que exigem conversa:**
   - queda abrupta na taxa de registro (o paciente sumiu, e sumir é dado)
   - lapsos concentrados numa única situação-âncora
   - confiança que caiu entre ciclos
   - resposta em campo livre que sugere sofrimento com comida
   - estado emocional recorrente sem alternativa no cardápio de regulação

O relatório mostra tendência, nunca nota. Nenhuma tela do paciente mostra o percentual de adesão de forma comparativa ou pontuada — o número é ferramenta clínica do profissional.

---

## 13. Dados e consentimento (LGPD)

Dado de saúde é dado pessoal sensível. O termo é assinado na consulta 1, antes do primeiro registro.

- **Consentimento específico e destacado** — não embutido em termo de uso genérico
- **Finalidade explícita:** acompanhar o comportamento entre consultas e subsidiar o atendimento. Nada mais. Sem uso secundário, sem treino de modelo, sem compartilhamento com terceiros
- **Quem acessa:** o paciente e o profissional que o atende. Ninguém mais
- **Retenção:** enquanto durar o acompanhamento, mais o prazo de guarda de prontuário exigido pelo CFN/CRN. Depois, exclusão
- **Direitos:** o paciente pede exportação ou exclusão dos dados dentro do app, sem precisar falar com ninguém
- **Revogação:** revogar o consentimento encerra o registro e não afeta o atendimento

Linguagem do termo: a que o paciente entende, não a do jurídico.

**Regra dos instrumentos:** resultados de triagem, caracterização e desfecho (SCOFF, TFEQ-14, ECAP, DEAS-s) são dados clínicos, gravados no prontuário do app e **não exibidos ao paciente como escore**. O paciente vê a conduta, não a nota. Isso vale também para o DEAS-s, que é autoaplicado — responder não dá direito a ver o resultado, e a tela de conclusão diz isso antes de começar.

---

## 14. Métricas dos primeiros 30 dias

| Métrica | Como medir |
|---|---|
| Adesão média por comportamento | dias cumpridos / dias válidos |
| Taxa de registro | dias com qualquer registro / dias corridos |
| Automaticidade | SRBAI na semana 4 |
| Recalibragens acionadas | quantas metas caíram abaixo de 50% em 2 semanas |
| Taxa de triagem positiva | quantos entraram em modo sem números, e por qual item |
| Uso do cardápio de regulação | quantas vezes uma alternativa foi acionada |
| Distribuição do TFEQ-14 | quantos em cada faixa; se quase todos caírem acima de 45, o corte não está separando nada neste público |
| Taxa de acionamento da ECAP | quantos passaram de 70 — valida se o gatilho condicional foi calibragem certa |
| Adesão ao DEAS-s | quantos responderam em casa; abaixo de 60% a medida de desfecho não se sustenta |

**Critério de sucesso, qualitativo e decisivo:** o profissional chega na consulta sabendo mais do que sabia antes. Se o relatório não muda nada na conduta, o app é espelho — e espelho não muda comportamento.

Como não houve ensaio em papel, cada ciclo de paciente é gravado com a versão do protocolo sob a qual rodou. Mudança clínica sobe a versão em `protocolo.md` e `seed.json` juntos.

---

## 15. Changelog

### 1.3.0

- **ECAP transcrita por completo** da publicação de Freitas et al. (2001): 16 itens, 62 alternativas, grade de correção e faixas 17/26. Escore é soma simples, 0 a 46
- **DEAS-s transcrito** do artigo e do material suplementar: 17 itens, parâmetros TRI, sistema de codificação, corte θ ≥ 1,5 e escala de exibição ancorada
- **`tfeq14.py` vira `escores.py`** — o modelo gradual é o mesmo para TFEQ-14 e DEAS-s, então um módulo só calcula os três instrumentos e roda os autochecks
- Registrado que a escala de exibição do DEAS-s **não é 50 + 10θ**; usar as âncoras publicadas
- Faixa alcançável de cada escore verificada por teste: TFEQ-14 26,9–82,2 · DEAS-s θ −1,39 a 3,10 · ECAP 0–46

### Pendências para a 1.4

- **Redação em português do DEAS-s** — hoje os enunciados estão em inglês, como no artigo. Precisa do DEAS original (Alvarenga, Scagliusi e Philippi, 2010) antes de qualquer uso com paciente
- Escrever os textos que o paciente lê na abertura de cada módulo
- Definir o fluxo de encaminhamento para psicologia (rede, critério, registro)
- Confirmar, depois dos primeiros ciclos, se o corte de 45 do TFEQ separa alguma coisa neste público ou se quase todo mundo cai acima dele

### 1.2.0

- **TFEQ-14 substitui o TFEQ-R21.** A versão brasileira é unidimensional, não tridimensional; os itens de restrição cognitiva não sustentaram escala (alfa 0,68, cargas negativas) e saíram. O que fica mede "desregulação do comer" com alfa 0,92
- Adotados os **pontos de corte 45 e 70**, com os três padrões: comer regulado, comer emocional, comer exagerado
- **Escore é TRI**, modelo gradual de Samejima, métrica 50/10 — implementado em `tfeq14.py`. Somar Likert não vale
- **ECAP passa a ser condicional** ao corte > 70, em vez de rotina. Consulta 1 cai de 42 para 19 itens no caso típico
- **BEDS-7 dispensado** — o corte de 70 faz o papel de porta que ele faria
- Nova **seção 1d**: restrição rígida vira flag de julgamento clínico, com as 6 perguntas mantidas como conversa não pontuada
- Nova **seção 1e**: **DEAS-s** como medida de desfecho, autoaplicado entre consultas, 12 em 12 semanas. Preenche a lacuna de medir "relação com a comida", que o protocolo perseguia sem medir
- Filtro duplo da seção 4 refeito sobre os padrões novos; restrição rígida **se soma** ao padrão do TFEQ em vez de ser alternativa
- Padrão passa a viver na **categoria**, não repetido por comportamento
- Removida a duplicata de "observar por dois minutos" entre Regulação emocional e Consciência
- Métricas dos 30 dias ganham distribuição do TFEQ, taxa de acionamento da ECAP e adesão ao DEAS-s

### Pendências da 1.2 — resolvidas na 1.3

- ~~Transcrever os 16 itens da ECAP~~ → feito, com grade de correção
- ~~Transcrever os 17 itens do DEAS-s~~ → feito; falta só a redação em português

### 1.1.0

- Seção 0 ganha **decisão registrada sobre peso**, com trava de exibição por tendência e bloqueio no modo sem números
- Seção 1 dividida em **1a porta de segurança**, **1b caracterização** e **1c rastreio de compulsão**, com finalidades e condutas distintas
- Script de abertura da triagem (1.0) passa a ser obrigatório
- Item 3 do SCOFF **não pontua** quando a perda de peso foi intencional e supervisionada
- **TFEQ-R21** adotado como instrumento de caracterização, reaplicado a cada 12 semanas
- **ECAP** adotada para rastreio de compulsão; BEDS-7 avaliado e aceito apenas como filtro de primeira passada
- Compulsão passa a ter **conduta própria** — encaminhamento e filtro de biblioteca, **sem** acionar o modo sem números
- Biblioteca da seção 4 passa a usar **filtro duplo** (barreira COM-B × padrão TFEQ)
- Novas categorias na biblioteca: **Estrutura e porção**, **Regulação emocional**, **Sono e energia**, **Movimento**
- Seção 6 ganha o **cardápio de regulação alternativa**, por estado emocional
- Nova seção 8: **resolução estruturada de problemas**
- Nova seção 11: **fase de manutenção**
- Recaracterização a cada 12 semanas incorporada à consulta de retorno
- Relatório pré-consulta ganha perfil TFEQ e estado do problema aberto
- Métricas dos 30 dias ganham taxa de triagem positiva e uso do cardápio

### Pendências da 1.1 — resolvidas na 1.2

- ~~Confirmar a escolha ECAP × BEDS-7~~ → ECAP, condicional ao corte 70; BEDS-7 dispensado
- ~~Definir se o TFEQ é autoaplicado ou conduzido~~ → TFEQ-14 na consulta; DEAS-s autoaplicado em casa
