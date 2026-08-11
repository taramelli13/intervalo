# Roadmap

App que estende a presença do nutricionista entre as consultas: comportamentos prescritos na consulta, registro leve no intervalo, relatório de adesão antes do próximo atendimento.

Estado: protocolo clínico na versão 1.4.0, modelo de dados desenhado, e nenhuma linha de app escrita ainda. Isso é decisão, não atraso ([D-005](DECISOES.md)).

---

## Fase 0, protocolo clínico: concluída

| Entrega | Onde |
|---|---|
| Documento clínico completo, 15 seções | `protocolo/protocolo.md` |
| Seed executável que o app consome | `protocolo/seed.json` |
| Escores dos três instrumentos | `protocolo/escores.py` |
| Validador que trava divergência entre documento e seed | `protocolo/validate_seed.py` |
| Registro de decisões | `DECISOES.md` |
| Roteiro operável da consulta 1 | `protocolo/roteiro-consulta-1.md` |
| Aplicador dos instrumentos na mesa | `protocolo/consulta.py` |

Conteúdo: triagem em quatro etapas, diagnóstico COM-B, 42 comportamentos-alvo em 9 categorias com filtro duplo, metas no formato quando/então com régua de confiança, plano de enfrentamento com cardápio de regulação, módulo de comer consciente, resolução estruturada de problemas, protocolo do lapso, fase de manutenção, relatório pré-consulta e política de dados.

Pendências que bloqueiam uso com paciente:

- [ ] Redação em português dos 17 itens do DEAS-s, a partir do DEAS original (Alvarenga et al., 2010)
- [ ] Textos que o paciente lê na abertura de cada módulo
- [ ] Fluxo de encaminhamento para psicologia: rede, critério, registro

---

## Fase 1, desenho

- [x] Modelo de dados derivado do seed, em `MODELO-DE-DADOS.md`: sete entidades de estado, log de eventos, invariantes, e a tabela que prova que o relatório pré-consulta fecha ([D-019](DECISOES.md) a [D-022](DECISOES.md))
- [x] Regime e alvo semanal de cada comportamento no seed, sem os quais a adesão de meta reduzida não calcula ([D-021](DECISOES.md))
- [ ] Telas do paciente: registro em menos de 5 segundos, dia furado, surfar o desejo, evolução por tendência
- [ ] Telas do profissional: consulta 1, prescrição de comportamento, relatório pré-consulta
- [ ] Modo sem números como estado de primeira classe do modelo, e não como flag de exibição
- [x] Decidir stack: Supabase gratuito em São Paulo + app web em TypeScript, custo zero até o piloto provar adesão ([D-024](DECISOES.md), processo em [DECISAO-STACK.md](DECISAO-STACK.md))
- [x] Protótipo da fila local validado no celular: eventos registrados em modo avião sobreviveram ao fechamento do navegador e sincronizaram sem duplicar quando a conexão voltou (`prototipos/fila-local/`). Pendente só o teste de paciência: fila presa por 24h no iPhone

---

## Fase 2, MVP

- [ ] Registro diário e cálculo de adesão
- [ ] Aplicação e escore dos instrumentos, portando `escores.py` para TypeScript com teste de fuzzing contra a versão Python ([D-024](DECISOES.md))
- [x] Esquema aplicado no Supabase (região São Paulo) e suíte anti-fuga passando: paciente só vê o próprio dado, escore invisível, evento imutável (`supabase/testes_rls.sql`)
- [ ] Backup: `pg_dump` diário agendado no consultório e ensaio de restauração mensal
- [ ] Relatório pré-consulta
- [ ] Fila local de eventos no app do paciente, que esvazia quando a conexão volta ([D-023](DECISOES.md))
- [ ] Notificação contextualizada, no gatilho do comportamento, sem cobrança
- [ ] Consentimento LGPD, exportação e exclusão de dados pelo próprio paciente

---

## Fase 3, piloto clínico

- [ ] Cronometrar os blocos 1 a 4 da consulta 1 na primeira aplicação real, verificação que ficou pendente da fase 0 ([D-018](DECISOES.md))
- [ ] Primeiros pacientes, cada ciclo gravado sob a versão do protocolo que rodou
- [ ] Métricas dos 30 dias: adesão por comportamento, taxa de registro, automaticidade, recalibragens acionadas, distribuição do TFEQ-14, taxa de acionamento da ECAP, adesão ao DEAS-s
- [ ] Calibrar o corte de 45 do TFEQ com dado próprio, porque a suspeita é que ele não separe nada neste público
- [ ] Revisar os alvos semanais padrão dos 42 comportamentos, arbitrados por julgamento clínico e sem uso real ([D-021](DECISOES.md))
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
