import { useBehavioralBadges } from "@/hooks/useBehavioralBadges";
import { useUserAchievements } from "@/hooks/useAchievements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Award, 
  MessageSquare, 
  CalendarCheck, 
  Heart, 
  Users, 
  Target, 
  BookOpen, 
  TrendingUp, 
  Share2, 
  Lightbulb,
  RefreshCw,
  Trophy,
  Sparkles,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  CalendarCheck,
  Heart,
  Activity: Heart,
  Users,
  Target,
  Award,
  BookOpen,
  GraduationCap: BookOpen,
  Trophy,
  TrendingUp,
  Sparkles,
  Share2,
  Star: Sparkles,
  Sunrise: CalendarCheck,
  Moon: CalendarCheck,
  Lightbulb,
  Crown: Trophy,
  HandHeart: Heart,
};

const categoryLabels: Record<string, string> = {
  feedback: "Feedback",
  engagement: "Engajamento",
  communication: "Comunicação",
  performance: "Performance",
  learning: "Aprendizado",
  development: "Desenvolvimento",
  social: "Social",
  lifestyle: "Estilo de Vida",
  mentorship: "Mentoria",
};

const rarityColors: Record<string, string> = {
  common: "bg-muted text-muted-foreground",
  rare: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  epic: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  legendary: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const rarityGlow: Record<string, string> = {
  common: "",
  rare: "shadow-blue-500/20",
  epic: "shadow-purple-500/20",
  legendary: "shadow-amber-500/40 shadow-lg",
};

export function BehavioralBadgesWidget() {
  const { 
    metrics, 
    isLoadingMetrics, 
    badgesByCategory, 
    triggerCheck, 
    isChecking,
    getNextBadges 
  } = useBehavioralBadges();
  
  const { data: userAchievements, isLoading: isLoadingAchievements } = useUserAchievements();

  const unlockedKeys = new Set(
    userAchievements?.map(ua => ua.achievement?.key).filter(Boolean) || []
  );

  const nextBadges = metrics ? getNextBadges(metrics) : [];

  if (isLoadingMetrics || isLoadingAchievements) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Badges Comportamentais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const categories = Object.keys(badgesByCategory);

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Badges Comportamentais
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={triggerCheck}
            disabled={isChecking}
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="progress" className="space-y-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="progress">Próximos</TabsTrigger>
            <TabsTrigger value="all">Todos os Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-4">
            {nextBadges.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Você já desbloqueou todos os badges disponíveis!</p>
              </div>
            ) : (
              <AnimatePresence>
                {nextBadges.map(({ badge, progress, remaining }, index) => {
                  const IconComponent = iconMap[badge.icon] || Award;
                  return (
                    <motion.div
                      key={badge.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border bg-card/50 ${rarityGlow[badge.rarity]}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${rarityColors[badge.rarity]}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium truncate">{badge.name}</span>
                            <Badge variant="outline" className={`text-xs ${rarityColors[badge.rarity]}`}>
                              {badge.rarity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {badge.description}
                          </p>
                          <div className="space-y-1">
                            <Progress value={progress} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{Math.round(progress)}%</span>
                              <span>{remaining}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2 text-xs">
                            <span className="text-primary">+{badge.xpReward} XP</span>
                            <span className="text-amber-500">+{badge.coinReward} 🪙</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {categories.map(category => {
              const badges = badgesByCategory[category];
              return (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    {categoryLabels[category] || category}
                    <Badge variant="secondary" className="text-xs">
                      {badges.filter(b => unlockedKeys.has(b.key)).length}/{badges.length}
                    </Badge>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {badges.map(badge => {
                      const isUnlocked = unlockedKeys.has(badge.key);
                      const IconComponent = iconMap[badge.icon] || Award;
                      
                      return (
                        <motion.div
                          key={badge.key}
                          whileHover={{ scale: isUnlocked ? 1.05 : 1 }}
                          className={`
                            p-3 rounded-lg border text-center relative
                            ${isUnlocked 
                              ? `${rarityColors[badge.rarity]} ${rarityGlow[badge.rarity]}` 
                              : 'bg-muted/30 opacity-50'
                            }
                          `}
                        >
                          {!isUnlocked && (
                            <Lock className="absolute top-1 right-1 h-3 w-3 text-muted-foreground" />
                          )}
                          <IconComponent className={`h-6 w-6 mx-auto mb-1 ${!isUnlocked && 'opacity-50'}`} />
                          <p className="text-xs font-medium truncate">{badge.name}</p>
                          {isUnlocked && (
                            <div className="text-xs text-primary mt-1">
                              +{badge.xpReward} XP
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
