import React, { memo, useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Flame, Zap, Star, TrendingUp, Clock, Target,
  Sparkles, ChevronUp, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ComboAction {
  id: string;
  name: string;
  category: string;
  timestamp: string;
  xpBase: number;
}

interface ComboState {
  count: number;
  multiplier: number;
  timeRemaining: number;
  maxTime: number;
  totalXPBonus: number;
  recentActions: ComboAction[];
}

const mockComboState: ComboState = {
  count: 7,
  multiplier: 2.5,
  timeRemaining: 45,
  maxTime: 60,
  totalXPBonus: 450,
  recentActions: [
    { id: '1', name: 'Quiz Completo', category: 'training', timestamp: '10:45', xpBase: 50 },
    { id: '2', name: 'Kudos Enviado', category: 'social', timestamp: '10:43', xpBase: 10 },
    { id: '3', name: 'Check-in', category: 'attendance', timestamp: '10:40', xpBase: 20 },
    { id: '4', name: 'Módulo Concluído', category: 'training', timestamp: '10:35', xpBase: 100 },
    { id: '5', name: 'Feedback Dado', category: 'social', timestamp: '10:30', xpBase: 25 }
  ]
};

const comboTiers = [
  { min: 1, max: 3, name: 'Aquecendo', color: 'text-gray-400', multiplier: 1.0 },
  { min: 4, max: 6, name: 'Combo!', color: 'text-blue-500', multiplier: 1.5 },
  { min: 7, max: 10, name: 'Super Combo!', color: 'text-purple-500', multiplier: 2.0 },
  { min: 11, max: 15, name: 'Mega Combo!', color: 'text-orange-500', multiplier: 3.0 },
  { min: 16, max: Infinity, name: 'Ultra Combo!', color: 'text-yellow-500', multiplier: 5.0 }
];

const ComboMeter = memo(({ combo }: { combo: ComboState }) => {
  const tier = comboTiers.find(t => combo.count >= t.min && combo.count <= t.max) || comboTiers[0];
  const nextTier = comboTiers.find(t => t.min > combo.count);
  const timeProgress = (combo.timeRemaining / combo.maxTime) * 100;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative"
    >
      {/* Combo Ring */}
      <div className="relative w-40 h-40 mx-auto">
        {/* Background Ring */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <motion.circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={440}
            initial={{ strokeDashoffset: 440 }}
            animate={{ strokeDashoffset: 440 - (440 * timeProgress) / 100 }}
            transition={{ duration: 0.5 }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            key={combo.count}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="flex items-center gap-1">
              <Flame className={`h-6 w-6 ${tier.color}`} />
              <span className="text-4xl font-bold text-foreground">{combo.count}</span>
            </div>
            <span className={`text-sm font-semibold ${tier.color}`}>{tier.name}</span>
          </motion.div>
        </div>
      </div>

      {/* Timer Warning */}
      <AnimatePresence>
        {combo.timeRemaining <= 15 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2"
          >
            <Badge variant="destructive" className="animate-pulse">
              <Clock className="h-3 w-3 mr-1" />
              {combo.timeRemaining}s
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

ComboMeter.displayName = 'ComboMeter';

const ActionCard = memo(({ action, multiplier }: { action: ComboAction; multiplier: number }) => {
  const bonusXP = Math.round(action.xpBase * (multiplier - 1));

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, height: 0 }}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
    >
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        <span className="text-sm text-foreground">{action.name}</span>
        <span className="text-xs text-muted-foreground">{action.timestamp}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{action.xpBase} XP</span>
        {bonusXP > 0 && (
          <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-xs">
            +{bonusXP}
          </Badge>
        )}
      </div>
    </motion.div>
  );
});

ActionCard.displayName = 'ActionCard';

export const ComboSystem = memo(() => {
  const [combo, setCombo] = useState<ComboState>(mockComboState);

  // Simulate timer countdown
  useEffect(() => {
    if (combo.timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setCombo(prev => ({
        ...prev,
        timeRemaining: Math.max(0, prev.timeRemaining - 1)
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [combo.timeRemaining]);

  const tier = useMemo(() => 
    comboTiers.find(t => combo.count >= t.min && combo.count <= t.max) || comboTiers[0],
    [combo.count]
  );

  const nextTier = useMemo(() => 
    comboTiers.find(t => t.min > combo.count),
    [combo.count]
  );

  return (
    <Card className="border-border/50 overflow-hidden">
      {/* Animated Background */}
      {combo.count >= 7 && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      
      <CardHeader className="pb-3 relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            Sistema de Combo
          </CardTitle>
          <Badge className={`bg-gradient-to-r from-primary to-purple-500`}>
            x{combo.multiplier.toFixed(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 relative">
        {/* Combo Meter */}
        <ComboMeter combo={combo} />

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-lg font-bold text-foreground">x{combo.multiplier}</div>
            <div className="text-xs text-muted-foreground">Multiplicador</div>
          </div>
          
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="text-lg font-bold text-primary">+{combo.totalXPBonus}</div>
            <div className="text-xs text-muted-foreground">XP Bônus</div>
          </div>
          
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-lg font-bold text-foreground">{combo.timeRemaining}s</div>
            <div className="text-xs text-muted-foreground">Restante</div>
          </div>
        </div>

        {/* Next Tier Progress */}
        {nextTier && (
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Próximo Tier</span>
              <span className={`text-sm font-semibold ${nextTier.color}`}>
                {nextTier.name} (x{nextTier.multiplier})
              </span>
            </div>
            <Progress 
              value={((combo.count - tier.min + 1) / (tier.max - tier.min + 1)) * 100} 
              className="h-2"
            />
            <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
              <span>{combo.count} combos</span>
              <span>{nextTier.min} para próximo</span>
            </div>
          </div>
        )}

        {/* Recent Actions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Ações Recentes</span>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            <AnimatePresence>
              {combo.recentActions.slice(0, 5).map(action => (
                <ActionCard 
                  key={action.id} 
                  action={action} 
                  multiplier={combo.multiplier}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Tips */}
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-start gap-2">
            <Award className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-foreground font-medium">Dica de Combo</p>
              <p className="text-xs text-muted-foreground">
                Complete ações variadas para manter o combo ativo e maximizar seus ganhos de XP!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ComboSystem.displayName = 'ComboSystem';
