/**
 * Shared authorization helpers for service layer.
 * Provides consistent auth checks across all services to prevent
 * unauthorized access when RLS is the only defense.
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Returns the currently authenticated user or throws.
 */
export async function requireAuth() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error("Não autenticado");
  }
  return user;
}

/**
 * Ensures the authenticated user matches the target userId,
 * or is an admin/manager.
 */
export async function requireSelfOrAdmin(targetUserId: string) {
  const user = await requireAuth();
  if (user.id === targetUserId) return user;

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const roleKeys = (roles || []).map((r: { role: string }) => r.role);
  if (roleKeys.includes("admin") || roleKeys.includes("super_admin")) {
    return user;
  }

  throw new Error("Sem permissão para acessar este recurso");
}

/**
 * Ensures the authenticated user has an admin or manager role.
 */
export async function requireAdminOrManager() {
  const user = await requireAuth();

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const roleKeys = (roles || []).map((r: { role: string }) => r.role);
  if (roleKeys.includes("admin") || roleKeys.includes("super_admin") || roleKeys.includes("manager")) {
    return user;
  }

  throw new Error("Acesso restrito a administradores e gestores");
}

/**
 * Ensures the authenticated user has an admin role.
 */
export async function requireAdmin() {
  const user = await requireAuth();

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const roleKeys = (roles || []).map((r: { role: string }) => r.role);
  if (roleKeys.includes("admin") || roleKeys.includes("super_admin")) {
    return user;
  }

  throw new Error("Acesso restrito a administradores");
}
