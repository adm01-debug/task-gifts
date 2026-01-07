import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Users, Trophy, Zap, Star, Crown, TrendingUp, Target, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TeamMember { id: string; name: string; avatar?: string; xp: number; role: string; }
interface TeamGoal { id: string; title: string; progress: number; target: number; reward: number; }

const mockMembers: TeamMember[] = [
  { id: "1", name: "Você", xp: 2500, role: "Líder" },
  { id: "2", name: "Ana S.", avatar: "/avatars/ana.jpg", xp: 2200, role: "Membro" },
  { id: "3", name: "Pedro L.", avatar: "/avatars/pedro.jpg", xp: 1800, role: "Membro" },
  { id: "4", name: "Maria F.", avatar: "/avatars/maria.jpg", xp: 1500, role: "Novato" },
];

const mockGoals: TeamGoal[] = [
  { id: "1", title: "100 Tarefas em Equipe", progress: 78, target: 100, reward: 1000 },
  { id: "2", title: "Streak Coletivo 7 dias", progress: 5, target: 7, reward: 500 },
];

export const TeamDashboard = memo(function TeamDashboard() {
  const totalXP = mockMembers.reduce((acc, m) => acc + m.xp, 0);
  const teamRank = 3;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center"><Users className="h-5 w-5 text-white" /></div>
            <div><span>Equipe Alpha</span><p className="text-xs font-normal text-muted-foreground">{mockMembers.length} membros</p></div>
          </div>
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500"><Crown className="h-3 w-3 mr-1" />#{teamRank}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Team Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-xl bg-muted/50 text-center"><Zap className="h-4 w-4 mx-auto mb-1 text-yellow-500" /><p className="text-lg font-bold">{totalXP.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">XP Total</p></div>
          <div className="p-3 rounded-xl bg-muted/50 text-center"><Trophy className="h-4 w-4 mx-auto mb-1 text-purple-500" /><p className="text-lg font-bold">12</p><p className="text-[10px] text-muted-foreground">Conquistas</p></div>
          <div className="p-3 rounded-xl bg-muted/50 text-center"><TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-500" /><p className="text-lg font-bold">+23%</p><p className="text-[10px] text-muted-foreground">Crescimento</p></div>
        </div>
        {/* Members */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">Membros</h4>
          {mockMembers.sort((a, b) => b.xp - a.xp).map((member, idx) => (
            <motion.div key={member.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} className={cn("flex items-center gap-3 p-2 rounded-lg", member.name === "Você" && "bg-primary/10")}>
              <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold", idx === 0 ? "bg-yellow-500 text-white" : "bg-muted")}>{idx + 1}</span>
              <Avatar className="w-7 h-7"><AvatarImage src={member.avatar} /><AvatarFallback className="text-[10px]">{member.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
              <div className="flex-1"><p className="text-sm font-medium">{member.name}</p><p className="text-[10px] text-muted-foreground">{member.role}</p></div>
              <Badge variant="outline" className="text-[10px]"><Zap className="h-2.5 w-2.5 mr-1" />{member.xp}</Badge>
            </motion.div>
          ))}
        </div>
        {/* Goals */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Target className="h-3.5 w-3.5" />Metas da Equipe</h4>
          {mockGoals.map(goal => (
            <div key={goal.id} className="p-3 rounded-lg bg-muted/50">
              <div className="flex justify-between text-sm mb-1"><span>{goal.title}</span><span className="font-medium">{goal.progress}/{goal.target}</span></div>
              <Progress value={(goal.progress / goal.target) * 100} className="h-1.5 mb-1" />
              <div className="flex justify-end"><Badge variant="outline" className="text-[10px] text-yellow-500"><Star className="h-2.5 w-2.5 mr-1" />+{goal.reward} XP</Badge></div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full">Ver Equipe Completa<ChevronRight className="h-4 w-4 ml-2" /></Button>
      </CardContent>
    </Card>
  );
});
