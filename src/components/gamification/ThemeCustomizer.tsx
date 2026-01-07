import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check, Lock, Sparkles, Crown, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Theme {
  id: string;
  name: string;
  colors: { primary: string; secondary: string; accent: string };
  unlocked: boolean;
  equipped: boolean;
  unlockRequirement?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const mockThemes: Theme[] = [
  { id: "1", name: "Padrão", colors: { primary: "#6366f1", secondary: "#8b5cf6", accent: "#a855f7" }, unlocked: true, equipped: true, rarity: "common" },
  { id: "2", name: "Oceano", colors: { primary: "#0ea5e9", secondary: "#06b6d4", accent: "#14b8a6" }, unlocked: true, equipped: false, rarity: "common" },
  { id: "3", name: "Floresta", colors: { primary: "#22c55e", secondary: "#10b981", accent: "#059669" }, unlocked: true, equipped: false, rarity: "rare" },
  { id: "4", name: "Pôr do Sol", colors: { primary: "#f97316", secondary: "#ef4444", accent: "#ec4899" }, unlocked: true, equipped: false, rarity: "rare" },
  { id: "5", name: "Aurora", colors: { primary: "#a855f7", secondary: "#ec4899", accent: "#f43f5e" }, unlocked: false, equipped: false, unlockRequirement: "Nível 20", rarity: "epic" },
  { id: "6", name: "Galáxia", colors: { primary: "#1e1b4b", secondary: "#312e81", accent: "#4f46e5" }, unlocked: false, equipped: false, unlockRequirement: "100 Conquistas", rarity: "legendary" },
];

const rarityConfig = {
  common: { label: "Comum", border: "border-gray-400/50" },
  rare: { label: "Raro", border: "border-blue-500/50" },
  epic: { label: "Épico", border: "border-purple-500/50" },
  legendary: { label: "Lendário", border: "border-amber-500/50" },
};

export const ThemeCustomizer = memo(function ThemeCustomizer() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center"><Palette className="h-5 w-5 text-white" /></div>
            <div><span>Personalização</span><p className="text-xs font-normal text-muted-foreground">Escolha seu tema</p></div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {mockThemes.map((theme, index) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "relative p-3 rounded-xl border cursor-pointer transition-all",
                rarityConfig[theme.rarity].border,
                !theme.unlocked && "opacity-60",
                theme.equipped && "ring-2 ring-primary",
                selected === theme.id && "ring-2 ring-primary/50"
              )}
              onClick={() => theme.unlocked && setSelected(theme.id)}
            >
              {theme.equipped && <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Check className="h-3 w-3 text-primary-foreground" /></div>}
              {!theme.unlocked && <div className="absolute inset-0 bg-background/50 rounded-xl flex items-center justify-center"><Lock className="h-5 w-5 text-muted-foreground" /></div>}
              {/* Color Preview */}
              <div className="flex gap-1 mb-2">
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.colors.secondary }} />
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
              </div>
              <p className="text-xs font-medium truncate">{theme.name}</p>
              <Badge variant="outline" className="text-[8px] mt-1">
                {theme.rarity === "legendary" && <Crown className="h-2 w-2 mr-0.5" />}
                {theme.rarity === "epic" && <Sparkles className="h-2 w-2 mr-0.5" />}
                {rarityConfig[theme.rarity].label}
              </Badge>
              {!theme.unlocked && theme.unlockRequirement && <p className="text-[9px] text-muted-foreground mt-1">{theme.unlockRequirement}</p>}
            </motion.div>
          ))}
        </div>
        {selected && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>Cancelar</Button>
            <Button className="flex-1"><Star className="h-4 w-4 mr-1" />Aplicar Tema</Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
});
