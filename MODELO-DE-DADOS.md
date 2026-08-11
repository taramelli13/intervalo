# Modelo de dados

Derivado do protocolo 1.4.0. Desenho, não implementação: não há SQL aqui porque a stack ainda não foi escolhida ([D-005](DECISOES.md)), e migração para banco indefinido é trabalho jogado fora. Este documento é que vira migração depois, não o contrário.

Escopo fixado em [D-022](DECISOES.md): o app é complemento do prontuário, não o prontuário. Um profissional. Paciente no celular, profissional no computador do consultório.

---

## Três decisões que organizam o resto

**O `seed.json` continua arquivo** ([D-019](DECISOES.md)). Nada do conteúdo clínico vira tabela. O banco guarda o id em texto e a versão do protocolo sob a qual o ciclo rodou.

**Registro do paciente é log append-only; estado é tabela** ([D-020](DECISOES.md)). Correção não é `update`, é evento novo.

**Modo sem números é derivado e materializado.** Escrito só como resultado de uma aplicação de instrumento, nunca à mão, e o filtro roda onde o conteúdo é montado — não na tela.

---

## Entidades de estado

### `paciente`

| Campo | Observação |
|---|---|
| `nome`, `contato`, `criado_em` | |
| `fase` | `mudanca` ou `manutencao` (seção 11). Muda o teto de comportamentos e o foco da biblioteca |
| `sem_numeros` | Derivado. Só escrito por aplicação de instrumento ou por sinal adicional registrado pelo profissional |
| `sem_numeros_origem`, `sem_numeros_desde` | Qual aplicação ligou o modo, e quando. Sem isso não dá para reavaliar a cada 3 meses |
| `restricao_rigida` | Três valores: `sim`, `nao`, `nao_avaliada`. Não avaliada não é o mesmo que não, e o `consulta.py` já trata assim |
| `peso_liberado`, `peso_justificativa` | Oculto por padrão ([D-007](DECISOES.md)); liberar exige justificativa escrita |
| `consentimento_versao`, `consentimento_em`, `consentimento_revogado_em` | Seção 13. Revogação encerra o registro e não afeta o atendimento |

### `ciclo` — o intervalo entre duas consultas

| Campo | Observação |
|---|---|
| `paciente`, `consulta_em`, `tipo` | `inicial` ou `retorno` |
| `protocolo_versao` | **O campo que [D-004](DECISOES.md) exige.** Sem ensaio em papel, cada ciclo precisa saber sob qual protocolo rodou |
| `barreira` | COM-B predominante diagnosticada nesta consulta |
| `padrao` | Padrão TFEQ vigente. Muda a cada recaracterização, de 12 em 12 semanas |
| `hapa` | `motivacional` ou `volitiva`. Prescrever a quem está na fase motivacional é o erro padrão |
| `fechado_em` | Nulo enquanto o ciclo é o corrente |

### `prescricao` — o comportamento ativo

| Campo | Observação |
|---|---|
| `ciclo`, `comportamento_id` | O id em texto, do seed |
| `rotulo`, `categoria`, `barreira` | Instantâneo do texto no momento da prescrição. Congela o que o paciente leu, mesmo que a 1.5 reescreva |
| `reduzida` | Se é a versão reduzida do comportamento |
| `regime`, `alvo_por_semana` | Vem do seed como padrão, mas **o valor válido é o combinado na consulta** |
| `meta_quando`, `meta_entao` | Dois campos, não um. Meta sem gatilho não é salvável |
| `confianca`, `importancia` | 0 a 10, no momento da definição. Nunca sobrescritos |
| `iniciada_em`, `encerrada_em`, `motivo_encerramento` | `consolidado`, `reduzida`, `trocada`, `fim_do_ciclo` |

**Reduzir uma meta abre prescrição nova**, não edita a existente. É o que torna computável o sinal "confiança que caiu entre ciclos" do relatório, e o que preserva o histórico de recalibragem.

### As outras quatro

| Entidade | Guarda | Detalhe que importa |
|---|---|---|
| `plano_enfrentamento` | O se/então da seção 6 | Situação do catálogo do seed **ou** texto do paciente — os dois casos existem |
| `cardapio_item` | Alternativa por estado emocional | Estado sem nenhuma alternativa é sinal do relatório, então a ausência precisa ser consultável |
| `problema` | Seção 8 | Frase, opções levantadas, opção escolhida, e uma revisão por ciclo. Três revisões sem solução aciona rediagnóstico COM-B |
| `aplicacao_instrumento` | SCOFF, TFEQ-14, ECAP, DEAS-s, SRBAI | Respostas item a item, escore, faixa e `protocolo_versao`. O SRBAI aponta para uma prescrição; os outros, para o paciente |

Guardar as respostas item a item, e não só o escore, é o que permite recalcular quando o `escores.py` mudar. Escore é derivado; resposta é dado.

---

## `evento` — o log

| Campo | Observação |
|---|---|
| `paciente`, `prescricao` | Prescrição nula em evento que não pertence a um comportamento |
| `id` | Gerado no dispositivo, não no servidor — a fila local grava antes de ter conexão ([D-023](DECISOES.md)) |
| `ocorrido_em` | Quando aconteceu, no fuso do paciente |
| `registrado_em` | Quando ele abriu o app e marcou |
| `tipo`, `dados` | |

**As duas datas separadas não são zelo.** A taxa de registro da seção 14 conta dias em que o paciente apareceu; a adesão conta dias em que o comportamento aconteceu. Numa coluna só, as duas métricas viram a mesma coisa — e "o paciente sumiu", que o protocolo trata como dado clínico, deixa de ser detectável.

| Tipo | Dados |
|---|---|
| `feito`, `nao_feito` | Nada além da prescrição |
| `lapso` | Situação-âncora e/ou texto livre. Os dois opcionais: pular não gera cobrança |
| `fome_saciedade` | Momento (antes ou depois) e valor de 0 a 10 |
| `fome_ou_gatilho` | Resposta (fome, ansiedade, tédio, cansaço, raiva, comemoração, não sei) e se comeu. **As duas registradas** — a resposta é o dado, não o freio |
| `surfar_desejo` | Se concluiu os dois minutos e o que decidiu. As duas decisões aceitas sem comentário |
| `cardapio_usado` | Estado e qual alternativa |
| `peso` | Só existe com `peso_liberado`. Nunca entra em cálculo de adesão |

---

## Como a adesão sai daqui

```
agendado     adesao = feitos / (alvo_por_semana * semanas)        limitado a 1
oportunista  adesao = feitos / (feitos + nao_feitos)              indefinida se zero
```

Adesão indefinida **não é zero.** Semana sem registro nenhum em comportamento oportunista significa que o gatilho não foi relatado, e entra no relatório como taxa de registro. Tratar como zero acionaria redução de meta em cima de quem fez o combinado — o oposto do que a regra da seção 9 existe para fazer.

---

## Invariantes

Coisas que o banco ou a camada de escrita precisa garantir, e que não podem depender de a tela lembrar:

1. No máximo **3 prescrições ativas** por paciente na fase de mudança, 2 na manutenção
2. Prescrição só existe dentro de um ciclo, e todo ciclo tem `protocolo_versao`
3. `sem_numeros` é escrito por aplicação de instrumento ou registro de sinal adicional, **nunca por edição direta**
4. Evento é append-only. Correção é evento novo
5. Escore de instrumento **não é exposto ao paciente** (seção 13) — a separação é de leitura, e a leitura do paciente não tem esse campo
6. Comportamento com `requer_numeros` não é ofertável a paciente em modo sem números, e o corte roda na montagem da biblioteca
7. Evento `fome_saciedade` ou `peso` de paciente em modo sem números é **recusado na camada de escrita**, não só omitido da tela — cliente desatualizado ou requisição direta não furam o modo ([D-025](DECISOES.md))

---

## Rastreabilidade — o relatório pré-consulta fecha?

Cada item da seção 12 e o campo de onde ele nasce. Item sem origem seria entidade faltando.

| # | Item do relatório | Origem |
|---|---|---|
| 1 | Adesão por comportamento, 2 e 4 semanas, com conduta calculada | `evento` (`feito`/`nao_feito`) sobre `prescricao.regime` e `alvo_por_semana`, cruzado com `regras_revisao` do seed |
| 2 | Contexto agregado dos lapsos | `evento` tipo `lapso`, agrupado por situação |
| 3 | Tendência de automaticidade | `aplicacao_instrumento` do SRBAI, por prescrição, em série |
| 4 | Réguas no momento da definição | `prescricao.confianca` e `importancia` |
| 5 | TFEQ-14 e DEAS-s com a medida anterior ao lado, e a flag de restrição | `aplicacao_instrumento` ordenada por data · `paciente.restricao_rigida` |
| 6 | Estado do problema aberto | `problema` e suas revisões |
| 7a | Queda abrupta na taxa de registro | Dias distintos de `evento.registrado_em` |
| 7b | Lapsos concentrados numa situação | Mesma agregação do item 2 |
| 7c | Confiança que caiu entre ciclos | `prescricao.confianca` em prescrições sucessivas do mesmo `comportamento_id` |
| 7d | Campo livre que sugere sofrimento | `evento` tipo `lapso`, texto |
| 7e | Estado emocional recorrente sem alternativa no cardápio | `evento` tipo `fome_ou_gatilho` menos os estados presentes em `cardapio_item` |

Fecha. Nenhum item precisou de entidade nova.

---

## Fora deste modelo

Anamnese, antropometria, evolução clínica, agenda, cobrança, prescrição de plano alimentar. Continuam onde estão hoje ([D-022](DECISOES.md)).
