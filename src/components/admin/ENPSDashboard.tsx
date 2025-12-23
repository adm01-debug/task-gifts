import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Plus,
  TrendingUp,
  TrendingDown,
  Users,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Calendar,
  Clock,
  Eye,
  Edit2,
  Trash2,
  Send,
  MessageSquare,
  Filter,
  RefreshCw,
  LineChart,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useENPSSurveys,
  useENPSSurveyStats,
  useENPSResponses,
  useCreateENPSSurvey,
  useUpdateENPSSurvey,
  useDeleteENPSSurvey,
  useEngagementSnapshots,
  useGenerateSnapshot,
} from "@/hooks/useENPS";
import { useDepartments } from "@/hooks/useDepartments";
import { format, differenceInDays, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-700",
  closed: "bg-blue-100 text-blue-700",
  archived: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  active: "Ativa",
  closed: "Encerrada",
  archived: "Arquivada",
};

const ENPS_COLORS = {
  promoters: "#10b981",
  passives: "#f59e0b",
  detractors: "#ef4444",
};

export function ENPSDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: surveys, isLoading } = useENPSSurveys(statusFilter !== "all" ? statusFilter : undefined);
  const { data: snapshots } = useEngagementSnapshots(undefined, 12);
  const { data: departments } = useDepartments();
  const deleteSurvey = useDeleteENPSSurvey();
  const generateSnapshot = useGenerateSnapshot();

  // Calculate overall stats
  const activeSurveys = surveys?.filter((s) => s.status === "active") || [];
  const totalResponses = surveys?.reduce((sum, s) => sum + (s.response_count || 0), 0) || 0;
  const latestScore = surveys?.find((s) => s.enps_score !== undefined)?.enps_score || 0;

  // Chart data for engagement trend
  const trendData =
    snapshots
      ?.map((s) => ({
        date: format(new Date(s.snapshot_date), "dd/MM"),
        enps: s.enps_score || 0,
        mood: (s.mood_avg || 0) * 20, // Scale to 0-100
        participation: s.participation_rate || 0,
      }))
      .reverse() || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Dashboard eNPS
          </h2>
          <p className="text-muted-foreground">
            Monitore a satisfação e engajamento dos colaboradores
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => generateSnapshot.mutate({})}
            disabled={generateSnapshot.isPending}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${generateSnapshot.isPending ? "animate-spin" : ""}`} />
            Gerar Snapshot
          </Button>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Pesquisa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <CreateSurveyForm
                departments={departments || []}
                onClose={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Score eNPS</p>
                  <p className="text-3xl font-bold">{latestScore}</p>
                </div>
                <div
                  className={`p-3 rounded-xl ${
                    latestScore >= 50
                      ? "bg-green-500/20"
                      : latestScore >= 0
                      ? "bg-yellow-500/20"
                      : "bg-red-500/20"
                  }`}
                >
                  {latestScore >= 0 ? (
                    <TrendingUp
                      className={`w-6 h-6 ${latestScore >= 50 ? "text-green-500" : "text-yellow-500"}`}
                    />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-500" />
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {latestScore >= 50 ? "Excelente" : latestScore >= 0 ? "Bom" : "Precisa melhorar"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Pesquisas Ativas</p>
                  <p className="text-3xl font-bold">{activeSurveys.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <Send className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {surveys?.length || 0} total
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Respostas</p>
                  <p className="text-3xl font-bold">{totalResponses}</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <MessageSquare className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Todas as pesquisas
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Snapshots</p>
                  <p className="text-3xl font-bold">{snapshots?.length || 0}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/20">
                  <LineChart className="w-6 h-6 text-amber-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Histórico de engajamento
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="surveys">Pesquisas</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Engagement Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Evolução do Engajamento</CardTitle>
                <CardDescription>Últimos 12 períodos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorEnps" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis domain={[-100, 100]} className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="enps"
                        stroke="#6366f1"
                        fillOpacity={1}
                        fill="url(#colorEnps)"
                        name="eNPS"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Latest Survey Results */}
            {surveys?.[0] && <SurveyResultsCard surveyId={surveys[0].id} />}
          </div>
        </TabsContent>

        {/* Surveys Tab */}
        <TabsContent value="surveys" className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="active">Ativa</SelectItem>
                <SelectItem value="closed">Encerrada</SelectItem>
                <SelectItem value="archived">Arquivada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : surveys?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma pesquisa encontrada
              </div>
            ) : (
              surveys?.map((survey, index) => (
                <motion.div
                  key={survey.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <SurveyCard
                    survey={survey}
                    onView={() => setSelectedSurvey(survey.id)}
                    onDelete={() => deleteSurvey.mutate(survey.id)}
                  />
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Métricas de Engajamento</CardTitle>
              <CardDescription>Comparativo de indicadores ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="enps" name="eNPS" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="mood" name="Humor (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="participation" name="Participação (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Survey Detail Dialog */}
      <Dialog open={selectedSurvey !== null} onOpenChange={() => setSelectedSurvey(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedSurvey && <SurveyDetailView surveyId={selectedSurvey} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Create Survey Form
function CreateSurveyForm({
  departments,
  onClose,
}: {
  departments: { id: string; name: string }[];
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 7), "yyyy-MM-dd"));
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [followUpQuestion, setFollowUpQuestion] = useState("");

  const createSurvey = useCreateENPSSurvey();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    await createSurvey.mutateAsync({
      title,
      description: description || undefined,
      department_id: departmentId || undefined,
      ends_at: new Date(endDate).toISOString(),
      is_anonymous: isAnonymous,
      follow_up_question: followUpQuestion || undefined,
      status: "active",
    });

    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Nova Pesquisa eNPS</DialogTitle>
        <DialogDescription>
          Crie uma pesquisa para medir a satisfação
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label>Título</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ex: Pesquisa de Satisfação Q1 2024"
          />
        </div>

        <div className="space-y-2">
          <Label>Descrição (opcional)</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contexto da pesquisa..."
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Departamento (opcional)</Label>
          <Select value={departmentId} onValueChange={setDepartmentId}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os departamentos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Data de Encerramento</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Pergunta de Follow-up (opcional)</Label>
          <Input
            value={followUpQuestion}
            onChange={(e) => setFollowUpQuestion(e.target.value)}
            placeholder="O que podemos melhorar?"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Respostas Anônimas</Label>
          <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!title || createSurvey.isPending}>
            {createSurvey.isPending ? "Criando..." : "Criar Pesquisa"}
          </Button>
        </div>
      </form>
    </>
  );
}

// Survey Card
function SurveyCard({
  survey,
  onView,
  onDelete,
}: {
  survey: {
    id: string;
    title: string;
    status: string;
    starts_at: string;
    ends_at: string;
    response_count?: number;
    enps_score?: number;
    is_anonymous: boolean;
  };
  onView: () => void;
  onDelete: () => void;
}) {
  const daysLeft = differenceInDays(new Date(survey.ends_at), new Date());
  const isActive = survey.status === "active";

  return (
    <Card className="border-border/50 hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold">{survey.title}</h4>
              <Badge className={STATUS_COLORS[survey.status]}>{STATUS_LABELS[survey.status]}</Badge>
              {survey.is_anonymous && (
                <Badge variant="outline" className="text-xs">
                  Anônima
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(survey.starts_at), "dd/MM/yyyy")} -{" "}
              {format(new Date(survey.ends_at), "dd/MM/yyyy")}
              {isActive && daysLeft > 0 && ` • ${daysLeft} dias restantes`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold">{survey.enps_score ?? "-"}</p>
              <p className="text-xs text-muted-foreground">{survey.response_count || 0} respostas</p>
            </div>

            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={onView}>
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onDelete}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Survey Results Card
function SurveyResultsCard({ surveyId }: { surveyId: string }) {
  const { data: stats, isLoading } = useENPSSurveyStats(surveyId);

  if (isLoading || !stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Carregando resultados...
        </CardContent>
      </Card>
    );
  }

  const pieData = [
    { name: "Promotores", value: stats.promoters, color: ENPS_COLORS.promoters },
    { name: "Neutros", value: stats.passives, color: ENPS_COLORS.passives },
    { name: "Detratores", value: stats.detractors, color: ENPS_COLORS.detractors },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Distribuição de Respostas</CardTitle>
        <CardDescription>Última pesquisa - {stats.total} respostas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="w-[200px] h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <ThumbsUp className="w-5 h-5 text-green-500" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Promotores (9-10)</span>
                  <span className="font-medium">{stats.promoterPercent}%</span>
                </div>
                <Progress value={stats.promoterPercent} className="h-2" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Minus className="w-5 h-5 text-yellow-500" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Neutros (7-8)</span>
                  <span className="font-medium">{stats.passivePercent}%</span>
                </div>
                <Progress value={stats.passivePercent} className="h-2" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThumbsDown className="w-5 h-5 text-red-500" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Detratores (0-6)</span>
                  <span className="font-medium">{stats.detractorPercent}%</span>
                </div>
                <Progress value={stats.detractorPercent} className="h-2" />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Score eNPS</span>
                <span
                  className={`text-2xl font-bold ${
                    stats.score >= 50
                      ? "text-green-500"
                      : stats.score >= 0
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {stats.score}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Survey Detail View
function SurveyDetailView({ surveyId }: { surveyId: string }) {
  const { data: stats } = useENPSSurveyStats(surveyId);
  const { data: responses } = useENPSResponses(surveyId);
  const updateSurvey = useUpdateENPSSurvey();

  return (
    <>
      <DialogHeader>
        <DialogTitle>Detalhes da Pesquisa</DialogTitle>
        <DialogDescription>Resultados e respostas detalhadas</DialogDescription>
      </DialogHeader>

      <div className="mt-4 space-y-6">
        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-green-500/10">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.promoters}</p>
                <p className="text-xs text-muted-foreground">Promotores</p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-500/10">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.passives}</p>
                <p className="text-xs text-muted-foreground">Neutros</p>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{stats.detractors}</p>
                <p className="text-xs text-muted-foreground">Detratores</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/10">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-primary">{stats.score}</p>
                <p className="text-xs text-muted-foreground">Score</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Responses List */}
        <div>
          <h4 className="font-medium mb-3">Respostas ({responses?.length || 0})</h4>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {responses?.map((response) => (
              <Card key={response.id} className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge
                        className={
                          response.category === "promoter"
                            ? "bg-green-500"
                            : response.category === "passive"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }
                      >
                        {response.score}
                      </Badge>
                      <span className="text-sm capitalize">
                        {response.category === "promoter"
                          ? "Promotor"
                          : response.category === "passive"
                          ? "Neutro"
                          : "Detrator"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(response.created_at), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                  {response.follow_up_answer && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      "{response.follow_up_answer}"
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
