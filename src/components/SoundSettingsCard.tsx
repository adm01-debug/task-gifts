import { motion } from "framer-motion";
import { Volume2, VolumeX, Music, Play } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useSoundSettings } from "@/contexts/SoundSettingsContext";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export const SoundSettingsCard = () => {
  const { settings, setEnabled, setVolume } = useSoundSettings();
  const { playClickSound, playAchievementSound } = useSoundEffects();

  const handleToggle = (enabled: boolean) => {
    setEnabled(enabled);
    if (enabled) {
      setTimeout(() => playClickSound(), 100);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const handleTestSound = () => {
    playAchievementSound();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
        <Music className="w-5 h-5 text-primary" />
        Configurações de Som
      </h3>

      <div className="space-y-6">
        {/* Sound Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center transition-colors
              ${settings.enabled ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}
            `}>
              {settings.enabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="font-medium">Efeitos Sonoros</p>
              <p className="text-sm text-muted-foreground">
                Sons de conquistas, níveis e ações
              </p>
            </div>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={handleToggle}
          />
        </div>

        {/* Volume Slider */}
        {settings.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Volume</span>
              <span className="font-medium">{Math.round(settings.volume * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <Slider
                value={[settings.volume]}
                onValueChange={handleVolumeChange}
                min={0}
                max={1}
                step={0.1}
                className="cursor-pointer flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestSound}
                className="shrink-0 gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                Testar
              </Button>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Baixo</span>
              <span>Alto</span>
            </div>
          </motion.div>
        )}

        {/* Sound Types Info */}
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">Sons incluem:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { icon: "🔥", label: "Streak ativado" },
              { icon: "⬆️", label: "Subida de nível" },
              { icon: "🏆", label: "Top 3 ranking" },
              { icon: "💰", label: "Moedas acumuladas" },
              { icon: "✨", label: "XP ganho" },
              { icon: "🎯", label: "Quest concluída" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-muted-foreground">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

