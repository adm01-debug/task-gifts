import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Shield, 
  Filter, 
  Calendar, 
  User, 
  Activity,
  Search,
  Clock,
  FileText,
  ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AllSelectItem } from "@/components/ui/all-select-item";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecentAuditLogs, AuditAction } from "@/hooks/useAudit";
import { useProfiles } from "@/hooks/useProfiles";
import { cn } from "@/lib/utils";
import { DesktopBackButton } from "@/components/navigation";

const actionLabels: Record<AuditAction, string> = {
  user_signup: "Cadastro",
  user_login: "Login",
  profile_update: "Atualização de Perfil",
  xp_gained: "XP Ganho",
  level_up: "Subiu de Nível",
  coins_earned: "Moedas Ganhas",
  coins_spent: "Moedas Gastas",
  quest_created: "Quest Criada",
  quest_updated: "Quest Atualizada",
  quest_deleted: "Quest Excluída",
  quest_assigned: "Quest Atribuída",
  quest_completed: "Quest Completa",
  kudos_given: "Kudos Enviado",
  kudos_received: "Kudos Recebido",
  achievement_unlocked: "Conquista Desbloqueada",
  streak_updated: "Streak Atualizado",
  department_created: "Departamento Criado",
  department_updated: "Departamento Atualizado",
  team_member_added: "Membro Adicionado",
  team_member_removed: "Membro Removido",
  role_assigned: "Cargo Atribuído",
  role_removed: "Cargo Removido",
};

const actionColors: Record<string, string> = {
  user_signup: "bg-success/20 text-success border-success/30",
  user_login: "bg-info/20 text-info border-info/30",
  profile_update: "bg-secondary/20 text-secondary-foreground border-secondary/30",
  xp_gained: "bg-success/20 text-success border-success/30",
  level_up: "bg-warning/20 text-warning border-warning/30",
  coins_earned: "bg-warning/20 text-warning border-warning/30",
  coins_spent: "bg-destructive/20 text-destructive border-destructive/30",
  quest_created: "bg-primary/20 text-primary border-primary/30",
  quest_updated: "bg-secondary/20 text-secondary-foreground border-secondary/30",
  quest_deleted: "bg-destructive/20 text-destructive border-destructive/30",
  quest_assigned: "bg-info/20 text-info border-info/30",
  quest_completed: "bg-success/20 text-success border-success/30",
  kudos_given: "bg-accent/20 text-accent-foreground border-accent/30",
  kudos_received: "bg-accent/20 text-accent-foreground border-accent/30",
  achievement_unlocked: "bg-warning/20 text-warning border-warning/30",
  streak_updated: "bg-streak/20 text-streak border-streak/30",
  department_created: "bg-primary/20 text-primary border-primary/30",
  department_updated: "bg-secondary/20 text-secondary-foreground border-secondary/30",
  team_member_added: "bg-success/20 text-success border-success/30",
  team_member_removed: "bg-destructive/20 text-destructive border-destructive/30",
  role_assigned: "bg-info/20 text-info border-info/30",
  role_removed: "bg-destructive/20 text-destructive border-destructive/30",
};

const allActions: AuditAction[] = [
  "user_signup", "user_login", "profile_update", "xp_gained", "level_up",
  "coins_earned", "coins_spent", "quest_created", "quest_updated", "quest_deleted",
  "quest_assigned", "quest_completed", "kudos_given", "kudos_received",
  "achievement_unlocked", "streak_updated", "department_created", "department_updated",
  "team_member_added", "team_member_removed", "role_assigned", "role_removed"
];

export default function AuditLogs() {
  const navigate = useNavigate();
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const { data: auditLogs = [], isLoading: logsLoading } = useRecentAuditLogs(500);
  const { data: profiles = [] } = useProfiles();

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Filter by action
      if (selectedAction !== "all" && log.action !== selectedAction) {
        return false;
      }

      // Filter by user
      if (selectedUserId !== "all" && log.user_id !== selectedUserId) {
        return false;
      }

      // Filter by date range
      const logDate = new Date(log.created_at);
      if (startDate && logDate < startDate) {
        return false;
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (logDate > endOfDay) {
          return false;
        }
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const profile = profiles.find((p) => p.id === log.user_id);
        const userName = profile?.display_name?.toLowerCase() || "";
        const actionLabel = actionLabels[log.action]?.toLowerCase() || "";
        const entityType = log.entity_type?.toLowerCase() || "";
        
        if (!userName.includes(query) && !actionLabel.includes(query) && !entityType.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [auditLogs, selectedAction, selectedUserId, startDate, endDate, searchQuery, profiles]);

  const getUserName = (userId: string) => {
    const profile = profiles.find((p) => p.id === userId);
    return profile?.display_name || "Usuário desconhecido";
  };

  const clearFilters = () => {
    setSelectedAction("all");
    setSelectedUserId("all");
    setSearchQuery("");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const hasActiveFilters = selectedAction !== "all" || selectedUserId !== "all" || searchQuery || startDate || endDate;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <DesktopBackButton />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Logs de Auditoria</h1>
              <p className="text-muted-foreground text-sm">
                Histórico completo de ações do sistema
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{auditLogs.length}</p>
                  <p className="text-xs text-muted-foreground">Total de Logs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{filteredLogs.length}</p>
                  <p className="text-xs text-muted-foreground">Filtrados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(auditLogs.map(l => l.user_id)).size}
                  </p>
                  <p className="text-xs text-muted-foreground">Usuários Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {auditLogs[0] ? format(new Date(auditLogs[0].created_at), "HH:mm") : "--:--"}
                  </p>
                  <p className="text-xs text-muted-foreground">Última Ação</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="w-5 h-5 text-primary" />
                  Filtros
                </CardTitle>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="relative lg:col-span-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Action Filter */}
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de ação" />
                  </SelectTrigger>
                  <SelectContent>
                    <AllSelectItem label="Todas as ações" />
                    {allActions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {actionLabels[action]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* User Filter */}
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    <AllSelectItem label="Todos os usuários" />
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.display_name || profile.email || "Sem nome"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Start Date */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy") : "Data início"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                {/* End Date */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy") : "Data fim"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Logs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Registros de Auditoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3">
                      <Skeleton className="h-4 w-32" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum log encontrado com os filtros aplicados.</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Data/Hora</TableHead>
                        <TableHead className="w-[180px]">Usuário</TableHead>
                        <TableHead className="w-[180px]">Ação</TableHead>
                        <TableHead className="w-[120px]">Entidade</TableHead>
                        <TableHead>Detalhes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log, index) => (
                        <motion.tr
                          key={log.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                        >
                          <TableCell className="font-mono text-sm">
                            {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                                {getUserName(log.user_id).charAt(0).toUpperCase()}
                              </div>
                              <span className="truncate max-w-[120px]">
                                {getUserName(log.user_id)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "font-medium",
                                actionColors[log.action] || "bg-muted"
                              )}
                            >
                              {actionLabels[log.action] || log.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {log.entity_type}
                          </TableCell>
                          <TableCell className="max-w-[300px]">
                            {log.new_data && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                                    Ver detalhes
                                    <ChevronDown className="w-3 h-3 ml-1" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                  <div className="space-y-2">
                                    <p className="font-semibold text-sm">Dados da ação:</p>
                                    <pre className="text-xs bg-muted p-2 rounded-lg overflow-auto max-h-40">
                                      {JSON.stringify(log.new_data, null, 2)}
                                    </pre>
                                    {log.old_data && (
                                      <>
                                        <p className="font-semibold text-sm">Dados anteriores:</p>
                                        <pre className="text-xs bg-muted p-2 rounded-lg overflow-auto max-h-40">
                                          {JSON.stringify(log.old_data, null, 2)}
                                        </pre>
                                      </>
                                    )}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
