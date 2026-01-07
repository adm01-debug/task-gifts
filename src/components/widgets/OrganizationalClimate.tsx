import { memo, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Smile, Frown, Meh, TrendingUp, TrendingDown,
  Heart, Users, Lightbulb, Shield, Target,
  ChevronRight, BarChart3, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClimatePillar {
  id: string;
  name: string;
  score: number;
  previousScore: number;
  icon: React.ElementType;
  color: string;
  description: string;
}

interface MoodEntry {
  date: string;
  mood: number;
  note?: string;
}

const mockPillars: ClimatePillar[] = [
  { 
    id: "engagement", 
    name: "Engajamento", 
    score: 78, 
    previousScore: 72, 
    icon: Heart, 
    color: "text-red-500",
    description: "Nível de conexão e comprometimento"
  },
  { 
    id: "collaboration", 
    name: "Colaboração", 
    score: 85, 
    previousScore: 83, 
    icon: Users, 
    color: "text-blue-500",
    description: "Trabalho em equipe e cooperação"
  },
  { 
    id: "innovation", 
    name: "Inovação", 
    score: 72, 
    previousScore: 75, 
    icon: Lightbulb, 
    color: "text-yellow-500",
    description: "Criatividade e novas ideias"
  },
  { 
    id: "wellbeing", 
    name: "Bem-estar", 
    score: 68, 
    previousScore: 65, 
    icon: Shield, 
    color: "text-green-500",
    description: "Equilíbrio e qualidade de vida"
  },
  { 
    id: "growth", 
    name: "Crescimento", 
    score: 81, 
    previousScore: 78, 
    icon: Target, 
    color: "text-purple-500",
    description: "Desenvolvimento e aprendizado"
  }
];

const mockMoodHistory: MoodEntry[] = [
  { date: "2024-01-15", mood: 4 },
  { date: "2024-01-14", mood: 5 },
  { date: "2024-01-13", mood: 3 },
  { date: "2024-01-12", mood: 4 },
  { date: "2024-01-11", mood: 4 },
  { date: "2024-01-10", mood: 5 },
  { date: "2024-01-09", mood: 2 },
];

const moodEmojis = [
  { value: 1, icon: Frown, label: "Muito ruim", color: "text-red-500" },
  { value: 2, icon: Frown, label: "Ruim", color: "text-orange-500" },
  { value: 3, icon: Meh, label: "Neutro", color: "text-yellow-500" },
  { value: 4, icon: Smile, label: "Bom", color: "text-lime-500" },
  { value: 5, icon: Smile, label: "Ótimo", color: "text-green-500" },
];

const PillarCard = memo(function PillarCard({ pillar }: { pillar: ClimatePillar }) {
  const Icon = pillar.icon;
  const trend = pillar.score - pillar.previousScore;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-3 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg bg-muted")}>
            <Icon className={cn("w-4 h-4", pillar.color)} />
          </div>
          <div>
            <h4 className="font-medium text-sm">{pillar.name}</h4>
            <p className="text-[10px] text-muted-foreground">{pillar.description}</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="font-bold text-lg">{pillar.score}%</p>
          <div className={cn(
            "flex items-center gap-0.5 text-xs",
            trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-muted-foreground"
          )}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : null}
            {trend > 0 ? `+${trend}` : trend}%
          </div>
        </div>
      </div>
      
      <Progress 
        value={pillar.score} 
        className="h-2"
      />
    </motion.div>
  );
});

export const OrganizationalClimate = memo(function OrganizationalClimate({ 
  className 
}: { 
  className?: string;
}) {
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const [showMoodPicker, setShowMoodPicker] = useState(true);

  const overallScore = useMemo(() => {
    const avg = mockPillars.reduce((sum, p) => sum + p.score, 0) / mockPillars.length;
    return Math.round(avg);
  }, []);

  const overallTrend = useMemo(() => {
    const currentAvg = mockPillars.reduce((sum, p) => sum + p.score, 0) / mockPillars.length;
    const previousAvg = mockPillars.reduce((sum, p) => sum + p.previousScore, 0) / mockPillars.length;
    return Math.round(currentAvg - previousAvg);
  }, []);

  const avgMood = useMemo(() => {
    const sum = mockMoodHistory.reduce((acc, m) => acc + m.mood, 0);
    return (sum / mockMoodHistory.length).toFixed(1);
  }, []);

  const handleMoodSelect = (mood: number) => {
    setTodayMood(mood);
    setShowMoodPicker(false);
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-teal-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Clima Organizacional</CardTitle>
              <p className="text-xs text-muted-foreground">
                Índice geral: {overallScore}%
              </p>
            </div>
          </div>

          <Badge 
            variant="outline" 
            className={cn(
              overallTrend > 0 ? "text-green-500 border-green-500/30" : 
              overallTrend < 0 ? "text-red-500 border-red-500/30" : ""
            )}
          >
            {overallTrend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : 
             overallTrend < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
            {overallTrend > 0 ? `+${overallTrend}` : overallTrend}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="pillars">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="pillars" className="text-xs">
              <BarChart3 className="w-3 h-3 mr-1" />
              Pilares
            </TabsTrigger>
            <TabsTrigger value="mood" className="text-xs">
              <Smile className="w-3 h-3 mr-1" />
              Seu Humor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pillars" className="space-y-3 mt-0">
            {mockPillars.map(pillar => (
              <PillarCard key={pillar.id} pillar={pillar} />
            ))}
            
            <Button variant="outline" className="w-full text-xs" size="sm">
              Ver Análise Completa
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </TabsContent>

          <TabsContent value="mood" className="mt-0">
            {/* Daily Mood Picker */}
            {showMoodPicker ? (
              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border mb-4">
                <h4 className="font-medium text-center mb-3">
                  Como você está se sentindo hoje?
                </h4>
                <div className="flex justify-center gap-2">
                  {moodEmojis.map(mood => {
                    const Icon = mood.icon;
                    return (
                      <motion.button
                        key={mood.value}
                        onClick={() => handleMoodSelect(mood.value)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                          "hover:bg-muted",
                          todayMood === mood.value && "ring-2 ring-primary"
                        )}
                        title={mood.label}
                      >
                        <Icon className={cn("w-8 h-8", mood.color)} />
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 mb-4 text-center"
              >
                <Sparkles className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Obrigado por compartilhar!</p>
                <p className="text-xs text-muted-foreground">+5 XP ganhos</p>
              </motion.div>
            )}

            {/* Mood History */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Histórico (7 dias)</h4>
                <Badge variant="secondary">Média: {avgMood}</Badge>
              </div>
              
              <div className="flex gap-1 justify-between">
                {mockMoodHistory.slice().reverse().map((entry, idx) => {
                  const moodConfig = moodEmojis.find(m => m.value === entry.mood);
                  const Icon = moodConfig?.icon || Meh;
                  const day = new Date(entry.date).toLocaleDateString('pt-BR', { weekday: 'short' });
                  
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                      >
                        <Icon className={cn("w-5 h-5", moodConfig?.color)} />
                      </motion.div>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="p-2 rounded-lg bg-muted text-center">
                <p className="text-lg font-bold text-green-500">
                  {mockMoodHistory.filter(m => m.mood >= 4).length}
                </p>
                <p className="text-[10px] text-muted-foreground">Dias bons</p>
              </div>
              <div className="p-2 rounded-lg bg-muted text-center">
                <p className="text-lg font-bold text-yellow-500">
                  {mockMoodHistory.filter(m => m.mood === 3).length}
                </p>
                <p className="text-[10px] text-muted-foreground">Neutros</p>
              </div>
              <div className="p-2 rounded-lg bg-muted text-center">
                <p className="text-lg font-bold text-red-500">
                  {mockMoodHistory.filter(m => m.mood <= 2).length}
                </p>
                <p className="text-[10px] text-muted-foreground">Difíceis</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

export default OrganizationalClimate;
