import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckSquare, Plus, Flame, Calendar, TrendingUp, 
  Star, Coffee, Book, Dumbbell, Brain, Heart
} from "lucide-react";

interface Habit {
  id: string;
  name: string;
  icon: typeof CheckSquare;
  color: string;
  streak: number;
  completedToday: boolean;
  weekProgress: boolean[];
  xpReward: number;
}

const mockHabits: Habit[] = [
  {
    id: "1",
    name: "Meditação Matinal",
    icon: Brain,
    color: "text-purple-500",
    streak: 12,
    completedToday: true,
    weekProgress: [true, true, true, true, true, false, false],
    xpReward: 15
  },
  {
    id: "2",
    name: "Exercício Físico",
    icon: Dumbbell,
    color: "text-red-500",
    streak: 5,
    completedToday: false,
    weekProgress: [true, false, true, true, true, false, false],
    xpReward: 25
  },
  {
    id: "3",
    name: "Leitura 30min",
    icon: Book,
    color: "text-blue-500",
    streak: 8,
    completedToday: true,
    weekProgress: [true, true, true, true, true, true, false],
    xpReward: 20
  },
  {
    id: "4",
    name: "Sem Café após 14h",
    icon: Coffee,
    color: "text-amber-500",
    streak: 3,
    completedToday: false,
    weekProgress: [true, true, true, false, false, false, false],
    xpReward: 10
  }
];

const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function HabitTracker() {
  const [habits, setHabits] = useState(mockHabits);

  const toggleHabit = (habitId: string) => {
    setHabits(prev => prev.map(habit => 
      habit.id === habitId 
        ? { ...habit, completedToday: !habit.completedToday }
        : habit
    ));
  };

  const completedCount = habits.filter(h => h.completedToday).length;
  const totalProgress = (completedCount / habits.length) * 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <CheckSquare className="h-5 w-5 text-primary" />
            Hábitos Diários
          </span>
          <Badge variant="secondary">
            {completedCount}/{habits.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Daily Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso de Hoje</span>
            <span className="font-medium">{Math.round(totalProgress)}%</span>
          </div>
          <Progress value={totalProgress} className="h-2" />
        </div>

        {/* Week Overview */}
        <div className="flex justify-between px-2 py-2 bg-muted/50 rounded-lg">
          {weekDays.map((day, index) => {
            const isToday = index === 4; // Friday as example
            const allComplete = habits.every(h => h.weekProgress[index]);
            const someComplete = habits.some(h => h.weekProgress[index]);
            
            return (
              <div 
                key={day} 
                className={`
                  flex flex-col items-center gap-1 px-2 py-1 rounded
                  ${isToday ? "bg-primary/10" : ""}
                `}
              >
                <span className={`text-xs ${isToday ? "font-bold text-primary" : "text-muted-foreground"}`}>
                  {day}
                </span>
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs
                  ${allComplete 
                    ? "bg-primary text-primary-foreground" 
                    : someComplete 
                      ? "bg-primary/30 text-primary" 
                      : "bg-muted text-muted-foreground"
                  }
                `}>
                  {allComplete ? "✓" : someComplete ? "◐" : "○"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Habits List */}
        <div className="space-y-2">
          {habits.map((habit, index) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
                ${habit.completedToday 
                  ? "bg-primary/5 border-primary/30" 
                  : "bg-card hover:bg-accent/50"
                }
              `}
              onClick={() => toggleHabit(habit.id)}
            >
              <motion.div
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${habit.completedToday ? "bg-primary" : "bg-muted"}
                `}
                whileTap={{ scale: 0.9 }}
                animate={habit.completedToday ? { scale: [1, 1.1, 1] } : {}}
              >
                <habit.icon className={`h-5 w-5 ${habit.completedToday ? "text-primary-foreground" : habit.color}`} />
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${habit.completedToday ? "line-through text-muted-foreground" : ""}`}>
                    {habit.name}
                  </span>
                  {habit.streak >= 7 && (
                    <Badge variant="secondary" className="text-xs">
                      <Flame className="h-3 w-3 mr-1 text-orange-500" />
                      {habit.streak}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    +{habit.xpReward} XP
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {habit.streak} dias
                  </span>
                </div>
              </div>

              <motion.div
                className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center
                  ${habit.completedToday 
                    ? "border-primary bg-primary text-primary-foreground" 
                    : "border-muted-foreground/30"
                  }
                `}
                animate={habit.completedToday ? { scale: [0.8, 1.2, 1] } : {}}
              >
                {habit.completedToday && "✓"}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Add Habit Button */}
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Hábito
        </Button>

        {/* Motivation */}
        {completedCount === habits.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 text-center"
          >
            <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="font-medium">Parabéns! Todos os hábitos concluídos! 🎉</p>
            <p className="text-sm text-muted-foreground">+50 XP de bônus diário</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
