# App — Intervalo

Página web em TypeScript para os dois perfis (D-024). Sem framework: Vite
empacota, Supabase dá banco e login, o resto é DOM.

| Página | Quem | O quê |
|---|---|---|
| `index.html` | ambos | login, encaminha pelo papel |
| `paciente.html` | celular | registro em poucos toques, fila local, consentimento e exportação |
| `profissional.html` | consultório | pacientes, ciclo, prescrição, instrumentos, relatório pré-consulta |

O conteúdo clínico vem de `../protocolo/seed.json` — o mesmo arquivo que o
validador testa (D-019). Os módulos de cálculo são puros e testados:

| Módulo | Papel | Teste |
|---|---|---|
| `src/escores.ts` | TFEQ-14, DEAS-s, ECAP — porte do `escores.py` | 2000 vetores de fuzzing gerados pelo Python + autochecks publicados |
| `src/adesao.ts` | adesão agendado/oportunista e taxa de registro | fórmulas de MODELO-DE-DADOS.md |
| `src/fila.ts` | fila local IndexedDB, sync sem duplicar (D-023) | store em memória |
| `src/relatorio.ts` | itens 1–7e do relatório pré-consulta | sinais 7a–7e |

## Rodar

```bash
npm install
npm test              # node --test, sem build
cp .env.example .env.local   # preencher com o projeto Supabase
npm run dev           # desenvolvimento
npm run build         # dist/ para hospedagem estática
```

Se `protocolo/escores.py` mudar, regenerar os vetores: `npm run vetores`
(o teste do porte falha se as duas versões divergirem — é o objetivo).

## Subir do zero

1. Aplicar `../supabase/migrations/` na ordem, e `../supabase/testes_rls.sql`
2. Criar o usuário do profissional (ver `../supabase/README.md`)
3. Para cada paciente: Authentication → Add user; inserir `perfis` (papel
   `paciente`) e vincular `pacientes.user_id` — o cadastro clínico a tela do
   profissional cria
4. Configurar os secrets `SUPABASE_URL` e `SUPABASE_ANON_KEY` no GitHub para o
   ping semanal (`.github/workflows/ping.yml`)
5. Agendar o backup diário no consultório (`../backup/`)

## O que ainda não tem tela

DEAS-s autoaplicado (itens ainda sem redação em português — pendência de fase
0) e o disparo de SRBAI a cada 4 semanas para o paciente (hoje o profissional
aplica em consulta). Plano de enfrentamento, cardápio e problemas são criados
via painel por enquanto; o paciente já os vê no app.
