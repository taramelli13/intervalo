# Backup diário do banco (requisito de v1, D-024): pg_dump completo, com data
# no nome, guardando os últimos 30. Agendar no computador do consultório:
#
#   schtasks /create /tn "Intervalo backup" /sc daily /st 07:30 `
#     /tr "powershell -NoProfile -File C:\intervalo\backup\backup.ps1"
#
# Pré-requisitos: pg_dump no PATH (instalador do PostgreSQL, só as ferramentas
# de cliente) e a connection string do Supabase (painel > Database > Connection
# string, modo session) salva na variável de ambiente INTERVALO_DB_URL.

$destino = Join-Path $PSScriptRoot "dumps"
New-Item -ItemType Directory -Force $destino | Out-Null

$arquivo = Join-Path $destino ("intervalo-{0}.dump" -f (Get-Date -Format "yyyy-MM-dd"))
pg_dump $env:INTERVALO_DB_URL --format=custom --file=$arquivo
if ($LASTEXITCODE -ne 0) { throw "pg_dump falhou ($LASTEXITCODE)" }

# retenção: 30 dumps mais recentes
Get-ChildItem $destino -Filter "intervalo-*.dump" |
  Sort-Object Name -Descending | Select-Object -Skip 30 |
  Remove-Item -Confirm:$false

Write-Output "ok — $arquivo ($([math]::Round((Get-Item $arquivo).Length / 1kb)) KB)"
