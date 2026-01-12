import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, ShieldAlert, ShieldCheck, ShieldOff, Activity, AlertTriangle, 
  Ban, Clock, RefreshCw, Trash2, Users, Globe, Loader2, 
  Smartphone, Monitor, Key, Lock, Eye, CheckCircle, XCircle,
  TrendingUp, Fingerprint, UserCheck, Settings
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BlockedIPsPanel } from "@/components/security/BlockedIPsPanel";
import { SecurityAlertsPanel } from "@/components/security/SecurityAlertsPanel";
import { RateLimitRulesPanel } from "@/components/security/RateLimitRulesPanel";
import { LoginAttemptsPanel } from "@/components/security/LoginAttemptsPanel";
import { SessionsPanel } from "@/components/security/SessionsPanel";
import { DevicesPanel } from "@/components/security/DevicesPanel";
import { SecurityNotificationsToggle } from "@/components/security/SecurityNotificationsToggle";
import { PasskeysPanel } from "@/components/security/PasskeysPanel";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";
import { useTwoFactor } from "@/hooks/useTwoFactor";
import { useWebAuthn } from "@/hooks/useWebAuthn";
import { useAuth } from "@/hooks/useAuth";
import { useSecurityPushNotifications } from "@/hooks/useSecurityPushNotifications";

interface SecurityStats {
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
}

export default function SecurityDashboard() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isEnabled: is2FAEnabled, isLoading: is2FALoading } = useTwoFactor();
  const { hasPasskeys, isLoading: passkeysLoading } = useWebAuthn();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Initialize security push notifications listener
  useSecurityPushNotifications();

  // Fetch security stats
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["security-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_security_stats", { p_hours: 24 });
      if (error) throw error;
      return data as unknown as SecurityStats;
    },
    refetchInterval: 30000,
  });

  // Fetch user devices
  const { data: devices, isLoading: devicesLoading } = useQuery({
    queryKey: ["user-devices", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_devices")
        .select("*")
        .eq("user_id", user?.id)
        .order("last_seen_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch new device alerts
  const { data: deviceAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["device-alerts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("new_device_alerts")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Cleanup mutation
  const cleanupMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("cleanup_old_security_logs", { p_days_to_keep: 30 });
      if (error) throw error;
      return data;
    },
    onSuccess: (data: { rate_limit_logs_deleted: number; login_attempts_deleted: number }) => {
      toast.success(`Limpeza concluída! Removidos: ${data.rate_limit_logs_deleted} logs de rate limit, ${data.login_attempts_deleted} tentativas de login.`);
      queryClient.invalidateQueries({ queryKey: ["security"] });
      refetchStats();
    },
    onError: () => {
      toast.error("Erro ao executar limpeza");
    },
  });

  // Calculate security score
  const calculateSecurityScore = () => {
    let score = 40; // Base score
    
    // MFA enabled adds 20 points
    if (is2FAEnabled) score += 20;
    
    // Passkeys enabled adds 15 points
    if (hasPasskeys) score += 15;
    
    // Trusted devices add up to 15 points
    const trustedDevices = devices?.filter(d => d.is_trusted)?.length || 0;
    score += Math.min(trustedDevices * 5, 15);
    
    // No unresolved alerts adds 10 points
    if (!stats?.unresolved_alerts) score += 10;
    
    // Low failed logins adds up to 10 points
    if (stats?.failed_logins === 0) score += 10;
    else if ((stats?.failed_logins || 0) < 5) score += 5;
    
    return Math.min(score, 100);
  };

  const securityScore = calculateSecurityScore();
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excelente";
    if (score >= 60) return "Bom";
    if (score >= 40) return "Regular";
    return "Crítico";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              Central de Segurança
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todas as configurações de segurança da sua conta
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetchStats()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="passkeys" className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4" />
              Passkeys
              {hasPasskeys && <CheckCircle className="w-3 h-3 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="mfa" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              MFA
              {is2FAEnabled && <CheckCircle className="w-3 h-3 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Dispositivos
              {devices?.length && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 p-0 flex items-center justify-center">
                  {devices.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Sessões
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alertas
              {stats?.unresolved_alerts ? (
                <Badge variant="destructive" className="ml-1 h-5 min-w-5 p-0 flex items-center justify-center">
                  {stats.unresolved_alerts}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Avançado
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Security Score Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    Pontuação de Segurança
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${securityScore * 3.52} 352`}
                        className={getScoreColor(securityScore)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-bold ${getScoreColor(securityScore)}`}>
                        {securityScore}
                      </span>
                      <span className="text-xs text-muted-foreground">de 100</span>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${getScoreColor(securityScore)} border-current`}
                  >
                    {getScoreLabel(securityScore)}
                  </Badge>
                </CardContent>
              </Card>

              {/* Quick Status Cards */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Status de Segurança</CardTitle>
                  <CardDescription>Resumo das configurações de proteção</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* MFA Status */}
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded-full ${is2FAEnabled ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                          <Key className={`w-4 h-4 ${is2FAEnabled ? 'text-green-500' : 'text-yellow-500'}`} />
                        </div>
                      </div>
                      <p className="text-sm font-medium">MFA</p>
                      <p className="text-xs text-muted-foreground">
                        {is2FALoading ? (
                          <Skeleton className="h-4 w-16" />
                        ) : is2FAEnabled ? (
                          <span className="text-green-500">Ativado</span>
                        ) : (
                          <span className="text-yellow-500">Desativado</span>
                        )}
                      </p>
                    </div>

                    {/* Devices */}
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-full bg-blue-500/10">
                          <Monitor className="w-4 h-4 text-blue-500" />
                        </div>
                      </div>
                      <p className="text-sm font-medium">Dispositivos</p>
                      <p className="text-xs text-muted-foreground">
                        {devicesLoading ? (
                          <Skeleton className="h-4 w-16" />
                        ) : (
                          `${devices?.length || 0} registrados`
                        )}
                      </p>
                    </div>

                    {/* Sessions */}
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-full bg-purple-500/10">
                          <Users className="w-4 h-4 text-purple-500" />
                        </div>
                      </div>
                      <p className="text-sm font-medium">Sessões Ativas</p>
                      <p className="text-xs text-muted-foreground">
                        {statsLoading ? (
                          <Skeleton className="h-4 w-16" />
                        ) : (
                          `${stats?.active_sessions || 0} online`
                        )}
                      </p>
                    </div>

                    {/* Alerts */}
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded-full ${stats?.unresolved_alerts ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                          <AlertTriangle className={`w-4 h-4 ${stats?.unresolved_alerts ? 'text-red-500' : 'text-green-500'}`} />
                        </div>
                      </div>
                      <p className="text-sm font-medium">Alertas</p>
                      <p className="text-xs text-muted-foreground">
                        {statsLoading ? (
                          <Skeleton className="h-4 w-16" />
                        ) : stats?.unresolved_alerts ? (
                          <span className="text-red-500">{stats.unresolved_alerts} pendentes</span>
                        ) : (
                          <span className="text-green-500">Nenhum pendente</span>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Recomendações de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {!hasPasskeys && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <Fingerprint className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Configure login biométrico</p>
                        <p className="text-xs text-muted-foreground">
                          Use sua impressão digital ou Face ID para fazer login
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setActiveTab("passkeys")}>
                        Configurar
                      </Button>
                    </div>
                  )}
                  
                  {!is2FAEnabled && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <ShieldAlert className="w-5 h-5 text-yellow-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Ative a autenticação de dois fatores</p>
                        <p className="text-xs text-muted-foreground">
                          Adicione uma camada extra de proteção à sua conta
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setActiveTab("mfa")}>
                        Configurar
                      </Button>
                    </div>
                  )}

                  {devices && devices.filter(d => !d.is_trusted).length > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <Smartphone className="w-5 h-5 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Revise seus dispositivos conectados</p>
                        <p className="text-xs text-muted-foreground">
                          Você tem {devices.filter(d => !d.is_trusted).length} dispositivo(s) não confiável(is)
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setActiveTab("devices")}>
                        Revisar
                      </Button>
                    </div>
                  )}

                  {stats?.unresolved_alerts && stats.unresolved_alerts > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Alertas de segurança pendentes</p>
                        <p className="text-xs text-muted-foreground">
                          Você tem {stats.unresolved_alerts} alerta(s) que precisam de atenção
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setActiveTab("alerts")}>
                        Ver Alertas
                      </Button>
                    </div>
                  )}

                  {is2FAEnabled && hasPasskeys && (!devices || devices.filter(d => !d.is_trusted).length === 0) && !stats?.unresolved_alerts && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Sua conta está bem protegida!</p>
                        <p className="text-xs text-muted-foreground">
                          Todas as configurações de segurança recomendadas estão ativas
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Device Alerts */}
            {deviceAlerts && deviceAlerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-primary" />
                    Acessos Recentes de Novos Dispositivos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {deviceAlerts.map((alert: any) => (
                      <div key={alert.id} className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className="p-2 rounded-full bg-muted">
                          <Monitor className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {alert.browser} em {alert.os}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            IP: {alert.ip_address} • {formatDistanceToNow(new Date(alert.created_at), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </p>
                        </div>
                        <Badge variant={alert.acknowledged ? "secondary" : "outline"}>
                          {alert.acknowledged ? "Reconhecido" : "Novo"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Violações Rate Limit</p>
                      <p className="text-2xl font-bold">
                        {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.rate_limit_violations || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-500/10 rounded-full">
                      <Activity className="w-6 h-6 text-orange-500" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Últimas 24h</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">IPs Bloqueados</p>
                      <p className="text-2xl font-bold">
                        {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.blocked_ips || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-full">
                      <Ban className="w-6 h-6 text-red-500" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Ativos agora</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Logins Falhados</p>
                      <p className="text-2xl font-bold">
                        {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.failed_logins || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-500/10 rounded-full">
                      <ShieldAlert className="w-6 h-6 text-yellow-500" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Últimas 24h</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Sessões Ativas</p>
                      <p className="text-2xl font-bold">
                        {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.active_sessions || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-full">
                      <Users className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Usuários online</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Alertas Pendentes</p>
                      <p className="text-2xl font-bold">
                        {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.unresolved_alerts || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-full">
                      <AlertTriangle className="w-6 h-6 text-purple-500" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Não resolvidos</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Passkeys Tab */}
          <TabsContent value="passkeys" className="space-y-6">
            <PasskeysPanel />
          </TabsContent>

          {/* MFA Tab */}
          <TabsContent value="mfa" className="space-y-6">
            <TwoFactorSetup />
            <SecurityNotificationsToggle />
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices">
            <DevicesPanel />
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <SessionsPanel />
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <SecurityAlertsPanel />
          </TabsContent>

          {/* Admin/Advanced Tab */}
          <TabsContent value="admin" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Configurações Avançadas</h2>
                <p className="text-sm text-muted-foreground">
                  Gerenciamento de rate limiting, IPs bloqueados e regras de segurança
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => cleanupMutation.mutate()}
                disabled={cleanupMutation.isPending}
              >
                {cleanupMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Limpar Logs Antigos
              </Button>
            </div>

            {/* Top Blocked IPs */}
            {stats?.top_blocked_ips && stats.top_blocked_ips.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Ban className="w-5 h-5 text-red-500" />
                    Top IPs Bloqueados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {stats.top_blocked_ips.map((ip: any, index: number) => (
                      <Badge 
                        key={index} 
                        variant={ip.is_permanent ? "destructive" : "secondary"}
                        className="text-sm py-1 px-3"
                      >
                        <Globe className="w-3 h-3 mr-1" />
                        {ip.ip_address} ({ip.violation_count}x)
                        {ip.is_permanent && <span className="ml-1">🔒</span>}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Admin Tabs */}
            <Tabs defaultValue="blocked" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="blocked" className="flex items-center gap-2">
                  <Ban className="w-4 h-4" />
                  IPs Bloqueados
                </TabsTrigger>
                <TabsTrigger value="attempts" className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  Tentativas Login
                </TabsTrigger>
                <TabsTrigger value="rules" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Regras Rate Limit
                </TabsTrigger>
              </TabsList>

              <TabsContent value="blocked">
                <BlockedIPsPanel />
              </TabsContent>

              <TabsContent value="attempts">
                <LoginAttemptsPanel />
              </TabsContent>

              <TabsContent value="rules">
                <RateLimitRulesPanel />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
