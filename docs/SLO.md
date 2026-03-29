# SLOs (Service Level Objectives) — GameficaRH

## Definições

| Serviço | SLI (Indicador) | SLO (Objetivo) | Janela |
|---------|-----------------|-----------------|--------|
| **App Frontend** | Disponibilidade (HTTP 200) | 99.5% | 30 dias |
| **App Frontend** | LCP (Largest Contentful Paint) | < 2.5s p95 | 30 dias |
| **App Frontend** | CLS (Cumulative Layout Shift) | < 0.1 p95 | 30 dias |
| **Supabase API** | Latência de queries | < 500ms p99 | 30 dias |
| **Supabase API** | Error rate | < 1% | 30 dias |
| **Edge Functions** | Latência | < 2s p95 | 30 dias |
| **Edge Functions** | Error rate | < 2% | 30 dias |
| **Auth Flow** | Login success rate | > 98% | 30 dias |
| **Auth Flow** | Latência de login | < 3s p95 | 30 dias |
| **External API** | Disponibilidade | 99% | 30 dias |
| **External API** | Latência | < 1s p95 | 30 dias |
| **Webhooks** | Delivery success rate | > 95% | 30 dias |
| **Webhooks** | Latência de processamento | < 5s p95 | 30 dias |

## Error Budget

| Serviço | SLO | Budget/mês (30d) |
|---------|-----|------------------|
| App Frontend 99.5% | 0.5% downtime | ~3.6 horas |
| Supabase API 99% | 1% errors | ~7.2 horas |
| Edge Functions 98% | 2% errors | ~14.4 horas |

## Alertas Vinculados

| Alerta | Condição | Ação (Runbook) |
|--------|---------|----------------|
| App Down | HTTP 5xx > 5% por 5 min | [Runbook: Verificar deploy](./OPERATIONS.md#troubleshooting) |
| DB Lento | Query p99 > 1s por 10 min | [Runbook: DB lento](./OPERATIONS.md#banco-lento) |
| Auth Failures | Login errors > 10% por 5 min | [Runbook: Auth](./OPERATIONS.md#autenticação-falhando) |
| Edge Function Crash | Error rate > 5% por 5 min | [Runbook: Edge Function](./OPERATIONS.md#edge-function-falhando) |

## Métricas RED por Endpoint

| Endpoint | Rate (req/min) | Error (%) | Duration (p95) |
|----------|:--------------:|:---------:|:--------------:|
| `/auth/login` | Monitorar | < 2% | < 2s |
| `/rest/v1/profiles` | Monitorar | < 1% | < 300ms |
| `/rest/v1/quests` | Monitorar | < 1% | < 500ms |
| `/functions/v1/external-api` | Monitorar | < 2% | < 1s |
| `/functions/v1/health` | Monitorar | 0% | < 200ms |

## Revisão

- SLOs revisados **trimestralmente** pelo time
- Error budgets revisados **mensalmente**
- Alertas testados **mensalmente** (fire drill)
