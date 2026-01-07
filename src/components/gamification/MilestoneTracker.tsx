import React, { memo, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Flag, Star, Trophy, Gift, Lock, CheckCircle2,
  ChevronRight, Sparkles, Zap, Target, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Milestone {
  id: string;
  title: string;
  description: string;
  category: 'level' | 'xp' | 'streak' | 'achievement' | 'social';
  requirement: number;
  current: number;
  xpReward: number;
  coinReward: number;
  specialReward?: string;
  unlocked: boolean;
  claimed: boolean;
}

const mockMilestones: Milestone[] = [
  { id: '1', title: 'Nível 10', description: 'Alcance o nível 10', category: 'level', requirement: 10, current: 10, xpReward: 500, coinReward: 100, unlocked: true, claimed: true },
  { id: '2', title: 'Nível 25', description: 'Alcance o nível 25', category: 'level', requirement: 25, current: 23, xpReward: 1500, coinReward: 300, specialReward: 'Badge Veterano', unlocked: false, claimed: false },
  { id: '3', title: '10.000 XP', description: 'Acumule 10.000 XP total', category: 'xp', requirement: 10000, current: 10000, xpReward: 1000, coinReward: 200, unlocked: true, claimed: false },
  { id: '4', title: 'Streak de 30 dias', description: 'Mantenha streak por 30 dias', category: 'streak', requirement: 30, current: 18, xpReward: 2000, coinReward: 500, specialReward: 'Título "Inabalável"', unlocked: false, claimed: false },
  { id: '5', title: '10 Conquistas', description: 'Desbloqueie 10 conquistas', category: 'achievement', requirement: 10, current: 8, xpReward: 800, coinReward: 150, unlocked: false, claimed: false },
  { id: '6', title: '50 Conexões', description: 'Conecte-se com 50 colegas', category: 'social', requirement: 50, current: 34, xpReward: 1200, coinReward: 250, specialReward: 'Avatar Exclusivo', unlocked: false, claimed: false }
];

const categoryConfig = {
  level: { label: 'Nível', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  xp: { label: 'XP', icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
  streak: { label: 'Streak', icon: Target, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  achievement: { label: 'Conquistas', icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  social: { label: 'Social', icon: Award, color: 'text-green-500', bg: 'bg-green-500/10' }
};

const MilestoneCard = memo(({ 
  milestone, 
  onClaim 
}: { 
  milestone: Milestone;
  onClaim: (id: string) => void;
}) => {
  const config = categoryConfig[milestone.category];
  const Icon = config.icon;
  const progress = Math.min((milestone.current / milestone.requirement) * 100, 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card className={`
        border-2 transition-all duration-300 overflow-hidden
        ${milestone.claimed ? 'border-green-500/30 bg-green-500/5' :
          milestone.unlocked ? 'border-primary/50 bg-primary/5' : 'border-border/50'}
      `}>
        {milestone.unlocked && !milestone.claimed && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        
        <CardContent className="p-4 relative">
          <div className="flex items-start gap-4">
            <div className={`
              p-3 rounded-xl ${config.bg}
              ${!milestone.unlocked ? 'opacity-50' : ''}
            `}>
              {milestone.unlocked ? (
                <Icon className={`h-6 w-6 ${config.color}`} />
              ) : (
                <Lock className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground">{milestone.title}</h4>
                {milestone.claimed && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>
              
              {!milestone.claimed && (
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="text-foreground font-medium">
                      {milestone.current.toLocaleString()} / {milestone.requirement.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
              
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <Zap className="h-3 w-3 mr-1" />
                  {milestone.xpReward} XP
                </Badge>
                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
                  <Gift className="h-3 w-3 mr-1" />
                  {milestone.coinReward}
                </Badge>
                {milestone.specialReward && (
                  <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {milestone.specialReward}
                  </Badge>
                )}
              </div>
            </div>
            
            {milestone.unlocked && !milestone.claimed && (
              <Button
                onClick={() => onClaim(milestone.id)}
                className="bg-gradient-to-r from-primary to-purple-500"
              >
                Coletar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

MilestoneCard.displayName = 'MilestoneCard';

export const MilestoneTracker = memo(() => {
  const [milestones, setMilestones] = useState<Milestone[]>(mockMilestones);
  const [filter, setFilter] = useState<string>('all');

  const handleClaim = (id: string) => {
    setMilestones(prev => prev.map(m => 
      m.id === id ? { ...m, claimed: true } : m
    ));
  };

  const stats = useMemo(() => ({
    total: milestones.length,
    unlocked: milestones.filter(m => m.unlocked).length,
    claimed: milestones.filter(m => m.claimed).length,
    pendingRewards: milestones.filter(m => m.unlocked && !m.claimed).length
  }), [milestones]);

  const filteredMilestones = useMemo(() => {
    if (filter === 'all') return milestones;
    if (filter === 'unlocked') return milestones.filter(m => m.unlocked && !m.claimed);
    if (filter === 'claimed') return milestones.filter(m => m.claimed);
    return milestones.filter(m => m.category === filter);
  }, [milestones, filter]);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-primary" />
            Marcos
          </CardTitle>
          {stats.pendingRewards > 0 && (
            <Badge className="bg-primary animate-pulse">
              {stats.pendingRewards} para coletar
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-foreground">{stats.claimed}</div>
            <div className="text-xs text-muted-foreground">Alcançados</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats.unlocked}</div>
            <div className="text-xs text-muted-foreground">Desbloqueados</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>

        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {[
              { value: 'all', label: 'Todos' },
              { value: 'unlocked', label: 'Pendentes' },
              { value: 'claimed', label: 'Coletados' },
              ...Object.entries(categoryConfig).map(([key, config]) => ({
                value: key,
                label: config.label
              }))
            ].map(option => (
              <Button
                key={option.value}
                variant={filter === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(option.value)}
                className="whitespace-nowrap"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </ScrollArea>

        <ScrollArea className="h-[400px]">
          <div className="space-y-3 pr-2">
            <AnimatePresence>
              {filteredMilestones.map(milestone => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  onClaim={handleClaim}
                />
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

MilestoneTracker.displayName = 'MilestoneTracker';
