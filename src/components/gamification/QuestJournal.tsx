import React, { memo, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, Star, Zap, Target, Clock, MapPin, Users, 
  CheckCircle2, Circle, ChevronRight, Sparkles, Trophy,
  Swords, Shield, Heart, Brain, Compass
} from "lucide-react";

interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  current?: number;
  target?: number;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  story: string;
  type: "main" | "side" | "daily" | "weekly" | "event";
  status: "active" | "completed" | "locked";
  difficulty: "easy" | "medium" | "hard" | "legendary";
  icon: React.ElementType;
  objectives: QuestObjective[];
  rewards: {
    xp: number;
    coins: number;
    items?: string[];
  };
  deadline?: string;
  location?: string;
  npc?: string;
  chain?: {
    current: number;
    total: number;
  };
}

const quests: Quest[] = [
  {
    id: "1",
    title: "O Chamado do Herói",
    description: "Complete o tutorial de integração",
    story: "Todo grande herói começa sua jornada com um primeiro passo. O reino corporativo aguarda alguém especial para restaurar a ordem e trazer prosperidade.",
    type: "main",
    status: "completed",
    difficulty: "easy",
    icon: Shield,
    objectives: [
      { id: "1-1", description: "Criar seu perfil", completed: true },
      { id: "1-2", description: "Conhecer a equipe", completed: true },
      { id: "1-3", description: "Completar primeiro treinamento", completed: true }
    ],
    rewards: { xp: 100, coins: 50 },
    chain: { current: 1, total: 5 }
  },
  {
    id: "2",
    title: "Mestre do Conhecimento",
    description: "Complete 5 trilhas de aprendizado",
    story: "A sabedoria é a maior arma de um verdadeiro herói. Busque conhecimento nas antigas bibliotecas do reino e torne-se um mestre em sua arte.",
    type: "main",
    status: "active",
    difficulty: "medium",
    icon: Brain,
    objectives: [
      { id: "2-1", description: "Completar trilha de Onboarding", completed: true },
      { id: "2-2", description: "Completar trilha de Compliance", completed: true },
      { id: "2-3", description: "Completar trilha de Liderança", completed: false, current: 3, target: 5 },
      { id: "2-4", description: "Completar trilha de Comunicação", completed: false },
      { id: "2-5", description: "Completar trilha de Inovação", completed: false }
    ],
    rewards: { xp: 500, coins: 150, items: ["Badge Sábio", "Título: Estudioso"] },
    chain: { current: 2, total: 5 },
    npc: "Mestre Arthur"
  },
  {
    id: "3",
    title: "Guardião da Pontualidade",
    description: "Mantenha uma sequência de 7 dias pontuais",
    story: "O tempo é o recurso mais precioso. Aqueles que o respeitam são dignos de grandes honras no reino.",
    type: "weekly",
    status: "active",
    difficulty: "medium",
    icon: Clock,
    objectives: [
      { id: "3-1", description: "Dias pontuais consecutivos", completed: false, current: 5, target: 7 }
    ],
    rewards: { xp: 200, coins: 75 },
    deadline: "2024-02-07"
  },
  {
    id: "4",
    title: "Aliança dos Companheiros",
    description: "Colabore com 3 colegas em projetos",
    story: "Nenhum herói vence sozinho. Forme alianças, construa pontes e juntos vocês serão invencíveis.",
    type: "side",
    status: "active",
    difficulty: "easy",
    icon: Users,
    objectives: [
      { id: "4-1", description: "Colaborar com Maria", completed: true },
      { id: "4-2", description: "Colaborar com João", completed: false },
      { id: "4-3", description: "Colaborar com Ana", completed: false }
    ],
    rewards: { xp: 150, coins: 50 },
    location: "Departamento de Vendas"
  },
  {
    id: "5",
    title: "Caçador de Metas Diárias",
    description: "Complete todas as missões do dia",
    story: "Cada novo dia traz novos desafios. Enfrente-os com coragem e colha as recompensas.",
    type: "daily",
    status: "active",
    difficulty: "easy",
    icon: Target,
    objectives: [
      { id: "5-1", description: "Check-in pontual", completed: true },
      { id: "5-2", description: "Completar 1 tarefa", completed: true },
      { id: "5-3", description: "Enviar 1 reconhecimento", completed: false }
    ],
    rewards: { xp: 50, coins: 25 },
    deadline: "Hoje, 23:59"
  },
  {
    id: "6",
    title: "O Grande Torneio",
    description: "Evento especial de competição",
    story: "Os maiores guerreiros do reino se reúnem para o lendário torneio. Prove seu valor e conquiste glória eterna!",
    type: "event",
    status: "active",
    difficulty: "legendary",
    icon: Swords,
    objectives: [
      { id: "6-1", description: "Alcançar Top 10 no ranking", completed: false, current: 15, target: 10 },
      { id: "6-2", description: "Ganhar 1000 XP no evento", completed: false, current: 650, target: 1000 },
      { id: "6-3", description: "Completar 5 desafios especiais", completed: false, current: 2, target: 5 }
    ],
    rewards: { xp: 1000, coins: 500, items: ["Troféu Campeão", "Skin Exclusiva"] },
    deadline: "5 dias restantes"
  }
];

const difficultyConfig = {
  easy: { color: "text-green-500", bg: "bg-green-500/20", label: "Fácil" },
  medium: { color: "text-amber-500", bg: "bg-amber-500/20", label: "Médio" },
  hard: { color: "text-red-500", bg: "bg-red-500/20", label: "Difícil" },
  legendary: { color: "text-purple-500", bg: "bg-purple-500/20", label: "Lendário" }
};

const typeConfig = {
  main: { color: "text-amber-500", label: "Principal" },
  side: { color: "text-blue-500", label: "Secundária" },
  daily: { color: "text-green-500", label: "Diária" },
  weekly: { color: "text-purple-500", label: "Semanal" },
  event: { color: "text-rose-500", label: "Evento" }
};

const QuestCard = memo(({ quest, onSelect }: { quest: Quest; onSelect: (q: Quest) => void }) => {
  const config = difficultyConfig[quest.difficulty];
  const typeConf = typeConfig[quest.type];
  const Icon = quest.icon;
  
  const progress = useMemo(() => {
    const completed = quest.objectives.filter(o => o.completed).length;
    return (completed / quest.objectives.length) * 100;
  }, [quest.objectives]);

  return (
    <motion.div
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(quest)}
      className={`
        relative p-4 rounded-xl border cursor-pointer
        ${quest.status === "completed" 
          ? "bg-green-500/10 border-green-500/30" 
          : "bg-card hover:bg-accent/50"}
        transition-colors
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-lg ${config.bg}`}>
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm truncate">{quest.title}</h4>
            {quest.status === "completed" && (
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            )}
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
            {quest.description}
          </p>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`text-xs ${typeConf.color}`}>
              {typeConf.label}
            </Badge>
            <Badge variant="outline" className={`text-xs ${config.color}`}>
              {config.label}
            </Badge>
            {quest.chain && (
              <Badge variant="outline" className="text-xs">
                Parte {quest.chain.current}/{quest.chain.total}
              </Badge>
            )}
          </div>
          
          {quest.status === "active" && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progresso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}
        </div>
        
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
      </div>
      
      {/* Rewards Preview */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
        <Badge variant="secondary" className="text-xs">
          <Zap className="h-3 w-3 mr-1" />
          {quest.rewards.xp} XP
        </Badge>
        <Badge variant="secondary" className="text-xs">
          <Star className="h-3 w-3 mr-1" />
          {quest.rewards.coins}
        </Badge>
        {quest.rewards.items && (
          <Badge variant="secondary" className="text-xs">
            +{quest.rewards.items.length} item(s)
          </Badge>
        )}
      </div>
    </motion.div>
  );
});

QuestCard.displayName = "QuestCard";

const QuestJournal = memo(({ className }: { className?: string }) => {
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [activeTab, setActiveTab] = useState("active");
  
  const stats = useMemo(() => {
    const active = quests.filter(q => q.status === "active").length;
    const completed = quests.filter(q => q.status === "completed").length;
    return { active, completed, total: quests.length };
  }, []);
  
  const filteredQuests = useMemo(() => {
    switch (activeTab) {
      case "active":
        return quests.filter(q => q.status === "active");
      case "completed":
        return quests.filter(q => q.status === "completed");
      case "main":
        return quests.filter(q => q.type === "main");
      default:
        return quests;
    }
  }, [activeTab]);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
              <BookOpen className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Diário de Missões</CardTitle>
              <p className="text-xs text-muted-foreground">
                {stats.active} ativas • {stats.completed} completas
              </p>
            </div>
          </div>
          
          <Badge className="bg-primary/20 text-primary">
            <Compass className="h-3 w-3 mr-1" />
            {stats.active} Ativas
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="active">Ativas</TabsTrigger>
            <TabsTrigger value="main">Principais</TabsTrigger>
            <TabsTrigger value="completed">Completas</TabsTrigger>
            <TabsTrigger value="all">Todas</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredQuests.map((quest) => (
                    <motion.div
                      key={quest.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <QuestCard quest={quest} onSelect={setSelectedQuest} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {filteredQuests.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma missão encontrada</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Quest Detail Modal */}
      <AnimatePresence>
        {selectedQuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedQuest(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-card rounded-2xl border shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className={`p-6 ${difficultyConfig[selectedQuest.difficulty].bg}`}>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-background/80">
                    <selectedQuest.icon className={`h-8 w-8 ${difficultyConfig[selectedQuest.difficulty].color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={typeConfig[selectedQuest.type].color}>
                        {typeConfig[selectedQuest.type].label}
                      </Badge>
                      <Badge variant="outline" className={difficultyConfig[selectedQuest.difficulty].color}>
                        {difficultyConfig[selectedQuest.difficulty].label}
                      </Badge>
                    </div>
                    <h2 className="text-xl font-bold">{selectedQuest.title}</h2>
                    {selectedQuest.chain && (
                      <p className="text-sm text-muted-foreground">
                        Parte {selectedQuest.chain.current} de {selectedQuest.chain.total}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Story */}
                <div className="p-4 rounded-lg bg-muted/50 italic text-sm">
                  "{selectedQuest.story}"
                </div>
                
                {/* Meta Info */}
                <div className="flex flex-wrap gap-3 text-sm">
                  {selectedQuest.deadline && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {selectedQuest.deadline}
                    </div>
                  )}
                  {selectedQuest.location && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {selectedQuest.location}
                    </div>
                  )}
                  {selectedQuest.npc && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {selectedQuest.npc}
                    </div>
                  )}
                </div>
                
                {/* Objectives */}
                <div>
                  <h3 className="font-semibold mb-2">Objetivos</h3>
                  <div className="space-y-2">
                    {selectedQuest.objectives.map((obj) => (
                      <div 
                        key={obj.id}
                        className={`
                          flex items-center gap-2 p-2 rounded-lg
                          ${obj.completed ? "bg-green-500/10" : "bg-muted/50"}
                        `}
                      >
                        {obj.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className={`text-sm flex-1 ${obj.completed ? "line-through text-muted-foreground" : ""}`}>
                          {obj.description}
                        </span>
                        {obj.target && (
                          <Badge variant="outline" className="text-xs">
                            {obj.current}/{obj.target}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Rewards */}
                <div>
                  <h3 className="font-semibold mb-2">Recompensas</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-amber-500/20 text-amber-500">
                      <Zap className="h-3 w-3 mr-1" />
                      {selectedQuest.rewards.xp} XP
                    </Badge>
                    <Badge className="bg-yellow-500/20 text-yellow-500">
                      <Star className="h-3 w-3 mr-1" />
                      {selectedQuest.rewards.coins} Moedas
                    </Badge>
                    {selectedQuest.rewards.items?.map((item, idx) => (
                      <Badge key={idx} className="bg-purple-500/20 text-purple-500">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-4 border-t flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedQuest(null)}
                >
                  Fechar
                </Button>
                {selectedQuest.status === "active" && (
                  <Button className="flex-1">
                    <Target className="h-4 w-4 mr-2" />
                    Rastrear
                  </Button>
                )}
                {selectedQuest.status === "completed" && (
                  <Button className="flex-1" variant="secondary" disabled>
                    <Trophy className="h-4 w-4 mr-2" />
                    Completa
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
});

QuestJournal.displayName = "QuestJournal";

export { QuestJournal };
