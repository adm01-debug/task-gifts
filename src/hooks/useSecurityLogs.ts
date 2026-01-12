import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface RateLimitLog {
  id: string;
  ip_address: string;
  user_id: string | null;
  endpoint: string;
  method: string;
  request_count: number;
  window_start: string;
  window_end: string;
  was_blocked: boolean;
  user_agent: string | null;
  country_code: string | null;
  created_at: string;
}

interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string;
  block_type: string;
  blocked_at: string;
  blocked_by: string | null;
  expires_at: string | null;
  is_permanent: boolean;
  violation_count: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface SecurityAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string | null;
  ip_address: string | null;
  user_id: string | null;
  metadata: Record<string, any>;
  is_resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
}

interface LoginAttempt {
  id: string;
  email: string;
  ip_address: string;
  user_agent: string | null;
  attempt_type: string;
  error_message: string | null;
  created_at: string;
}

interface RateLimitRule {
  id: string;
  name: string;
  endpoint_pattern: string;
  requests_per_minute: number;
  requests_per_hour: number;
  block_duration_minutes: number;
  is_active: boolean;
  applies_to_authenticated: boolean;
  applies_to_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

interface SessionLog {
  id: string;
  user_id: string;
  session_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  login_at: string;
  logout_at: string | null;
  is_active: boolean;
  last_activity_at: string;
  created_at: string;
}

export function useRateLimitLogs(options?: { limit?: number }) {
  return useQuery({
    queryKey: ["rate-limit-logs", options?.limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rate_limit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(options?.limit || 100);
      if (error) throw error;
      return data as RateLimitLog[];
    },
  });
}

export function useBlockedIPs() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["blocked-ips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blocked_ips")
        .select("*")
        .order("blocked_at", { ascending: false });
      if (error) throw error;
      return data as BlockedIP[];
    },
  });

  const blockIP = useMutation({
    mutationFn: async (params: {
      ip_address: string;
      reason: string;
      block_type?: string;
      duration_minutes?: number;
      is_permanent?: boolean;
    }) => {
      const expiresAt = params.is_permanent
        ? null
        : new Date(Date.now() + (params.duration_minutes || 60) * 60 * 1000).toISOString();

      const { error } = await supabase.from("blocked_ips").insert({
        ip_address: params.ip_address,
        reason: params.reason,
        block_type: params.block_type || "manual",
        blocked_by: user?.id,
        is_permanent: params.is_permanent || false,
        expires_at: expiresAt,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("IP bloqueado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["blocked-ips"] });
      queryClient.invalidateQueries({ queryKey: ["security-stats"] });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("duplicate")) {
        toast.error("Este IP já está bloqueado");
      } else {
        toast.error("Erro ao bloquear IP");
      }
    },
  });

  const unblockIP = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blocked_ips").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("IP desbloqueado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["blocked-ips"] });
      queryClient.invalidateQueries({ queryKey: ["security-stats"] });
    },
    onError: () => {
      toast.error("Erro ao desbloquear IP");
    },
  });

  return {
    ...query,
    blockIP,
    unblockIP,
  };
}

export function useSecurityAlerts() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["security-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as SecurityAlert[];
    },
  });

  const resolveAlert = useMutation({
    mutationFn: async (params: { id: string; notes?: string }) => {
      const { error } = await supabase
        .from("security_alerts")
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolution_notes: params.notes,
        })
        .eq("id", params.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Alerta resolvido");
      queryClient.invalidateQueries({ queryKey: ["security-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["security-stats"] });
    },
    onError: () => {
      toast.error("Erro ao resolver alerta");
    },
  });

  return {
    ...query,
    resolveAlert,
    unresolvedCount: query.data?.filter((a) => !a.is_resolved).length || 0,
  };
}

export function useLoginAttempts(options?: { limit?: number }) {
  return useQuery({
    queryKey: ["login-attempts", options?.limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("login_attempts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(options?.limit || 200);
      if (error) throw error;
      return data as LoginAttempt[];
    },
    refetchInterval: 30000,
  });
}

export function useRateLimitRules() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["rate-limit-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rate_limit_rules")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as RateLimitRule[];
    },
  });

  const createRule = useMutation({
    mutationFn: async (rule: Omit<RateLimitRule, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase.from("rate_limit_rules").insert(rule);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Regra criada");
      queryClient.invalidateQueries({ queryKey: ["rate-limit-rules"] });
    },
    onError: () => {
      toast.error("Erro ao criar regra");
    },
  });

  const updateRule = useMutation({
    mutationFn: async (params: { id: string; updates: Partial<RateLimitRule> }) => {
      const { error } = await supabase
        .from("rate_limit_rules")
        .update(params.updates)
        .eq("id", params.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Regra atualizada");
      queryClient.invalidateQueries({ queryKey: ["rate-limit-rules"] });
    },
    onError: () => {
      toast.error("Erro ao atualizar regra");
    },
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rate_limit_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Regra excluída");
      queryClient.invalidateQueries({ queryKey: ["rate-limit-rules"] });
    },
    onError: () => {
      toast.error("Erro ao excluir regra");
    },
  });

  return {
    ...query,
    createRule,
    updateRule,
    deleteRule,
  };
}

export function useSessionLogs() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["session-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_logs")
        .select("*")
        .order("login_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as SessionLog[];
    },
  });

  const terminateSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from("session_logs")
        .update({
          is_active: false,
          logout_at: new Date().toISOString(),
        })
        .eq("id", sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Sessão encerrada");
      queryClient.invalidateQueries({ queryKey: ["session-logs"] });
      queryClient.invalidateQueries({ queryKey: ["security-stats"] });
    },
    onError: () => {
      toast.error("Erro ao encerrar sessão");
    },
  });

  const terminateAllSessions = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("session_logs")
        .update({
          is_active: false,
          logout_at: new Date().toISOString(),
        })
        .eq("is_active", true)
        .neq("user_id", user?.id || "");
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Todas as sessões encerradas");
      queryClient.invalidateQueries({ queryKey: ["session-logs"] });
      queryClient.invalidateQueries({ queryKey: ["security-stats"] });
    },
    onError: () => {
      toast.error("Erro ao encerrar sessões");
    },
  });

  return {
    ...query,
    terminateSession,
    terminateAllSessions,
    activeSessions: query.data?.filter((s) => s.is_active) || [],
  };
}

export function useSecurityStats(hours: number = 24) {
  return useQuery({
    queryKey: ["security-stats", hours],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_security_stats", { p_hours: hours });
      if (error) throw error;
      return data as unknown as {
        rate_limit_violations: number;
        blocked_ips: number;
        failed_logins: number;
        active_sessions: number;
        unresolved_alerts: number;
        top_blocked_ips: Array<{
          ip_address: string;
          violation_count: number;
          reason: string;
          is_permanent: boolean;
        }>;
        recent_alerts: Array<{
          id: string;
          alert_type: string;
          severity: string;
          title: string;
          created_at: string;
        }>;
      };
    },
    refetchInterval: 30000,
  });
}

export function useCleanupSecurityLogs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (daysToKeep: number = 30) => {
      const { data, error } = await supabase.rpc("cleanup_old_security_logs", {
        p_days_to_keep: daysToKeep,
      });
      if (error) throw error;
      return data as unknown as {
        rate_limit_logs_deleted: number;
        login_attempts_deleted: number;
        session_logs_deleted: number;
        expired_blocks_deleted: number;
        cleaned_at: string;
      };
    },
    onSuccess: (data) => {
      toast.success(
        `Limpeza concluída! Removidos: ${data.rate_limit_logs_deleted} logs de rate limit, ${data.login_attempts_deleted} tentativas de login.`
      );
      queryClient.invalidateQueries({ queryKey: ["security"] });
      queryClient.invalidateQueries({ queryKey: ["security-stats"] });
    },
    onError: () => {
      toast.error("Erro ao executar limpeza");
    },
  });
}
