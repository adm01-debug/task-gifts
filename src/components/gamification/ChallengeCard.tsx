import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Swords, 
  Users, 
  Clock, 
  Trophy,
  Zap,
  Star,
  ChevronRight,
  CheckCircle2,
  Target,
  Crown,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  isYou?: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "solo" | "team" | "pvp";
  status: "active" | "upcoming" | "completed";
  difficulty: "bronze" | "silver" | "gold" | "diamond";
  xpReward: number;
  coinReward: number;
  participants: Participant[];
  maxParticipants: number;
  endsIn: string;
  progress?: number;
  target?: number;
}

const mockChallenges: Challenge[] = [
  {
    id: "1",
    title: "Duelo de Produtividade",
    description: "Complete mais tarefas que seu oponente em 24h",
    type: "pvp",
    status: "active",
    difficulty: "gold",
    xpReward: 500,
    coinReward: 250,
    participants: [
      { id: "1", name: "Você", score: 12, isYou: true },
      { id: "2", name: "Carlos M.", avatar: "/avatars/carlos.jpg", score: 10 },
    ],
    maxParticipants: 2,
    endsIn: "18h",
    progress: 12,
    target: 15,
  },
  {
    id: "2",
    title: "Desafio de Equipe: Sprint",
    description: "Complete 50 tarefas como equipe",
    type: "team",
    status: "active",
    difficulty: "diamond",
    xpReward: 1000,
    coinReward: 500,
    participants: [
      { id: "1", name: "Você", score: 15, isYou: true },
      { id: "2", name: "Ana S.", avatar: "/avatars/ana.jpg", score: 12 },
      { id: "3", name: "Pedro L.", avatar: "/avatars/pedro.jpg", score: 8 },
      { id: "4", name: "Maria F.", avatar: "/avatars/maria.jpg", score: 10 },
    ],
    maxParticipants: 5,
    endsIn: "2d",
    progress: 45,
    target: 50,
  },
  {
    id: "3",
    title: "Maratona Solo",
    description: "Complete 20 tarefas em uma semana",
    type: "solo",
    status: "active",
    difficulty: "silver",
    xpReward: 300,
    coinReward: 150,
    participants: [{ id: "1", name: "Você", score: 14, isYou: true }],
    maxParticipants: 1,
    endsIn: "3d",
    progress: 14,
    target: 20,
  },
];

const difficultyConfig = {
  bronze: { label: "Bronze", color: "text-amber-600", bg: "bg-amber-600/10", border: "border-amber-600/30" },
  silver: { label: "Prata", color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/30" },
  gold: { label: "Ouro", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  diamond: { label: "Diamante", color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/30" },
};

const typeConfig = {
  solo: { label: "Solo", icon: Target, color: "text-blue-500" },
  team: { label: "Equipe", icon: Users, color: "text-green-500" },
  pvp: { label: "PvP", icon: Swords, color: "text-red-500" },
};

export const ChallengeCard = memo(function ChallengeCard() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Swords className="h-5 w-5 text-white" />
            </div>
            <div>
              <span>Desafios Ativos</span>
              <p className="text-xs font-normal text-muted-foreground">
                {mockChallenges.filter(c => c.status === "active").length} em andamento
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Ver Todos
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {mockChallenges.map((challenge, index) => {
          const TypeIcon = typeConfig[challenge.type].icon;
          const isExpanded = expandedId === challenge.id;
          const progressPercent = challenge.target 
            ? (challenge.progress! / challenge.target) * 100 
            : 0;

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "rounded-xl border overflow-hidden transition-all cursor-pointer",
                difficultyConfig[challenge.difficulty].border,
                difficultyConfig[challenge.difficulty].bg
              )}
              onClick={() => setExpandedId(isExpanded ? null : challenge.id)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      difficultyConfig[challenge.difficulty].bg
                    )}>
                      <TypeIcon className={cn("h-5 w-5", typeConfig[challenge.type].color)} />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{challenge.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className={cn("text-[10px]", typeConfig[challenge.type].color)}>
                          {typeConfig[challenge.type].label}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[10px]", difficultyConfig[challenge.difficulty].color)}>
                          <Sparkles className="h-2.5 w-2.5 mr-1" />
                          {difficultyConfig[challenge.difficulty].label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {challenge.endsIn}
                  </div>
                </div>

                {/* Progress */}
                {challenge.target && (
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{challenge.description}</span>
                      <span className="font-medium">{challenge.progress}/{challenge.target}</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                )}

                {/* Participants Preview */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center -space-x-2">
                    {challenge.participants.slice(0, 4).map((participant) => (
                      <Avatar key={participant.id} className={cn(
                        "w-7 h-7 border-2 border-background",
                        participant.isYou && "ring-2 ring-primary"
                      )}>
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback className="text-[10px]">
                          {participant.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {challenge.participants.length > 4 && (
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
                        +{challenge.participants.length - 4}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-yellow-500">
                      <Zap className="h-3.5 w-3.5" />
                      +{challenge.xpReward}
                    </span>
                    <span className="flex items-center gap-1 text-amber-500">
                      <Star className="h-3.5 w-3.5" />
                      +{challenge.coinReward}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t bg-background/50"
                  >
                    <div className="p-4 space-y-3">
                      <h5 className="text-xs font-medium flex items-center gap-2">
                        <Trophy className="h-3.5 w-3.5 text-amber-500" />
                        Placar
                      </h5>

                      <div className="space-y-2">
                        {challenge.participants
                          .sort((a, b) => b.score - a.score)
                          .map((participant, idx) => (
                            <div 
                              key={participant.id}
                              className={cn(
                                "flex items-center justify-between p-2 rounded-lg",
                                participant.isYou && "bg-primary/10"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                                  idx === 0 ? "bg-yellow-500 text-white" :
                                  idx === 1 ? "bg-gray-400 text-white" :
                                  idx === 2 ? "bg-amber-600 text-white" :
                                  "bg-muted"
                                )}>
                                  {idx === 0 ? <Crown className="h-3 w-3" /> : idx + 1}
                                </span>
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={participant.avatar} />
                                  <AvatarFallback className="text-[8px]">
                                    {participant.name.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">
                                  {participant.name}
                                  {participant.isYou && (
                                    <Badge variant="secondary" className="ml-2 text-[8px]">Você</Badge>
                                  )}
                                </span>
                              </div>
                              <span className="font-bold text-sm">{participant.score}</span>
                            </div>
                          ))}
                      </div>

                      <Button className="w-full" size="sm">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Ver Detalhes do Desafio
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
});
