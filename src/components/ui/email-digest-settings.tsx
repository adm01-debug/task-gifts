import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Calendar, 
  Bell, 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  Settings,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DigestPreferences {
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly";
  includeXpSummary: boolean;
  includeAchievements: boolean;
  includeRankChanges: boolean;
  includeDeadlines: boolean;
  includeTeamUpdates: boolean;
  preferredTime: string;
}

interface EmailDigestSettingsProps {
  initialPreferences?: Partial<DigestPreferences>;
  onSave?: (preferences: DigestPreferences) => void;
  className?: string;
}

const defaultPreferences: DigestPreferences = {
  enabled: true,
  frequency: "weekly",
  includeXpSummary: true,
  includeAchievements: true,
  includeRankChanges: true,
  includeDeadlines: true,
  includeTeamUpdates: false,
  preferredTime: "09:00"
};

const frequencyOptions = [
  { value: "daily", label: "Diário", icon: Clock, description: "Todo dia às" },
  { value: "weekly", label: "Semanal", icon: Calendar, description: "Toda segunda às" },
  { value: "monthly", label: "Mensal", icon: Calendar, description: "Primeiro dia do mês às" }
];

const contentOptions = [
  { key: "includeXpSummary", label: "Resumo de XP", icon: TrendingUp, description: "XP ganho e progresso de nível" },
  { key: "includeAchievements", label: "Conquistas", icon: Trophy, description: "Badges e conquistas desbloqueadas" },
  { key: "includeRankChanges", label: "Mudanças de Rank", icon: Target, description: "Sua posição no ranking" },
  { key: "includeDeadlines", label: "Prazos", icon: Clock, description: "Missões e metas próximas" },
  { key: "includeTeamUpdates", label: "Updates do Time", icon: Bell, description: "Atividades da sua equipe" }
];

export function EmailDigestSettings({ 
  initialPreferences, 
  onSave,
  className 
}: EmailDigestSettingsProps) {
  const [preferences, setPreferences] = useState<DigestPreferences>({
    ...defaultPreferences,
    ...initialPreferences
  });
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof DigestPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setSaved(false);
  };

  const handleFrequencyChange = (frequency: DigestPreferences["frequency"]) => {
    setPreferences(prev => ({ ...prev, frequency }));
    setSaved(false);
  };

  const handleTimeChange = (time: string) => {
    setPreferences(prev => ({ ...prev, preferredTime: time }));
    setSaved(false);
  };

  const handleSave = () => {
    onSave?.(preferences);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Resumo por Email</CardTitle>
            <CardDescription>Configure seu digest personalizado</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Master Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <div>
              <Label className="font-medium">Ativar Resumo</Label>
              <p className="text-sm text-muted-foreground">
                Receba atualizações sobre seu progresso
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.enabled}
            onCheckedChange={() => handleToggle("enabled")}
          />
        </div>

        <AnimatePresence>
          {preferences.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              {/* Frequency Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Frequência</Label>
                <div className="grid grid-cols-3 gap-2">
                  {frequencyOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = preferences.frequency === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleFrequencyChange(option.value as DigestPreferences["frequency"])}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-muted hover:border-muted-foreground/30"
                        )}
                      >
                        <Icon className={cn(
                          "h-5 w-5 mx-auto mb-1",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className={cn(
                          "text-sm font-medium block",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Horário Preferido</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="time"
                    value={preferences.preferredTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="px-3 py-2 rounded-md border bg-background text-sm"
                  />
                  <span className="text-sm text-muted-foreground">
                    {frequencyOptions.find(f => f.value === preferences.frequency)?.description}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Content Options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Conteúdo do Resumo</Label>
                <div className="space-y-2">
                  {contentOptions.map((option) => {
                    const Icon = option.icon;
                    const isEnabled = preferences[option.key as keyof DigestPreferences] as boolean;
                    return (
                      <motion.div
                        key={option.key}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg transition-colors",
                          isEnabled ? "bg-primary/5" : "bg-muted/30"
                        )}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-1.5 rounded-md",
                            isEnabled ? "bg-primary/20" : "bg-muted"
                          )}>
                            <Icon className={cn(
                              "h-4 w-4",
                              isEnabled ? "text-primary" : "text-muted-foreground"
                            )} />
                          </div>
                          <div>
                            <span className="text-sm font-medium">{option.label}</span>
                            <p className="text-xs text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={() => handleToggle(option.key as keyof DigestPreferences)}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Preview Badge */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Mail className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  Próximo envio: {preferences.frequency === "daily" 
                    ? "Amanhã" 
                    : preferences.frequency === "weekly" 
                    ? "Segunda-feira" 
                    : "Dia 1"} às {preferences.preferredTime}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          className="w-full"
          disabled={saved}
        >
          <AnimatePresence mode="wait">
            {saved ? (
              <motion.div
                key="saved"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Salvo!
              </motion.div>
            ) : (
              <motion.div
                key="save"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Salvar Preferências
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </CardContent>
    </Card>
  );
}

// Compact version for settings page
export function MiniDigestToggle({ 
  enabled = false, 
  onToggle 
}: { 
  enabled?: boolean; 
  onToggle?: (enabled: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Resumo por Email</span>
        {enabled && (
          <Badge variant="secondary" className="text-xs">
            Ativo
          </Badge>
        )}
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} />
    </div>
  );
}
