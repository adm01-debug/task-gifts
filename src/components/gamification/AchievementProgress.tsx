import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Lock, Star, Gem, Zap, Target, TrendingUp, ChevronRight, Sparkles, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  progress: number;
  target: number;
  xpReward: number;
  coinReward: number;
  unlockedAt?: string;
  hint?: string;
}

const mockAchievements: Achievement[] = [
  { id: "1", name: "Primeiro Passo", description: "Complete sua primeira tarefa", icon: Star, category: "Iniciante", rarity: "common", progress: 1, target: 1, xpReward: 50, coinReward: 10, unlockedAt: "2024-01-15" },
  { id: "2", name: "Produtivo", description: "Complete 100 tarefas", icon: Target, category: "Produtividade", rarity: "rare", progress: 78, target: 100, xpReward: 500, coinReward: 100 },
  { id: "3", name: "Em Chamas", description: "Mantenha 30 dias de streak", icon: Zap, category: "Consistência", rarity: "epic", progress: 15, target: 30, xpReward: 1000, coinReward: 250, hint: "Continue logando diariamente!" },
  { id: "4", name: "Mestre Supremo", description: "Alcance o nível 50", icon: Crown, category: "Progressão", rarity: "legendary", progress: 20, target: 50, xpReward: 5000, coinReward: 1000, hint: "Você está no nível 20" },
  { id: "5", name: "Colaborador", description: "Ajude 25 colegas", icon: Sparkles, category: "Social", rarity: "rare", progress: 12, target: 25, xpReward: 300, coinReward: 75 },
  { id: "6", name: "Aprendiz Dedicado", description: "Complete 10 cursos", icon: Award, category: "Aprendizado", rarity: "epic", progress: 4, target: 10, xpReward: 750, coinReward: 150 },
];

const rarityConfig = {
  common: { label: "Comum", color: "text-gray-500", bg: "bg-gray-500/10", border: "border-gray-500/30", gradient: "from-gray-500 to-gray-400" },
  rare: { label: "Raro", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30", gradient: "from-blue-500 to-cyan-400" },
  epic: { label: "Épico", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/30", gradient: "from-purple-500 to-pink-400" },
  legendary: { label: "Lendário", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30", gradient: "from-amber-500 to-yellow-400" },
};

const categoryIcons: Record<string, React.ElementType> = {
  "Iniciante": Star,
  "Produtividade": Target,
  "Consistência": Zap,
  "Progressão": TrendingUp,
  "Social": Sparkles,
  "Aprendizado": Award,
};

export const AchievementProgress = memo(function AchievementProgress() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = [...new Set(mockAchievements.map(a => a.category))];
  const filteredAchievements = selectedCategory
    ? mockAchievements.filter(a => a.category === selectedCategory)
    : mockAchievements;

  const unlockedCount = mockAchievements.filter(a => a.progress >= a.target).length;
  const totalProgress = mockAchievements.reduce((acc, a) => acc + Math.min(a.progress / a.target, 1), 0);
  const overallProgress = (totalProgress / mockAchievements.length) * 100;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="block">Conquistas</span>
              <span className="text-xs font-normal text-muted-foreground">
                {unlockedCount}/{mockAchievements.length} desbloqueadas
              </span>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Gem className="h-3 w-3 text-purple-500" />
            {Math.round(overallProgress)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso Geral</span>
            <span className="text-xs text-muted-foreground">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="shrink-0"
          >
            Todas
          </Button>
          {categories.map((cat) => {
            const Icon = categoryIcons[cat] || Award;
            return (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="shrink-0 gap-1"
              >
                <Icon className="h-3 w-3" />
                {cat}
              </Button>
            );
          })}
        </div>

        {/* Achievements List */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filteredAchievements.map((achievement, index) => {
            const config = rarityConfig[achievement.rarity];
            const Icon = achievement.icon;
            const isUnlocked = achievement.progress >= achievement.target;
            const progressPercent = Math.min((achievement.progress / achievement.target) * 100, 100);
            const isExpanded = expandedId === achievement.id;

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-3 rounded-xl border transition-all cursor-pointer",
                  isUnlocked ? "bg-green-500/5 border-green-500/30" : config.border,
                  !isUnlocked && config.bg
                )}
                onClick={() => setExpandedId(isExpanded ? null : achievement.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    isUnlocked 
                      ? "bg-gradient-to-br from-green-500 to-emerald-400" 
                      : `bg-gradient-to-br ${config.gradient} opacity-50`
                  )}>
                    {isUnlocked ? (
                      <Icon className="h-5 w-5 text-white" />
                    ) : (
                      <Lock className="h-4 w-4 text-white/70" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={cn("font-medium text-sm", !isUnlocked && "text-muted-foreground")}>
                        {achievement.name}
                      </p>
                      <Badge variant="outline" className={cn("text-[10px]", config.color)}>
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                    {!isUnlocked && (
                      <>
                        <Progress value={progressPercent} className="h-1.5 mb-1" />
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{achievement.progress}/{achievement.target}</span>
                          <span>{Math.round(progressPercent)}%</span>
                        </div>
                      </>
                    )}
                    {isUnlocked && (
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <Sparkles className="h-3 w-3" />
                        Desbloqueado em {achievement.unlockedAt}
                      </div>
                    )}
                  </div>
                  <ChevronRight className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    isExpanded && "rotate-90"
                  )} />
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 mt-3 border-t space-y-2">
                        <div className="flex gap-3">
                          <div className="flex items-center gap-1.5 text-sm">
                            <Star className="h-4 w-4 text-amber-500" />
                            <span>+{achievement.xpReward} XP</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm">
                            <Gem className="h-4 w-4 text-purple-500" />
                            <span>+{achievement.coinReward} moedas</span>
                          </div>
                        </div>
                        {achievement.hint && !isUnlocked && (
                          <div className="p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                            💡 Dica: {achievement.hint}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 pt-3 border-t">
          {Object.entries(rarityConfig).map(([rarity, config]) => {
            const count = mockAchievements.filter(a => a.rarity === rarity && a.progress >= a.target).length;
            const total = mockAchievements.filter(a => a.rarity === rarity).length;
            return (
              <div key={rarity} className="text-center">
                <div className={cn("w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-1", config.bg)}>
                  <Gem className={cn("h-4 w-4", config.color)} />
                </div>
                <p className="text-xs font-medium">{count}/{total}</p>
                <p className="text-[10px] text-muted-foreground">{config.label}</p>
              </div>
            );
          })}
        </div>

        <Button variant="outline" className="w-full gap-2">
          Ver Todas as Conquistas
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
});
