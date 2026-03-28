-- Seed data for development and testing environments.
-- Run: supabase db reset (applies migrations + seed)
-- WARNING: Do NOT run in production.

-- Departments
INSERT INTO departments (id, name, description, color) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Engenharia', 'Time de desenvolvimento', '#3B82F6'),
  ('d1000000-0000-0000-0000-000000000002', 'Produto', 'Time de produto e design', '#8B5CF6'),
  ('d1000000-0000-0000-0000-000000000003', 'Comercial', 'Time de vendas', '#10B981')
ON CONFLICT DO NOTHING;

-- Roles
INSERT INTO roles (id, key, name, description, level) VALUES
  ('r1000000-0000-0000-0000-000000000001', 'admin', 'Administrador', 'Acesso total', 100),
  ('r1000000-0000-0000-0000-000000000002', 'manager', 'Gestor', 'Gerencia equipe', 50),
  ('r1000000-0000-0000-0000-000000000003', 'employee', 'Colaborador', 'Acesso padrão', 10)
ON CONFLICT DO NOTHING;

-- Permissions
INSERT INTO permissions (id, key, name, module, category) VALUES
  ('p1000000-0000-0000-0000-000000000001', 'admin.full', 'Acesso Total', 'admin', 'admin'),
  ('p1000000-0000-0000-0000-000000000002', 'users.view', 'Ver Usuários', 'users', 'view'),
  ('p1000000-0000-0000-0000-000000000003', 'users.manage', 'Gerenciar Usuários', 'users', 'admin'),
  ('p1000000-0000-0000-0000-000000000004', 'reports.view', 'Ver Relatórios', 'reports', 'view'),
  ('p1000000-0000-0000-0000-000000000005', 'quests.manage', 'Gerenciar Quests', 'gamification', 'admin')
ON CONFLICT DO NOTHING;

-- Role-Permission assignments
INSERT INTO role_permissions (role_id, permission_id) VALUES
  ('r1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001'),
  ('r1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000002'),
  ('r1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000004'),
  ('r1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000005'),
  ('r1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- Sample achievements
INSERT INTO achievements (id, key, name, description, icon, category, rarity, xp_reward, coin_reward) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'first_login', 'Primeiro Acesso', 'Fez login pela primeira vez', '🎉', 'onboarding', 'common', 50, 25),
  ('a1000000-0000-0000-0000-000000000002', 'quest_10', '10 Quests', 'Completou 10 quests', '⭐', 'quests', 'rare', 200, 100),
  ('a1000000-0000-0000-0000-000000000003', 'streak_7', 'Semana Perfeita', '7 dias consecutivos', '🔥', 'engagement', 'epic', 500, 250)
ON CONFLICT DO NOTHING;

-- Sample shop rewards
INSERT INTO shop_rewards (id, name, description, price_coins, category, rarity, is_active, stock) VALUES
  ('sr100000-0000-0000-0000-000000000001', 'Day Off', 'Um dia de folga', 5000, 'benefit', 'legendary', true, 5),
  ('sr100000-0000-0000-0000-000000000002', 'Café Premium', 'Vale café gourmet', 500, 'product', 'common', true, null),
  ('sr100000-0000-0000-0000-000000000003', 'Mentoria 1h', 'Sessão de mentoria com líder', 2000, 'experience', 'rare', true, 10)
ON CONFLICT DO NOTHING;
