// Re-export from new centralized RBAC hook for backwards compatibility
export { useRBAC, useHasPermission, useCanAccess } from "./useRBAC";
export type { AppRole, AccessCheckOptions } from "./useRBAC";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { AppRole } from "./useRBAC";

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "manager" | "employee";
  created_at: string;
}

/**
 * @deprecated Use useRBAC instead for more complete RBAC functionality
 */
export function useUserRoles() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async (): Promise<UserRole[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return (data || []) as UserRole[];
    },
    enabled: !!user,
    staleTime: 60000,
  });
}

/**
 * @deprecated Use useRBAC().hasRole() instead
 */
export function useHasRole(role: "admin" | "manager" | "employee") {
  const { data: roles, isLoading } = useUserRoles();
  const hasRole = roles?.some((r) => r.role === role) ?? false;
  return { hasRole, isLoading };
}

/**
 * @deprecated Use useRBAC().isAdmin instead
 */
export function useIsAdmin() {
  return useHasRole("admin");
}

/**
 * @deprecated Use useRBAC().isManager instead
 */
export function useIsManager() {
  const { data: roles, isLoading } = useUserRoles();
  const isManager = roles?.some((r) => r.role === "admin" || r.role === "manager") ?? false;
  return { isManager, isLoading };
}
