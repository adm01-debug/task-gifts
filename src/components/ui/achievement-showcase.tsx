import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { 
  Trophy, Star, Filter, Search, Share2, 
  Lock, Calendar, Sparkles, ChevronDown, Grid, List
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  category: string;
  xpReward: number;
  coinReward: number;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface AchievementShowcaseProps {
  achievements?: Achievement[];
  className?: string;
  onShare?: (achievement: Achievement) => void;
}

const rarityConfig = {
  common: {
    label: "Comum",
    color: "text-gray-500",
    bg: "bg-gray-500/10",
    border: "border-gray-500/30",
    gradient: "from-gray-400 to-gray-500",
  },
  rare: {
    label: "Raro",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    gradient: "from-blue-400 to-blue-600",
  },
  epic: {
    label: "Épico",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    gradient: "from-purple-400 to-purple-600",
  },
  legendary: {
    label: "Lendário",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    gradient: "from-amber-400 to-orange-500",
  },
};

const defaultAchievements: Achievement[] = [
  { id: "1", name: "Primeiro Login", description: "Fez login pela primeira vez", icon: "🎉", rarity: "common", category: "Início", xpReward: 50, coinReward: 10, unlockedAt: new Date() },
  { id: "2", name: "Maratonista", description: "Completou 10 missões em um dia", icon: "🏃", rarity: "rare", category: "Missões", xpReward: 200, coinReward: 50, unlockedAt: new Date() },
  { id: "3", name: "Mestre do Quiz", description: "Acertou 100% em 5 quizzes seguidos", icon: "🧠", rarity: "epic", category: "Aprendizado", xpReward: 500, coinReward: 100, unlockedAt: new Date() },
  { id: "4", name: "Lenda Viva", description: "Alcançou nível 50", icon: "👑", rarity: "legendary", category: "Nível", xpReward: 2000, coinReward: 500, progress: 35, maxProgress: 50 },
  { id: "5", name: "Pontual", description: "7 dias pontuais seguidos", icon: "⏰", rarity: "rare", category: "Ponto", xpReward: 150, coinReward: 30, unlockedAt: new Date() },
  { id: "6", name: "Mestre Mentor", description: "Mentoreou 10 colegas", icon: "🎓", rarity: "epic", category: "Social", xpReward: 300, coinReward: 75, progress: 6, maxProgress: 10 },
  { id: "7", name: "Colecionador", description: "Desbloqueou 50 conquistas", icon: "🏆", rarity: "legendary", category: "Meta", xpReward: 1000, coinReward: 250, progress: 12, maxProgress: 50 },
  { id: "8", name: "Streak Master", description: "30 dias de sequência", icon: "🔥", rarity: "rare", category: "Streak", xpReward: 250, coinReward: 60, progress: 18, maxProgress: 30 },
];

const categories = ["Todos", "Início", "Missões", "Aprendizado", "Nível", "Ponto", "Social", "Meta", "Streak"];

/**
 * AchievementShowcase - Gallery of achievements with filters and search
 */
export function AchievementShowcase({
  achievements = defaultAchievements,
  className,
  onShare,
}: AchievementShowcaseProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const filteredAchievements = useMemo(() => {
    return achievements.filter(achievement => {
      const matchesSearch = achievement.name.toLowerCase().includes(search.toLowerCase()) ||
                           achievement.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "Todos" || achievement.category === selectedCategory;
      const matchesRarity = !selectedRarity || achievement.rarity === selectedRarity;
      return matchesSearch && matchesCategory && matchesRarity;
    });
  }, [achievements, search, selectedCategory, selectedRarity]);

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalCount = achievements.length;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-5 h-5 text-amber-500" />
            Galeria de Conquistas
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {unlockedCount}/{totalCount}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conquistas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && "bg-muted")}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 pt-2">
                  {/* Categories */}
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map(category => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>

                  {/* Rarity Filter */}
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(rarityConfig).map(([key, config]) => (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-7 text-xs",
                          selectedRarity === key && config.bg,
                          selectedRarity === key && config.border
                        )}
                        onClick={() => setSelectedRarity(selectedRarity === key ? null : key)}
                      >
                        <Star className={cn("w-3 h-3 mr-1", config.color)} />
                        {config.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Achievements Grid/List */}
        <div className={cn(
          viewMode === "grid" 
            ? "grid grid-cols-2 sm:grid-cols-3 gap-3" 
            : "space-y-2"
        )}>
          {filteredAchievements.map((achievement, index) => {
            const config = rarityConfig[achievement.rarity];
            const isUnlocked = !!achievement.unlockedAt;
            const hasProgress = achievement.progress !== undefined;

            if (viewMode === "list") {
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all",
                    isUnlocked 
                      ? `${config.bg} ${config.border}` 
                      : "bg-muted/50 border-border opacity-60"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                    isUnlocked 
                      ? `bg-gradient-to-br ${config.gradient}` 
                      : "bg-muted"
                  )}>
                    {isUnlocked ? achievement.icon : <Lock className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{achievement.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                    {hasProgress && (
                      <div className="mt-1">
                        <div className="h-1 rounded-full bg-muted overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full", `bg-gradient-to-r ${config.gradient}`)}
                            style={{ width: `${(achievement.progress! / achievement.maxProgress!) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {achievement.progress}/{achievement.maxProgress}
                        </span>
                      </div>
                    )}
                  </div>
                  {isUnlocked && onShare && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => onShare(achievement)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  )}
                </motion.div>
              );
            }

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                whileHover={isUnlocked ? { scale: 1.02, y: -2 } : {}}
                className={cn(
                  "relative p-3 rounded-xl border text-center transition-all",
                  isUnlocked 
                    ? `${config.bg} ${config.border} cursor-pointer` 
                    : "bg-muted/50 border-border opacity-60"
                )}
              >
                {/* Rarity indicator */}
                {isUnlocked && (
                  <div className="absolute -top-1 -right-1">
                    <Star className={cn("w-4 h-4", config.color)} />
                  </div>
                )}

                {/* Icon */}
                <div className={cn(
                  "w-14 h-14 mx-auto rounded-xl flex items-center justify-center text-3xl mb-2",
                  isUnlocked 
                    ? `bg-gradient-to-br ${config.gradient}` 
                    : "bg-muted"
                )}>
                  {isUnlocked ? achievement.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
                </div>

                {/* Name */}
                <h4 className="font-semibold text-xs line-clamp-1">{achievement.name}</h4>
                
                {/* Progress or Date */}
                {hasProgress && !isUnlocked && (
                  <div className="mt-2">
                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full", `bg-gradient-to-r ${config.gradient}`)}
                        style={{ width: `${(achievement.progress! / achievement.maxProgress!) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {achievement.progress}/{achievement.maxProgress}
                    </span>
                  </div>
                )}
                
                {isUnlocked && (
                  <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {achievement.unlockedAt!.toLocaleDateString()}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>Nenhuma conquista encontrada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
