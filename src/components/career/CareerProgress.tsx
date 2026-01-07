import { memo, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Briefcase, TrendingUp, Star, Target, 
  ArrowUpRight, ArrowDownRight, Minus,
  Users, Award, Zap, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CareerMetric {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
  change: number;
}

interface CareerLevel {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  perks: string[];
  isUnlocked: boolean;
  isCurrent: boolean;
}

interface CareerPath {
  currentRole: string;
  department: string;
  currentLevel: number;
  totalXp: number;
  nextLevelXp: number;
  metrics: CareerMetric[];
  levels: CareerLevel[];
}

const mockCareerPath: CareerPath = {
  currentRole: "Product Designer",
  department: "Produto",
  currentLevel: 3,
  totalXp: 4500,
  nextLevelXp: 6000,
  metrics: [
    { id: "projects", name: "Projetos Entregues", current: 12, target: 15, unit: "", trend: "up", change: 3 },
    { id: "feedback", name: "Avaliação 360°", current: 4.2, target: 4.5, unit: "/5", trend: "up", change: 0.3 },
    { id: "mentoring", name: "Horas de Mentoria", current: 20, target: 30, unit: "h", trend: "stable", change: 0 },
    { id: "certifications", name: "Certificações", current: 3, target: 5, unit: "", trend: "up", change: 1 }
  ],
  levels: [
    { level: 1, title: "Junior Designer", minXp: 0, maxXp: 1000, perks: ["Acesso a trilhas básicas"], isUnlocked: true, isCurrent: false },
    { level: 2, title: "Designer", minXp: 1000, maxXp: 3000, perks: ["Mentoria 1:1", "Projetos próprios"], isUnlocked: true, isCurrent: false },
    { level: 3, title: "Senior Designer", minXp: 3000, maxXp: 6000, perks: ["Liderar squads", "Budget para cursos"], isUnlocked: true, isCurrent: true },
    { level: 4, title: "Lead Designer", minXp: 6000, maxXp: 10000, perks: ["Gestão de time", "Participação em decisões estratégicas"], isUnlocked: false, isCurrent: false },
    { level: 5, title: "Principal Designer", minXp: 10000, maxXp: 15000, perks: ["Voz em C-level", "Equity"], isUnlocked: false, isCurrent: false }
  ]
};

const MetricCard = memo(function MetricCard({ metric }: { metric: CareerMetric }) {
  const progress = (metric.current / metric.target) * 100;
  
  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-muted-foreground">{metric.name}</p>
        <div className={cn(
          "flex items-center gap-0.5 text-xs",
          metric.trend === "up" && "text-green-500",
          metric.trend === "down" && "text-red-500",
          metric.trend === "stable" && "text-muted-foreground"
        )}>
          {metric.trend === "up" && <ArrowUpRight className="w-3 h-3" />}
          {metric.trend === "down" && <ArrowDownRight className="w-3 h-3" />}
          {metric.trend === "stable" && <Minus className="w-3 h-3" />}
          {metric.change !== 0 && (metric.change > 0 ? `+${metric.change}` : metric.change)}
        </div>
      </div>
      <div className="flex items-end justify-between mb-1">
        <span className="text-lg font-bold">{metric.current}{metric.unit}</span>
        <span className="text-xs text-muted-foreground">/ {metric.target}{metric.unit}</span>
      </div>
      <Progress value={Math.min(progress, 100)} className="h-1.5" />
    </div>
  );
});

const LevelNode = memo(function LevelNode({ 
  level, 
  isLast 
}: { 
  level: CareerLevel;
  isLast: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      {/* Node */}
      <div className="flex flex-col items-center">
        <motion.div
          initial={level.isCurrent ? { scale: 0.8 } : {}}
          animate={level.isCurrent ? { scale: [0.8, 1.1, 1] } : {}}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
            level.isCurrent && "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20",
            level.isUnlocked && !level.isCurrent && "bg-green-500/20 border-green-500 text-green-500",
            !level.isUnlocked && "bg-muted border-muted-foreground/30 text-muted-foreground"
          )}
        >
          {level.isCurrent ? (
            <Star className="w-5 h-5" />
          ) : level.isUnlocked ? (
            <Award className="w-5 h-5" />
          ) : (
            <span className="font-bold">{level.level}</span>
          )}
        </motion.div>
        
        {/* Connector Line */}
        {!isLast && (
          <div className={cn(
            "w-0.5 h-12 -mt-1",
            level.isUnlocked ? "bg-green-500" : "bg-muted-foreground/30"
          )} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 pb-8">
        <div className="flex items-center gap-2">
          <h4 className={cn(
            "font-semibold text-sm",
            level.isCurrent && "text-primary",
            !level.isUnlocked && "text-muted-foreground"
          )}>
            {level.title}
          </h4>
          {level.isCurrent && (
            <Badge className="text-[10px] h-4">Atual</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {level.minXp.toLocaleString()} - {level.maxXp.toLocaleString()} XP
        </p>
        
        {level.isUnlocked && (
          <div className="flex flex-wrap gap-1 mt-2">
            {level.perks.map((perk, idx) => (
              <Badge key={idx} variant="outline" className="text-[10px] h-5">
                {perk}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export const CareerProgress = memo(function CareerProgress({ 
  className 
}: { 
  className?: string;
}) {
  const [career] = useState(mockCareerPath);

  const currentLevelProgress = useMemo(() => {
    const currentLevel = career.levels.find(l => l.isCurrent);
    if (!currentLevel) return 0;
    const levelXp = career.totalXp - currentLevel.minXp;
    const levelRange = currentLevel.maxXp - currentLevel.minXp;
    return (levelXp / levelRange) * 100;
  }, [career]);

  const xpToNextLevel = career.nextLevelXp - career.totalXp;

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <CardTitle className="text-lg">{career.currentRole}</CardTitle>
              <p className="text-xs text-muted-foreground">{career.department} • Nível {career.currentLevel}</p>
            </div>
          </div>
          
          <Badge variant="secondary" className="text-xs">
            <Zap className="w-3 h-3 mr-1" />
            {career.totalXp.toLocaleString()} XP
          </Badge>
        </div>

        {/* Level Progress */}
        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso para Nível {career.currentLevel + 1}</span>
            <span className="text-xs text-muted-foreground">
              {xpToNextLevel.toLocaleString()} XP restantes
            </span>
          </div>
          <Progress value={currentLevelProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Próximo: <span className="font-medium text-foreground">{career.levels.find(l => l.level === career.currentLevel + 1)?.title}</span>
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Metrics */}
        <div>
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            Métricas de Desenvolvimento
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {career.metrics.map(metric => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </div>

        {/* Career Ladder */}
        <div>
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            Trilha de Carreira
          </h4>
          <div className="pl-2">
            {career.levels.map((level, idx) => (
              <LevelNode 
                key={level.level} 
                level={level}
                isLast={idx === career.levels.length - 1}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default CareerProgress;
