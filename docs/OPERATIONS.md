# Runbook Operacional — GameficaRH

## Git Flow

```
main (produção)
  └── feat/xxx (features)
  └── fix/xxx (bug fixes)
  └── hotfix/xxx (correções urgentes em prod)
```

- **Branch principal:** `main`
- **Formato de branch:** `feat/descricao`, `fix/descricao`, `hotfix/descricao`
- **Commits:** Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`)
- **PR obrigatório** para merge em main
- **CI deve passar** antes do merge

## Deploy

### Produção
1. Merge PR em `main`
2. CI executa: type-check → lint → format:check → test → build
3. Build publicado automaticamente via Lovable/Vercel

### Rollback
1. Identifique o commit anterior estável: `git log --oneline -10`
2. Crie hotfix branch: `git checkout -b hotfix/rollback-xxx main~1`
3. Push e crie PR urgente (sem review obrigatório para hotfixes)

## Procedimento de Incidente

| Severidade | Descrição | SLA | Ação |
|:---:|-----------|-----|------|
| P0 | Sistema inacessível | 15 min | Rollback imediato + post-mortem em 24h |
| P1 | Feature crítica quebrada | 1h | Hotfix + post-mortem em 48h |
| P2 | Bug não-bloqueante | 24h | Fix no próximo sprint |
| P3 | Melhoria/cosmético | Backlog | Priorizar normalmente |

### Checklist de Incidente
1. [ ] Identificar o problema (logs, monitoramento)
2. [ ] Comunicar no canal do time
3. [ ] Mitigar (rollback, feature flag, disable integration)
4. [ ] Corrigir (hotfix branch)
5. [ ] Validar (testes, staging)
6. [ ] Deploy da correção
7. [ ] Post-mortem (dentro de 48h)

## Troubleshooting

### Banco lento
1. Verificar `query_telemetry` para queries lentas
2. Executar `EXPLAIN ANALYZE` nas top queries
3. Verificar se índices existem nas colunas filtradas
4. Verificar connection pooling no Supabase dashboard

### Edge Function falhando
1. Verificar logs no Supabase dashboard → Edge Functions → Logs
2. Verificar se secrets estão configurados (SUPABASE_SERVICE_ROLE_KEY)
3. Verificar CORS headers (deve usar `_shared/cors.ts`)
4. Testar localmente: `supabase functions serve <function-name>`

### Autenticação falhando
1. Verificar se tokens estão em `sessionStorage` (não localStorage)
2. Verificar se `verify-ip` Edge Function está respondendo
3. Verificar rate limiting: `ip_access_logs` e `login_attempts` tables
4. Verificar 2FA: `user_two_factor` table status

### Integração Bitrix24 falhando
1. Verificar OAuth tokens: `bitrix24-oauth` Edge Function logs
2. Verificar rate limits (50 req/s padrão Bitrix24)
3. Verificar webhook logs: `bitrix24_webhook_logs` table

## Rotinas Periódicas

| Frequência | Tarefa | Responsável |
|-----------|--------|-------------|
| Semanal | Dependabot PRs review | Dev de plantão |
| Semanal | npm audit check | CI automático |
| Mensal | Revisão de segurança (RLS, auth guards) | Tech Lead |
| Trimestral | Revisão de deps major version | Time |
| Semestral | Pen test / security audit | Externo |
