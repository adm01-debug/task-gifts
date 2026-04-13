import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllAchievements, useUserAchievements } from "@/hooks/useAchievements";

const rarityColors: Record<string, string> = {
  common: "from-muted-foreground/30 to-muted-foreground/10 border-muted-foreground/30",
  rare: "from-secondary/30 to-secondary/10 border-secondary/50",
  epic: "from-accent/30 to-accent/10 border-accent/50",
  legendary: "from-gold/30 to-gold/10 border-gold/50 shadow-[0_0_20px_hsl(var(--gold)/0.3)]",
};

export function ProfileAchievements() {
  const { data: allAchievements = [], isLoading } = useAllAchievements();
  const { data: userAchievements = [] } = useUserAchievements();

  const unlockedIds = new Set(userAchievements.map((ua: { achievement_id: string }) => ua.achievement_id));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2"><Trophy className="w-5 h-5 text-gold" />Conquistas</h3>
        <span className="text-sm text-muted-foreground">{userAchievements.length}/{allAchievements.length}</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : allAchievements.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground"><Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">Nenhuma conquista disponível</p></div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {allAchievements.slice(0, 12).map((achievement, i) => {
            const isUnlocked = unlockedIds.has(achievement.id);
            const rarity = achievement.rarity as keyof typeof rarityColors;
            return (
              <motion.div key={achievement.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.05 }} whileHover={{ scale: 1.05 }}
                className={`relative p-3 rounded-xl border text-center transition-all ${isUnlocked ? `bg-gradient-to-br ${rarityColors[rarity] || rarityColors.common}` : 'bg-muted/50 border-border opacity-40 grayscale'}`}>
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <p className="text-xs font-medium truncate">{achievement.name}</p>
                {isUnlocked && <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center text-xs">✓</div>}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
