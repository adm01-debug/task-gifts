# Arquitetura do Sistema — GameficaRH

## Diagrama de Alto Nível

```mermaid
graph TB
    subgraph "Frontend (React 18 + Vite)"
        UI[Componentes UI<br/>shadcn/ui + Radix]
        Pages[Páginas<br/>Lazy-loaded]
        Hooks[Custom Hooks<br/>useAuth, useRBAC, useProfiles]
        Services[Service Layer<br/>57 services com auth guards]
        Query[TanStack Query<br/>Cache + Realtime]
        Contexts[React Contexts<br/>Auth, Gamification, Sound]
    end

    subgraph "Supabase Cloud"
        Auth[Supabase Auth<br/>Email/Pass + 2FA + WebAuthn]
        DB[(PostgreSQL<br/>100+ tabelas, RLS)]
        Edge[Edge Functions<br/>24 funções Deno]
        Realtime[Realtime<br/>WebSocket channels]
        Storage[Storage<br/>Avatares, certificados]
    end

    subgraph "Integrações Externas"
        Bitrix[Bitrix24<br/>CRM/ERP]
        ExtAPI[External API<br/>REST + Webhooks]
        Email[Resend<br/>Email notifications]
        HIBP[Have I Been Pwned<br/>Password check]
        GeoIP[ip-api.com<br/>Geo verification]
    end

    UI --> Pages
    Pages --> Hooks
    Hooks --> Services
    Hooks --> Query
    Services --> Auth
    Services --> DB
    Query --> DB
    Query --> Realtime
    Edge --> DB
    Edge --> Bitrix
    Edge --> Email
    Edge --> GeoIP
    ExtAPI --> Edge
    Services --> HIBP
```

## Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant SA as Supabase Auth
    participant IP as verify-ip
    participant Dev as detect-new-device
    participant DB as PostgreSQL

    U->>F: Acessa aplicação
    F->>IP: Verifica IP (whitelist)
    IP-->>F: allowed: true/false

    U->>F: Login (email + password)
    F->>SA: signInWithPassword()
    SA-->>F: Session + JWT

    F->>Dev: Registra dispositivo
    Dev->>DB: Verifica fingerprint
    alt Novo dispositivo
        Dev->>U: Email de alerta
    end

    F->>DB: get_user_rbac(userId)
    DB-->>F: roles + permissions
    F->>F: Renderiza UI por role
```

## Fluxo de Gamificação (XP)

```mermaid
sequenceDiagram
    participant U as Usuário
    participant S as Service Layer
    participant RPC as add_xp_atomic()
    participant DB as PostgreSQL
    participant N as Notifications
    participant A as Audit

    U->>S: Completa quest
    S->>S: requireAuth()
    S->>RPC: add_xp_atomic(userId, 100)
    RPC->>DB: SELECT xp FOR UPDATE
    RPC->>DB: UPDATE xp, level
    RPC-->>S: {old_xp, new_xp, leveled_up}

    par Assíncrono
        S->>A: logXpGain()
        S->>N: notifyXpGain()
    end

    alt Level up
        S->>A: logLevelUp()
        S->>N: notifyLevelUp()
    end
```

## Camadas de Segurança

```mermaid
graph LR
    subgraph "Camada 1: Rede"
        IP[IP Whitelist]
        CORS[CORS Whitelist]
        CSP[Security Headers]
    end

    subgraph "Camada 2: Autenticação"
        Auth[Supabase Auth]
        TwoFA[2FA TOTP]
        WebAuthn[WebAuthn/Passkeys]
        Rate[Rate Limiting]
    end

    subgraph "Camada 3: Autorização"
        Guards[Auth Guards<br/>requireAuth/Admin]
        RBAC[RBAC<br/>Roles + Permissions]
        RLS[Row Level Security<br/>PostgreSQL policies]
    end

    subgraph "Camada 4: Dados"
        Validate[Zod Schemas]
        Atomic[RPCs Atômicos<br/>FOR UPDATE]
        Constraints[DB Constraints<br/>CHECK, NOT NULL]
        Audit[Audit Logging]
    end

    IP --> Auth --> Guards --> Validate
    CORS --> TwoFA --> RBAC --> Atomic
    CSP --> WebAuthn --> RLS --> Constraints
    Rate --> Audit
```

## Decisões Arquiteturais (ADR)

### ADR-001: Supabase como BaaS
- **Contexto**: Necessidade de backend rápido com auth, DB, realtime
- **Decisão**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Consequência**: Lock-in parcial, mas RLS + PostgREST eliminam necessidade de API custom

### ADR-002: RPCs Atômicos para Gamificação
- **Contexto**: Race conditions em addXp, addCoins com padrão read-modify-write
- **Decisão**: Funções PostgreSQL com `SELECT ... FOR UPDATE` + `SECURITY DEFINER`
- **Consequência**: Operações atômicas no nível do banco, fallback em JS se RPC indisponível

### ADR-003: Auth Guards na Service Layer
- **Contexto**: RLS protege no nível DB, mas services não verificavam caller
- **Decisão**: `requireAuth()`, `requireSelfOrAdmin()`, `requireAdminOrManager()` em todas mutations
- **Consequência**: Dupla camada de proteção (service + DB)

### ADR-004: sessionStorage em vez de localStorage
- **Contexto**: Tokens JWT em localStorage vulneráveis a XSS
- **Decisão**: Migrar para sessionStorage (limpa ao fechar aba)
- **Consequência**: Usuário precisa re-autenticar ao abrir nova aba

### ADR-005: CORS Whitelist Compartilhado
- **Contexto**: 24 Edge Functions com CORS `'*'` hardcoded
- **Decisão**: Módulo compartilhado `_shared/cors.ts` com whitelist de origens
- **Consequência**: Segurança consistente, fácil de atualizar
