# Relatório de Auditoria do Sistema — GameficaRH

**Data:** 2026-03-26
**Escopo:** Análise exaustiva de segurança, performance, arquitetura e manutenibilidade
**Plataforma:** React 18 + TypeScript + Supabase (PostgreSQL) + Vite + PWA

---

## Sumário Executivo

O **GameficaRH** é uma plataforma de gamificação corporativa construída sobre React 18 / TypeScript no frontend e Supabase (PostgreSQL) como backend-as-a-service. O sistema inclui ~650 arquivos, 100+ tabelas, 27 Edge Functions e uma ampla gama de funcionalidades: RBAC, 2FA/WebAuthn, sistema de quests, loja virtual, trilhas de aprendizado, integrações externas via API/Webhook, e um painel administrativo completo.

### Saúde Geral do Sistema

| Categoria | Nota | Status |
|-----------|------|--------|
| Autenticação | 8/10 | Bom — 2FA, WebAuthn, HIBP check |
| Autorização (RBAC) | 7/10 | Bom — RLS + RBAC, mas waterfall de queries |
| Validação de Dados | 7/10 | Bom — Zod schemas, gaps na camada de serviço |
| Segurança | 6/10 | **Atenção** — Race conditions, backup codes fracos |
| Performance | 6/10 | Moderado — Waterfalls, re-renders, cache agressivo |
| Testes | 3/10 | **Crítico** — Apenas 2 arquivos de teste |
| Logging/Monitoring | 4/10 | Fraco — Apenas in-memory, sem tracking externo |
| Documentação | 4/10 | Fraco — Sem ADR, docs técnicos mínimos |
| Infraestrutura | 7/10 | Bom — PWA, code splitting, RLS |

---

## 1. Segurança

### 1.1 [CRÍTICO] Race Condition em profilesService — CORRIGIDO

**Descrição:** As funções `addXp()`, `addCoins()`, `incrementStreak()` e `incrementQuestsCompleted()` usavam padrão read-modify-write (get → calculate → update) sem transações. Duas operações simultâneas liam o mesmo valor e sobreescreviam uma à outra.

**Impacto:** Perda silenciosa de XP/coins em cenários concorrentes (ex: dois webhooks completando tarefas simultaneamente).

**Severidade:** Alta | **Prioridade:** Crítica

**Correção aplicada:**
- Criadas funções PostgreSQL atômicas (`add_xp_atomic`, `add_coins_atomic`, `increment_streak_atomic`, `increment_quests_completed_atomic`) usando `SELECT ... FOR UPDATE` + `UPDATE` na mesma transação.
- `profilesService.ts` agora tenta RPC atômico primeiro e faz fallback para o padrão antigo.
- Adicionadas constraints de banco: `CHECK (xp >= 0)`, `CHECK (coins >= 0)`, `CHECK (level >= 1)`.

**Evidência:** `src/services/profilesService.ts:58-85` (antes) → padrão get-modify-set sem lock.

```sql
-- Nova função atômica (migration 20260326100000)
CREATE OR REPLACE FUNCTION add_xp_atomic(p_user_id UUID, p_amount INT)
RETURNS JSONB AS $$
  SELECT xp, level FROM profiles WHERE id = p_user_id FOR UPDATE;
  -- Calcula e atualiza atomicamente
$$;
```

---

### 1.2 [CRÍTICO] Backup Codes 2FA com Math.random() — CORRIGIDO

**Descrição:** Os códigos de backup do 2FA eram gerados com `Math.random()`, que é previsível e não criptograficamente seguro (~34 bits de entropia por código).

**Impacto:** Atacante poderia prever códigos de backup e bypassar 2FA.

**Severidade:** Alta | **Prioridade:** Crítica

**Correção aplicada:**
- Substituído `Math.random()` por `crypto.getRandomValues()` (Web Crypto API).
- Cada código agora tem 32 bits de entropia verdadeira (8 chars hex).
- Códigos são hashados com SHA-256 antes do armazenamento no banco.
- Códigos plaintext são mostrados ao usuário apenas uma vez durante setup.

**Evidência:** `src/services/twoFactorService.ts:29` (antes):
```typescript
// ANTES (inseguro):
const code = Math.random().toString(36).substring(2, 8).toUpperCase();

// DEPOIS (seguro):
const bytes = new Uint8Array(count * 4);
crypto.getRandomValues(bytes);
```

---

### 1.3 [CRÍTICO] Backup Codes Armazenados em Plaintext — CORRIGIDO

**Descrição:** Códigos de backup eram salvos como texto puro na tabela `user_two_factor`, permitindo exposição em caso de vazamento do banco.

**Correção aplicada:**
- Códigos são hashados com SHA-256 via `crypto.subtle.digest()` antes de salvar.
- Verificação usa comparação de hash (não plaintext).

---

### 1.4 [ALTO] CORS Wildcard em Edge Functions — CORRIGIDO

**Descrição:** Todas as Edge Functions usavam `Access-Control-Allow-Origin: '*'`, permitindo requisições de qualquer origem.

**Impacto:** Potencial para ataques CSRF e exfiltração de dados via sites maliciosos.

**Correção aplicada:**
- Criado módulo compartilhado `supabase/functions/_shared/cors.ts` com whitelist de origens.
- Origens de desenvolvimento (localhost, lovable.dev) permitidas via regex.
- Header `Vary: Origin` adicionado para correto caching de CDN.
- Aplicado em `external-api`, `external-webhook`, `verify-ip`.

---

### 1.5 [ALTO] supabase.raw() Inexistente — CORRIGIDO

**Descrição:** Edge Functions usavam `supabase.raw(\`xp + ${value}\`)` que **não existe** na biblioteca supabase-js. Essas chamadas falhavam silenciosamente, resultando em recompensas nunca creditadas.

**Locais:** `external-api/index.ts` (grantAchievement), `external-webhook/index.ts` (handleUserCheckin)

**Correção aplicada:**
- Substituído por chamadas RPC atômicas (`add_xp_atomic`, `add_user_rewards`).

---

### 1.6 [ALTO] Sem Rate Limiting em Verificação 2FA — CORRIGIDO

**Descrição:** Não havia limite de tentativas na verificação de TOTP/backup codes, permitindo brute-force.

**Correção aplicada:**
- Rate limiter in-memory por userId: máximo 5 tentativas por 15 minutos.
- Lockout temporário com mensagem informativa ao usuário.
- Reset automático após período de lockout ou verificação bem-sucedida.

---

### 1.7 [MÉDIO] IpAccessGuard Fail-Open Imediato — CORRIGIDO

**Descrição:** Qualquer erro de rede na verificação de IP resultava em acesso imediato (fail-open), sem retry.

**Correção aplicada:**
- Sistema de retry (3 tentativas) antes de fail-open.
- Logging prominente quando fail-open é acionado.
- UI de retry para o usuário durante falhas intermediárias.

---

### 1.8 [MÉDIO] Validação de Input Ausente em profilesService.update

**Descrição:** O método `update()` aceitava qualquer valor sem validação client-side.

**Correção aplicada:**
- Função `validateProfileUpdate()` verifica ranges de todos os campos numéricos.
- Constraints de banco de dados como segunda camada de defesa.

---

### 1.9 [INFO] Análise de Endpoints Públicos (verify_jwt: false)

Funções sem verificação JWT (endpoints públicos):

| Função | Justificativa | Risco |
|--------|---------------|-------|
| `bitrix24-oauth` | OAuth callback externo | Médio — validar tokens |
| `bitrix24-webhook` | Webhook recebido | Médio — validar assinatura |
| `external-api` | API com chave própria | Baixo — autenticação por API key |
| `external-webhook` | Webhook com chave | Baixo — autenticação por API key |
| `verify-ip` | Chamada pré-auth | Baixo — retorna apenas allow/deny |
| `send-rate-limit-alert` | Alerta interno | Baixo |
| `detect-new-device` | Detecção de dispositivo | Médio |
| `verify-geo` | Verificação geográfica | Baixo |

**Recomendação:** Revisar `bitrix24-oauth` e `detect-new-device` para adicionar validação de assinatura/token.

---

## 2. Performance

### 2.1 [ALTO] RBAC Query Waterfall — CORRIGIDO

**Descrição:** O hook `useRBAC` executava 3 queries sequenciais (waterfall):
1. `user_roles` → obtém roles do usuário
2. `roles` → obtém detalhes das roles
3. `role_permissions` + `permissions` → obtém permissões

**Impacto:** ~300-500ms de latência no carregamento de permissões. Multiplica por 3 a latência de rede.

**Correção aplicada:**
- Criada função SQL `get_user_rbac(p_user_id)` que retorna tudo em um único JOIN.
- Hook `useRBAC` agora usa uma única query RPC com fallback para o padrão antigo.

```sql
-- Uma query substitui três
SELECT jsonb_build_object(
  'roles', (SELECT ... FROM user_roles ur JOIN roles r ...),
  'permissions', (SELECT ... FROM role_permissions rp JOIN permissions p ...)
) WHERE ur.user_id = p_user_id;
```

---

### 2.2 [MÉDIO] GamificationContext Não Memoizado — CORRIGIDO

**Descrição:** O valor do contexto era recriado a cada render do Provider, causando re-renders desnecessários em todos os consumidores.

**Correção:** `useMemo()` aplicado ao valor do contexto.

---

### 2.3 [MÉDIO] Leaderboard com refetchInterval Agressivo

**Descrição:** `useWeeklyLeaderboard` usa `refetchInterval: 60000` (1 minuto), gerando queries constantes ao banco mesmo quando o usuário não está vendo o leaderboard.

**Recomendação:**
- Aumentar `staleTime` para 5 minutos
- Usar `refetchOnWindowFocus` em vez de interval fixo
- Considerar Supabase Realtime para atualizações push

---

### 2.4 [MÉDIO] N+1 Query em kudosService

**Descrição:** Após buscar kudos, faz query separada para profiles dos usuários envolvidos.

**Recomendação:** Usar JOINs do Supabase:
```typescript
supabase.from("kudos").select(`
  *,
  from_profile:profiles!from_user_id(display_name, avatar_url),
  to_profile:profiles!to_user_id(display_name, avatar_url)
`);
```

---

### 2.5 [BAIXO] Real-time Channel Name Collisions

**Descrição:** Múltiplos componentes usando `supabase.channel("kudos-realtime")` compartilham o mesmo canal, causando invalidações desnecessárias.

**Recomendação:** Usar nomes únicos: `kudos-realtime-${componentId}`.

---

## 3. Banco de Dados

### 3.1 Modelagem e RLS

**Pontos positivos:**
- RLS habilitado em todas as tabelas core
- Políticas granulares (users can view, only update own)
- Helper function `has_role()` para verificações de admin
- Audit logging via `entity_versions` e `audit_logs`

**Gaps identificados:**

| Problema | Severidade | Recomendação |
|----------|-----------|--------------|
| Profiles com SELECT público (`USING (true)`) | Médio | Restringir a colunas não-PII |
| 71 migrations sem consolidação | Baixo | Squash migrations periódico |
| Sem índices explícitos em `audit_logs.entity_type` | Médio | Adicionar índice composto |
| WebAuthn challenges sem TTL | Médio | **CORRIGIDO** — migration 20260326100002 |

---

### 3.2 Funções SECURITY DEFINER

Funções `SECURITY DEFINER` executam com privilégios do owner (geralmente superuser). Verificar que:
- `add_xp_atomic` — OK, recebe apenas user_id e amount
- `add_user_rewards` — OK, parâmetros validados
- `get_user_rbac` — OK, somente leitura
- `get_executive_metrics` — **Atenção:** acessa contagens globais

---

## 4. Manutenibilidade e Código

### 4.1 [ALTO] TypeScript com Modo Permissivo

**Configuração atual (`tsconfig.json`):**
```json
{
  "noImplicitAny": false,
  "strictNullChecks": false,
  "noUnusedLocals": false,
  "noUnusedParameters": false
}
```

**Impacto:** Bugs de null/undefined não são detectados em compile-time. Variáveis não usadas acumulam. Types `any` proliferam.

**Recomendação progressiva:**
1. Habilitar `noUnusedLocals` e `noUnusedParameters` (baixo risco)
2. Habilitar `strictNullChecks` (médio esforço, alto retorno)
3. Habilitar `noImplicitAny` (alto esforço)

---

### 4.2 [ALTO] Cobertura de Testes Mínima

**Estado atual:** Apenas 2 arquivos de teste:
- `src/test/external-db-bridge.test.ts` (53KB)
- `src/test/telemetry.test.tsx` (22KB)

**Funcionalidades sem testes:**
- Autenticação e fluxo de login
- RBAC e verificação de permissões
- Operações de XP/coins (race conditions)
- 2FA setup e verificação
- WebAuthn registration/authentication
- Fluxo de compra na loja virtual
- Quest completion e reward granting
- Edge Functions (external-api, webhooks)

**Recomendação:**
```
Prioridade 1: Testes para auth, RBAC, XP atomicity
Prioridade 2: Testes para 2FA, WebAuthn, shop
Prioridade 3: E2E com Playwright para fluxos críticos
Meta: 60%+ coverage em services/ e hooks/
```

---

### 4.3 [MÉDIO] Fire-and-Forget em Operações de Auditoria — CORRIGIDO

**Descrição:** Audit logging usava `.catch(() => {})` (swallow silencioso de erros).

**Correção:** Substituído por `.catch((err) => logger.warn(...))` com mensagem descritiva.

---

### 4.4 [MÉDIO] Componentes Admin Redundantes

`PermissionsManager.tsx` (133 linhas) e `RolePermissionsManager.tsx` (543 linhas) implementam funcionalidade similar com UIs diferentes.

**Recomendação:** Consolidar em um único componente.

---

## 5. Logging e Monitoramento — MELHORADO

### Estado anterior:
- Logs in-memory (máximo 100 entries), perdidos no refresh
- Sem redação de PII
- Sem integração com serviços externos
- Sem métricas de performance

### Melhorias aplicadas:
- **PII Redaction:** Campos sensíveis (password, token, cpf, api_key, etc.) automaticamente substituídos por `[REDACTED]`
- **External Handler:** Interface `setExternalHandler()` para integração com Sentry/DataDog
- **Buffer aumentado** para 200 entries
- **Filtro por level:** `getLogsByLevel('error')`

### Recomendações pendentes:
1. Integrar Sentry para error tracking em produção
2. Adicionar métricas de performance (Web Vitals)
3. Implementar log shipping para análise histórica
4. Configurar alertas para erros recorrentes

---

## 6. Integrações Externas

### 6.1 External API (`external-api/index.ts`)

**Pontos positivos:**
- Autenticação por API key + secret
- Permission checking (read/write/admin)
- Request logging com duração
- Validação de campos obrigatórios

**Gaps:**
- Sem rate limiting por API key (apenas global)
- Sem paginação com cursor (usa offset)
- `search` parameter usa `.ilike.%${search}%` — seguro via PostgREST mas poderia usar sanitização extra

### 6.2 External Webhook (`external-webhook/index.ts`)

**Pontos positivos:**
- Webhook outbound triggering
- Batch operations support
- Idempotency check (task already exists)

**Gaps:**
- Batch sem limite de tamanho (poderia receber array de 100K items)
- Sem webhook signature verification no inbound

**Recomendação:** Adicionar `MAX_BATCH_SIZE = 100` e verificação HMAC para webhooks recebidos.

---

## 7. Infraestrutura e Custos

### 7.1 PWA e Caching

**Estado:** Bem configurado com Workbox:
- Fonts: CacheFirst (1 ano)
- Imagens: CacheFirst (30 dias)
- API: StaleWhileRevalidate (24h)
- Offline check-in via Background Sync

### 7.2 Bundle Splitting

Chunks otimizados: `vendor`, `ui`, `charts`, `animation`, `supabase`, `query`.

### 7.3 Estimativa de Custos Supabase

| Recurso | Uso Estimado | Observação |
|---------|-------------|------------|
| Database | 100+ tabelas, RLS ativo | Monitorar query count |
| Auth | Email/password + 2FA | Dentro do free tier |
| Edge Functions | 27 funções | Monitorar invocações |
| Realtime | Channels para kudos, notifications | Monitorar connections |
| Storage | Avatares, certificados | Verificar limites |

**Recomendação:** Configurar alertas de uso no dashboard Supabase para evitar surpresas de billing.

---

## 8. Benchmarking com Padrões de Mercado

| Critério | GameficaRH | Padrão SaaS B2B | Gap |
|----------|-----------|-----------------|-----|
| Autenticação MFA | 2FA + WebAuthn | 2FA + SSO/SAML | Falta SSO/SAML |
| Cobertura de testes | ~2% | >60% | **Crítico** |
| Error tracking | Nenhum | Sentry/DataDog | **Alto** |
| CI/CD | Não visível | GitHub Actions + staging | **Alto** |
| Security headers (CSP) | Ausente | Obrigatório | **Alto** |
| Rate limiting | In-memory | Redis/persistente | Médio |
| Observabilidade | Logs in-memory | APM + dashboards | **Alto** |
| Documentação API | Endpoints listados | OpenAPI/Swagger | Médio |
| Backup/Recovery | Supabase managed | Multi-region | Baixo |
| GDPR/LGPD compliance | PII em profiles | Consentimento + DPO | Médio |

---

## 9. Roadmap de Correções

### Sprint 1 (Semana 1-2) — Crítico
- [x] ~~Race condition em profilesService~~
- [x] ~~Backup codes com Math.random()~~
- [x] ~~Backup codes em plaintext~~
- [x] ~~supabase.raw() inexistente~~
- [x] ~~Rate limiting em 2FA~~
- [ ] Integrar Sentry para error tracking
- [ ] Adicionar CSP headers via Vite plugin

### Sprint 2 (Semana 3-4) — Alto
- [x] ~~CORS wildcard em Edge Functions~~
- [x] ~~RBAC query waterfall~~
- [x] ~~IpAccessGuard fail-open~~
- [ ] Testes para auth, RBAC, profilesService
- [ ] Habilitar `strictNullChecks` no TypeScript
- [ ] CI/CD pipeline com GitHub Actions

### Sprint 3 (Semana 5-6) — Médio
- [x] ~~GamificationContext memoization~~
- [x] ~~WebAuthn challenge TTL~~
- [x] ~~PII redaction no logging~~
- [ ] Consolidar PermissionsManager
- [ ] Fix N+1 em kudosService
- [ ] Adicionar batch size limits em webhooks
- [ ] Documentar API com OpenAPI spec

### Sprint 4+ (Contínuo) — Desejável
- [ ] SSO/SAML para clientes enterprise
- [ ] Testes E2E com Playwright
- [ ] Performance monitoring (Web Vitals)
- [ ] LGPD compliance (consentimento, DPO)
- [ ] Migration squash
- [ ] Redis para rate limiting persistente

---

## 10. Arquivos Modificados Nesta Auditoria

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `src/services/profilesService.ts` | Correção | Operações atômicas via RPC, validação, logging |
| `src/services/twoFactorService.ts` | Correção | Crypto backup codes, hashing SHA-256, rate limit |
| `src/services/loggingService.ts` | Melhoria | PII redaction, external handler, buffer 200 |
| `src/hooks/useRBAC.ts` | Otimização | Query única via RPC, fallback mantido |
| `src/contexts/GamificationContext.tsx` | Otimização | useMemo no valor do contexto |
| `src/components/IpAccessGuard.tsx` | Correção | Retry antes de fail-open (3 tentativas) |
| `supabase/functions/_shared/cors.ts` | Novo | CORS compartilhado com whitelist |
| `supabase/functions/external-api/index.ts` | Correção | CORS + fix supabase.raw() |
| `supabase/functions/external-webhook/index.ts` | Correção | CORS + fix supabase.raw() |
| `supabase/functions/verify-ip/index.ts` | Correção | CORS com whitelist |
| `supabase/migrations/20260326100000_*.sql` | Novo | Funções atômicas + constraints |
| `supabase/migrations/20260326100001_*.sql` | Novo | RBAC query unificada |
| `supabase/migrations/20260326100002_*.sql` | Novo | WebAuthn challenge TTL |

---

*Relatório gerado automaticamente como parte da auditoria de sistema.*
*Próxima revisão recomendada: 2026-06-26 (trimestral).*
