import React, { memo, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ScrollText, Star, Clock, Users, Trophy, MapPin,
  ChevronRight, Flame, Target, Gift, Sparkles,
  CheckCircle2, Circle, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestObjective {
  id: string;
  description: string;
  current: number;
  target: number;
  completed: boolean;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'main' | 'side' | 'daily' | 'weekly' | 'event';
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  status: 'available' | 'active' | 'completed' | 'failed';
  objectives: QuestObjective[];
  xpReward: number;
  coinReward: number;
  timeLimit?: string;
  participants?: number;
  location?: string;
  chain?: { current: number; total: number };
}

const mockQuests: Quest[] = [
  {
    id: '1',
    title: 'Jornada do Conhecimento',
    description: 'Complete todos os módulos de treinamento obrigatório',
    category: 'main',
    difficulty: 'hard',
    status: 'active',
    objectives: [
      { id: '1', description: 'Completar módulo de Segurança', current: 1, target: 1, completed: true },
      { id: '2', description: 'Completar módulo de Compliance', current: 0, target: 1, completed: false },
      { id: '3', description: 'Passar no quiz final', current: 0, target: 1, completed: false }
    ],
    xpReward: 500,
    coinReward: 100,
    chain: { current: 2, total: 5 }
  },
  {
    id: '2',
    title: 'Networking Champion',
    description: 'Conecte-se com colegas de outros departamentos',
    category: 'side',
    difficulty: 'medium',
    status: 'active',
    objectives: [
      { id: '1', description: 'Enviar 5 kudos', current: 3, target: 5, completed: false },
      { id: '2', description: 'Participar de 2 eventos', current: 1, target: 2, completed: false }
    ],
    xpReward: 200,
    coinReward: 50,
    participants: 45
  },
  {
    id: '3',
    title: 'Pontualidade Perfeita',
    description: 'Mantenha check-in pontual por 5 dias',
    category: 'weekly',
    difficulty: 'easy',
    status: 'active',
    objectives: [
      { id: '1', description: 'Check-ins pontuais', current: 3, target: 5, completed: false }
    ],
    xpReward: 150,
    coinReward: 30,
    timeLimit: '4 dias restantes'
  },
  {
    id: '4',
    title: 'Evento Especial: Hackathon',
    description: 'Participe do hackathon de inovação',
    category: 'event',
    difficulty: 'legendary',
    status: 'available',
    objectives: [
      { id: '1', description: 'Formar equipe', current: 0, target: 1, completed: false },
      { id: '2', description: 'Submeter projeto', current: 0, target: 1, completed: false },
      { id: '3', description: 'Apresentar solução', current: 0, target: 1, completed: false }
    ],
    xpReward: 1000,
    coinReward: 500,
    timeLimit: 'Começa em 2 dias',
    location: 'Auditório Principal'
  }
];

const categoryConfig = {
  main: { label: 'Principal', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  side: { label: 'Secundária', icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  daily: { label: 'Diária', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  weekly: { label: 'Semanal', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  event: { label: 'Evento', icon: Sparkles, color: 'text-pink-500', bg: 'bg-pink-500/10' }
};

const difficultyConfig = {
  easy: { label: 'Fácil', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  medium: { label: 'Médio', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  hard: { label: 'Difícil', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  legendary: { label: 'Lendário', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' }
};

const QuestCard = memo(({ quest, onSelect }: { quest: Quest; onSelect: (id: string) => void }) => {
  const category = categoryConfig[quest.category];
  const difficulty = difficultyConfig[quest.difficulty];
  const CategoryIcon = category.icon;
  
  const completedObjectives = quest.objectives.filter(o => o.completed).length;
  const totalObjectives = quest.objectives.length;
  const progress = (completedObjectives / totalObjectives) * 100;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className="cursor-pointer"
      onClick={() => onSelect(quest.id)}
    >
      <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${category.bg}`}>
              <CategoryIcon className={`h-5 w-5 ${category.color}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground truncate">{quest.title}</h4>
                {quest.chain && (
                  <Badge variant="outline" className="text-xs">
                    {quest.chain.current}/{quest.chain.total}
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                {quest.description}
              </p>
              
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <Badge variant="outline" className={difficulty.color}>
                  {difficulty.label}
                </Badge>
                {quest.timeLimit && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {quest.timeLimit}
                  </span>
                )}
                {quest.participants && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {quest.participants} participantes
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {completedObjectives}/{totalObjectives} objetivos
                  </span>
                  <span className="text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-primary flex items-center gap-1">
                    <Star className="h-3.5 w-3.5" />
                    {quest.xpReward} XP
                  </span>
                  <span className="text-sm font-medium text-yellow-500 flex items-center gap-1">
                    <Gift className="h-3.5 w-3.5" />
                    {quest.coinReward}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

QuestCard.displayName = 'QuestCard';

const QuestDetail = memo(({ quest, onClose }: { quest: Quest; onClose: () => void }) => {
  const category = categoryConfig[quest.category];
  const difficulty = difficultyConfig[quest.difficulty];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onClose}>
          ← Voltar
        </Button>
        <Badge variant="outline" className={difficulty.color}>
          {difficulty.label}
        </Badge>
      </div>

      <div>
        <h3 className="text-xl font-bold text-foreground mb-2">{quest.title}</h3>
        <p className="text-muted-foreground">{quest.description}</p>
      </div>

      {quest.location && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {quest.location}
        </div>
      )}

      <div className="space-y-3">
        <h4 className="font-semibold text-foreground">Objetivos</h4>
        {quest.objectives.map((objective, index) => (
          <motion.div
            key={objective.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              objective.completed 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-muted/30 border-border/50'
            }`}
          >
            {objective.completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
            <div className="flex-1">
              <span className={objective.completed ? 'line-through text-muted-foreground' : 'text-foreground'}>
                {objective.description}
              </span>
              {!objective.completed && objective.target > 1 && (
                <div className="mt-1">
                  <Progress value={(objective.current / objective.target) * 100} className="h-1" />
                  <span className="text-xs text-muted-foreground">
                    {objective.current}/{objective.target}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{quest.xpReward}</div>
          <div className="text-xs text-muted-foreground">XP</div>
        </div>
        <div className="w-px h-10 bg-border" />
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-500">{quest.coinReward}</div>
          <div className="text-xs text-muted-foreground">Moedas</div>
        </div>
      </div>

      {quest.status === 'available' && (
        <Button className="w-full">
          <Target className="h-4 w-4 mr-2" />
          Aceitar Quest
        </Button>
      )}
    </motion.div>
  );
});

QuestDetail.displayName = 'QuestDetail';

export const QuestLog = memo(() => {
  const [quests] = useState<Quest[]>(mockQuests);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('active');

  const selectedQuest = useMemo(() => 
    quests.find(q => q.id === selectedQuestId),
    [quests, selectedQuestId]
  );

  const filteredQuests = useMemo(() => {
    switch (activeTab) {
      case 'active':
        return quests.filter(q => q.status === 'active');
      case 'available':
        return quests.filter(q => q.status === 'available');
      case 'completed':
        return quests.filter(q => q.status === 'completed');
      default:
        return quests;
    }
  }, [quests, activeTab]);

  const stats = useMemo(() => ({
    active: quests.filter(q => q.status === 'active').length,
    available: quests.filter(q => q.status === 'available').length,
    completed: quests.filter(q => q.status === 'completed').length
  }), [quests]);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" />
            Quest Log
          </CardTitle>
          <Badge variant="secondary">
            {stats.active} ativas
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {selectedQuest ? (
            <QuestDetail
              key="detail"
              quest={selectedQuest}
              onClose={() => setSelectedQuestId(null)}
            />
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="active" className="flex-1">
                    Ativas ({stats.active})
                  </TabsTrigger>
                  <TabsTrigger value="available" className="flex-1">
                    Disponíveis ({stats.available})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex-1">
                    Completas ({stats.completed})
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[400px]">
                  <div className="space-y-3 pr-2">
                    <AnimatePresence>
                      {filteredQuests.map(quest => (
                        <QuestCard
                          key={quest.id}
                          quest={quest}
                          onSelect={setSelectedQuestId}
                        />
                      ))}
                    </AnimatePresence>
                    {filteredQuests.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Nenhuma quest encontrada</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
});

QuestLog.displayName = 'QuestLog';
