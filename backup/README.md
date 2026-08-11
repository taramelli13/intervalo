# Backup e restauração

Backup que nunca foi restaurado não é backup. Duas rotinas:

## Diária — `backup.ps1`

`pg_dump` completo do banco do Supabase para `backup/dumps/`, com retenção de
30 dias. Agendamento e pré-requisitos estão comentados no topo do script.

## Mensal — ensaio de restauração

No primeiro dia útil do mês, restaurar o dump mais recente num banco local e
conferir que os dados estão lá:

```powershell
createdb ensaio_intervalo
pg_restore -d ensaio_intervalo --no-owner (Get-ChildItem backup\dumps | Sort-Object Name | Select-Object -Last 1).FullName
psql -d ensaio_intervalo -c "select count(*) from eventos; select max(registrado_em) from eventos;"
dropdb ensaio_intervalo
```

Critério: `max(registrado_em)` é de ontem ou hoje. Se não for, o backup está
rodando mas não está backupeando — tratar como incidente, não como detalhe.
