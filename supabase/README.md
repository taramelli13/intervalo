# Banco — Supabase

Esquema derivado de [`MODELO-DE-DADOS.md`](../MODELO-DE-DADOS.md). O arquivo SQL no repositório é a fonte de verdade; o dashboard é só onde ele roda.

## Aplicar, na ordem

No SQL Editor do projeto (Dashboard → SQL Editor → New query):

1. Colar e rodar os arquivos de `migrations/` na ordem numérica (0001, 0002, 0003…)
2. Colar e rodar `testes_rls.sql` — tem que terminar com **"ok — nenhuma fuga"** nas mensagens. Ele cria dados de teste e desfaz tudo no final; pode rodar quantas vezes quiser, inclusive em produção

## Criar o usuário do profissional

1. Dashboard → Authentication → Add user → e-mail e senha
2. Copiar o UUID do usuário criado e rodar no SQL Editor:

```sql
insert into perfis values ('<uuid-copiado>', 'profissional');
```

Paciente segue o mesmo caminho com papel `'paciente'`, mais uma linha em `pacientes` com o `user_id` dele — mas isso a tela da consulta 1 vai fazer sozinha.

## O que os invariantes do modelo viram aqui

| Invariante | Implementação |
|---|---|
| Teto de 3 comportamentos (2 na manutenção) | trigger `teto` |
| `sem_numeros` nunca editado à mão | trigger `scoff`, único caminho de escrita |
| Evento append-only | trigger `imutavel` — barra update/delete até de service_role |
| Escore invisível ao paciente | ausência de policy de select em `aplicacoes_instrumento` |
| Peso só liberado e fora do modo sem números | trigger `peso` |

Mudança de esquema é arquivo novo em `migrations/` (`0002_...`), nunca edição do aplicado.
