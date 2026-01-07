import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Map, 
  Star, 
  Lock, 
  CheckCircle2, 
  Play,
  Trophy,
  Coins,
  Zap,
  ChevronRight
} from "lucide-react";

interface QuestNode {
  id: string;
  title: string;
  description: string;
  type: "main" | "side" | "boss";
  status: "locked" | "available" | "in_progress" | "completed";
  xpReward: number;
  coinReward: number;
  position: { x: number; y: number };
  connections: string[];
  requirements?: string[];
  progress?: number;
}

const questNodes: QuestNode[] = [
  {
    id: "q1",
    title: "Primeiro Passo",
    description: "Complete seu perfil",
    type: "main",
    status: "completed",
    xpReward: 50,
    coinReward: 25,
    position: { x: 10, y: 50 },
    connections: ["q2"]
  },
  {
    id: "q2",
    title: "Conhecendo o Sistema",
    description: "Explore as funcionalidades",
    type: "main",
    status: "completed",
    xpReward: 75,
    coinReward: 40,
    position: { x: 25, y: 30 },
    connections: ["q3", "q4"]
  },
  {
    id: "q3",
    title: "Colaboração",
    description: "Envie seu primeiro kudos",
    type: "side",
    status: "in_progress",
    xpReward: 100,
    coinReward: 50,
    position: { x: 40, y: 20 },
    connections: ["q5"],
    progress: 60
  },
  {
    id: "q4",
    title: "Aprendizado",
    description: "Complete um treinamento",
    type: "main",
    status: "available",
    xpReward: 150,
    coinReward: 75,
    position: { x: 40, y: 60 },
    connections: ["q6"]
  },
  {
    id: "q5",
    title: "Líder de Equipe",
    description: "Reconheça 5 colegas",
    type: "side",
    status: "locked",
    xpReward: 200,
    coinReward: 100,
    position: { x: 55, y: 15 },
    connections: ["q7"],
    requirements: ["q3"]
  },
  {
    id: "q6",
    title: "Mestre do Conhecimento",
    description: "Complete 3 treinamentos",
    type: "main",
    status: "locked",
    xpReward: 250,
    coinReward: 125,
    position: { x: 55, y: 70 },
    connections: ["q7"],
    requirements: ["q4"]
  },
  {
    id: "q7",
    title: "Guardião da Cultura",
    description: "Desbloqueie todas as conquistas",
    type: "boss",
    status: "locked",
    xpReward: 500,
    coinReward: 300,
    position: { x: 80, y: 45 },
    connections: [],
    requirements: ["q5", "q6"]
  }
];

const nodeColors = {
  main: {
    completed: "bg-green-500",
    in_progress: "bg-primary",
    available: "bg-blue-500",
    locked: "bg-muted"
  },
  side: {
    completed: "bg-green-400",
    in_progress: "bg-primary/80",
    available: "bg-cyan-500",
    locked: "bg-muted"
  },
  boss: {
    completed: "bg-gradient-to-br from-amber-400 to-orange-500",
    in_progress: "bg-gradient-to-br from-amber-500 to-red-500",
    available: "bg-gradient-to-br from-purple-500 to-pink-500",
    locked: "bg-muted"
  }
};

export function QuestMap() {
  const [selectedQuest, setSelectedQuest] = useState<QuestNode | null>(null);

  const completedCount = questNodes.filter(q => q.status === "completed").length;
  const totalQuests = questNodes.length;

  const getNodeSize = (type: string) => {
    switch (type) {
      case "boss": return "w-16 h-16";
      case "main": return "w-12 h-12";
      default: return "w-10 h-10";
    }
  };

  const getNodeIcon = (quest: QuestNode) => {
    if (quest.status === "locked") return <Lock className="h-4 w-4" />;
    if (quest.status === "completed") return <CheckCircle2 className="h-4 w-4" />;
    if (quest.type === "boss") return <Trophy className="h-5 w-5" />;
    return <Star className="h-4 w-4" />;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Map className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Mapa de Quests</CardTitle>
              <p className="text-sm text-muted-foreground">
                Sua jornada de desenvolvimento
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm">
            {completedCount}/{totalQuests} Completas
          </Badge>
        </div>
        <Progress value={(completedCount / totalQuests) * 100} className="h-2 mt-2" />
      </CardHeader>

      <CardContent className="p-0">
        {/* Quest Map Visualization */}
        <div className="relative h-[300px] bg-gradient-to-br from-muted/30 via-background to-muted/30 overflow-hidden">
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
            {questNodes.map(quest => 
              quest.connections.map(targetId => {
                const target = questNodes.find(q => q.id === targetId);
                if (!target) return null;
                
                const isActive = quest.status === "completed" || quest.status === "in_progress";
                
                return (
                  <motion.line
                    key={`${quest.id}-${targetId}`}
                    x1={`${quest.position.x}%`}
                    y1={`${quest.position.y}%`}
                    x2={`${target.position.x}%`}
                    y2={`${target.position.y}%`}
                    stroke={isActive ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                    strokeWidth={isActive ? 3 : 2}
                    strokeDasharray={isActive ? "0" : "5,5"}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                );
              })
            )}
          </svg>

          {/* Quest Nodes */}
          {questNodes.map((quest, index) => (
            <motion.div
              key={quest.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: `${quest.position.x}%`, top: `${quest.position.y}%`, zIndex: 1 }}
              onClick={() => setSelectedQuest(quest)}
            >
              <motion.div
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  ${getNodeSize(quest.type)} 
                  ${nodeColors[quest.type][quest.status]}
                  rounded-full flex items-center justify-center
                  shadow-lg border-2 border-background
                  ${quest.status === "in_progress" ? "animate-pulse" : ""}
                  ${quest.status !== "locked" ? "text-white" : "text-muted-foreground"}
                `}
              >
                {getNodeIcon(quest)}
              </motion.div>
              
              {/* Progress ring for in_progress */}
              {quest.status === "in_progress" && quest.progress && (
                <svg 
                  className="absolute inset-0 -rotate-90" 
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="hsl(var(--primary) / 0.3)"
                    strokeWidth="6"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${quest.progress * 2.83} 283`}
                    initial={{ strokeDasharray: "0 283" }}
                    animate={{ strokeDasharray: `${quest.progress * 2.83} 283` }}
                    transition={{ duration: 1 }}
                  />
                </svg>
              )}
            </motion.div>
          ))}

          {/* Legend */}
          <div className="absolute bottom-2 left-2 flex gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Completa</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <span className="text-muted-foreground">Em Progresso</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">Disponível</span>
            </div>
          </div>
        </div>

        {/* Selected Quest Details */}
        {selectedQuest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-t bg-card"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge 
                    variant={selectedQuest.type === "boss" ? "default" : "outline"}
                    className={selectedQuest.type === "boss" ? "bg-gradient-to-r from-amber-500 to-orange-500" : ""}
                  >
                    {selectedQuest.type === "boss" ? "Boss" : selectedQuest.type === "main" ? "Principal" : "Secundária"}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={
                      selectedQuest.status === "completed" ? "border-green-500 text-green-500" :
                      selectedQuest.status === "in_progress" ? "border-primary text-primary" :
                      selectedQuest.status === "available" ? "border-blue-500 text-blue-500" :
                      "border-muted text-muted-foreground"
                    }
                  >
                    {selectedQuest.status === "completed" ? "Completa" :
                     selectedQuest.status === "in_progress" ? "Em Progresso" :
                     selectedQuest.status === "available" ? "Disponível" : "Bloqueada"}
                  </Badge>
                </div>
                <h4 className="font-semibold">{selectedQuest.title}</h4>
                <p className="text-sm text-muted-foreground">{selectedQuest.description}</p>
                
                {selectedQuest.status === "in_progress" && selectedQuest.progress && (
                  <div className="mt-2">
                    <Progress value={selectedQuest.progress} className="h-2" />
                    <span className="text-xs text-muted-foreground">{selectedQuest.progress}% completo</span>
                  </div>
                )}

                {selectedQuest.requirements && selectedQuest.status === "locked" && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Requer: {selectedQuest.requirements.map(r => {
                        const req = questNodes.find(q => q.id === r);
                        return req?.title;
                      }).join(", ")}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-right space-y-1">
                <div className="flex items-center gap-1 text-sm">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="font-medium">+{selectedQuest.xpReward} XP</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Coins className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">+{selectedQuest.coinReward}</span>
                </div>
              </div>
            </div>

            {selectedQuest.status === "available" && (
              <Button className="w-full mt-3">
                <Play className="h-4 w-4 mr-2" />
                Iniciar Quest
              </Button>
            )}

            {selectedQuest.status === "in_progress" && (
              <Button className="w-full mt-3">
                Continuar
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
