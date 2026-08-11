# Telas

Derivado do protocolo 1.4.0 e do modelo de dados. Desenho, não implementação: cada tela diz o que existe nela, o que ela lê e escreve no modelo, e como se comporta em modo sem números. Layout fino, cor e tipografia ficam para a fase 2 — o que está fixado aqui é o comportamento, que vem do protocolo e não é escolha visual.

Dois princípios atravessam tudo:

**O paciente nunca vê escore, percentual ou comparação.** A tela de evolução dele mostra tendência, nunca nota ([seção 12 do protocolo](protocolo/protocolo.md)). Número de adesão é ferramenta clínica do profissional.

**Modo sem números é ausência, não cadeado.** O que o paciente em modo sem números não pode usar simplesmente não existe na tela dele — sem item bloqueado, sem "recurso indisponível", sem indício de que outros pacientes veem algo a mais. O corte roda na montagem do conteúdo e na camada de escrita, nunca na tela ([D-025](DECISOES.md)).

---

## Telas do paciente — celular

### P1. Registro — a tela inicial

Abrir o app **é** chegar na tela de registro. Nenhuma navegação antes dela: o orçamento de 5 segundos é gasto em destravar o celular e tocar uma vez, não em atravessar menu.

A tela lista as prescrições ativas (no máximo 3, invariante 1 do modelo), cada uma com o rótulo congelado na prescrição e o registro do dia:

| Regime | O que aparece | O que escreve |
|---|---|---|
| Agendado | "Feito" · "Hoje não" | `evento` `feito` ou `nao_feito` |
| Oportunista | "Aconteceu e eu fiz" · "Aconteceu e eu não fiz" | `evento` `feito` ou `nao_feito` |

O oportunista exige as duas respostas como opções de igual peso, senão o denominador da adesão não existe ([D-021](DECISOES.md)). Nenhuma das quatro respostas gera cor de erro, som ou texto de julgamento — "hoje não" é registro tão válido quanto "feito".

Um toque grava. O evento nasce com `id` gerado no dispositivo, `ocorrido_em` agora e `registrado_em` agora, direto na fila local ([D-023](DECISOES.md)) — a tela nunca espera rede. Um ajuste opcional, "foi mais cedo", muda `ocorrido_em` para outro momento do dia; é o único refinamento, e fica atrás de um toque a mais porque o caso comum não precisa dele.

Na mesma tela, abaixo das prescrições, as entradas para o resto do app: dia furado (P2), surfar o desejo (P3), os registros do módulo de comer consciente (P4) e evolução (P5). Entrada é uma linha com nome, não um grid de ícones.

**Sem números:** a lista de prescrições e os dois botões ficam idênticos — feito/não feito permanece ([seção 1a](protocolo/protocolo.md)). Somem as entradas de escala de fome e evolução. Sem contagem de dias, sem streak, em nenhum dos modos.

### P2. Dia furado

A tela mais importante do produto (seção 10). Acessível da tela inicial em um toque, sempre, com o nome que o paciente usa — "hoje não saiu como planejado" — e não um termo técnico.

- Uma pergunta: **"o que estava acontecendo?"**
- Opções: as situações-âncora do plano de enfrentamento do paciente primeiro, o catálogo do seed depois, campo livre opcional no fim
- Pular é um botão do mesmo tamanho que responder. Pular grava o lapso do mesmo jeito, sem contexto
- Fechamento: a próxima ocorrência do gatilho aparece como nova chance, sem penalidade acumulada. Nenhuma frase de superação, nenhum conselho

Escreve `evento` tipo `lapso`, com situação-âncora e/ou texto, os dois opcionais. Sem vermelho, sem som, sem streak quebrado.

**Sem números:** idêntica. Esta tela permanece por inteiro.

### P3. Surfar o desejo

Tela de dois minutos, aberta no momento da vontade.

1. Um toque inicia. Contagem discreta, sem número gigante regressivo — uma barra ou círculo que se completa
2. Durante os dois minutos, os convites de observação da seção 7: onde a vontade aparece no corpo, se cresce, se muda. Texto parado, sem animação que dispute atenção
3. No fim, a decisão: **"comi" · "deixei passar"** — as duas aceitas sem comentário, sem cor de certo e errado
4. Depois da decisão, o cardápio de regulação do paciente aparece como opção, sem texto persuasivo. Fechar a tela é tão fácil quanto escolher uma alternativa

Escreve `evento` tipo `surfar_desejo` (concluiu os dois minutos, o que decidiu) e, se uma alternativa for usada, `evento` tipo `cardapio_usado`. Interromper antes dos dois minutos também grava — interrupção é dado, não falha.

**Sem números:** idêntica. É o único item do módulo de comer consciente que permanece ([seção 7](protocolo/protocolo.md)).

### P4. Registros do comer consciente

Três registros pequenos, cada um a dois toques da tela inicial:

| Registro | Interação | Escreve |
|---|---|---|
| Fome e saciedade | Régua 0–10, antes ou depois da refeição. Dois toques: posição na régua, confirmar. Sem meta, sem faixa "certa" colorida | `evento` `fome_saciedade` |
| Fome ou gatilho | "É fome ou é outra coisa?" — fome, ansiedade, tédio, cansaço, raiva, comemoração, não sei. Depois: "comeu?" — as duas respostas registradas, nenhuma bloqueia nada | `evento` `fome_ou_gatilho` |
| Peso | Só existe com `peso_liberado`. Campo de valor, sem gráfico do dia, sem comparação com o registro anterior. A leitura é tendência em janela de semanas, na tela do profissional | `evento` `peso` |

**Sem números:** fome e saciedade e peso não existem (peso some mesmo liberado — [D-007](DECISOES.md)). Fome ou gatilho permanece: é pergunta de contexto, não escala.

### P5. Evolução

A pergunta que a tela responde: *"isso está virando parte de mim?"* — nunca *"que nota eu tirei?"*.

- Por prescrição ativa: uma curva suave de frequência nas últimas semanas, **sem eixo numérico, sem percentual, sem contagem** — a forma da curva é a informação
- Uma frase de tendência calculada: "mais presente que há duas semanas", "estável", "menos presente" — três estados, sem número
- Comportamentos consolidados (encerrados por `consolidado`) aparecem numa lista de conquistas permanentes, sem data de validade

Lê a mesma agregação de `evento` que alimenta o relatório do profissional, mas o payload montado para o paciente não contém percentual nem escore — a separação é de leitura, no servidor (invariante 5 do modelo).

**Sem números:** a tela não existe. A entrada some da tela inicial. A percepção de evolução desse paciente é trabalho da consulta, não do app.

### P6. DEAS-s autoaplicado

Liberada pelo profissional ao fim da consulta 1 e a cada 12 semanas. Aparece como um cartão na tela inicial enquanto estiver pendente — convite, não bloqueio.

- Tela de abertura diz, antes de começar: o resultado vai para o profissional, **o app não mostra escore** — responder não dá direito a ver a nota (seção 13)
- Um item por tela, 17 telas, respondível em qualquer ordem de sessão: parar no item 9 e voltar à noite não perde nada
- Ao terminar: agradecimento de uma linha, sem resultado, sem faixa, sem cor

Escreve `aplicacao_instrumento` com respostas item a item. O escore é calculado e gravado, nunca exibido nesta superfície.

**Sem números:** a aplicação existe normalmente — quem decide instrumento é o profissional, e o paciente não vê número em nenhum dos modos.

### P7. Consentimento e dados

- Termo da seção 13 na consulta 1, em linguagem do paciente, com aceite registrado (`consentimento_versao`, `consentimento_em`)
- Uma tela de dados, acessível sempre: exportar tudo (arquivo legível) e excluir tudo, os dois sem falar com ninguém
- Revogar consentimento encerra o registro e diz, na própria tela, que não afeta o atendimento

---

## Telas do profissional — computador do consultório

### N1. Consulta 1

A tela é o roteiro da seção 2 em ordem fixa — a mesma ordem do `roteiro-consulta-1.md`, que hoje roda em `consulta.py`. Uma etapa por vez, avanço explícito, sem pular etapa obrigatória:

1. Script de abertura na tela, para ler, não para parafrasear
2. **SCOFF ajustado** — 5 itens; o item 3 abre a pergunta de intencionalidade antes de pontuar. Sinais adicionais da seção 1a como checkboxes ao lado. Resultado positivo liga `sem_numeros` com `sem_numeros_origem` e `sem_numeros_desde` — a tela informa o que o modo muda no app do paciente, e não existe caminho para ligar ou desligar o modo fora de uma aplicação de instrumento ou sinal registrado (invariante 3)
3. **TFEQ-14** — 14 itens, escore TRI calculado ao confirmar, faixa exibida com a leitura da seção 1b
4. **ECAP** — só aparece se o TFEQ passou de 70. Abaixo disso, um atalho discreto "aplicar mesmo assim" que exige motivo em texto
5. **Restrição rígida** — as 6 perguntas como roteiro de conversa na tela, sem campos de pontuação, e uma flag ao final: sim · não · não avaliada
6. Contexto de vida, onde a adesão quebra, **fase HAPA** — motivacional encerra o fluxo aqui: registra o ciclo, não prescreve, e a tela diz por quê
7. **COM-B** — as três perguntas discriminantes, barreira registrada no ciclo
8. Prescrição (N2), plano de enfrentamento e cardápio (N3), consentimento, liberação do DEAS-s

Escreve `paciente`, `ciclo` (com `protocolo_versao` da versão carregada — invariante 2), `aplicacao_instrumento` por instrumento aplicado. Nada é gravado como escore solto: sempre respostas item a item.

### N2. Prescrição de comportamento

Usada na consulta 1 e em toda consulta de retorno.

- A biblioteca chega **já filtrada** pelo filtro duplo — barreira do ciclo e padrão vigente, menos os `bloqueado_por` das flags do paciente e, em modo sem números, menos os `requer_numeros` (invariante 6). O profissional vê 3 a 5 opções, não as 42 com badges de aviso: opção que não deve ser oferecida não aparece
- Escolhido o comportamento: **meta em dois campos**, "quando" e "então", pré-preenchidos pelo `gatilho_sugerido` do seed. Sem os dois preenchidos, não salva (modelo, `prescricao`)
- Regime e alvo semanal vêm do seed como ponto de partida editável — o valor válido é o combinado na consulta
- **Réguas de importância e confiança**, 0 a 10. Confiança abaixo de 7: a tela oferece a versão reduzida do mesmo comportamento e repergunta. Abaixo de 7 de novo: sugere trocar o comportamento e aponta que a barreira pode ter sido mal diagnosticada (seção 5)
- Teto: com 3 prescrições ativas (2 na manutenção), o botão de adicionar não existe. Reduzir uma meta encerra a prescrição atual (`motivo_encerramento: reduzida`) e abre uma nova — a tela não edita prescrição ativa

### N3. Plano de enfrentamento e cardápio

- Situações-âncora: as do catálogo do seed como lista de partida, mais texto livre do paciente — os dois casos gravam em `plano_enfrentamento`
- Cada situação exige o "então": plano executável no momento, não intenção
- Cardápio: uma coluna por estado emocional, preenchida com as perguntas da seção 6 na tela como roteiro. Mínimo de duas alternativas por estado; estado sem alternativa fica visível como lacuna — é sinal do relatório, não erro de formulário

### N4. Relatório pré-consulta

A tela mais importante para o profissional ([D-003](DECISOES.md)). Uma página, lida em três minutos, sem navegação interna. Ordem fixa, do que exige ação para o que contextualiza:

1. **Sinais que exigem conversa** no topo, só os que dispararam (itens 7a–7e da seção 12; origem de cada um na tabela de rastreabilidade do modelo). Nenhum sinal: uma linha dizendo isso
2. **Adesão por comportamento**, 2 e 4 semanas, com a conduta da seção 9 já calculada ao lado — progredir, manter, reduzir. Adesão indefinida de oportunista sem registro aparece como "gatilho não relatado", nunca como zero
3. **Contexto agregado dos lapsos**, situações em ordem de frequência — é a matéria-prima da resolução de problemas (N5)
4. **Tendência de automaticidade** (SRBAI) por prescrição
5. **Réguas no momento da definição**, com marcação quando a confiança caiu entre ciclos
6. **TFEQ-14 e DEAS-s** em série, medida anterior ao lado, flag de restrição rígida
7. **Problema aberto**: frase, opção testada, resultado da última revisão
8. Rodapé de estado: fase do paciente, modo sem números com origem e data e a data da reavaliação de 12 semanas, consentimento vigente

Tela de leitura: o relatório não tem botão de conduta. Agir é abrir a consulta de retorno.

### N5. Consulta de retorno

Mesmo padrão da consulta 1 — etapas em ordem — alimentado pelo relatório:

1. Revisão de adesão com a conduta sugerida por prescrição; reduzir usa o fluxo de N2
2. **Resolução de problemas** (seção 8) sobre a situação mais frequente dos lapsos: os cinco passos como etapas na tela, gravando `problema` e revisão. Três revisões sem solução: a tela aponta rediagnóstico COM-B, não quarta tentativa
3. SRBAI a cada 4 semanas; recaracterização a cada 12 (TFEQ-14, DEAS-s, reavaliação do modo sem números e da flag de restrição) — a tela avisa quando o prazo venceu, e a reaplicação é o único caminho que reescreve `sem_numeros`
4. Fechamento do ciclo (`fechado_em`) e abertura do seguinte

---

## Modo sem números — onde cada camada corta

O modo é estado de primeira classe: nasce de aplicação de instrumento ou sinal registrado (invariante 3), tem origem e data, e é reavaliado a cada 12 semanas. As telas são a última camada, e a que menos trabalha:

| Camada | O que faz |
|---|---|
| Escrita (`paciente.sem_numeros`) | Só aplicação de instrumento ou sinal adicional escreve. Não há edição direta em tela nenhuma |
| Montagem da biblioteca | `requer_numeros` não é ofertável — o profissional não vê a opção (invariante 6) |
| Montagem do conteúdo do paciente | O payload do paciente sem números não contém campos numéricos, telas P4 (fome/peso) e P5, nem escore de ninguém em modo nenhum (invariante 5) |
| Camada de escrita de eventos | `fome_saciedade` e `peso` de paciente sem números são recusados no servidor (invariante 7 do modelo) — a tela não exibir não é garantia, cliente antigo ou requisição direta não podem furar |
| Tela | Não mostra o que não recebeu. Nenhuma lógica própria de modo |

---

## O que nenhuma tela tem

Streak e badge de dias perfeitos, vermelho de fracasso, som de alerta, percentual visível ao paciente, comparação entre pacientes, número do dia do peso, frase motivacional automática, chat. A lista de fora de escopo do [ROADMAP](ROADMAP.md) vale por tela, não só por produto.
