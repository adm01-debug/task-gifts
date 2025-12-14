import { motion } from "framer-motion";
import { useState, useCallback, useMemo } from "react";
import { Wand2, Sparkles, Lock, ChevronRight, Crown, Palette, Frame } from "lucide-react";
import { AvatarPreview, AvatarCollectionPreview } from "./AvatarPreview";
import { AvatarCustomizer } from "./AvatarCustomizer";
import { useAvatarItems } from "@/hooks/useAvatar";
import { cn } from "@/lib/utils";
interface ProfileAvatarSectionProps {
  userId: string;
  userLevel: number;
  userStreak: number;
  userCoins: number;
  displayName: string;
}

const categories = [
  { key: "background", label: "Fundos", icon: Palette },
  { key: "frame", label: "Molduras", icon: Frame },
  { key: "accessory", label: "Acessórios", icon: Crown },
  { key: "effect", label: "Efeitos", icon: Sparkles },
  { key: "badge_style", label: "Badges", icon: Wand2 },
];

export function ProfileAvatarSection({
  userId,
  userLevel,
  userStreak,
  userCoins,
  displayName,
}: ProfileAvatarSectionProps) {
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const { data: items } = useAvatarItems(userId, userLevel, userStreak);

  const openCustomizer = useCallback(() => setCustomizerOpen(true), []);
  const closeCustomizer = useCallback(() => setCustomizerOpen(false), []);

  // Calculate collection stats
  const { totalItems, ownedItems, collectionPercent, legendaryOwned, epicOwned, nextUnlocks } = useMemo(() => {
    const total = items?.length || 0;
    const owned = items?.filter(i => i.owned)?.length || 0;
    const percent = total > 0 ? Math.round((owned / total) * 100) : 0;
    const legendary = items?.filter(i => i.owned && i.rarity === 'legendary')?.length || 0;
    const epic = items?.filter(i => i.owned && i.rarity === 'epic')?.length || 0;
    const unlocks = items?.filter(i => !i.owned && i.canUnlock)?.slice(0, 4) || [];
    return { totalItems: total, ownedItems: owned, collectionPercent: percent, legendaryOwned: legendary, epicOwned: epic, nextUnlocks: unlocks };
  }, [items]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-secondary" />
            Sistema de Avatar
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCustomizer}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors text-sm font-medium"
          >
            <Sparkles className="w-4 h-4" />
            Personalizar
          </motion.button>
        </div>

        {/* Main Preview */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Large Avatar Preview */}
          <div className="relative">
            <AvatarPreview
              userId={userId}
              userLevel={userLevel}
              userStreak={userStreak}
              displayName={displayName}
              size="xl"
              showEffects={true}
              onClick={openCustomizer}
            />

            {/* Glow effect for legendary items */}
            {legendaryOwned > 0 && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    "0 0 20px hsl(var(--gold) / 0.3)",
                    "0 0 40px hsl(var(--gold) / 0.5)",
                    "0 0 20px hsl(var(--gold) / 0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ pointerEvents: "none" }}
              />
            )}
          </div>

          {/* Collection Stats */}
          <div className="flex-1 space-y-4">
            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Coleção Completa</span>
                <span className="font-semibold text-primary">{ownedItems}/{totalItems} itens</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${collectionPercent}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className={cn(
                    "h-full rounded-full",
                    collectionPercent === 100 ? "bg-success" : "xp-bar"
                  )}
                />
              </div>
            </div>

            {/* Rarity Stats */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gold shadow-[0_0_8px_hsl(var(--gold)/0.5)]" />
                <span className="text-sm">
                  <span className="font-semibold text-gold">{legendaryOwned}</span>
                  <span className="text-muted-foreground ml-1">Lendários</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span className="text-sm">
                  <span className="font-semibold text-accent">{epicOwned}</span>
                  <span className="text-muted-foreground ml-1">Épicos</span>
                </span>
              </div>
            </div>

            {/* Unlock hint */}
            <p className="text-xs text-muted-foreground">
              Desbloqueie mais itens subindo de nível, mantendo streaks e completando conquistas!
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="p-6">
        <h4 className="text-sm font-semibold text-muted-foreground mb-4">CATEGORIAS</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <AvatarCollectionPreview
                userId={userId}
                userLevel={userLevel}
                userStreak={userStreak}
                category={cat.key}
                onClick={openCustomizer}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Unlocks / Next Unlocks */}
      <div className="p-6 border-t border-border bg-muted/20">
        <h4 className="text-sm font-semibold text-muted-foreground mb-4">PRÓXIMOS DESBLOQUEIOS</h4>
        <div className="flex flex-wrap gap-2">
          {items
            ?.filter(i => !i.owned && i.canUnlock)
            ?.slice(0, 4)
            ?.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.05 }}
                onClick={openCustomizer}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all",
                  "bg-card hover:border-primary/50",
                  item.rarity === 'rare' && "border-secondary/30",
                  item.rarity === 'epic' && "border-accent/30",
                  item.rarity === 'legendary' && "border-gold/30",
                )}
              >
                <span className="text-xl">{item.icon}</span>
                <div className="text-left">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.unlockReason}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            ))}

          {(!items || items.filter(i => !i.owned && i.canUnlock).length === 0) && (
            <p className="text-sm text-muted-foreground">
              Continue progredindo para desbloquear novos itens!
            </p>
          )}
        </div>
      </div>

      {/* Avatar Customizer Modal */}
      <AvatarCustomizer
        userId={userId}
        userLevel={userLevel}
        userStreak={userStreak}
        userCoins={userCoins}
        displayName={displayName}
        open={customizerOpen}
        onClose={closeCustomizer}
      />
    </motion.div>
  );
}