# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

## [Unreleased]

### Adicionado
- Auth guards (`requireAuth`, `requireSelfOrAdmin`, `requireAdminOrManager`, `requireAdmin`) em 43 services
- RPCs atômicos PostgreSQL para XP/coins/streak (`add_xp_atomic`, `add_coins_atomic`, etc.)
- Backup codes 2FA com `crypto.getRandomValues()` + SHA-256 hash
- Rate limiting em verificação 2FA (5 tentativas / 15 min lockout)
- CORS whitelist compartilhado para todas 24 Edge Functions (`_shared/cors.ts`)
- WebAuthn challenge TTL (5 min expiry + cleanup automático)
- GitHub Actions CI/CD pipeline (type-check → lint → format → test → build)
- Dependabot para npm + GitHub Actions
- Web Vitals reporting (LCP, FID, CLS) via PerformanceObserver nativo
- Sentry integration stub (`src/lib/monitoring.ts`)
- Dockerfile multi-stage (dev + build + production/nginx)
- OpenAPI 3.0 spec para external-api (`docs/openapi.yml`)
- Diagramas de arquitetura Mermaid (`docs/ARCHITECTURE.md`)
- 5 Architecture Decision Records (ADR-001 a ADR-005)
- 12 arquivos de testes (authGuards, profilesService, shopService, twoFactor, kudos, duels, etc.)
- CONTRIBUTING.md com padrões de desenvolvimento
- `.prettierrc` + `.prettierignore` para formatação consistente
- PR template com checklist

### Corrigido
- Race condition em `profilesService.addXp/addCoins/incrementStreak` (get-modify-write → FOR UPDATE)
- Race condition em `shopService.purchaseReward` (double-spend → `purchase_reward_atomic`)
- Race condition em `seasonalEventsService.incrementProgress` (get-or-create → upsert)
- Race condition em `missionsService.getOrCreateProgress` (get-or-create → upsert)
- `supabase.raw()` inexistente em Edge Functions → RPCs atômicos
- `document.write()` XSS em PDF export → blob URL
- IP address sempre null em `useLoginLockout` → detecta via Edge Function
- Audit logging silencioso (catch vazio) → `logger.warn()`
- Kudos `getKudosReceived/Given` retornando null profiles → JOINs completos
- HTTP em `verify-geo` → HTTPS + validação de IP (anti-SSRF)
- IpAccessGuard fail-open imediato → 3 retries antes
- `missionsService.claimReward` sem ownership check → verifica `user_id`
- SECURITY DEFINER sem auth checks → `_check_profile_access()`

### Segurança
- Migração de `localStorage` para `sessionStorage` para tokens Supabase
- `.env` adicionado explicitamente ao `.gitignore`
- ESLint security rules (no-eval, no-implied-eval, no-new-func, no-script-url)
- CSP headers no Vite dev server
- nginx.conf com security headers para produção
- PII redaction automática no logging service
- DB constraints: `CHECK (xp >= 0)`, `CHECK (coins >= 0)`, `CHECK (level >= 1)`

### Alterado
- TypeScript: habilitado `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- RBAC hook: 3-query waterfall → single unified RPC
- GamificationContext: valor memoizado com `useMemo()`
- Logging service: buffer 100 → 200, external handler interface
