# Registro de decisões

Log append-only. Cada entrada guarda o contexto, a decisão, o porquê e a consequência, inclusive das decisões que descartaram caminhos inteiros, que costumam ser as mais informativas.

Convenção: entrada nova vai no fim, nunca se reescreve entrada antiga. Se uma decisão for revertida, entra uma decisão nova que a revoga e diz por quê.

---

## D-001 · Descartar o marketplace de serviços locais
**09/08/2026**

**Contexto.** Ideia inicial: app onde profissionais (pedreiro, eletricista, técnico) se cadastram e clientes buscam, avaliam e contratam.

**Decisão.** Descartado antes de escrever qualquer linha.

**Por quê.** Cinco defeitos estruturais, não de execução: o concorrente real é o WhatsApp; frequência de uso de uma vez a cada dois anos destrói retenção; desintermediação mata a comissão no segundo serviço; avaliação não funciona com poucas notas em cidade pequena; e não há efeito de rede entre cidades. A evidência de mercado fecha o caso. A líder do setor chegou a valer menos que o próprio caixa, e uma concorrente com quase dez anos opera em sete cidades.

**Consequência.** Conta de guardanapo para uma cidade de 80 mil habitantes: cerca de R$ 9 mil/mês de receita bruta no cenário otimista, antes de custo. É um bom freela, não uma empresa.

---

## D-002 · Descartar o pivô B2B para contabilidade
**09/08/2026**

**Contexto.** Segunda hipótese: vender software para escritórios de contabilidade, começando pela coleta de documentos.

**Decisão.** Descartado.

**Por quê.** A versão óbvia já tem dono, com portal do cliente, leitura automática de documento e white label, por R$ 99 a R$ 299/mês. Entrar ali é chegar cinco anos atrasado.

**Consequência.** Sobraram recortes menos óbvios: viver dentro do WhatsApp em vez de um portal, auditoria de conformidade da reforma tributária, ou vender através do contador como canal. Nenhum foi perseguido, e ficam registrados caso o projeto atual não vingue.

---

## D-003 · O agente de mudança é o profissional, não o app
**09/08/2026**

**Contexto.** Terceira ideia: app de mudança de comportamento alimentar. Categoria saturada, com a pior retenção da loja.

**Decisão.** Construir o app como extensão da consulta, não como produto de consumo. O nutricionista prescreve 2 ou 3 comportamentos na consulta, o app sustenta o intervalo, e o profissional chega na consulta seguinte com dados de adesão.

**Por quê.** Resolve de uma vez os dois assassinos da categoria. Na retenção, o paciente registra porque tem consulta marcada com um humano que vai olhar. Na aquisição, quem paga já está pagando a consulta, então o custo de aquisição é zero.

**Consequência.** Todo o resto do produto decorre disso. O relatório pré-consulta vira a tela mais importante para o profissional, e nenhuma feature pode competir com a relação clínica.

---

## D-004 · Testar direto no app, sem ensaio em papel
**09/08/2026**

**Contexto.** A recomendação inicial era rodar o método em papel e WhatsApp com cinco pacientes por 30 dias antes de escrever código.

**Decisão.** Pular o ensaio. Desenvolver o produto completo e testar direto com paciente real.

**Por quê.** Decisão do responsável clínico, que aceita o custo de não ter ensaio prévio.

**Consequência.** Duas obrigações que não seriam necessárias com ensaio. O protocolo passa a ser versionado com semver desde a primeira versão, e cada ciclo de paciente grava sob qual versão rodou. E a triagem de risco entra na v1, não no backlog, porque não há ensaio para pegar problema clínico antes do paciente.

---

## D-005 · Protocolo clínico antes de modelo de dados e telas
**09/08/2026**

**Contexto.** Três frentes possíveis para começar: protocolo, desenho de produto, ou stack.

**Decisão.** Protocolo primeiro. Modelo de dados, telas e stack derivam dele.

**Por quê.** Decidir tela antes de protocolo é decidir no escuro, e num produto clínico o protocolo determina quais dados existem, quem os vê e o que o app tem proibido fazer.

**Consequência.** Stack segue indefinida de propósito. A primeira coisa versionada do repositório é um documento clínico, não código.

---

## D-006 · Documento clínico como fonte de verdade, com seed executável derivado
**09/08/2026**

**Contexto.** O protocolo precisa ser legível e editável pelo nutricionista, e ao mesmo tempo executável pelo app.

**Decisão.** `protocolo.md` é a fonte clínica de verdade, `seed.json` carrega a mesma coisa em forma que o app consome, e `validate_seed.py` falha se os dois divergirem.

**Por quê.** Sem o documento, o profissional não revisa. Sem o seed, o app reimplementa as regras e diverge em três meses. Sem o validador, a divergência acontece em silêncio.

**Consequência.** Já compensou duas vezes: o validador pegou o documento em versão diferente do seed, e depois pegou a tabela de filtro do documento listando categorias diferentes das do seed.

---

## D-007 · Peso fica fora por padrão
**09/08/2026**

**Contexto.** Automonitoramento de peso é um dos preditores mais consistentes de manutenção do peso perdido. E é também o gatilho que o protocolo inteiro tenta evitar.

**Decisão.** Peso oculto por padrão. Liberável pelo profissional caso a caso, com justificativa. Quando liberado, aparece só como tendência em janela de semanas, nunca o número do dia. Bloqueado sem exceção no modo sem números. E o app não usa peso para calcular nada.

**Por quê.** Ignorar a evidência seria descartar um componente eficaz. Adotar sem trava reintroduz o problema.

**Consequência.** Registrado como decisão consciente para não voltar como discussão a cada ciclo. Revisão marcada para a versão 2.0.

---

## D-008 · Separar porta de segurança de caracterização
**09/08/2026**

**Contexto.** A primeira versão do protocolo usava um instrumento só fazendo dois trabalhos: decidir se o registro numérico é seguro, e descrever como a pessoa come.

**Decisão.** Etapas distintas, com instrumentos, finalidades e condutas distintas: 1a segurança, 1b caracterização, 1c compulsão, 1d restrição.

**Por quê.** Rastreio de segurança e descrição de padrão têm curvas de erro opostas. Um deve errar para o lado de sinalizar demais. O outro precisa descrever com precisão.

**Consequência.** Triagem positiva de risco restritivo aciona o modo sem números. Triagem positiva de compulsão não aciona, porque o tratamento de referência para compulsão usa automonitoramento estruturado, e retirar os números removeria uma ferramenta útil.

---

## D-009 · Manter o SCOFF, com desvio deliberado no item 3
**09/08/2026, revisado em 10/08/2026**

**Contexto.** Objeção do responsável clínico: as perguntas do SCOFF parecem mirar anorexia, bulimia e dismorfia, e 100% dos pacientes dele chegam sem sintoma restritivo, com dificuldade de perder peso por comer emocional, falta de controle e desorganização de rotina.

**Decisão.** Manter o SCOFF como porta de segurança. Adicionar um script de abertura obrigatório que enquadra a triagem como rotina aplicada a todo mundo. E fazer o item 3, sobre perda de mais de 6 kg em três meses, não pontuar quando a perda foi intencional e supervisionada.

**Por quê.** A objeção estava certa sobre o desconforto e sobre o desalinhamento populacional, e errada sobre a conclusão: base rate baixa com dano alto é exatamente o caso em que se mantém rastreio. O que estava errado não era rastrear, era transformar isso em formulário no minuto 1 sem enquadramento. Sem o ajuste do item 3, boa parte dos pacientes bem-sucedidos cairia no modo sem números pelo motivo errado.

**Consequência.** O escore deixa de ser comparável com a literatura do SCOFF. Registrado como desvio explícito no seed, e o validador exige que o campo exista.

---

## D-010 · Trocar o TFEQ-R21 pelo TFEQ-14
**10/08/2026**

**Contexto.** O protocolo usava o TFEQ-R21 lendo três domínios, restrição cognitiva, comer emocional e descontrole, e chamava a restrição de "a leitura mais acionável". A fonte apresentada para embasar isso foi uma reanálise da versão brasileira por Teoria de Resposta ao Item.

**Decisão.** Adotar a versão de 14 itens, unidimensional, com os pontos de corte 45 e 70.

**Por quê.** A reanálise mostrou que os três domínios não existem nos dados brasileiros. Comer emocional e descontrole se fundem, os seis itens de restrição cognitiva apontaram na direção oposta dos demais, e o alfa desse domínio foi 0,68. Retirados, sobra um instrumento com alfa 0,92. Insistir nos três domínios seria reportar um perfil que o instrumento não mede.

**Consequência.** Uma confusão de nomenclatura foi desfeita no caminho, e ela mudava a conta: "restrição cognitiva" no TFEQ não é sintoma restritivo, é mentalidade de dieta, que é quase universal em quem procura emagrecimento. A tese clínica sobre restrição rígida continua válida. O que caiu foi a capacidade daquele questionário de medi-la. Ver D-012.

---

## D-011 · Avaliar e dispensar o BEDS-7
**10/08/2026**

**Contexto.** Busca por um rastreio de compulsão mais adequado ao público do que o SCOFF.

**Decisão.** Considerado e não adotado.

**Por quê.** A favor: 7 itens, um minuto, item-porta que evita constranger quem não tem o quadro. Contra: sensibilidade altíssima com especificidade de 38,7%, o que num serviço de emagrecimento significa volume alto de falso-positivo; desenho patrocinado pela indústria farmacêutica no contexto de identificar candidatos a tratamento medicamentoso, o que enviesa para sobreinclusão; e sem validação brasileira publicada.

**Consequência.** O papel de porta que o BEDS-7 faria passou a ser feito pelo corte de 70 do próprio TFEQ-14, um instrumento a menos. Ver D-013.

---

## D-012 · Restrição rígida vira julgamento clínico, não escore
**10/08/2026**

**Contexto.** Perdida a subescala de restrição do TFEQ, faltou instrumento para um eixo que o protocolo trata como central. O DEAS-s foi cogitado para essa vaga.

**Decisão.** Não adicionar instrumento. As seis perguntas de restrição do TFEQ-R21 ficam como conversa explicitamente não pontuada, e o profissional registra uma flag: sim, não, ou não avaliada.

**Por quê.** O DEAS-s não mede restrição. Mede atitudes disfuncionais em geral, ocupando o mesmo território do SCOFF com 17 itens em vez de 5. O instrumento que mede o construto certo, o controle rígido versus flexível de Westenhoefer, tem 25 itens e adaptação portuguesa, não brasileira. Vinte e cinco itens para um eixo secundário anulariam o ganho de ter encurtado a consulta.

**Consequência.** É o único cruzamento do protocolo que depende de julgamento clínico e não de instrumento, e isso está dito no documento. A flag se soma ao padrão do TFEQ em vez de substituí-lo, porque restrição e descontrole são dois eixos que coexistem, não duas pontas de um eixo só.

---

## D-013 · ECAP condicional ao corte de 70
**10/08/2026**

**Contexto.** A proposta em discussão era ramificar pelo escore do TFEQ: alto vai para a ECAP, baixo vai para o DEAS-s.

**Decisão.** ECAP só quando o TFEQ-14 passa de 70. Abaixo disso, nenhum instrumento extra, e o paciente vai direto ao diagnóstico COM-B.

**Por quê.** O ramo original tinha um furo: restrição e descontrole coexistem, então mandar escore alto para a ECAP e escore baixo para o DEAS-s deixaria sem avaliação de restrição exatamente o paciente onde ela mais importa. E escore baixo num serviço de emagrecimento não é achado negativo, significa que a dificuldade está em rotina, ambiente e organização, que é território de COM-B e não pede questionário.

**Consequência.** A consulta 1 caiu de 42 para 19 itens no caso típico, e 35 no ramo pesado. A faixa "comer exagerado" já descreve o quadro que a ECAP caracteriza, então ela funciona como porta sem custar instrumento.

---

## D-014 · DEAS-s como medida de desfecho, não de triagem
**10/08/2026**

**Contexto.** O protocolo declara perseguir melhora de regulação e de relação com a comida, não emagrecimento, e não tinha nenhuma medida disso. TFEQ mede desregulação, SRBAI mede automaticidade, e "a relação com a comida melhorou" não tinha métrica.

**Decisão.** DEAS-s entra, mas fora do bloco de triagem: baseline e a cada 12 semanas, autoaplicado no app entre a consulta 1 e a 2.

**Por quê.** No slot certo ele mede exatamente a coisa que o protocolo persegue, sem pesar na consulta.

**Consequência.** O desfecho principal do protocolo passa a ser queda no TFEQ-14 acompanhada de queda no DEAS-s, e nenhum dos dois aparece na balança.

---

## D-015 · Escore por TRI, não por soma
**10/08/2026**

**Contexto.** Os pontos de corte do TFEQ-14 e do DEAS-s vêm de estudos que calcularam escore por Teoria de Resposta ao Item.

**Decisão.** Implementar o modelo de resposta gradual de Samejima com escore EAP, em `escores.py`, para os dois instrumentos. A ECAP continua soma simples, porque é assim que ela foi construída.

**Por quê.** Somar Likert e comparar com o corte publicado dá resultado errado, porque os itens têm discriminação e limiares diferentes. Era uma armadilha silenciosa: o número sairia plausível e estaria errado.

**Consequência.** Duas descobertas de calibragem que só apareceram ao rodar o cálculo. A faixa alcançável do TFEQ-14 é 26,9 a 82,2, e responder "falso, na maioria das vezes" nos 14 itens já resulta em 49,4, dentro da faixa emocional. O corte de 45 é sinal fraco neste público, e isso virou métrica de acompanhamento dos primeiros 30 dias. A escala de exibição do DEAS-s, por sinal, não é 50 + 10θ, apesar de o artigo descrevê-la assim: as âncoras publicadas não batem com a fórmula, e o código usa as âncoras.

---

## D-016 · Não inventar item de instrumento clínico
**10/08/2026**

**Contexto.** ECAP e DEAS-s entraram no protocolo antes de as publicações originais estarem disponíveis.

**Decisão.** Registrar os instrumentos como esqueleto, com o campo `pendencia` preenchido, e fazer o validador exigir que instrumento sem itens esteja marcado como pendente.

**Por quê.** Enunciado aproximado de instrumento validado é instrumento não validado.

**Consequência.** As duas pendências bloquearam o primeiro uso até as fontes chegarem, e foram resolvidas em seguida. Sobra uma: os enunciados do DEAS-s estão em inglês, como publicados, e a redação validada em português precisa vir do DEAS original. O validador falha se essa pendência for apagada enquanto os textos em inglês continuarem lá.

---

## D-017 · Voz impessoal na documentação, primeira pessoa nos posts
**10/08/2026**

**Contexto.** O repositório é público e serve de portfólio. Dúvida sobre escrever a documentação em primeira pessoa ou de forma impessoal.

**Decisão.** Impessoal no README, neste log e no protocolo, com uma única frase de autoria em primeira pessoa no README. A narrativa em primeira pessoa fica para os posts.

**Por quê.** README em primeira pessoa lê como exercício pessoal, e impessoal lê como coisa que existe: o leitor passa a avaliar o produto em vez do esforço. O protocolo, além disso, é documento clínico, e primeira pessoa ali soa a opinião. Mas o fato mais relevante do projeto, que quem escreveu o protocolo é o nutricionista que vai usá-lo no próprio consultório, estava invisível, e isso é o que separa este repositório de mais um habit tracker.

**Consequência.** Passada a skill humanizer nos três documentos públicos. Saíram travessões, negrito decorativo, emojis de status, ponto e vírgula empilhado e frases de efeito. Os rótulos em negrito das entradas deste log ficaram, porque são estrutura de formulário e não ênfase.

---

## D-018 · Não iniciar o piloto antes do app estar pronto
**10/08/2026**

**Contexto.** Havia um paciente candidato a piloto, e o roteiro da consulta 1 mais o aplicador dos instrumentos estavam prontos. A alternativa oferecida era dar um veículo provisório de registro para o intervalo entre consultas, uma linha por dia no WhatsApp ou um cartão de papel.

**Decisão.** Não começar. O piloto começa quando o app estiver pronto.

**Por quê.** Decisão do responsável clínico, coerente com D-004.

**Consequência.** O protocolo continua sem nenhuma validação de uso, e isso é o risco assumido em D-004 se materializando: a primeira vez que o roteiro rodar será com paciente real e app pronto. `roteiro-consulta-1.md` e `consulta.py` ficam prontos e parados. A verificação pendente da fase 0, cronometrar os blocos 1 a 4, passa a ser a primeira tarefa da fase 3.

---

## D-019 · Seed continua arquivo, e a prescrição guarda instantâneo do texto
**10/08/2026**

**Contexto.** Primeira decisão do modelo de dados: o que o `seed.json` vira no banco. A opção óbvia era transformar comportamento, categoria e técnica em tabelas com chave estrangeira.

**Decisão.** O seed continua arquivo lido em runtime. O banco guarda o id em texto, a versão do protocolo no ciclo, e um instantâneo do texto prescrito dentro da própria prescrição.

**Por quê.** Virar tabela criaria uma segunda fonte de verdade do conteúdo clínico, que é exatamente o que o `validate_seed.py` existe para impedir desde D-006. E D-004 exige saber sob qual versão cada ciclo rodou: com tabela, subir para a 1.5 vira migração de conteúdo versionada; com arquivo, basta o campo `protocolo_versao` e o histórico do git.

**Consequência.** Integridade referencial do conteúdo passa a ser responsabilidade do validador, não do banco — id de comportamento inexistente não é erro de chave estrangeira. Em compensação, a frase que o paciente leu fica congelada mesmo quando o rótulo muda.

---

## D-020 · Registro do paciente em log append-only, estado em tabela
**10/08/2026**

**Contexto.** O protocolo produz cinco tipos de registro heterogêneos: feito e não feito, lapso com contexto, fome e saciedade antes e depois, fome ou gatilho, surfar o desejo.

**Decisão.** Tudo que o paciente registra vira evento em log append-only, com tipo e conteúdo. Correção é evento novo, nunca `update`. O que muda no lugar — paciente, ciclo, prescrição, plano, cardápio, problema — fica em tabela normal.

**Por quê.** Inserção não gera conflito de sincronização, e tipo novo de registro não pede migração. O protocolo já mudou de forma três vezes em três versões.

**Consequência.** Adesão e taxa de registro viram agregação, não leitura de coluna. Consulta mais chata de escrever, e provavelmente uma tabela derivada quando o volume doer.

---

## D-021 · Alvo semanal explícito — a adesão da versão reduzida era incomputável
**10/08/2026**

**Contexto.** Ao desenhar como a adesão sairia do banco, apareceu um furo no protocolo. A regra da seção 9 é uma divisão, `dias cumpridos / dias válidos`, mas as versões reduzidas do seed diziam "três dias na semana" em texto corrido. Nenhum denominador legível por máquina.

**Decisão.** Cada comportamento ganha `regime_padrao`, `alvo_por_semana` e `reduzida_por_semana` no seed, com assert no validador. Protocolo sobe para 1.4.0.

**Por quê.** Sem denominador, a recalibragem automática — o mecanismo que impede o app de culpar o paciente por meta mal calibrada — não rodava em nenhuma meta reduzida. E ao classificar os 42 comportamentos apareceu o segundo furo: seis deles são oportunistas, disparados por estado interno e não por relógio. Quem teve duas vontades fortes na semana e surfou as duas tem adesão de 100%, não de 2 em 7. Tratar como agendado acionaria redução de meta em cima de quem fez exatamente o combinado.

**Consequência.** Os alvos padrão foram arbitrados por julgamento clínico, sem uso real, e entram como pendência da 1.5 para revisão com dado do piloto. O registro do comportamento oportunista passa a exigir as duas respostas, "aconteceu e eu fiz" e "aconteceu e eu não fiz", senão o denominador não existe.

---

## D-022 · O app é complemento do prontuário, não o prontuário
**10/08/2026**

**Contexto.** O modelo de dados podia crescer para virar registro clínico completo, com anamnese, evolução, antropometria e a guarda de prontuário exigida pelo conselho.

**Decisão.** O app guarda só o que o protocolo produz. Anamnese, antropometria, evolução e histórico continuam onde estão hoje. Um profissional, sem coluna de profissional e sem isolamento por linha.

**Por quê.** Virar prontuário multiplicaria o escopo da fase 2 e traria exigência de guarda, assinatura e interoperabilidade — nada disso serve ao problema que o app resolve, que é o intervalo entre consultas. Multi-profissional, sem um segundo profissional existindo, é uma coluna e um backfill adiados por custo zero.

**Consequência.** O relatório pré-consulta é leitura de apoio, não documento clínico. Se um dia o app precisar valer como prontuário, isto vira decisão nova que revoga esta.

---

## Ganchos de publicação

Decisões que rendem post por contarem uma reviravolta, e não só um resultado:

| Gancho | Decisões |
|---|---|
| "Matei minha própria ideia com uma conta de guardanapo" | D-001, D-002 |
| "O app não muda comportamento nenhum, quem muda é o profissional" | D-003 |
| "O paper que eu ia citar como fonte derrubou meu protocolo" | D-010 |
| "Meu cliente estava certo na crítica e errado na conclusão" | D-009, D-010 |
| "Cortei o questionário de 42 para 19 perguntas e melhorei o rastreio" | D-011, D-013 |
| "Somar as respostas dava um número plausível e errado" | D-015 |
| "O validador que impede o documento clínico e o código de divergirem" | D-006 |
| "Desenhar o banco encontrou um furo no protocolo que a leitura clínica não pegou" | D-021 |
