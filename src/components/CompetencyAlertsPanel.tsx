import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw, 
  Users, 
  Brain,
  ChevronDown,
  ChevronUp,
  Target,
  Lightbulb,
  GraduationCap
} from "lucide-react";
import { useCompetencyAlerts } from "@/hooks/useCompetencyAlerts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TeamMemberCompetency {
  userId: string;
  displayName: string;
  competencies: Array<{
    area: string;
    value: number;
    icon: string;
  }>;
  avgCompetency: number;
  gaps: string[];
}

export function CompetencyAlertsPanel() {
  const { triggerBatchAnalysis, isBatchAnalyzing } = useCompetencyAlerts();
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  // Fetch team members with their competencies
  const { data: teamCompetencies, isLoading, refetch } = useQuery({
    queryKey: ['team-competencies-alerts'],
    queryFn: async () => {
      // Get team members
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select(`
          user_id,
          profiles!inner(id, display_name, email)
        `);

      if (!teamMembers?.length) return [];

      const results: TeamMemberCompetency[] = [];

      for (const member of teamMembers) {
        const userId = member.user_id;
        const profile = member.profiles as { display_name?: string; email?: string; xp?: number; level?: number; quests_completed?: number; streak?: number } | null;

        // Calculate competencies (simplified version - full calc in edge function)
        const { data: moduleProgress } = await supabase
          .from('module_progress')
          .select('completed_at, score')
          .eq('user_id', userId);

        const { data: questAssignments } = await supabase
          .from('quest_assignments')
          .select('completed_at')
          .eq('user_id', userId);

        const { data: kudosReceived } = await supabase
          .from('kudos')
          .select('id')
          .eq('to_user_id', userId);

        const { data: attendanceStreak } = await supabase
          .from('attendance_streaks')
          .select('current_streak, total_punctual_days')
          .eq('user_id', userId)
          .maybeSingle();

        const completedModules = moduleProgress?.filter(m => m.completed_at) || [];
        const completedQuests = questAssignments?.filter(q => q.completed_at) || [];

        const competencies = [
          { 
            area: "Conhecimento Técnico", 
            value: Math.min(100, completedModules.length * 8 + 20), 
            icon: "🎓" 
          },
          { 
            area: "Resolução de Problemas", 
            value: Math.min(100, completedQuests.length * 10 + 15), 
            icon: "🧩" 
          },
          { 
            area: "Colaboração", 
            value: Math.min(100, (kudosReceived?.length || 0) * 10 + 10), 
            icon: "🤝" 
          },
          { 
            area: "Disciplina", 
            value: Math.min(100, (attendanceStreak?.current_streak || 0) * 8 + (attendanceStreak?.total_punctual_days || 0) * 2), 
            icon: "⏰" 
          },
          { 
            area: "Liderança", 
            value: Math.min(100, completedQuests.length * 5 + 10), 
            icon: "👑" 
          },
          { 
            area: "Comunicação", 
            value: Math.min(100, (kudosReceived?.length || 0) * 8 + 15), 
            icon: "💬" 
          },
        ];

        const avgCompetency = Math.round(competencies.reduce((acc, c) => acc + c.value, 0) / competencies.length);
        const gaps = competencies.filter(c => c.value < 40).map(c => c.area);

        results.push({
          userId,
          displayName: profile?.display_name || profile?.email?.split('@')[0] || 'Usuário',
          competencies,
          avgCompetency,
          gaps
        });
      }

      // Sort by gaps count (most gaps first)
      return results.sort((a, b) => b.gaps.length - a.gaps.length);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const toggleExpand = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSendAlerts = async () => {
    await triggerBatchAnalysis();
    refetch();
  };

  const usersWithGaps = teamCompetencies?.filter(u => u.gaps.length > 0) || [];
  const criticalCount = teamCompetencies?.filter(u => u.gaps.length >= 3).length || 0;
  const moderateCount = usersWithGaps.length - criticalCount;

  const getGapColor = (gapCount: number) => {
    if (gapCount >= 3) return "text-red-500";
    if (gapCount >= 1) return "text-amber-500";
    return "text-emerald-500";
  };

  const getCompetencyColor = (value: number) => {
    if (value >= 70) return "bg-emerald-500";
    if (value >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-primary" />
            Alertas de Competência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-primary" />
            Alertas de Competência
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSendAlerts}
                  disabled={isBatchAnalyzing}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isBatchAnalyzing ? 'animate-spin' : ''}`} />
                  Enviar Alertas
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Analisa competências e envia notificações para usuários com gaps</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-muted/50 text-center"
          >
            <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{teamCompetencies?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Total Analisados</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-3 rounded-lg bg-red-500/10 text-center border border-red-500/20"
          >
            <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-red-500" />
            <div className="text-2xl font-bold text-red-500">{criticalCount}</div>
            <div className="text-xs text-muted-foreground">Gaps Críticos</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-3 rounded-lg bg-amber-500/10 text-center border border-amber-500/20"
          >
            <Target className="w-5 h-5 mx-auto mb-1 text-amber-500" />
            <div className="text-2xl font-bold text-amber-500">{moderateCount}</div>
            <div className="text-xs text-muted-foreground">Gaps Moderados</div>
          </motion.div>
        </div>

        {/* Users with Gaps */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {usersWithGaps.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground"
              >
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                <p className="font-medium text-emerald-600">Nenhum gap crítico identificado!</p>
                <p className="text-sm">A equipe está com boas competências.</p>
              </motion.div>
            ) : (
              usersWithGaps.map((user, index) => (
                <motion.div
                  key={user.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-lg border border-border/50 overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpand(user.userId)}
                    className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center font-bold text-primary`}>
                        {user.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{user.displayName}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Média: {user.avgCompetency}%</span>
                          <span className={getGapColor(user.gaps.length)}>
                            {user.gaps.length} gap{user.gaps.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.gaps.length >= 3 && (
                        <Badge variant="destructive" className="text-xs">Crítico</Badge>
                      )}
                      {expandedUsers.has(user.userId) ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedUsers.has(user.userId) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 pt-0 space-y-3 border-t border-border/50 bg-muted/20">
                          {/* Competencies Grid */}
                          <div className="grid grid-cols-2 gap-2">
                            {user.competencies.map((comp) => (
                              <div key={comp.area} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="flex items-center gap-1">
                                    <span>{comp.icon}</span>
                                    <span className="truncate">{comp.area}</span>
                                  </span>
                                  <span className={comp.value < 40 ? 'text-red-500 font-medium' : ''}>
                                    {comp.value}%
                                  </span>
                                </div>
                                <Progress 
                                  value={comp.value} 
                                  className={`h-1.5 [&>div]:${getCompetencyColor(comp.value)}`}
                                />
                              </div>
                            ))}
                          </div>

                          {/* Recommendations */}
                          {user.gaps.length > 0 && (
                            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                              <div className="flex items-center gap-2 text-xs font-medium text-amber-600 mb-1">
                                <Lightbulb className="w-3 h-3" />
                                Recomendações
                              </div>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                {user.gaps.slice(0, 2).map((gap) => (
                                  <li key={gap} className="flex items-start gap-1">
                                    <GraduationCap className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span>Desenvolver <strong>{gap}</strong> através de trilhas específicas</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
