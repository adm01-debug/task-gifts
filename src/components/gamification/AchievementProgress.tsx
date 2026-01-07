import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Award, Lock, Star, Gem, Zap, Target, TrendingUp, ChevronRight, 
  Sparkles, Crown, Trophy, Flame, Gift, CheckCircle2, Eye, EyeOff,
  Shield, Sword, Heart, Brain, Users, BookOpen, Rocket, Medal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  isNew?: boolean;
  bonusReward?: string;
}

const mockAchievements: Achievement[] = [
  { id: "1", name: "Primeiro Passo", description: "Complete sua primeira tarefa", icon: Star, category: "Iniciante", rarity: "common", progress: 1, target: 1, xpReward: 50, coinReward: 10, unlockedAt: "2024-01-15" },
  { id: "2", name: "Produtivo", description: "Complete 100 tarefas", icon: Target, category: "Produtividade", rarity: "rare", progress: 78, target: 100, xpReward: 500, coinReward: 100, isNew: true },
  { id: "3", name: "Em Chamas", description: "Mantenha 30 dias de streak", icon: Flame, category: "Consistência", rarity: "epic", progress: 15, target: 30, xpReward: 1000, coinReward: 250, hint: "Continue logando diariamente!", bonusReward: "Avatar Exclusivo" },
  { id: "4", name: "Mestre Supremo", description: "Alcance o nível 50", icon: Crown, category: "Progressão", rarity: "legendary", progress: 20, target: 50, xpReward: 5000, coinReward: 1000, hint: "Você está no nível 20", bonusReward: "Título Lendário" },
  { id: "5", name: "Colaborador", description: "Ajude 25 colegas", icon: Users, category: "Social", rarity: "rare", progress: 25, target: 25, xpReward: 300, coinReward: 75, unlockedAt: "2024-01-20" },
  { id: "6", name: "Aprendiz Dedicado", description: "Complete 10 cursos", icon: BookOpen, category: "Aprendizado", rarity: "epic", progress: 4, target: 10, xpReward: 750, coinReward: 150 },
  { id: "7", name: "Velocista", description: "Complete 5 tarefas em 1 hora", icon: Rocket, category: "Produtividade", rarity: "rare", progress: 3, target: 5, xpReward: 200, coinReward: 50 },
  { id: "8", name: "Defensor", description: "Sem erros por 7 dias", icon: Shield, category: "Qualidade", rarity: "epic", progress: 7, target: 7, xpReward: 600, coinReward: 120, unlockedAt: "2024-01-22" },
];

const rarityConfig = {
  common: { 
    label: "Comum", 
    color: "text-slate-400", 
    bg: "bg-slate-500/10", 
    border: "border-slate-500/30", 
    gradient: "from-slate-500 to-slate-400",
    glow: "shadow-slate-500/20",
    stars: 1
  },
  rare: { 
    label: "Raro", 
    color: "text-blue-400", 
    bg: "bg-blue-500/10", 
    border: "border-blue-500/30", 
    gradient: "from-blue-500 to-cyan-400",
    glow: "shadow-blue-500/30",
    stars: 2
  },
  epic: { 
    label: "Épico", 
    color: "text-purple-400", 
    bg: "bg-purple-500/10", 
    border: "border-purple-500/30", 
    gradient: "from-purple-500 to-pink-400",
    glow: "shadow-purple-500/30",
    stars: 3
  },
  legendary: { 
    label: "Lendário", 
    color: "text-amber-400", 
    bg: "bg-amber-500/10", 
    border: "border-amber-500/30", 
    gradient: "from-amber-500 to-yellow-400",
    glow: "shadow-amber-500/40",
    stars: 4
  },
};

const categoryIcons: Record<string, React.ElementType> = {
  "Iniciante": Star,
  "Produtividade": Target,
  "Consistência": Flame,
  "Progressão": TrendingUp,
  "Social": Users,
  "Aprendizado": BookOpen,
  "Qualidade": Shield,
};

export const AchievementProgress = memo(function AchievementProgress() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "unlocked" | "locked">("all");
  const [showHints, setShowHints] = useState(true);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const categories = ["all", ...new Set(mockAchievements.map(a => a.category))];
  
  const filteredAchievements = mockAchievements
    .filter(a => selectedCategory === "all" || a.category === selectedCategory)
    .filter(a => {
      if (viewMode === "unlocked") return a.progress >= a.target;
      if (viewMode === "locked") return a.progress < a.target;
      return true;
    });

  const unlockedCount = mockAchievements.filter(a => a.progress >= a.target).length;
  const totalProgress = mockAchievements.reduce((acc, a) => acc + Math.min(a.progress / a.target, 1), 0);
  const overallProgress = (totalProgress / mockAchievements.length) * 100;
  const totalXP = mockAchievements.filter(a => a.progress >= a.target).reduce((acc, a) => acc + a.xpReward, 0);
  const totalCoins = mockAchievements.filter(a => a.progress >= a.target).reduce((acc, a) => acc + a.coinReward, 0);

  // Animate progress on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(overallProgress);
    }, 300);
    return () => clearTimeout(timer);
  }, [overallProgress]);

  const handleCelebrate = (id: string) => {
    setCelebratingId(id);
    setTimeout(() => setCelebratingId(null), 2000);
  };

  return (
    <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-background via-background to-amber-500/5">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <CardHeader className="pb-3 relative">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trophy className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">Conquistas</span>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  {unlockedCount}/{mockAchievements.length}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-500" />
                  {totalXP.toLocaleString()} XP
                </span>
                <span className="flex items-center gap-1">
                  <Gem className="h-3 w-3 text-purple-500" />
                  {totalCoins.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHints(!showHints)}
            className="h-8 w-8"
          >
            {showHints ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 relative">
        {/* Overall Progress Hero */}
        <motion.div 
          className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-amber-500" />
              <span className="font-semibold">Progresso Total</span>
            </div>
            <motion.span 
              className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent"
              key={animatedProgress}
            >
              {Math.round(animatedProgress)}%
            </motion.span>
          </div>
          
          <div className="relative h-4 bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${animatedProgress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>

          {/* Milestone Markers */}
          <div className="flex justify-between mt-2 px-1">
            {[25, 50, 75, 100].map((milestone) => (
              <div key={milestone} className="flex flex-col items-center">
                <div className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  animatedProgress >= milestone 
                    ? "bg-amber-500 shadow-lg shadow-amber-500/50" 
                    : "bg-muted-foreground/30"
                )} />
                <span className="text-[10px] text-muted-foreground mt-1">{milestone}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
          <TabsList className="grid grid-cols-3 h-9">
            <TabsTrigger value="all" className="text-xs gap-1">
              <Award className="h-3 w-3" />
              Todas
            </TabsTrigger>
            <TabsTrigger value="unlocked" className="text-xs gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Obtidas
            </TabsTrigger>
            <TabsTrigger value="locked" className="text-xs gap-1">
              <Lock className="h-3 w-3" />
              Bloqueadas
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => {
            const Icon = cat === "all" ? Award : (categoryIcons[cat] || Award);
            const count = cat === "all" 
              ? filteredAchievements.length 
              : mockAchievements.filter(a => a.category === cat).length;
            
            return (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0",
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-muted/50 hover:bg-muted"
                )}
              >
                <Icon className="h-3 w-3" />
                {cat === "all" ? "Todas" : cat}
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                  {count}
                </Badge>
              </motion.button>
            );
          })}
        </div>

        {/* Achievements Grid */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {filteredAchievements.map((achievement, index) => {
              const config = rarityConfig[achievement.rarity];
              const Icon = achievement.icon;
              const isUnlocked = achievement.progress >= achievement.target;
              const progressPercent = Math.min((achievement.progress / achievement.target) * 100, 100);
              const isExpanded = expandedId === achievement.id;
              const isCelebrating = celebratingId === achievement.id;

              return (
                <motion.div
                  key={achievement.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.03 }}
                  className={cn(
                    "relative p-4 rounded-2xl border-2 transition-all cursor-pointer group",
                    isUnlocked 
                      ? "bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/40" 
                      : cn(config.bg, config.border),
                    isCelebrating && "ring-4 ring-amber-500/50"
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : achievement.id)}
                >
                  {/* New Badge */}
                  {achievement.isNew && (
                    <motion.div
                      className="absolute -top-2 -right-2 z-10"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 shadow-lg">
                        NOVO!
                      </Badge>
                    </motion.div>
                  )}

                  {/* Celebration Effect */}
                  {isCelebrating && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-amber-500 rounded-full"
                          initial={{ 
                            top: "50%", 
                            left: "50%", 
                            scale: 0 
                          }}
                          animate={{ 
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0]
                          }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                        />
                      ))}
                    </motion.div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Achievement Icon */}
                    <motion.div 
                      className={cn(
                        "relative w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                        isUnlocked 
                          ? "bg-gradient-to-br from-green-500 to-emerald-400 shadow-green-500/30" 
                          : `bg-gradient-to-br ${config.gradient} ${config.glow} opacity-70`
                      )}
                      whileHover={{ scale: 1.1, rotate: isUnlocked ? [0, -10, 10, 0] : 0 }}
                      onHoverEnd={() => isUnlocked && handleCelebrate(achievement.id)}
                    >
                      {isUnlocked ? (
                        <>
                          <Icon className="h-7 w-7 text-white" />
                          <motion.div
                            className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </motion.div>
                        </>
                      ) : (
                        <>
                          <Icon className="h-6 w-6 text-white/70" />
                          <Lock className="absolute bottom-0 right-0 h-4 w-4 text-white/70 bg-black/30 rounded-full p-0.5" />
                        </>
                      )}

                      {/* Rarity Stars */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {[...Array(config.stars)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={cn(
                              "h-2.5 w-2.5 fill-current",
                              isUnlocked ? "text-amber-400" : "text-white/50"
                            )} 
                          />
                        ))}
                      </div>
                    </motion.div>

                    {/* Achievement Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={cn(
                          "font-bold",
                          isUnlocked ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {achievement.name}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] uppercase tracking-wider",
                            config.color,
                            config.border
                          )}
                        >
                          {config.label}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>

                      {/* Progress Bar */}
                      {!isUnlocked && (
                        <div className="space-y-1">
                          <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
                            <motion.div
                              className={cn("absolute inset-y-0 left-0 rounded-full bg-gradient-to-r", config.gradient)}
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercent}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {achievement.progress.toLocaleString()}/{achievement.target.toLocaleString()}
                            </span>
                            <span className={cn("font-medium", config.color)}>
                              {Math.round(progressPercent)}%
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Unlocked Status */}
                      {isUnlocked && (
                        <motion.div 
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <Sparkles className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600 font-medium">
                            Desbloqueado em {achievement.unlockedAt}
                          </span>
                        </motion.div>
                      )}
                    </div>

                    {/* Expand Arrow */}
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </motion.div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t border-dashed space-y-3">
                          {/* Rewards */}
                          <div className="flex flex-wrap gap-2">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-lg">
                              <Star className="h-4 w-4 text-amber-500" />
                              <span className="text-sm font-medium">+{achievement.xpReward.toLocaleString()} XP</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-lg">
                              <Gem className="h-4 w-4 text-purple-500" />
                              <span className="text-sm font-medium">+{achievement.coinReward.toLocaleString()}</span>
                            </div>
                            {achievement.bonusReward && (
                              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-lg">
                                <Gift className="h-4 w-4 text-pink-500" />
                                <span className="text-sm font-medium">{achievement.bonusReward}</span>
                              </div>
                            )}
                          </div>

                          {/* Hint */}
                          {achievement.hint && !isUnlocked && showHints && (
                            <motion.div 
                              className="p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              <div className="flex items-start gap-2">
                                <Brain className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs font-medium text-blue-600 mb-0.5">Dica</p>
                                  <p className="text-sm text-muted-foreground">{achievement.hint}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {/* Category Info */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {(() => {
                              const CatIcon = categoryIcons[achievement.category] || Award;
                              return <CatIcon className="h-3 w-3" />;
                            })()}
                            <span>Categoria: {achievement.category}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredAchievements.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Nenhuma conquista encontrada</p>
            </motion.div>
          )}
        </div>

        {/* Rarity Stats */}
        <div className="grid grid-cols-4 gap-2 pt-4 border-t">
          {Object.entries(rarityConfig).map(([rarity, config]) => {
            const unlockedInRarity = mockAchievements.filter(
              a => a.rarity === rarity && a.progress >= a.target
            ).length;
            const totalInRarity = mockAchievements.filter(a => a.rarity === rarity).length;
            const percent = totalInRarity > 0 ? (unlockedInRarity / totalInRarity) * 100 : 0;

            return (
              <motion.div 
                key={rarity} 
                className={cn(
                  "p-3 rounded-xl text-center transition-all",
                  config.bg,
                  "hover:scale-105"
                )}
                whileHover={{ y: -2 }}
              >
                <div className={cn(
                  "w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2 bg-gradient-to-br shadow-lg",
                  config.gradient,
                  config.glow
                )}>
                  <Gem className="h-5 w-5 text-white" />
                </div>
                <p className="text-lg font-bold">
                  {unlockedInRarity}/{totalInRarity}
                </p>
                <p className={cn("text-xs font-medium", config.color)}>
                  {config.label}
                </p>
                <div className="mt-1.5 h-1 bg-muted/50 rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full bg-gradient-to-r", config.gradient)}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            className="w-full h-12 gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30"
          >
            <Trophy className="h-5 w-5" />
            Ver Todas as Conquistas
            <ChevronRight className="h-5 w-5" />
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
});
