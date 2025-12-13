import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Target, 
  Award, 
  AlertTriangle,
  ChevronRight,
  BarChart3,
  BookOpen,
  Flame,
  ArrowLeft,
  Filter,
  Brain,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useScrollHeader } from "@/hooks/useScrollHeader";
import { useProfiles } from "@/hooks/useProfiles";
import { useDepartments } from "@/hooks/useDepartments";
import { QuestsList } from "@/components/manager/QuestsList";
import { ChurnPredictionPanel } from "@/components/ChurnPredictionPanel";
import { CompetencyRadar } from "@/components/CompetencyRadar";
import { TeamCompetencyDashboard } from "@/components/manager/TeamCompetencyDashboard";
import { CompetencyAlertsPanel } from "@/components/CompetencyAlertsPanel";
import { TeamCertificationsPanel } from "@/components/TeamCertificationsPanel";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Types
interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNext: number;
  questsCompleted: number;
  questsTotal: number;
  streak: number;
  lastActive: string;
  trend: "up" | "down" | "same";
  riskLevel: "low" | "medium" | "high";
  department: string;
}

// Helper to calculate XP needed for next level
const calculateXpToNext = (level: number): number => {
  return level * 500 + 500;
};

// Helper to calculate risk level based on streak and activity
const calculateRiskLevel = (streak: number, updatedAt: string): "low" | "medium" | "high" => {
  const daysSinceActive = Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceActive > 7 || streak === 0) return "high";
  if (daysSinceActive > 3 || streak < 3) return "medium";
  return "low";
};

// Helper to calculate trend based on recent activity
const calculateTrend = (streak: number, questsCompleted: number): "up" | "down" | "same" => {
  if (streak >= 5 && questsCompleted > 10) return "up";
  if (streak === 0) return "down";
  return "same";
};

// Stat Card Component
const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  changeType,
  color,
  delay 
}: { 
  icon: React.ElementType;
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  color: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs ${
            changeType === "positive" ? "text-green-400" :
            changeType === "negative" ? "text-red-400" : "text-muted-foreground"
          }`}>
            {changeType === "positive" ? <TrendingUp className="w-3 h-3" /> :
             changeType === "negative" ? <TrendingDown className="w-3 h-3" /> : null}
            {change}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
  </motion.div>
);

// Team Member Row Component
const TeamMemberRow = ({ member, index }: { member: TeamMember; index: number }) => {
  const progressPercent = (member.questsCompleted / member.questsTotal) * 100;
  const xpPercent = (member.xp / member.xpToNext) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ scale: 1.01, x: 4 }}
      className="group"
    >
      <Card className="p-4 bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/40 hover:bg-card/50 transition-all duration-300 cursor-pointer">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold">
              {member.avatar}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
              member.riskLevel === "low" ? "bg-green-500" :
              member.riskLevel === "medium" ? "bg-yellow-500" : "bg-red-500"
            }`} />
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground truncate">{member.name}</h4>
              <Badge variant="outline" className="text-xs">
                Lv.{member.level}
              </Badge>
              {member.trend === "up" && <TrendingUp className="w-4 h-4 text-green-400" />}
              {member.trend === "down" && <TrendingDown className="w-4 h-4 text-red-400" />}
            </div>
            <p className="text-xs text-muted-foreground">{member.department} • Ativo: {member.lastActive}</p>
            
            {/* Progress Bar */}
            <div className="mt-2 flex items-center gap-2">
              <Progress value={progressPercent} className="h-1.5 flex-1" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {member.questsCompleted}/{member.questsTotal}
              </span>
            </div>
          </div>
          
          {/* Stats */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-1 text-amber-400">
                <Flame className="w-4 h-4" />
                <span className="font-bold">{member.streak}</span>
              </div>
              <p className="text-xs text-muted-foreground">Streak</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground">{member.xp.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">XP Total</p>
            </div>
          </div>
          
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </Card>
    </motion.div>
  );
};

// Department Card Component  
interface DepartmentData {
  id: string;
  name: string;
  color: string | null;
}

const DepartmentCard = ({ department, members, index }: { department: DepartmentData; members: TeamMember[]; index: number }) => {
  const deptMembers = members.filter(m => m.department === department.name);
  const avgProgress = deptMembers.length > 0 
    ? Math.round(deptMembers.reduce((acc, m) => acc + (m.questsCompleted / Math.max(m.questsTotal, 1)) * 100, 0) / deptMembers.length)
    : 0;
  const completionRate = deptMembers.length > 0
    ? Math.round(deptMembers.filter(m => m.riskLevel === "low").length / deptMembers.length * 100)
    : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <Card 
        className="p-4 bg-card/40 backdrop-blur-sm border-border/40 hover:border-primary/40 transition-all duration-300 cursor-pointer"
        style={{ borderLeftColor: department.color || "#6366f1", borderLeftWidth: 3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-foreground">{department.name}</h4>
          <Badge 
            variant="secondary" 
            className="text-xs"
            style={{ backgroundColor: `${department.color || "#6366f1"}20`, color: department.color || "#6366f1" }}
          >
            {deptMembers.length} membros
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progresso Médio</span>
              <span className="text-foreground font-medium">{avgProgress}%</span>
            </div>
            <Progress value={avgProgress} className="h-2" />
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <span className="text-xs text-muted-foreground">Taxa de Conclusão</span>
            <span className="text-sm font-bold" style={{ color: department.color || "#6366f1" }}>
              {completionRate}%
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// At Risk Alert Component
const AtRiskAlert = ({ members }: { members: TeamMember[] }) => {
  const atRiskMembers = members.filter(m => m.riskLevel === "high");
  
  if (atRiskMembers.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-4 bg-red-500/10 border-red-500/30 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-red-500/20">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-red-400">Atenção Necessária</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {atRiskMembers.length} membro{atRiskMembers.length > 1 ? "s" : ""} com baixo engajamento nos últimos 7 dias
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {atRiskMembers.map(member => (
                <Badge key={member.id} variant="outline" className="border-red-500/30 text-red-400">
                  {member.name}
                </Badge>
              ))}
            </div>
          </div>
          <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
            Ver Detalhes
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const { data: profiles = [], isLoading: profilesLoading } = useProfiles();
  const { data: departments = [], isLoading: departmentsLoading } = useDepartments();
  const isScrolled = useScrollHeader(10);
  
  // Transform profiles to TeamMember format
  const teamMembers: TeamMember[] = useMemo(() => {
    return profiles.map(profile => ({
      id: profile.id,
      name: profile.display_name || profile.email?.split("@")[0] || "Usuário",
      avatar: (profile.display_name || profile.email || "U").substring(0, 2).toUpperCase(),
      level: profile.level,
      xp: profile.xp,
      xpToNext: calculateXpToNext(profile.level),
      questsCompleted: profile.quests_completed,
      questsTotal: 50,
      streak: profile.streak,
      lastActive: formatDistanceToNow(new Date(profile.updated_at), { addSuffix: true, locale: ptBR }),
      trend: calculateTrend(profile.streak, profile.quests_completed),
      riskLevel: calculateRiskLevel(profile.streak, profile.updated_at),
      department: "Geral",
    }));
  }, [profiles]);
  
  const filteredMembers = selectedDepartment === "all" 
    ? teamMembers 
    : teamMembers.filter(m => m.department === selectedDepartment);
  
  // Calculate stats
  const totalMembers = teamMembers.length || 1;
  const avgCompletion = teamMembers.length > 0 ? Math.round(teamMembers.reduce((acc, m) => acc + (m.questsCompleted / Math.max(m.questsTotal, 1)) * 100, 0) / totalMembers) : 0;
  const avgStreak = teamMembers.length > 0 ? Math.round(teamMembers.reduce((acc, m) => acc + m.streak, 0) / totalMembers) : 0;
  const atRiskCount = teamMembers.filter(m => m.riskLevel === "high").length;
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "header-sticky border-b border-border/50",
          isScrolled && "scrolled"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Dashboard do Gestor</h1>
                <p className="text-sm text-muted-foreground">Acompanhe o progresso da sua equipe</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </motion.header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Alert Section */}
        <AtRiskAlert members={teamMembers} />
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Membros da Equipe"
            value={totalMembers.toString()}
            color="#6366f1"
            delay={0}
          />
          <StatCard
            icon={Target}
            label="Taxa de Conclusão"
            value={`${avgCompletion}%`}
            change="+5%"
            changeType="positive"
            color="#10b981"
            delay={0.1}
          />
          <StatCard
            icon={Flame}
            label="Streak Médio"
            value={`${avgStreak} dias`}
            change="+2"
            changeType="positive"
            color="#f59e0b"
            delay={0.2}
          />
          <StatCard
            icon={AlertTriangle}
            label="Precisam Atenção"
            value={atRiskCount.toString()}
            change={atRiskCount > 0 ? "Agir" : "OK"}
            changeType={atRiskCount > 0 ? "negative" : "neutral"}
            color="#ef4444"
            delay={0.3}
          />
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="team" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" />
              Equipe
            </TabsTrigger>
            <TabsTrigger value="churn" className="gap-2">
              <Brain className="h-4 w-4" />
              Predição IA
            </TabsTrigger>
            <TabsTrigger value="competencies" className="gap-2">
              <Target className="h-4 w-4" />
              Competências
            </TabsTrigger>
            <TabsTrigger value="certifications" className="gap-2">
              <Award className="h-4 w-4" />
              Certificações
            </TabsTrigger>
            <TabsTrigger value="quests" className="gap-2">
              <Target className="h-4 w-4" />
              Quests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Team Members List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Membros da Equipe</h2>
                  <Badge variant="outline">{filteredMembers.length} membros</Badge>
                </div>
                
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {filteredMembers.map((member, index) => (
                      <TeamMemberRow key={member.id} member={member} index={index} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
              
              {/* Departments Sidebar */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Por Departamento</h2>
                
                <div className="space-y-3">
                  {departments.map((dept, index) => (
                    <DepartmentCard key={dept.id} department={dept} members={teamMembers} index={index} />
                  ))}
                </div>
                
                {/* Quick Actions */}
                <Card className="p-4 bg-card/40 backdrop-blur-sm border-border/40">
                  <h3 className="font-semibold text-foreground mb-3">Ações Rápidas</h3>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2" 
                      size="sm"
                      onClick={() => navigate("/quest-builder")}
                    >
                      <BookOpen className="w-4 h-4" />
                      Criar Nova Trilha
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                      <Award className="w-4 h-4" />
                      Enviar Reconhecimento
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                      <BarChart3 className="w-4 h-4" />
                      Exportar Relatório
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="churn">
            <ChurnPredictionPanel />
          </TabsContent>

          <TabsContent value="competencies">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TeamCompetencyDashboard />
              </div>
              <div>
                <CompetencyAlertsPanel />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="certifications">
            <TeamCertificationsPanel />
          </TabsContent>

          <TabsContent value="quests">
            <QuestsList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
