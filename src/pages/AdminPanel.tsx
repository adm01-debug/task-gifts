import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Building2,
  HelpCircle,
  ShoppingBag,
  BookOpen,
  Settings,
  ArrowLeft,
  Shield,
  LayoutDashboard,
  Award,
  ChevronRight,
  Search,
  History,
  TrendingUp,
  AlertTriangle,
  Link2,
  Trophy,
  Target,
  BarChart3,
  MessageSquare,
  Megaphone,
  PartyPopper,
  Heart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UsersManager } from "@/components/admin/UsersManager";
import { DepartmentsManager } from "@/components/admin/DepartmentsManager";
import { AdminChangeHistory } from "@/components/admin/AdminChangeHistory";
import { AdminMetricsDashboard } from "@/components/admin/AdminMetricsDashboard";
import { AdminAlertsPanel } from "@/components/admin/AdminAlertsPanel";
import { Bitrix24Integration } from "@/components/admin/Bitrix24Integration";
import { LeaguesManager } from "@/components/admin/LeaguesManager";
import { GoalsManager } from "@/components/admin/GoalsManager";
import { SurveyCreator } from "@/components/admin/SurveyCreator";
import { FeedbackCycleManager } from "@/components/admin/FeedbackCycleManager";
import { AnnouncementPublisher } from "@/components/admin/AnnouncementPublisher";
import { CelebrationManager } from "@/components/admin/CelebrationManager";
import { MoodAnalytics } from "@/components/admin/MoodAnalytics";
import { useProfiles } from "@/hooks/useProfiles";
import { useDepartments } from "@/hooks/useDepartments";
import { useAdminRewards } from "@/hooks/useShop";
import { useQuizQuestions } from "@/hooks/useQuizQuestions";
import { usePublishedTrails } from "@/hooks/useTrails";

interface QuickLinkProps {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  badge?: string;
  color: string;
}

const QuickLink = ({ icon: Icon, title, description, href, badge, color }: QuickLinkProps) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="cursor-pointer border-border/50 hover:border-primary/40 transition-all duration-300 group"
        onClick={() => navigate(href)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div 
              className="p-3 rounded-xl transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{title}</h3>
                {badge && (
                  <Badge variant="secondary" className="text-xs">{badge}</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

function AdminPanelContent() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data for overview stats
  const { data: profiles } = useProfiles();
  const { data: departments } = useDepartments();
  const { data: rewards } = useAdminRewards();
  const { data: questions } = useQuizQuestions();
  const { data: trails } = usePublishedTrails();

  const stats = {
    users: profiles?.length || 0,
    departments: departments?.length || 0,
    rewards: rewards?.length || 0,
    questions: questions?.length || 0,
    trails: trails?.length || 0,
  };

  const quickLinks: QuickLinkProps[] = [
    {
      icon: HelpCircle,
      title: "Perguntas do Quiz",
      description: "Gerenciar perguntas e gerar com IA",
      href: "/quiz/admin",
      badge: `${stats.questions}`,
      color: "#6366f1",
    },
    {
      icon: ShoppingBag,
      title: "Loja de Recompensas",
      description: "Produtos, promoções e pedidos",
      href: "/shop/admin",
      badge: `${stats.rewards}`,
      color: "#10b981",
    },
    {
      icon: BookOpen,
      title: "Trilhas de Aprendizado",
      description: "Criar e gerenciar trilhas",
      href: "/trails",
      badge: `${stats.trails}`,
      color: "#f59e0b",
    },
    {
      icon: LayoutDashboard,
      title: "Dashboard Gestor",
      description: "Visão geral da equipe",
      href: "/manager",
      color: "#8b5cf6",
    },
    {
      icon: Award,
      title: "Dashboard Executivo",
      description: "Métricas e KPIs C-Level",
      href: "/executive",
      color: "#ec4899",
    },
    {
      icon: Shield,
      title: "Logs de Auditoria",
      description: "Histórico de ações do sistema",
      href: "/audit",
      color: "#64748b",
    },
  ];

  const filteredLinks = quickLinks.filter(
    (link) =>
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border"
      >
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")} aria-label="Voltar">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Painel Administrativo</h1>
                    <p className="text-sm text-muted-foreground">
                      Gerenciamento centralizado da plataforma
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="metrics" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Métricas
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="departments" className="gap-2">
              <Building2 className="h-4 w-4" />
              Departamentos
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alertas
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="bitrix24" className="gap-2">
              <Link2 className="h-4 w-4" />
              Bitrix24
            </TabsTrigger>
            <TabsTrigger value="leagues" className="gap-2">
              <Trophy className="h-4 w-4" />
              Ligas
            </TabsTrigger>
            <TabsTrigger value="goals" className="gap-2">
              <Target className="h-4 w-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="surveys" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Surveys
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="announcements" className="gap-2">
              <Megaphone className="h-4 w-4" />
              Anúncios
            </TabsTrigger>
            <TabsTrigger value="celebrations" className="gap-2">
              <PartyPopper className="h-4 w-4" />
              Celebrações
            </TabsTrigger>
            <TabsTrigger value="mood" className="gap-2">
              <Heart className="h-4 w-4" />
              Mood
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Usuários", value: stats.users, color: "#6366f1", icon: Users },
                { label: "Departamentos", value: stats.departments, color: "#10b981", icon: Building2 },
                { label: "Recompensas", value: stats.rewards, color: "#f59e0b", icon: ShoppingBag },
                { label: "Perguntas", value: stats.questions, color: "#ec4899", icon: HelpCircle },
                { label: "Trilhas", value: stats.trails, color: "#8b5cf6", icon: BookOpen },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${stat.color}15` }}
                        >
                          <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick Links */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Acesso Rápido</CardTitle>
                    <CardDescription>Navegue para outras áreas administrativas</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <AnimatePresence mode="popLayout">
                    {filteredLinks.map((link, index) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <QuickLink {...link} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics">
            <AdminMetricsDashboard />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <UsersManager />
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments">
            <DepartmentsManager />
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <AdminAlertsPanel />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <AdminChangeHistory />
          </TabsContent>

          {/* Bitrix24 Tab */}
          <TabsContent value="bitrix24">
            <Bitrix24Integration />
          </TabsContent>

          {/* Leagues Tab */}
          <TabsContent value="leagues">
            <LeaguesManager />
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals">
            <GoalsManager />
          </TabsContent>

          {/* Surveys Tab */}
          <TabsContent value="surveys">
            <SurveyCreator />
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <FeedbackCycleManager />
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements">
            <AnnouncementPublisher />
          </TabsContent>

          {/* Celebrations Tab */}
          <TabsContent value="celebrations">
            <CelebrationManager />
          </TabsContent>

          {/* Mood Tab */}
          <TabsContent value="mood">
            <MoodAnalytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function AdminPanel() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminPanelContent />
    </ProtectedRoute>
  );
}
