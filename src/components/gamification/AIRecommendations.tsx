import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Target, TrendingUp, Zap, Star, BookOpen, Users, Clock, ChevronRight, Sparkles, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Recommendation {
  id: string;
  type: "quest" | "skill" | "course" | "social";
  title: string;
  description: string;
  reason: string;
  xpReward: number;
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: string;
  matchScore: number;
}

const mockRecommendations: Recommendation[] = [
  { id: "1", type: "quest", title: "Sprint de Documentação", description: "Complete a documentação pendente", reason: "Baseado em suas habilidades de escrita", xpReward: 300, difficulty: "medium", estimatedTime: "2h", matchScore: 95 },
  { id: "2", type: "skill", title: "Liderança Avançada", description: "Desenvolva habilidades de liderança", reason: "Próximo passo na sua progressão", xpReward: 500, difficulty: "hard", estimatedTime: "4 semanas", matchScore: 88 },
  { id: "3", type: "course", title: "React Hooks Masterclass", description: "Aprenda hooks avançados", reason: "Complementa seu perfil técnico", xpReward: 750, difficulty: "medium", estimatedTime: "8h", matchScore: 92 },
  { id: "4", type: "social", title: "Mentoria de Novatos", description: "Ajude novos membros da equipe", reason: "Você tem experiência para compartilhar", xpReward: 200, difficulty: "easy", estimatedTime: "1h/semana", matchScore: 85 },
];

const typeConfig = {
  quest: { icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
  skill: { icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10" },
  course: { icon: BookOpen, color: "text-green-500", bg: "bg-green-500/10" },
  social: { icon: Users, color: "text-pink-500", bg: "bg-pink-500/10" },
};

const difficultyConfig = {
  easy: { label: "Fácil", color: "text-green-500 bg-green-500/10" },
  medium: { label: "Médio", color: "text-amber-500 bg-amber-500/10" },
  hard: { label: "Difícil", color: "text-red-500 bg-red-500/10" },
};

export const AIRecommendations = memo(function AIRecommendations() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center"
            >
              <Brain className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <span className="block">Recomendações IA</span>
              <span className="text-xs font-normal text-muted-foreground">
                Personalizadas para você
              </span>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            4 novas
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Analysis Summary */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-5 w-5 text-violet-500" />
            <span className="font-semibold">Análise do Seu Perfil</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-violet-500">87%</p>
              <p className="text-[10px] text-muted-foreground">Produtividade</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">92%</p>
              <p className="text-[10px] text-muted-foreground">Engajamento</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-500">78%</p>
              <p className="text-[10px] text-muted-foreground">Crescimento</p>
            </div>
          </div>
        </div>

        {/* Recommendations List */}
        <div className="space-y-2">
          {mockRecommendations.map((rec, index) => {
            const config = typeConfig[rec.type];
            const difficulty = difficultyConfig[rec.difficulty];
            const Icon = config.icon;
            const isExpanded = expandedId === rec.id;

            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 rounded-xl border hover:border-primary/50 transition-all cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : rec.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", config.bg)}>
                    <Icon className={cn("h-5 w-5", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{rec.title}</p>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {rec.matchScore}% match
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className={cn("text-[10px]", difficulty.color)}>
                        {difficulty.label}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />{rec.estimatedTime}
                      </span>
                      <span className="text-[10px] text-amber-500 flex items-center gap-1">
                        <Star className="h-3 w-3" />+{rec.xpReward} XP
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                    isExpanded && "rotate-90"
                  )} />
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 mt-3 border-t space-y-3">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-violet-500" />
                            <strong>Por que isso?</strong> {rec.reason}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 gap-1">
                            <Zap className="h-4 w-4" />
                            Iniciar
                          </Button>
                          <Button size="sm" variant="outline">
                            Depois
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Weekly Goals from AI */}
        <div className="p-3 rounded-xl border">
          <div className="flex items-center gap-2 mb-3">
            <Award className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold">Meta Semanal IA</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Complete 3 recomendações para ganhar bônus
          </p>
          <Progress value={33} className="h-2 mb-1" />
          <p className="text-[10px] text-muted-foreground">1/3 completadas • +500 XP bônus</p>
        </div>

        <Button variant="outline" className="w-full gap-2">
          Ver Mais Recomendações
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
});
