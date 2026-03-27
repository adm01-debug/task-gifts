# GameficaRH — Plataforma de Gamificação Corporativa

Plataforma de gamificação, engajamento e treinamento corporativo construída com React 18, TypeScript, Supabase (PostgreSQL) e Vite.

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, Radix UI (shadcn/ui) |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions + Realtime) |
| State | TanStack React Query v5, React Context |
| Auth | Supabase Auth, WebAuthn/FIDO2, TOTP 2FA, HIBP |
| PWA | vite-plugin-pwa, Workbox |
| Testes | Vitest, React Testing Library |

## Funcionalidades Principais

- Sistema de XP, Coins, Levels, Streaks e Quests
- Loja virtual com recompensas
- Trilhas de aprendizado (LMS)
- Duelos PvP e missões por departamento
- Feedback 360, PDI, eNPS, pesquisas de clima
- Painel admin com RBAC granular
- Integrações externas via API REST e Webhooks
- Notificações push (PWA)
- 2FA (TOTP + backup codes), WebAuthn/Passkeys

## Pré-requisitos

- Node.js 20+
- npm 10+
- Conta Supabase (projeto configurado)

## Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd task-gifts

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais Supabase

# Inicie o servidor de desenvolvimento
npm run dev
```

## Scripts

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run test` | Testes (watch mode) |
| `npm run test:run` | Testes (single run) |
| `npm run test:coverage` | Testes com cobertura |
| `npm run type-check` | Verificação de tipos TypeScript |
| `npm run lint` | Lint com ESLint |
| `npm run format` | Formatação com Prettier |
| `npm run format:check` | Verifica formatação |
| `npm run ci` | Pipeline completa (types + lint + test + build) |

## Arquitetura

```
src/
├── components/       # Componentes React (UI, admin, rbac, lms, effects)
├── contexts/         # React Contexts (Gamification, Accessibility, Sound)
├── hooks/            # Custom hooks (useAuth, useRBAC, useProfiles, etc.)
├── integrations/     # Supabase client + auto-generated types
├── lib/              # Validações, auth guards, utilitários
├── pages/            # Páginas (lazy-loaded via React Router)
├── services/         # Camada de serviço (57 services com auth guards)
├── test/             # Testes e mocks
└── types/            # TypeScript type definitions

supabase/
├── functions/        # 24 Edge Functions (Deno) com CORS whitelist
├── migrations/       # 74 migrations SQL (RLS, indexes, RPCs atômicos)
└── config.toml       # Configuração do projeto Supabase
```

## Segurança

- **Auth**: Supabase Auth + 2FA (TOTP com crypto.getRandomValues) + WebAuthn
- **Autorização**: RBAC com RLS em todas as tabelas + auth guards na camada de serviço
- **CORS**: Whitelist de origens (módulo compartilhado `_shared/cors.ts`)
- **XSS**: DOMPurify para HTML, blob URLs para PDF export
- **Race conditions**: RPCs atômicos com `SELECT ... FOR UPDATE`
- **Secrets**: Backup codes hashados com SHA-256, `.env` no `.gitignore`
- **Sessions**: `sessionStorage` (não localStorage) para tokens

## CI/CD

GitHub Actions pipeline: TypeScript check → ESLint → Vitest → Build → npm audit

## Documentação

- [Relatório de Auditoria](./SYSTEM_AUDIT_REPORT.md)
- [API Externa (OpenAPI)](./docs/openapi.yml)
- [Diagrama de Arquitetura](./docs/ARCHITECTURE.md)
- [Guia de Contribuição](./CONTRIBUTING.md)
