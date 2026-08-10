# Roadmap

App que estende a presença do nutricionista entre as consultas: comportamentos prescritos na consulta, registro leve no intervalo, relatório de adesão antes do próximo atendimento.

Estado: protocolo clínico fechado na versão 1.3.0, e nenhuma linha de app escrita ainda. Isso é decisão, não atraso ([D-005](DECISOES.md)).

---

## Fase 0, protocolo clínico: concluída

| Entrega | Onde |
|---|---|
| Documento clínico completo, 15 seções | `protocolo/protocolo.md` |
| Seed executável que o app consome | `protocolo/seed.json` |
| Escores dos três instrumentos | `protocolo/escores.py` |
| Validador que trava divergência entre documento e seed | `protocolo/validate_seed.py` |
| Registro de decisões | `DECISOES.md` |

Conteúdo: triagem em quatro etapas, diagnóstico COM-B, 42 comportamentos-alvo em 9 categorias com filtro duplo, metas no formato quando/então com régua de confiança, plano de enfrentamento com cardápio de regulação, módulo de comer consciente, resolução estruturada de problemas, protocolo do lapso, fase de manutenção, relatório pré-consulta e política de dados.

Pendências que bloqueiam uso com paciente:

- [ ] Redação em português dos 17 itens do DEAS-s, a partir do DEAS original (Alvarenga et al., 2010)
- [ ] Textos que o paciente lê na abertura de cada módulo
- [ ] Fluxo de encaminhamento para psicologia: rede, critério, registro

---

## Fase 1, desenho

- [ ] Modelo de dados derivado do seed: paciente, ciclo, comportamento ativo, registro diário, lapso com contexto, aplicação de instrumento, prontuário
- [ ] Telas do paciente: registro em menos de 5 segundos, dia furado, surfar o desejo, evolução por tendência
- [ ] Telas do profissional: consulta 1, prescrição de comportamento, relatório pré-consulta
- [ ] Modo sem números como estado de primeira classe do modelo, e não como flag de exibição
- [ ] Decidir stack, que segue em aberto de propósito

---

## Fase 2, MVP

- [ ] Registro diário e cálculo de adesão
- [ ] Aplicação e escore dos instrumentos, portando `escores.py` para a stack escolhida
- [ ] Relatório pré-consulta
- [ ] Offline-first com sincronização e resolução de conflito
- [ ] Notificação contextualizada, no gatilho do comportamento, sem cobrança
- [ ] Consentimento LGPD, exportação e exclusão de dados pelo próprio paciente

---

## Fase 3, piloto clínico

- [ ] Primeiros pacientes, cada ciclo gravado sob a versão do protocolo que rodou
- [ ] Métricas dos 30 dias: adesão por comportamento, taxa de registro, automaticidade, recalibragens acionadas, distribuição do TFEQ-14, taxa de acionamento da ECAP, adesão ao DEAS-s
- [ ] Calibrar o corte de 45 do TFEQ com dado próprio, porque a suspeita é que ele não separe nada neste público
- [ ] Critério de sucesso: o profissional chega na consulta sabendo mais do que sabia antes

---

## Fase 4, manutenção

- [ ] Fase de manutenção do protocolo implementada: consulta espaçada e nunca interrompida, comportamentos de sustentação, gatilho de reativação
- [ ] Revisar a decisão sobre peso ([D-007](DECISOES.md)) com dado do piloto

---

## Fora de escopo, deliberadamente

Contagem de calorias e macros. Peso como métrica de progresso. Streak punitivo e badge de dias perfeitos. Classificação de alimento em bom ou ruim. Ranking entre pacientes. Chat, comunidade e plano alimentar.

---

## Como rodar as verificações

```bash
python protocolo/validate_seed.py
```

Valida o seed inteiro, confere que documento e seed não divergiram, e roda os autochecks dos três escores.
