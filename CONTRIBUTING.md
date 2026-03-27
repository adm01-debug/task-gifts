# Guia de Contribuição — GameficaRH

## Configuração do Ambiente

```bash
npm install
cp .env.example .env
npm run dev
```

## Fluxo de Desenvolvimento

1. Crie uma branch a partir de `main`: `git checkout -b feat/minha-feature`
2. Implemente suas mudanças
3. Execute a pipeline local: `npm run ci`
4. Commit com mensagem descritiva (prefixos: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`)
5. Abra um Pull Request para `main`

## Padrões de Código

### TypeScript
- `noUnusedLocals` e `noUnusedParameters` estão habilitados
- Evite `any` — use tipos específicos ou `unknown`
- Use `as const` para objetos imutáveis

### Services
- Toda mutation (insert/update/delete) deve ter auth guard:
  - `await requireAuth()` para operações do próprio usuário
  - `await requireSelfOrAdmin(userId)` para operações em perfil específico
  - `await requireAdminOrManager()` para operações administrativas
  - `await requireAdmin()` para operações restritas (roles, permissions)
- Import: `import { requireAuth } from "@/lib/authGuards"`

### Edge Functions
- Use `getCorsHeaders(req)` de `../_shared/cors.ts` (nunca `'*'`)
- Use RPCs atômicos para operações de XP/coins (nunca `supabase.raw()`)
- Valide inputs antes de processar

### Testes
- Arquivo: `src/test/<service-name>.test.ts`
- Use o mock de Supabase: `src/test/mocks/supabase.ts`
- Framework: Vitest + React Testing Library

### Formatação
- Prettier configurado em `.prettierrc`
- Execute `npm run format` antes de commitar

## Estrutura de Pastas

```
src/services/    → Lógica de negócio (1 service por domínio)
src/hooks/       → React hooks customizados
src/components/  → Componentes UI
src/lib/         → Utilitários puros (validações, guards)
src/test/        → Testes unitários e mocks
```

## Banco de Dados

- Migrations em `supabase/migrations/`
- RLS habilitado em todas as tabelas
- Novas tabelas devem ter RLS policies
- Use `CREATE OR REPLACE FUNCTION` para RPCs

## Segurança

- Nunca commit `.env` (está no `.gitignore`)
- Backup codes devem ser hashados com SHA-256
- Sessions usam `sessionStorage` (não `localStorage`)
- PII é automaticamente redacted no logging service
