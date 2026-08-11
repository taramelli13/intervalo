# Onde este app vai rodar

Documento de apoio a decisão, não decisão tomada. Escrito para consulta externa: quem lê não precisa conhecer o projeto.

Estado: protocolo clínico fechado na versão 1.4.0, modelo de dados desenhado, nenhuma linha de código de aplicação escrita. A stack é a última decisão antes de começar.

---

## O que o app é

Um app que estende a presença do nutricionista entre as consultas. Na consulta, o profissional prescreve de um a três comportamentos-alvo no formato *quando/então*. No intervalo, o paciente registra. Antes da consulta seguinte, o profissional lê um relatório de adesão.

A tese do produto é que **quem muda o comportamento é o profissional, não o app** ([D-003](DECISOES.md)). O paciente registra porque tem consulta marcada com um humano que vai olhar. Isso resolve retenção e custo de aquisição de uma vez só, e é o que separa este app de um diário alimentar.

**Escala real do piloto**

- Um profissional, o próprio autor
- Dezenas de pacientes, não milhares
- Alguns registros por paciente por dia
- Cálculo de escore clínico: 20 a 40 vezes por mês, no total

**Dois clientes**

- **Paciente:** celular, registro em menos de 5 segundos, no momento do gatilho
- **Profissional:** computador do consultório, aplicação de questionários e relatório pré-consulta

---

## Restrições que já são decisão tomada

Não estão em aberto. Estão em [`DECISOES.md`](DECISOES.md) e limitam as respostas possíveis.

| Decisão | O que fixa | Efeito sobre a stack |
|---|---|---|
| Protocolo versionado ([D-004](DECISOES.md)) | Cada ciclo grava sob qual versão do protocolo rodou. Não houve ensaio em papel | Conteúdo clínico vive em arquivo versionado no git, não em tabela |
| Log append-only ([D-020](DECISOES.md)) | Tudo que o paciente registra é evento imutável. Correção é evento novo | Sincronização não tem conflito a resolver: inserção não briga com inserção |
| Fila local ([D-023](DECISOES.md)) | O paciente registra sem internet; consultar histórico exige conexão | Precisa de armazenamento local no navegador. Nenhuma plataforma entrega isso pronto |
| Complemento, não prontuário ([D-022](DECISOES.md)) | Anamnese, antropometria e evolução seguem no sistema atual | Sem exigência de guarda longa, assinatura digital ou interoperabilidade |
| Sem lembrete na v1 | Os gatilhos são situações, não horários. Um empurrão às 12h é aproximação grosseira e arrisca virar cobrança, que o protocolo proíbe | **Dispensa app nativo e loja.** O app do paciente pode ser página web instalável |
| Manutenção assistida | O código é mantido pelo autor junto com um assistente, não por um time | Peso maior para menos peças em operação do que para familiaridade prévia |

---

## O que existe de código hoje

Nada de aplicação. O que existe é a camada clínica, em Python.

| Arquivo | Papel | Roda em produção? |
|---|---|---|
| `protocolo/protocolo.md` | Documento clínico, fonte de verdade, 15 seções | Não |
| `protocolo/seed.json` | O mesmo conteúdo em forma consumível: 42 comportamentos, 9 categorias, 5 instrumentos | Sim, lido pelo app |
| `protocolo/escores.py` | Escore dos instrumentos. Modelo gradual de Samejima com estimativa por quadratura fixa | Sim, se ficar em Python |
| `protocolo/validate_seed.py` | Trava divergência entre documento e seed. Já pegou dois erros reais | Não, é verificação de repositório |

O `escores.py` tem cerca de 50 linhas de aritmética pura, sem nenhuma biblioteca de estatística. É importante porque somar respostas Likert e comparar com o ponto de corte publicado dá um número plausível e errado ([D-015](DECISOES.md)) — foi por isso que o cálculo virou código testado em vez de conta na planilha.

---

## A decisão, em três partes

**1. Plataforma pronta ou backend próprio?** É a parte principal. Uma plataforma como o Supabase entrega banco PostgreSQL, autenticação e API já funcionando, com regras de acesso por linha configuradas no próprio banco. A alternativa é um backend escrito à mão, em Python, sobre um PostgreSQL gerenciado.

**2. Onde o dado de saúde fica hospedado?** Serviço gerenciado fora do país, serviço gerenciado com região no Brasil, ou servidor nacional administrado pelo próprio autor.

**3. O que acontece com o cálculo do escore?** Consequência das outras duas. Continua em Python, é traduzido para a linguagem do app, ou passa a existir nas duas com risco de divergirem.

---

## Comparação

| Dimensão | Plataforma pronta (Supabase) | Backend próprio (Python) |
|---|---|---|
| Linguagens no projeto | **Uma.** TypeScript na tela e na lógica | Duas. TypeScript na tela, Python no servidor |
| O que precisa ser escrito | **Login, permissão e API vêm prontos** | Login, sessão, permissão e cada rota escritos à mão |
| O que precisa ser operado | **Um painel. Backup automático** | Um serviço e um banco, com deploy próprio |
| Reaproveitamento do `escores.py` | Precisa ser traduzido, ou vira serviço à parte | **É o mesmo arquivo que o validador já testa** |
| Onde vive a lógica de adesão | Em TypeScript, escrita do zero | Em Python, escrita do zero |
| Custo mensal no piloto | ≈ US$ 25 assim que sair do plano gratuito | ≈ US$ 0 a 20 |
| Saída, se precisar trocar | Dado sai por dump. Login e regras de acesso precisam ser refeitos | **Python comum e PostgreSQL comum rodam em qualquer lugar** |
| Fila local do paciente | Escrita à mão nos dois casos. Nenhuma plataforma entrega isso | idem |

Existe uma terceira via: plataforma pronta para banco e login, mais um serviço Python pequeno só para o escore. Preserva o código clínico e o pouco backend, mas passa a exigir dois lugares para operar e depurar. Para um projeto de uma pessoa, costuma somar os inconvenientes dos dois lados.

---

## O ponto que mais pesou, e como ele mudou

A primeira recomendação foi backend próprio em Python, com o argumento de que traduzir o cálculo do escore seria arriscado. **Esse argumento não se sustentou.** São 50 linhas de aritmética, e a tradução leva cerca de uma hora.

O risco verdadeiro é outro e é menor: passariam a existir duas implementações do mesmo escore, sem garantia de que continuem concordando. Isso tem correção barata — o arquivo Python já tem um autocheck com valores fixos, e a tradução carrega os mesmos valores esperados. As duas versões ficam presas aos números publicados no artigo original, não uma à outra, e qualquer desvio quebra o próprio teste.

O argumento que sobrou, e que é mais forte, é banal: **sem lembrete automático, o app do paciente é uma página web, e página web é TypeScript.** A plataforma pronta deixa o projeto inteiro numa linguagem só. O backend próprio impõe duas, e para uma pessoa só isso é o dobro de tudo — estilo, ferramenta, erro para entender.

---

## Recomendação atual

- **Plataforma pronta, com região no Brasil.** A hospedagem nacional não é exigência legal, mas é o argumento mais confortável de explicar a paciente e a conselho
- **`escores.py` e `validate_seed.py` ficam em Python**, como ferramenta de repositório. O validador nunca roda em produção: ele lê os arquivos e reclama antes do commit. Isso não precisa estar na linguagem do app
- **O cálculo do escore é traduzido para TypeScript**, carregando os mesmos valores fixos do autocheck

Grau de confiança: moderado. A comparação depende de três fatos ainda não verificados, listados no fim.

---

## O que mudaria a resposta

| Se acontecer isto | A escolha vira |
|---|---|
| Lembrete automático voltar a ser requisito | Entra app instalável de verdade, e a discussão de loja e de notificação no iPhone reabre |
| O app precisar valer como prontuário | Guarda longa e exportação legível por outro profissional passam a mandar na escolha |
| Entrar um segundo nutricionista com carteira própria | Isolamento entre carteiras vira requisito de banco, e a plataforma pronta ganha peso |
| O conselho exigir dado em território nacional | Elimina qualquer provedor sem região no Brasil |
| A lógica de relatório crescer muito | Backend próprio volta a fazer sentido, porque a plataforma não ajuda em nada nessa parte |

---

## Perguntas para levar a quem for consultado

Vale mais ouvir divergência fundamentada do que confirmação. Estas são as perguntas em que a resposta muda o projeto.

1. **Para um app de um profissional só, com dezenas de pacientes, o backend próprio se paga em algum momento?**
   O que se quer testar é se a economia inicial da plataforma pronta se inverte com o tempo, e a partir de qual sinal.

2. **Quanto trabalho realmente dá sair de uma plataforma pronta depois de um ano rodando com pacientes reais?**
   O dado sai por dump, isso é fato. A pergunta é sobre login, regras de acesso e o que mais tiver grudado sem se perceber.

3. **Regra de acesso por linha configurada no banco é confiável o bastante para dado de saúde, ou o consenso é validar também no servidor?**
   É o ponto onde a plataforma pronta assume uma responsabilidade que normalmente seria de código próprio.

4. **Alguém já operou fila local de gravação em página web, e quais são as armadilhas?**
   É a única parte que precisa ser escrita à mão nos dois cenários, e a que sustenta a tela mais importante do produto.

5. **Há alguma exigência do conselho de nutrição sobre onde o dado de acompanhamento pode ficar armazenado?**
   Pergunta para o CRN, não para desenvolvedor. A LGPD não exige território nacional; o conselho pode ter posição própria.

6. **Manter o cálculo do escore em duas linguagens, com as duas presas aos mesmos valores publicados, é aceitável ou é dívida disfarçada?**
   É a única parte clinicamente sensível da decisão. Errar aqui produz número plausível e errado, que é pior que erro visível.

---

## Fatos a confirmar antes de fechar

Três coisas entraram na comparação sem verificação independente.

- **Região São Paulo** — se o provedor escolhido realmente oferece hospedagem em território brasileiro, e se isso vale para o banco e para as funções
- **Plano gratuito** — as condições de pausa por inatividade e o preço real do primeiro plano pago. Projeto que dorme é inaceitável com paciente de verdade registrando
- **Posição do conselho** — se o CRN tem norma sobre armazenamento de dado de acompanhamento, distinta do que a LGPD exige

---

Quando a decisão for tomada, ela vira D-024 em [`DECISOES.md`](DECISOES.md) e este documento fica como o registro de como se chegou nela.
