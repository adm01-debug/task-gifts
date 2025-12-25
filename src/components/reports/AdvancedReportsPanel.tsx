import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  FileText, Download, Calendar, Filter, BarChart3, 
  PieChart, TrendingUp, Users, Clock, Star, Plus,
  Play, Pause, Trash2, Eye, Mail, Share2
} from "lucide-react";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  metrics: string[];
  filters: string[];
  created_at: string;
  last_generated?: string;
  is_favorite: boolean;
}

interface ScheduledReport {
  id: string;
  template_id: string;
  template_name: string;
  frequency: "daily" | "weekly" | "monthly";
  next_run: string;
  recipients: string[];
  format: "pdf" | "excel" | "csv";
  is_active: boolean;
}

interface GeneratedReport {
  id: string;
  name: string;
  generated_at: string;
  format: string;
  size: string;
  generated_by: string;
}

const REPORT_CATEGORIES = [
  { value: "engagement", label: "Engajamento", icon: TrendingUp },
  { value: "performance", label: "Performance", icon: BarChart3 },
  { value: "talent", label: "Talentos", icon: Users },
  { value: "climate", label: "Clima", icon: PieChart },
];

const AVAILABLE_METRICS = [
  { value: "enps", label: "eNPS Score" },
  { value: "participation", label: "Taxa de Participação" },
  { value: "mood", label: "Humor Médio" },
  { value: "okr_progress", label: "Progresso OKRs" },
  { value: "feedback_count", label: "Feedbacks Enviados" },
  { value: "checkin_rate", label: "Taxa de 1-on-1" },
  { value: "turnover", label: "Turnover" },
  { value: "training", label: "Horas de Treinamento" },
  { value: "pdi_progress", label: "Progresso PDI" },
  { value: "kpi_achievement", label: "Atingimento KPIs" },
];

const AVAILABLE_FILTERS = [
  { value: "department", label: "Departamento" },
  { value: "location", label: "Localização" },
  { value: "tenure", label: "Tempo de Casa" },
  { value: "level", label: "Nível Hierárquico" },
  { value: "gender", label: "Gênero" },
  { value: "age", label: "Faixa Etária" },
];

export const AdvancedReportsPanel = () => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([
    {
      id: "1",
      name: "Relatório Executivo Mensal",
      description: "Visão consolidada de todos os indicadores de RH",
      category: "engagement",
      metrics: ["enps", "participation", "mood", "turnover"],
      filters: ["department", "location"],
      created_at: "2024-01-15",
      last_generated: "2024-12-01",
      is_favorite: true,
    },
    {
      id: "2",
      name: "Dashboard de Performance",
      description: "Acompanhamento de OKRs e KPIs",
      category: "performance",
      metrics: ["okr_progress", "kpi_achievement"],
      filters: ["department", "level"],
      created_at: "2024-03-20",
      last_generated: "2024-12-15",
      is_favorite: false,
    },
    {
      id: "3",
      name: "Análise de Clima por Pilar",
      description: "Detalhamento dos 10 pilares de clima",
      category: "climate",
      metrics: ["enps", "mood", "participation"],
      filters: ["department", "tenure", "level"],
      created_at: "2024-06-10",
      is_favorite: true,
    },
  ]);

  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: "1",
      template_id: "1",
      template_name: "Relatório Executivo Mensal",
      frequency: "monthly",
      next_run: "2025-01-01 08:00",
      recipients: ["ceo@empresa.com", "rh@empresa.com"],
      format: "pdf",
      is_active: true,
    },
    {
      id: "2",
      template_id: "2",
      template_name: "Dashboard de Performance",
      frequency: "weekly",
      next_run: "2024-12-30 09:00",
      recipients: ["diretoria@empresa.com"],
      format: "excel",
      is_active: true,
    },
  ]);

  const [generatedReports] = useState<GeneratedReport[]>([
    {
      id: "1",
      name: "Relatório Executivo - Dezembro 2024",
      generated_at: "2024-12-01 08:00",
      format: "PDF",
      size: "2.4 MB",
      generated_by: "Sistema (Agendado)",
    },
    {
      id: "2",
      name: "Dashboard Performance - Semana 51",
      generated_at: "2024-12-23 09:00",
      format: "Excel",
      size: "1.8 MB",
      generated_by: "Sistema (Agendado)",
    },
    {
      id: "3",
      name: "Análise Clima Q4 2024",
      generated_at: "2024-12-20 14:30",
      format: "PDF",
      size: "3.1 MB",
      generated_by: "Maria Silva",
    },
  ]);

  const [newTemplateDialog, setNewTemplateDialog] = useState(false);
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    category: "",
  });

  const [scheduleConfig, setScheduleConfig] = useState({
    frequency: "monthly",
    recipients: "",
    format: "pdf",
  });

  const createTemplate = () => {
    if (!newTemplate.name || !newTemplate.category || selectedMetrics.length === 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const template: ReportTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      description: newTemplate.description,
      category: newTemplate.category,
      metrics: selectedMetrics,
      filters: selectedFilters,
      created_at: new Date().toISOString().split("T")[0],
      is_favorite: false,
    };

    setTemplates([...templates, template]);
    setNewTemplateDialog(false);
    setNewTemplate({ name: "", description: "", category: "" });
    setSelectedMetrics([]);
    setSelectedFilters([]);
    toast.success("Template criado!");
  };

  const scheduleReport = () => {
    if (!selectedTemplate || !scheduleConfig.recipients) {
      toast.error("Configure todos os campos");
      return;
    }

    const scheduled: ScheduledReport = {
      id: Date.now().toString(),
      template_id: selectedTemplate.id,
      template_name: selectedTemplate.name,
      frequency: scheduleConfig.frequency as "daily" | "weekly" | "monthly",
      next_run: new Date(Date.now() + 86400000).toISOString(),
      recipients: scheduleConfig.recipients.split(",").map(e => e.trim()),
      format: scheduleConfig.format as "pdf" | "excel" | "csv",
      is_active: true,
    };

    setScheduledReports([...scheduledReports, scheduled]);
    setScheduleDialog(false);
    setSelectedTemplate(null);
    setScheduleConfig({ frequency: "monthly", recipients: "", format: "pdf" });
    toast.success("Relatório agendado!");
  };

  const toggleFavorite = (id: string) => {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, is_favorite: !t.is_favorite } : t
    ));
  };

  const generateNow = (template: ReportTemplate) => {
    toast.info(`Gerando ${template.name}...`);
    setTimeout(() => {
      toast.success("Relatório gerado! Disponível em Downloads.");
      setTemplates(templates.map(t => 
        t.id === template.id 
          ? { ...t, last_generated: new Date().toISOString().split("T")[0] } 
          : t
      ));
    }, 2000);
  };

  const toggleSchedule = (id: string) => {
    setScheduledReports(scheduledReports.map(s => 
      s.id === id ? { ...s, is_active: !s.is_active } : s
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Relatórios Avançados</h2>
          <p className="text-muted-foreground">
            Crie, agende e exporte relatórios personalizados
          </p>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2">
            <Calendar className="h-4 w-4" />
            Agendados
          </TabsTrigger>
          <TabsTrigger value="generated" className="gap-2">
            <Download className="h-4 w-4" />
            Gerados
          </TabsTrigger>
          <TabsTrigger value="builder" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Construtor
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {REPORT_CATEGORIES.map((cat) => (
                <Badge key={cat.value} variant="outline" className="cursor-pointer">
                  <cat.icon className="h-3 w-3 mr-1" />
                  {cat.label}
                </Badge>
              ))}
            </div>
            <Dialog open={newTemplateDialog} onOpenChange={setNewTemplateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Criar Template de Relatório</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nome *</Label>
                    <Input
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      placeholder="Ex: Relatório Trimestral RH"
                    />
                  </div>

                  <div>
                    <Label>Descrição</Label>
                    <Input
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                      placeholder="Breve descrição do relatório"
                    />
                  </div>

                  <div>
                    <Label>Categoria *</Label>
                    <Select
                      value={newTemplate.category}
                      onValueChange={(v) => setNewTemplate({ ...newTemplate, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {REPORT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Métricas *</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
                      {AVAILABLE_METRICS.map((metric) => (
                        <label key={metric.value} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={selectedMetrics.includes(metric.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedMetrics([...selectedMetrics, metric.value]);
                              } else {
                                setSelectedMetrics(selectedMetrics.filter(m => m !== metric.value));
                              }
                            }}
                          />
                          {metric.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Filtros Disponíveis</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {AVAILABLE_FILTERS.map((filter) => (
                        <label key={filter.value} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={selectedFilters.includes(filter.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedFilters([...selectedFilters, filter.value]);
                              } else {
                                setSelectedFilters(selectedFilters.filter(f => f !== filter.value));
                              }
                            }}
                          />
                          {filter.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button onClick={createTemplate} className="w-full">
                    Criar Template
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => {
              const category = REPORT_CATEGORIES.find(c => c.value === template.category);
              const CategoryIcon = category?.icon || FileText;

              return (
                <Card key={template.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <CategoryIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {category?.label}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(template.id)}
                      >
                        <Star className={`h-4 w-4 ${template.is_favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {template.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.metrics.slice(0, 3).map((m) => (
                        <Badge key={m} variant="secondary" className="text-xs">
                          {AVAILABLE_METRICS.find(am => am.value === m)?.label}
                        </Badge>
                      ))}
                      {template.metrics.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.metrics.length - 3}
                        </Badge>
                      )}
                    </div>

                    {template.last_generated && (
                      <p className="text-xs text-muted-foreground mb-3">
                        Último: {template.last_generated}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => generateNow(template)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Gerar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setScheduleDialog(true);
                        }}
                      >
                        <Calendar className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Scheduled Tab */}
        <TabsContent value="scheduled" className="space-y-4">
          <div className="space-y-3">
            {scheduledReports.map((scheduled) => (
              <Card key={scheduled.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{scheduled.template_name}</span>
                        <Badge variant={scheduled.is_active ? "default" : "secondary"}>
                          {scheduled.is_active ? "Ativo" : "Pausado"}
                        </Badge>
                      </div>

                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {scheduled.frequency === "daily" && "Diário"}
                          {scheduled.frequency === "weekly" && "Semanal"}
                          {scheduled.frequency === "monthly" && "Mensal"}
                        </span>
                        <span>Próximo: {scheduled.next_run}</span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {scheduled.recipients.length} destinatários
                        </span>
                        <Badge variant="outline">{scheduled.format.toUpperCase()}</Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleSchedule(scheduled.id)}
                      >
                        {scheduled.is_active ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Generated Tab */}
        <TabsContent value="generated" className="space-y-4">
          <div className="space-y-3">
            {generatedReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {report.generated_at} • {report.size} • {report.generated_by}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{report.format}</Badge>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Download className="h-4 w-4" />
                        Baixar
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Builder Tab */}
        <TabsContent value="builder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Construtor de Relatórios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Período</Label>
                  <Select defaultValue="last30">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last7">Últimos 7 dias</SelectItem>
                      <SelectItem value="last30">Últimos 30 dias</SelectItem>
                      <SelectItem value="last90">Últimos 90 dias</SelectItem>
                      <SelectItem value="thisYear">Este ano</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Departamento</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="tech">Tecnologia</SelectItem>
                      <SelectItem value="sales">Vendas</SelectItem>
                      <SelectItem value="hr">RH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Formato</Label>
                  <Select defaultValue="pdf">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Métricas a incluir</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {AVAILABLE_METRICS.map((metric) => (
                    <label key={metric.value} className="flex items-center gap-2 text-sm p-2 border rounded hover:bg-muted cursor-pointer">
                      <Checkbox />
                      {metric.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="gap-2">
                  <Play className="h-4 w-4" />
                  Gerar Relatório
                </Button>
                <Button variant="outline">
                  Salvar como Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialog} onOpenChange={setScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Relatório</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Template: <strong>{selectedTemplate?.name}</strong>
            </p>

            <div>
              <Label>Frequência</Label>
              <Select
                value={scheduleConfig.frequency}
                onValueChange={(v) => setScheduleConfig({ ...scheduleConfig, frequency: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal (Segunda)</SelectItem>
                  <SelectItem value="monthly">Mensal (Dia 1)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Destinatários (emails separados por vírgula)</Label>
              <Input
                value={scheduleConfig.recipients}
                onChange={(e) => setScheduleConfig({ ...scheduleConfig, recipients: e.target.value })}
                placeholder="email1@empresa.com, email2@empresa.com"
              />
            </div>

            <div>
              <Label>Formato</Label>
              <Select
                value={scheduleConfig.format}
                onValueChange={(v) => setScheduleConfig({ ...scheduleConfig, format: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={scheduleReport} className="w-full">
              Agendar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
