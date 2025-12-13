import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "admin" | "manager" | "employee";

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

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
    staleTime: 60000, // Cache for 1 minute
  });
}

export function useHasRole(role: AppRole) {
  const { data: roles, isLoading } = useUserRoles();

  const hasRole = roles?.some((r) => r.role === role) ?? false;

  return { hasRole, isLoading };
}

export function useIsAdmin() {
  return useHasRole("admin");
}

export function useIsManager() {
  const { data: roles, isLoading } = useUserRoles();

  const isManager =
    roles?.some((r) => r.role === "admin" || r.role === "manager") ?? false;

  return { isManager, isLoading };
}
