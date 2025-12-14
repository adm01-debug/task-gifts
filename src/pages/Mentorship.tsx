import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileDrawer } from "@/components/MobileDrawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Trophy, 
  Target, 
  CheckCircle2, 
  Clock, 
  Gift,
  Sparkles,
  GraduationCap,
  UserPlus,
  MessageCircle,
  Star,
  Zap
} from "lucide-react";
import {
  useActiveMentorship,
  useMentorshipMissions,
  useMentorshipProgress,
  useCompleteMissionStep,
  useClaimMissionReward,
  usePendingRequests,
  useAcceptMentorshipRequest,
  usePotentialMentors,
  useCreateMentorshipRequest,
} from "@/hooks/useMentorship";
import confetti from "canvas-confetti";

const difficultyColors = {
  easy: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  hard: "bg-red-500/20 text-red-400 border-red-500/30",
};

const missionTypeLabels = {
  mentor_only: "Mentor",
  apprentice_only: "Aprendiz",
  collaborative: "Dupla",
};

const missionTypeColors = {
  mentor_only: "bg-purple-500/20 text-purple-400",
  apprentice_only: "bg-blue-500/20 text-blue-400",
  collaborative: "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white",
};

export default function Mentorship() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [completingMissionId, setCompletingMissionId] = useState<string | null>(null);
  const [claimingMissionId, setClaimingMissionId] = useState<string | null>(null);
  const [requestingMentorId, setRequestingMentorId] = useState<string | null>(null);
  const [acceptingRequestId, setAcceptingRequestId] = useState<string | null>(null);
  
  const { data: activePair, isLoading: pairLoading } = useActiveMentorship();
  const { data: missions } = useMentorshipMissions();
  const { data: progress } = useMentorshipProgress(activePair?.id);
  const { data: pendingRequests } = usePendingRequests();
  const { data: potentialMentors } = usePotentialMentors();
  
  const completeMission = useCompleteMissionStep();
  const claimReward = useClaimMissionReward();
  const acceptRequest = useAcceptMentorshipRequest();
  const createRequest = useCreateMentorshipRequest();

  const isMentor = activePair?.mentor_id === user?.id;
  const partner = isMentor ? activePair?.apprentice : activePair?.mentor;

  const getMissionProgress = (missionId: string) => {
    return progress?.find((p) => p.mission_id === missionId);
  };

  const isMissionComplete = (mission: any) => {
    const prog = getMissionProgress(mission.id);
    if (!prog) return false;

    if (mission.mission_type === "collaborative") {
      return prog.completed_by_mentor && prog.completed_by_apprentice;
    } else if (mission.mission_type === "mentor_only") {
      return prog.completed_by_mentor;
    } else {
      return prog.completed_by_apprentice;
    }
  };

  const canComplete = (mission: any) => {
    const prog = getMissionProgress(mission.id);
    
    if (mission.mission_type === "mentor_only" && !isMentor) return false;
    if (mission.mission_type === "apprentice_only" && isMentor) return false;
    
    if (prog) {
      if (isMentor && prog.completed_by_mentor) return false;
      if (!isMentor && prog.completed_by_apprentice) return false;
    }
    
    return true;
  };

  const handleComplete = (missionId: string) => {
    if (!activePair) return;
    setCompletingMissionId(missionId);
    completeMission.mutate({
      pairId: activePair.id,
      missionId,
      isMentor,
    }, {
      onSettled: () => setCompletingMissionId(null),
    });
  };

  const handleClaimReward = (mission: any) => {
    const prog = getMissionProgress(mission.id);
    if (!prog || !activePair) return;

    setClaimingMissionId(mission.id);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#8b5cf6", "#3b82f6", "#10b981"],
    });

    claimReward.mutate({
      progressId: prog.id,
      xpReward: mission.xp_reward,
      coinReward: mission.coin_reward,
      pairId: activePair.id,
    }, {
      onSettled: () => setClaimingMissionId(null),
    });
  };

  const handleAcceptRequest = (requestId: string) => {
    setAcceptingRequestId(requestId);
    acceptRequest.mutate(requestId, {
      onSettled: () => setAcceptingRequestId(null),
    });
  };

  const handleRequestMentor = (mentorId: string) => {
    setRequestingMentorId(mentorId);
    createRequest.mutate({
      targetId: mentorId,
      requestType: "find_mentor",
      message: "Gostaria de ter você como meu mentor!",
    }, {
      onSettled: () => setRequestingMentorId(null),
    });
  };

  const completedCount = missions?.filter((m) => isMissionComplete(m)).length || 0;
  const totalMissions = missions?.length || 0;
  const progressPercent = totalMissions > 0 ? (completedCount / totalMissions) * 100 : 0;

  const content = (
    <div className="flex-1 overflow-auto bg-background">
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Mentoria Gamificada</h1>
            <p className="text-muted-foreground">
              Aprenda e ensine com recompensas mútuas
            </p>
          </div>
        </motion.div>

        {pairLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : activePair ? (
          <>
            {/* Active Mentorship Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-400" />
                      Mentoria Ativa
                    </CardTitle>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      {isMentor ? "Você é Mentor" : "Você é Aprendiz"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Partner Info */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-purple-500">
                        <AvatarImage src={partner?.avatar_url || undefined} />
                        <AvatarFallback className="bg-purple-500/20 text-xl">
                          {partner?.display_name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {isMentor ? "Seu Aprendiz" : "Seu Mentor"}
                        </p>
                        <p className="text-lg font-bold">{partner?.display_name || "Usuário"}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            Nível {partner?.level || 1}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {partner?.xp?.toLocaleString() || 0} XP
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-lg bg-background/50">
                        <Trophy className="h-5 w-5 mx-auto text-yellow-400 mb-1" />
                        <p className="text-xl font-bold">{activePair.total_missions_completed}</p>
                        <p className="text-xs text-muted-foreground">Missões</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-background/50">
                        <Zap className="h-5 w-5 mx-auto text-purple-400 mb-1" />
                        <p className="text-xl font-bold">{activePair.total_xp_earned}</p>
                        <p className="text-xs text-muted-foreground">XP Ganho</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progresso da Mentoria</span>
                      <span className="text-purple-400">{completedCount}/{totalMissions}</span>
                    </div>
                    <Progress value={progressPercent} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Missions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  Missões da Mentoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {missions?.map((mission, index) => {
                      const prog = getMissionProgress(mission.id);
                      const isComplete = isMissionComplete(mission);
                      const canAct = canComplete(mission);
                      const canClaim = isComplete && prog && !prog.rewards_claimed;

                      return (
                        <motion.div
                          key={mission.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-4 rounded-lg border ${
                            isComplete
                              ? "border-green-500/30 bg-green-500/5"
                              : "border-border bg-card"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{mission.icon}</span>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-semibold">{mission.title}</h4>
                                  <Badge className={missionTypeColors[mission.mission_type]}>
                                    {missionTypeLabels[mission.mission_type]}
                                  </Badge>
                                  <Badge className={difficultyColors[mission.difficulty]}>
                                    {mission.difficulty}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {mission.description}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                  <span className="text-purple-400">+{mission.xp_reward} XP</span>
                                  <span className="text-yellow-400">+{mission.coin_reward} 🪙</span>
                                </div>

                                {/* Progress indicators for collaborative */}
                                {mission.mission_type === "collaborative" && prog && (
                                  <div className="flex items-center gap-4 mt-2 text-xs">
                                    <span className={prog.completed_by_mentor ? "text-green-400" : "text-muted-foreground"}>
                                      {prog.completed_by_mentor ? "✓" : "○"} Mentor
                                    </span>
                                    <span className={prog.completed_by_apprentice ? "text-green-400" : "text-muted-foreground"}>
                                      {prog.completed_by_apprentice ? "✓" : "○"} Aprendiz
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              {canClaim ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleClaimReward(mission)}
                                  disabled={claimingMissionId === mission.id}
                                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                                >
                                  <Gift className="h-4 w-4 mr-1" />
                                  {claimingMissionId === mission.id ? "..." : "Resgatar"}
                                </Button>
                              ) : isComplete ? (
                                <Badge className="bg-green-500/20 text-green-400">
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Completa
                                </Badge>
                              ) : canAct ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleComplete(mission.id)}
                                  disabled={completingMissionId === mission.id}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  {completingMissionId === mission.id ? "..." : "Concluir"}
                                </Button>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground">
                                  <Clock className="h-4 w-4 mr-1" />
                                  Aguardando
                                </Badge>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* No Active Mentorship */
          <Tabs defaultValue="find" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="find">Encontrar Mentor</TabsTrigger>
              <TabsTrigger value="requests">
                Solicitações
                {pendingRequests && pendingRequests.length > 0 && (
                  <Badge className="ml-2 bg-red-500">{pendingRequests.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="find">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-purple-400" />
                    Mentores Disponíveis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {potentialMentors && potentialMentors.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {potentialMentors.map((mentor) => (
                        <motion.div
                          key={mentor.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-lg border border-border bg-card hover:border-purple-500/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={mentor.avatar_url || undefined} />
                              <AvatarFallback className="bg-purple-500/20">
                                {mentor.display_name?.[0] || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold">{mentor.display_name}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  <Star className="h-3 w-3 mr-1 text-yellow-400" />
                                  Nível {mentor.level}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {mentor.xp?.toLocaleString()} XP
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleRequestMentor(mentor.id)}
                              disabled={requestingMentorId === mentor.id}
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              {requestingMentorId === mentor.id ? "..." : "Solicitar"}
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum mentor disponível no momento</p>
                      <p className="text-sm">Continue evoluindo para se tornar um mentor!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-blue-400" />
                    Solicitações Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingRequests && pendingRequests.length > 0 ? (
                    <div className="space-y-4">
                      {pendingRequests.map((request) => (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 rounded-lg border border-border bg-card"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={request.requester?.avatar_url || undefined} />
                                <AvatarFallback>
                                  {request.requester?.display_name?.[0] || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold">
                                  {request.requester?.display_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {request.request_type === "find_mentor"
                                    ? "Quer você como mentor"
                                    : "Quer ser seu mentor"}
                                </p>
                                {request.message && (
                                  <p className="text-sm mt-1 italic">"{request.message}"</p>
                                )}
                              </div>
                            </div>
                            <Button
                              onClick={() => handleAcceptRequest(request.id)}
                              disabled={acceptingRequestId === request.id}
                              className="bg-gradient-to-r from-purple-500 to-blue-500"
                            >
                              {acceptingRequestId === request.id ? "Aceitando..." : "Aceitar"}
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma solicitação pendente</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen">
        <MobileDrawer open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)} />
        {content}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      {content}
    </div>
  );
}
