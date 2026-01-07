import { memo, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, CheckCircle2, Clock, Play, 
  Award, Star, ChevronRight, Lock, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  duration: number; // minutes
  type: "video" | "reading" | "quiz" | "practice";
  isCompleted: boolean;
  isLocked: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  xpReward: number;
  badge?: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  totalHours: number;
  modules: Module[];
  progress: number;
  enrolledAt?: Date;
  completedAt?: Date;
}

const mockPath: LearningPath = {
  id: "leadership",
  title: "Liderança Moderna",
  description: "Desenvolva habilidades essenciais para liderar equipes de alta performance",
  category: "Gestão",
  difficulty: "intermediate",
  totalHours: 12,
  progress: 45,
  enrolledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  modules: [
    {
      id: "m1",
      title: "Fundamentos de Liderança",
      description: "Conceitos básicos e estilos de liderança",
      xpReward: 200,
      badge: "Líder Iniciante",
      lessons: [
        { id: "l1", title: "O que é liderança?", duration: 15, type: "video", isCompleted: true, isLocked: false },
        { id: "l2", title: "Estilos de liderança", duration: 20, type: "reading", isCompleted: true, isLocked: false },
        { id: "l3", title: "Quiz: Fundamentos", duration: 10, type: "quiz", isCompleted: true, isLocked: false }
      ]
    },
    {
      id: "m2",
      title: "Comunicação Efetiva",
      description: "Técnicas de comunicação para líderes",
      xpReward: 250,
      lessons: [
        { id: "l4", title: "Escuta ativa", duration: 20, type: "video", isCompleted: true, isLocked: false },
        { id: "l5", title: "Feedback construtivo", duration: 25, type: "video", isCompleted: false, isLocked: false },
        { id: "l6", title: "Prática: Role Play", duration: 30, type: "practice", isCompleted: false, isLocked: false }
      ]
    },
    {
      id: "m3",
      title: "Gestão de Conflitos",
      description: "Como mediar e resolver conflitos",
      xpReward: 300,
      badge: "Mediador",
      lessons: [
        { id: "l7", title: "Tipos de conflitos", duration: 15, type: "reading", isCompleted: false, isLocked: true },
        { id: "l8", title: "Técnicas de mediação", duration: 30, type: "video", isCompleted: false, isLocked: true },
        { id: "l9", title: "Estudo de caso", duration: 20, type: "practice", isCompleted: false, isLocked: true }
      ]
    }
  ]
};

const difficultyConfig = {
  beginner: { label: "Iniciante", color: "text-green-500 bg-green-500/10" },
  intermediate: { label: "Intermediário", color: "text-yellow-500 bg-yellow-500/10" },
  advanced: { label: "Avançado", color: "text-red-500 bg-red-500/10" }
};

const lessonTypeConfig = {
  video: { icon: Play, color: "text-blue-500" },
  reading: { icon: BookOpen, color: "text-purple-500" },
  quiz: { icon: Star, color: "text-yellow-500" },
  practice: { icon: Sparkles, color: "text-green-500" }
};

const ModuleCard = memo(function ModuleCard({ 
  module,
  isExpanded,
  onToggle,
  onStartLesson
}: { 
  module: Module;
  isExpanded: boolean;
  onToggle: () => void;
  onStartLesson: (lessonId: string) => void;
}) {
  const completedLessons = module.lessons.filter(l => l.isCompleted).length;
  const progress = (completedLessons / module.lessons.length) * 100;
  const isCompleted = progress === 100;

  return (
    <motion.div
      layout
      className={cn(
        "rounded-lg border overflow-hidden transition-all",
        isCompleted && "border-green-500/30 bg-green-500/5"
      )}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            isCompleted ? "bg-green-500/20" : "bg-muted"
          )}>
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <BookOpen className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="text-left">
            <h4 className="font-medium text-sm">{module.title}</h4>
            <p className="text-xs text-muted-foreground">
              {completedLessons}/{module.lessons.length} lições • {module.xpReward} XP
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {module.badge && isCompleted && (
            <Badge variant="secondary" className="text-xs">
              <Award className="w-3 h-3 mr-1" />
              {module.badge}
            </Badge>
          )}
          <ChevronRight className={cn(
            "w-4 h-4 transition-transform",
            isExpanded && "rotate-90"
          )} />
        </div>
      </button>

      {/* Progress Bar */}
      <div className="px-4">
        <Progress value={progress} className="h-1" />
      </div>

      {/* Lessons */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="p-4 pt-3 space-y-2">
          {module.lessons.map((lesson, idx) => {
            const TypeIcon = lessonTypeConfig[lesson.type].icon;
            return (
              <motion.button
                key={lesson.id}
                onClick={() => !lesson.isLocked && onStartLesson(lesson.id)}
                disabled={lesson.isLocked}
                className={cn(
                  "w-full p-3 rounded-lg flex items-center gap-3 transition-all text-left",
                  lesson.isCompleted && "bg-green-500/10",
                  lesson.isLocked && "opacity-50 cursor-not-allowed",
                  !lesson.isCompleted && !lesson.isLocked && "bg-muted/50 hover:bg-muted"
                )}
                whileHover={!lesson.isLocked ? { scale: 1.01 } : {}}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  lesson.isCompleted ? "bg-green-500/20" : "bg-muted"
                )}>
                  {lesson.isLocked ? (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  ) : lesson.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <TypeIcon className={cn("w-4 h-4", lessonTypeConfig[lesson.type].color)} />
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="text-sm font-medium">{lesson.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {lesson.duration} min
                    <span className="capitalize">• {lesson.type}</span>
                  </div>
                </div>

                {!lesson.isLocked && !lesson.isCompleted && (
                  <Button size="sm" variant="ghost" className="h-8">
                    <Play className="w-3 h-3 mr-1" />
                    Iniciar
                  </Button>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
});

export const LearningPathProgress = memo(function LearningPathProgress({ 
  className 
}: { 
  className?: string;
}) {
  const [path] = useState(mockPath);
  const [expandedModule, setExpandedModule] = useState<string | null>("m2");

  const stats = useMemo(() => {
    const totalLessons = path.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completedLessons = path.modules.reduce(
      (sum, m) => sum + m.lessons.filter(l => l.isCompleted).length, 
      0
    );
    const totalXp = path.modules.reduce((sum, m) => sum + m.xpReward, 0);
    return { totalLessons, completedLessons, totalXp };
  }, [path]);

  const handleStartLesson = (lessonId: string) => {
    // Navigate to lesson or open lesson modal
    const lesson = path.modules
      .flatMap(m => m.lessons)
      .find(l => l.id === lessonId);
    if (lesson) {
      // Lesson start handled by parent component
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <CardTitle className="text-lg">{path.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">{path.category}</Badge>
                <Badge className={cn("text-xs", difficultyConfig[path.difficulty].color)}>
                  {difficultyConfig[path.difficulty].label}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{path.progress}%</p>
            <p className="text-xs text-muted-foreground">Progresso</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-2">{path.description}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-2 rounded-lg bg-muted text-center">
            <p className="font-bold text-primary">{stats.completedLessons}/{stats.totalLessons}</p>
            <p className="text-[10px] text-muted-foreground">Lições</p>
          </div>
          <div className="p-2 rounded-lg bg-muted text-center">
            <p className="font-bold text-purple-500">{path.totalHours}h</p>
            <p className="text-[10px] text-muted-foreground">Duração</p>
          </div>
          <div className="p-2 rounded-lg bg-muted text-center">
            <p className="font-bold text-yellow-500">{stats.totalXp}</p>
            <p className="text-[10px] text-muted-foreground">XP Total</p>
          </div>
        </div>

        <Progress value={path.progress} className="h-2 mt-3" />
      </CardHeader>

      <CardContent className="space-y-3">
        {path.modules.map(module => (
          <ModuleCard
            key={module.id}
            module={module}
            isExpanded={expandedModule === module.id}
            onToggle={() => setExpandedModule(
              expandedModule === module.id ? null : module.id
            )}
            onStartLesson={handleStartLesson}
          />
        ))}
      </CardContent>
    </Card>
  );
});

export default LearningPathProgress;
