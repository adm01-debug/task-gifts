import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, User, Activity, Clock, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRecentAuditLogs } from "@/hooks/useAudit";
import { useProfiles } from "@/hooks/useProfiles";
import { DesktopBackButton } from "@/components/navigation";
import { AuditFilters, actionLabels } from "@/components/audit/AuditFilters";
import { AuditTable } from "@/components/audit/AuditTable";
import { format, startOfDay } from "date-fns";

export default function AuditLogs() {
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const { data: auditLogs = [], isLoading: logsLoading } = useRecentAuditLogs(500);
  const { data: profiles = [] } = useProfiles();

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (selectedAction !== "all" && log.action !== selectedAction) return false;
      if (selectedUserId !== "all" && log.user_id !== selectedUserId) return false;
      const logDate = new Date(log.created_at);
      if (startDate && logDate < startDate) return false;
      if (endDate) { const eod = new Date(endDate); eod.setHours(23, 59, 59, 999); if (logDate > eod) return false; }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const profile = profiles.find((p) => p.id === log.user_id);
        const userName = profile?.display_name?.toLowerCase() || "";
        const actionLabel = actionLabels[log.action]?.toLowerCase() || "";
        const entityType = log.entity_type?.toLowerCase() || "";
        if (!userName.includes(query) && !actionLabel.includes(query) && !entityType.includes(query)) return false;
      }
      return true;
    });
  }, [auditLogs, selectedAction, selectedUserId, startDate, endDate, searchQuery, profiles]);

  const getUserName = (userId: string) => profiles.find((p) => p.id === userId)?.display_name || "Usuário desconhecido";

  const clearFilters = () => { setSelectedAction("all"); setSelectedUserId("all"); setSearchQuery(""); setStartDate(undefined); setEndDate(undefined); };
  const hasActiveFilters = selectedAction !== "all" || selectedUserId !== "all" || !!searchQuery || !!startDate || !!endDate;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <DesktopBackButton />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"><Shield className="w-6 h-6 text-primary-foreground" /></div>
            <div><h1 className="text-2xl font-bold">Logs de Auditoria</h1><p className="text-muted-foreground text-sm">Histórico completo de ações do sistema</p></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total de Logs", value: auditLogs.length, icon: FileText, bg: "bg-primary/10", color: "text-primary" },
            { label: "Filtrados", value: filteredLogs.length, icon: Activity, bg: "bg-success/10", color: "text-success" },
            { label: "Usuários Ativos", value: new Set(auditLogs.map(l => l.user_id)).size, icon: User, bg: "bg-info/10", color: "text-info" },
            { label: "Última Ação", value: auditLogs[0] ? format(new Date(auditLogs[0].created_at), "HH:mm") : "--:--", icon: Clock, bg: "bg-warning/10", color: "text-warning" },
          ].map((stat) => (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
                  <div><p className="text-2xl font-bold">{stat.value}</p><p className="text-xs text-muted-foreground">{stat.label}</p></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <AuditFilters
            searchQuery={searchQuery} onSearchChange={setSearchQuery}
            selectedAction={selectedAction} onActionChange={setSelectedAction}
            selectedUserId={selectedUserId} onUserChange={setSelectedUserId}
            startDate={startDate} onStartDateChange={setStartDate}
            endDate={endDate} onEndDateChange={setEndDate}
            onClear={clearFilters} hasActiveFilters={hasActiveFilters} profiles={profiles}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <AuditTable logs={filteredLogs} isLoading={logsLoading} getUserName={getUserName} />
        </motion.div>
      </div>
    </div>
  );
}
