import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Target, 
  Plus, 
  CheckCircle2, 
  Circle,
  Calendar,
  Flame,
  Trophy,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Zap,
  Clock
} from "lucide-react";

interface Goal {
  id: string;
  title: string;
  description?: string;
  category: "personal" | "professional" | "health" | "learning";
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: Date;
  milestones: {
    id: string;
    title: string;
    completed: boolean;
    xpReward: number;
  }[];
  xpReward: number;
  streak: number;
}

const categoryConfig = {
  personal: { color: "bg-purple-500", label: "Pessoal", icon: "💜" },
  professional: { color: "bg-blue-500", label: "Profissional", icon: "💼" },
  health: { color: "bg-green-500", label: "Saúde", icon: "💪" },
  learning: { color: "bg-amber-500", label: "Aprendizado", icon: "📚" }
};

const mockGoals: Goal[] = [
  {
    id: "1",
    title: "Completar 10 treinamentos",
    description: "Desenvolver novas habilidades",
    category: "learning",
    targetValue: 10,
    currentValue: 7,
    unit: "treinamentos",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    milestones: [
      { id: "m1", title: "Primeiro treinamento", completed: true, xpReward: 50 },
      { id: "m2", title: "5 treinamentos", completed: true, xpReward: 100 },
      { id: "m3", title: "Meta final", completed: false, xpReward: 200 }
    ],
    xpReward: 500,
    streak: 5
  },
  {
    id: "2",
    title: "Enviar 50 kudos",
    description: "Reconhecer colegas de trabalho",
    category: "professional",
    targetValue: 50,
    currentValue: 32,
    unit: "kudos",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
    milestones: [
      { id: "m1", title: "10 kudos", completed: true, xpReward: 30 },
      { id: "m2", title: "25 kudos", completed: true, xpReward: 75 },
      { id: "m3", title: "Meta final", completed: false, xpReward: 150 }
    ],
    xpReward: 300,
    streak: 12
  },
  {
    id: "3",
    title: "100 dias de pontualidade",
    description: "Manter consistência no check-in",
    category: "personal",
    targetValue: 100,
    currentValue: 45,
    unit: "dias",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
    milestones: [
      { id: "m1", title: "7 dias", completed: true, xpReward: 25 },
      { id: "m2", title: "30 dias", completed: true, xpReward: 100 },
      { id: "m3", title: "Meta final", completed: false, xpReward: 500 }
    ],
    xpReward: 750,
    streak: 45
  }
];

export function GoalTracker() {
  const [goals] = useState<Goal[]>(mockGoals);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [showAddGoal, setShowAddGoal] = useState(false);

  const getDaysRemaining = (deadline: Date) => {
    const days = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-primary";
    if (progress >= 25) return "bg-amber-500";
    return "bg-red-500";
  };

  const totalProgress = Math.round(
    goals.reduce((sum, g) => sum + (g.currentValue / g.targetValue) * 100, 0) / goals.length
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Metas & Objetivos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Acompanhe seu progresso
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => setShowAddGoal(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nova Meta
          </Button>
        </div>

        {/* Overall Progress */}
        <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso Geral</span>
            <span className="text-2xl font-bold text-primary">{totalProgress}%</span>
          </div>
          <Progress value={totalProgress} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{goals.filter(g => g.currentValue >= g.targetValue).length} metas completas</span>
            <span>{goals.length} metas totais</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <AnimatePresence>
          {goals.map((goal, index) => {
            const progress = (goal.currentValue / goal.targetValue) * 100;
            const daysRemaining = getDaysRemaining(goal.deadline);
            const isExpanded = expandedGoal === goal.id;
            const config = categoryConfig[goal.category];

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg overflow-hidden"
              >
                {/* Goal Header */}
                <button
                  onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                  className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center text-xl`}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{goal.title}</h4>
                        {goal.streak > 0 && (
                          <Badge variant="outline" className="shrink-0 border-orange-500 text-orange-500">
                            <Flame className="h-3 w-3 mr-1" />
                            {goal.streak}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {goal.currentValue}/{goal.targetValue} {goal.unit}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {daysRemaining} dias
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <Progress 
                          value={progress} 
                          className="h-2 flex-1"
                        />
                        <span className="text-sm font-medium w-12 text-right">
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </div>

                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </motion.div>
                  </div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t bg-muted/30"
                    >
                      <div className="p-4 space-y-4">
                        {goal.description && (
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        )}

                        {/* Milestones */}
                        <div>
                          <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-amber-500" />
                            Marcos
                          </h5>
                          <div className="space-y-2">
                            {goal.milestones.map((milestone) => (
                              <div 
                                key={milestone.id}
                                className={`flex items-center justify-between p-2 rounded-lg ${
                                  milestone.completed ? "bg-green-500/10" : "bg-muted/50"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {milestone.completed ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span className={`text-sm ${milestone.completed ? "line-through text-muted-foreground" : ""}`}>
                                    {milestone.title}
                                  </span>
                                </div>
                                <Badge variant={milestone.completed ? "secondary" : "outline"} className="text-xs">
                                  <Zap className="h-3 w-3 mr-1" />
                                  +{milestone.xpReward} XP
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 rounded-lg bg-background text-center">
                            <div className="text-lg font-bold text-primary">
                              {goal.currentValue}
                            </div>
                            <div className="text-xs text-muted-foreground">Atual</div>
                          </div>
                          <div className="p-3 rounded-lg bg-background text-center">
                            <div className="text-lg font-bold text-amber-500">
                              {goal.targetValue}
                            </div>
                            <div className="text-xs text-muted-foreground">Meta</div>
                          </div>
                          <div className="p-3 rounded-lg bg-background text-center">
                            <div className="text-lg font-bold text-green-500">
                              +{goal.xpReward}
                            </div>
                            <div className="text-xs text-muted-foreground">XP Total</div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit2 className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Add Goal Modal Placeholder */}
        {showAddGoal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 border-2 border-dashed rounded-lg"
          >
            <div className="text-center">
              <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                Defina uma nova meta para acompanhar
              </p>
              <div className="flex gap-2 justify-center">
                <Button size="sm" onClick={() => setShowAddGoal(false)}>
                  Criar Meta
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAddGoal(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
