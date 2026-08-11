/**
 * Termo de consentimento (LGPD, seção 13 do protocolo). Versionado: mudar o
 * texto exige subir a versão, e o aceite grava qual versão o paciente leu.
 */
export const CONSENTIMENTO_VERSAO = "1.0";

export const CONSENTIMENTO_TEXTO = `
Este aplicativo registra o que combinamos em consulta: os comportamentos
prescritos, os seus registros diários (feito, não feito, lapsos, sinais de
fome) e as respostas dos questionários que fazem parte do acompanhamento.

O que é coletado — apenas o que você registra aqui e as respostas dos
questionários aplicados em consulta. Nada de calorias, nada de peso (a menos
que liberado em conjunto, com justificativa), nenhum dado do seu celular além
do que você digita.

Para que serve — para o seu nutricionista chegar na próxima consulta sabendo
como foi o intervalo, em vez de depender da memória. Os dados não são usados
para nenhuma outra finalidade, não são vendidos e não alimentam publicidade.

Quem vê — somente você e o seu nutricionista. Os escores dos questionários
são instrumento de trabalho clínico e são lidos pelo profissional, que os
discute com você em consulta.

Onde ficam — em banco de dados hospedado no Brasil (região São Paulo), com
acesso restrito por autenticação, e cópia de segurança no computador do
consultório.

Seus direitos — a qualquer momento você pode: exportar tudo o que registrou
(botão nesta tela); revogar este consentimento, o que encerra os registros
sem afetar o seu atendimento; e pedir ao profissional a exclusão definitiva
dos seus dados, inclusive das respostas de questionários.
`.trim();
