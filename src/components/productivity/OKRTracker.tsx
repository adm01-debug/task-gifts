import { memo, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Target, CheckCircle2, Clock, Users, 
  TrendingUp, Calendar, ChevronRight, Plus,
  AlertCircle, Flag, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KeyResult {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  progress: number;
  trend: "up" | "down" | "stable";
  lastUpdate: Date;
}

interface OKR {
  id: string;
  objective: string;
  owner: { name: string; avatar?: string };
  quarter: string;
  status: "on-track" | "at-risk" | "behind" | "completed";
  progress: number;
  keyResults: KeyResult[];
  dueDate: Date;
}

const mockOKRs: OKR[] = [
  {
    id: "okr1",
    objective: "Aumentar engajamento dos colaboradores",
    owner: { name: "Maria Santos" },
    quarter: "Q1 2024",
    status: "on-track",
    progress: 72,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
    keyResults: [
      { id: "kr1", title: "Participação em eventos", current: 85, target: 90, unit: "%", progress: 94, trend: "up", lastUpdate: new Date() },
      { id: "kr2", title: "NPS interno", current: 42, target: 50, unit: "pts", progress: 84, trend: "up", lastUpdate: new Date() },
      { id: "kr3", title: "Taxa de retenção", current: 88, target: 95, unit: "%", progress: 93, trend: "stable", lastUpdate: new Date() }
    ]
  },
  {
    id: "okr2",
    objective: "Desenvolver cultura de feedback contínuo",
    owner: { name: "Carlos Silva" },
    quarter: "Q1 2024",
    status: "at-risk",
    progress: 45,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    keyResults: [
      { id: "kr4", title: "Feedbacks mensais", current: 120, target: 300, unit: "", progress: 40, trend: "down", lastUpdate: new Date() },
      { id: "kr5", title: "Treinamentos realizados", current: 5, target: 10, unit: "", progress: 50, trend: "up", lastUpdate: new Date() }
    ]
  },
  {
    id: "okr3",
    objective: "Completar programa de liderança",
    owner: { name: "Ana Costa" },
    quarter: "Q1 2024",
    status: "completed",
    progress: 100,
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    keyResults: [
      { id: "kr6", title: "Módulos concluídos", current: 8, target: 8, unit: "", progress: 100, trend: "stable", lastUpdate: new Date() },
      { id: "kr7", title: "Avaliação final", current: 92, target: 80, unit: "%", progress: 100, trend: "up", lastUpdate: new Date() }
    ]
  }
];

const statusConfig = {
  "on-track": { label: "No Prazo", color: "text-green-500 bg-green-500/10 border-green-500/30" },
  "at-risk": { label: "Em Risco", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30" },
  "behind": { label: "Atrasado", color: "text-red-500 bg-red-500/10 border-red-500/30" },
  "completed": { label: "Concluído", color: "text-blue-500 bg-blue-500/10 border-blue-500/30" }
};

const OKRCard = memo(function OKRCard({ 
  okr,
  isExpanded,
  onToggle
}: { 
  okr: OKR;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const config = statusConfig[okr.status];
  const daysRemaining = Math.ceil((okr.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      layout
      className={cn(
        "rounded-xl border overflow-hidden",
        okr.status === "completed" && "border-blue-500/30"
      )}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left"
      >
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          okr.status === "completed" ? "bg-blue-500/20" : "bg-muted"
        )}>
          {okr.status === "completed" ? (
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
          ) : (
            <Target className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm">{okr.objective}</h4>
            <Badge variant="outline" className={cn("text-xs shrink-0", config.color)}>
              {config.label}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Avatar className="w-4 h-4">
                <AvatarFallback className="text-[8px]">
                  {okr.owner.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {okr.owner.name}
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {okr.quarter}
            </div>
            {daysRemaining > 0 && okr.status !== "completed" && (
              <>
                <span>•</span>
                <div className={cn(
                  "flex items-center gap-1",
                  daysRemaining <= 7 && "text-red-500"
                )}>
                  <Clock className="w-3 h-3" />
                  {daysRemaining}d restantes
                </div>
              </>
            )}
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">
                {okr.keyResults.length} resultados-chave
              </span>
              <span className="font-medium">{okr.progress}%</span>
            </div>
            <Progress value={okr.progress} className="h-2" />
          </div>
        </div>

        <ChevronRight className={cn(
          "w-4 h-4 shrink-0 transition-transform",
          isExpanded && "rotate-90"
        )} />
      </button>

      {/* Key Results */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t"
          >
            <div className="p-4 space-y-3">
              {okr.keyResults.map((kr, idx) => (
                <div 
                  key={kr.id}
                  className="p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">KR{idx + 1}</span>
                      <p className="text-sm font-medium">{kr.title}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {kr.trend === "up" && <TrendingUp className="w-3 h-3 text-green-500" />}
                      {kr.trend === "down" && <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />}
                      <span className="text-sm font-bold">
                        {kr.current}{kr.unit}/{kr.target}{kr.unit}
                      </span>
                    </div>
                  </div>
                  <Progress value={kr.progress} className="h-1.5 mt-2" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export const OKRTracker = memo(function OKRTracker({ 
  className 
}: { 
  className?: string;
}) {
  const [okrs] = useState(mockOKRs);
  const [expandedOKR, setExpandedOKR] = useState<string | null>("okr1");

  const stats = useMemo(() => {
    const total = okrs.length;
    const completed = okrs.filter(o => o.status === "completed").length;
    const atRisk = okrs.filter(o => o.status === "at-risk" || o.status === "behind").length;
    const avgProgress = Math.round(okrs.reduce((sum, o) => sum + o.progress, 0) / total);
    return { total, completed, atRisk, avgProgress };
  }, [okrs]);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Meus OKRs</CardTitle>
              <p className="text-xs text-muted-foreground">
                Q1 2024 • {stats.avgProgress}% progresso geral
              </p>
            </div>
          </div>

          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" />
            Novo OKR
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-2 rounded-lg bg-muted text-center">
            <p className="font-bold text-primary">{stats.total}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
          <div className="p-2 rounded-lg bg-muted text-center">
            <p className="font-bold text-green-500">{stats.completed}</p>
            <p className="text-[10px] text-muted-foreground">Concluídos</p>
          </div>
          <div className="p-2 rounded-lg bg-muted text-center">
            <p className="font-bold text-yellow-500">{stats.atRisk}</p>
            <p className="text-[10px] text-muted-foreground">Em Risco</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {okrs.map(okr => (
          <OKRCard
            key={okr.id}
            okr={okr}
            isExpanded={expandedOKR === okr.id}
            onToggle={() => setExpandedOKR(
              expandedOKR === okr.id ? null : okr.id
            )}
          />
        ))}
      </CardContent>
    </Card>
  );
});

export default OKRTracker;
