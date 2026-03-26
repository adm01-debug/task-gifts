import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useMemo, useCallback } from "react";

export type AppRole = "admin" | "manager" | "employee";

export interface RoleInfo {
  id: string;
  key: string;
  name: string;
  description: string | null;
  level: number;
}

export interface PermissionInfo {
  id: string;
  key: string;
  name: string;
  module: string;
  category: string | null;
}

interface RBACData {
  roles: RoleInfo[];
  permissions: PermissionInfo[];
}

interface RBACState {
  roles: AppRole[];
  permissions: string[];
  roleInfos: RoleInfo[];
  permissionInfos: PermissionInfo[];
  isLoading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isSuperAdmin: boolean;
  highestLevel: number;
}

/**
 * Fetches all RBAC data in a single RPC call to eliminate the 3-query waterfall.
 * Falls back to legacy multi-query approach if RPC is unavailable.
 */
async function fetchUserRBAC(userId: string): Promise<RBACData> {
  // Try unified RPC first (single query)
  const { data: rpcData, error: rpcError } = await supabase
    .rpc("get_user_rbac", { p_user_id: userId });

  if (!rpcError && rpcData) {
    return {
      roles: (rpcData.roles || []) as RoleInfo[],
      permissions: (rpcData.permissions || []) as PermissionInfo[],
    };
  }

  // Fallback: legacy multi-query approach
  console.warn("[useRBAC] RPC get_user_rbac unavailable, using fallback queries", rpcError);

  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  const roleKeys = (userRoles || []).map((r: { role: string }) => r.role);
  if (roleKeys.length === 0) return { roles: [], permissions: [] };

  const { data: roleInfos } = await supabase
    .from("roles")
    .select("id, key, name, description, level")
    .in("key", roleKeys);

  const roles = (roleInfos || []) as RoleInfo[];
  const roleIds = roles.map(r => r.id);
  if (roleIds.length === 0) return { roles, permissions: [] };

  const { data: rpData } = await supabase
    .from("role_permissions")
    .select(`permission_id, permissions:permission_id (id, key, name, module, category)`)
    .in("role_id", roleIds);

  const permissionsMap = new Map<string, PermissionInfo>();
  (rpData || []).forEach((rp: { permissions: PermissionInfo | null }) => {
    if (rp.permissions) {
      permissionsMap.set(rp.permissions.id, rp.permissions);
    }
  });

  return { roles, permissions: Array.from(permissionsMap.values()) };
}

export function useRBAC(): RBACState & {
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  hasAllRoles: (roles: AppRole[]) => boolean;
  hasPermission: (permissionKey: string) => boolean;
  hasAnyPermission: (permissionKeys: string[]) => boolean;
  hasAllPermissions: (permissionKeys: string[]) => boolean;
  hasMinLevel: (level: number) => boolean;
  canAccess: (options: AccessCheckOptions) => boolean;
} {
  const { user } = useAuth();

  // Single unified query for all RBAC data
  const { data: rbacData, isLoading } = useQuery({
    queryKey: ["rbac-unified", user?.id],
    queryFn: () => fetchUserRBAC(user!.id),
    enabled: !!user?.id,
    staleTime: 300000, // 5 minutes
  });

  const roleInfos = useMemo(() => rbacData?.roles || [], [rbacData]);
  const permissionInfos = useMemo(() => rbacData?.permissions || [], [rbacData]);

  const roleKeys = useMemo(() =>
    roleInfos.map(r => r.key as AppRole),
    [roleInfos]
  );

  const permissions = useMemo(() =>
    permissionInfos.map(p => p.key),
    [permissionInfos]
  );

  const highestLevel = useMemo(() =>
    roleInfos.length > 0 ? Math.max(...roleInfos.map(r => r.level)) : 0,
    [roleInfos]
  );

  const isAdmin = useMemo(() =>
    roleKeys.includes("admin") || permissions.includes("admin.full"),
    [roleKeys, permissions]
  );

  const isSuperAdmin = useMemo(() =>
    roleInfos.some(r => r.key === "super_admin") || highestLevel >= 100,
    [roleInfos, highestLevel]
  );

  const isManager = useMemo(() =>
    roleKeys.includes("admin") || roleKeys.includes("manager") || highestLevel >= 40,
    [roleKeys, highestLevel]
  );

  // Helper functions
  const hasRole = useCallback((role: AppRole): boolean => {
    return roleKeys.includes(role);
  }, [roleKeys]);

  const hasAnyRole = useCallback((roles: AppRole[]): boolean => {
    return roles.some(role => roleKeys.includes(role));
  }, [roleKeys]);

  const hasAllRoles = useCallback((roles: AppRole[]): boolean => {
    return roles.every(role => roleKeys.includes(role));
  }, [roleKeys]);

  const hasPermission = useCallback((permissionKey: string): boolean => {
    // Super admin bypass
    if (permissions.includes("admin.full")) return true;
    return permissions.includes(permissionKey);
  }, [permissions]);

  const hasAnyPermission = useCallback((permissionKeys: string[]): boolean => {
    if (permissions.includes("admin.full")) return true;
    return permissionKeys.some(key => permissions.includes(key));
  }, [permissions]);

  const hasAllPermissions = useCallback((permissionKeys: string[]): boolean => {
    if (permissions.includes("admin.full")) return true;
    return permissionKeys.every(key => permissions.includes(key));
  }, [permissions]);

  const hasMinLevel = useCallback((level: number): boolean => {
    return highestLevel >= level;
  }, [highestLevel]);

  const canAccess = useCallback((options: AccessCheckOptions): boolean => {
    // Super admin always has access
    if (permissions.includes("admin.full")) return true;

    const { 
      requiredRole, 
      requiredRoles, 
      requiredPermission, 
      requiredPermissions,
      minLevel,
      requireAll = false 
    } = options;

    const checks: boolean[] = [];

    if (requiredRole) {
      checks.push(hasRole(requiredRole));
    }

    if (requiredRoles && requiredRoles.length > 0) {
      checks.push(requireAll ? hasAllRoles(requiredRoles) : hasAnyRole(requiredRoles));
    }

    if (requiredPermission) {
      checks.push(hasPermission(requiredPermission));
    }

    if (requiredPermissions && requiredPermissions.length > 0) {
      checks.push(requireAll ? hasAllPermissions(requiredPermissions) : hasAnyPermission(requiredPermissions));
    }

    if (minLevel !== undefined) {
      checks.push(hasMinLevel(minLevel));
    }

    // If no checks specified, deny access
    if (checks.length === 0) return false;

    // If requireAll, all checks must pass; otherwise any check passing is enough
    return requireAll ? checks.every(Boolean) : checks.some(Boolean);
  }, [hasRole, hasAllRoles, hasAnyRole, hasPermission, hasAllPermissions, hasAnyPermission, hasMinLevel, permissions]);

  return {
    roles: roleKeys,
    permissions,
    roleInfos,
    permissionInfos,
    isLoading,
    isAdmin,
    isManager,
    isSuperAdmin,
    highestLevel,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasMinLevel,
    canAccess,
  };
}

export interface AccessCheckOptions {
  requiredRole?: AppRole;
  requiredRoles?: AppRole[];
  requiredPermission?: string;
  requiredPermissions?: string[];
  minLevel?: number;
  requireAll?: boolean;
}

// Convenience hooks
export function useHasPermission(permissionKey: string) {
  const { hasPermission, isLoading } = useRBAC();
  return { hasPermission: hasPermission(permissionKey), isLoading };
}

export function useCanAccess(options: AccessCheckOptions) {
  const { canAccess, isLoading } = useRBAC();
  return { canAccess: canAccess(options), isLoading };
}
