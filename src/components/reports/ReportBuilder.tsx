import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  PieChart,
  LineChart,
  Table2,
  FileText,
  Presentation,
  Calendar,
  Filter,
  Users,
  Save,
  Eye,
  Clock,
  Send,
  Link as LinkIcon,
  CheckCircle2,
  Plus,
  Trash2,
  GripVertical,
  Settings2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDepartments } from "@/hooks/useDepartments";

type ReportType = "dashboard" | "table" | "chart" | "pdf" | "powerpoint";
type WidgetType = "kpi_cards" | "line_chart" | "bar_chart" | "pie_chart" | "table" | "heatmap";
type Period = "1m" | "3m" | "6m" | "1y" | "custom";
type Granularity = "weekly" | "monthly" | "quarterly";

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  metrics: string[];
  position: number;
}

interface ReportConfig {
  name: string;
  type: ReportType;
  module: "engagement" | "talents" | "performance";
  metrics: string[];
  period: Period;
  customDateStart?: string;
  customDateEnd?: string;
  granularity: Granularity;
  filters: {
    departments: string[];
    attributes: Record<string, string>;
  };
  widgets: Widget[];
  layout: "1col" | "2col" | "3col" | "grid";
  theme: "light" | "dark" | "auto";
  sharing: {
    saveToLibrary: boolean;
    visibleTo: string[];
    scheduleEnabled: boolean;
    scheduleFrequency?: "daily" | "weekly" | "monthly";
    scheduleDay?: string;
    scheduleTime?: string;
    scheduleRecipients: string[];
    publicLinkEnabled: boolean;
    publicLinkExpiry?: number;
  };
}

const METRICS_BY_MODULE = {
  engagement: [
    { id: "enps", name: "eNPS", icon: BarChart3 },
    { id: "lnps", name: "lNPS", icon: BarChart3 },
    { id: "clima", name: "Clima Geral (0-100)", icon: LineChart },
    { id: "pilares", name: "10 Pilares (detalhado)", icon: PieChart },
    { id: "participacao", name: "Taxa de Participação", icon: Users },
    { id: "opinioes", name: "Número de Opiniões", icon: FileText },
    { id: "sentimento", name: "Análise de Sentimento", icon: BarChart3 },
  ],
  talents: [
    { id: "nine_box", name: "Distribuição 9-Box", icon: PieChart },
    { id: "avaliacoes", name: "Média de Avaliações", icon: BarChart3 },
    { id: "pdi_conclusao", name: "Conclusão PDI", icon: LineChart },
    { id: "feedbacks", name: "Feedbacks Enviados/Recebidos", icon: BarChart3 },
    { id: "gaps", name: "Gaps de Competência", icon: PieChart },
    { id: "sucessao", name: "Pipeline Sucessão", icon: Users },
  ],
  performance: [
    { id: "okr_status", name: "Status OKRs", icon: BarChart3 },
    { id: "okr_progress", name: "Progresso OKRs", icon: LineChart },
    { id: "kpis", name: "KPIs Críticos", icon: BarChart3 },
    { id: "iniciativas", name: "Status Iniciativas", icon: Table2 },
    { id: "burndown", name: "Burn-down", icon: LineChart },
    { id: "roi", name: "ROI", icon: BarChart3 },
  ],
};

const WIDGET_TYPES: { id: WidgetType; name: string; icon: React.ElementType }[] = [
  { id: "kpi_cards", name: "KPI Cards", icon: BarChart3 },
  { id: "line_chart", name: "Gráfico de Linha", icon: LineChart },
  { id: "bar_chart", name: "Gráfico de Barras", icon: BarChart3 },
  { id: "pie_chart", name: "Gráfico de Pizza", icon: PieChart },
  { id: "table", name: "Tabela", icon: Table2 },
  { id: "heatmap", name: "Heatmap", icon: BarChart3 },
];

interface ReportBuilderProps {
  onBack: () => void;
  onSave: (config: ReportConfig) => void;
  initialConfig?: Partial<ReportConfig>;
}

export default function ReportBuilder({ onBack, onSave, initialConfig }: ReportBuilderProps) {
  const [step, setStep] = useState(1);
  const { data: departments } = useDepartments();
  
  const [config, setConfig] = useState<ReportConfig>({
    name: initialConfig?.name || "",
    type: initialConfig?.type || "dashboard",
    module: initialConfig?.module || "engagement",
    metrics: initialConfig?.metrics || [],
    period: initialConfig?.period || "3m",
    granularity: initialConfig?.granularity || "monthly",
    filters: initialConfig?.filters || { departments: [], attributes: {} },
    widgets: initialConfig?.widgets || [],
    layout: initialConfig?.layout || "2col",
    theme: initialConfig?.theme || "auto",
    sharing: initialConfig?.sharing || {
      saveToLibrary: true,
      visibleTo: [],
      scheduleEnabled: false,
      scheduleRecipients: [],
      publicLinkEnabled: false,
    },
  });

  const updateConfig = (updates: Partial<ReportConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const canProceed = () => {
    switch (step) {
      case 1:
        return config.name.trim().length > 0;
      case 2:
        return config.metrics.length > 0;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const addWidget = (type: WidgetType) => {
    const widget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      title: WIDGET_TYPES.find((w) => w.id === type)?.name || "Widget",
      metrics: [],
      position: config.widgets.length,
    };
    updateConfig({ widgets: [...config.widgets, widget] });
  };

  const removeWidget = (id: string) => {
    updateConfig({ widgets: config.widgets.filter((w) => w.id !== id) });
  };

  const toggleMetric = (metricId: string) => {
    const newMetrics = config.metrics.includes(metricId)
      ? config.metrics.filter((m) => m !== metricId)
      : [...config.metrics, metricId];
    updateConfig({ metrics: newMetrics });
  };

  const toggleDepartment = (deptId: string) => {
    const newDepts = config.filters.departments.includes(deptId)
      ? config.filters.departments.filter((d) => d !== deptId)
      : [...config.filters.departments, deptId];
    updateConfig({ filters: { ...config.filters, departments: newDepts } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">Criar Relatório Customizado</h2>
            <p className="text-sm text-muted-foreground">
              Passo {step} de {totalSteps}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={progress} className="w-32 h-2" />
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 1 && (
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="report-name">Nome do Relatório *</Label>
                    <Input
                      id="report-name"
                      value={config.name}
                      onChange={(e) => updateConfig({ name: e.target.value })}
                      placeholder="Ex: Análise Trimestral de Engajamento - Tech"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label>Tipo de Relatório</Label>
                    <RadioGroup
                      value={config.type}
                      onValueChange={(v) => updateConfig({ type: v as ReportType })}
                      className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2"
                    >
                      {[
                        { value: "dashboard", label: "Dashboard Interativo", icon: BarChart3 },
                        { value: "table", label: "Tabela de Dados", icon: Table2 },
                        { value: "chart", label: "Gráfico Único", icon: PieChart },
                        { value: "pdf", label: "Documento PDF", icon: FileText },
                        { value: "powerpoint", label: "Apresentação", icon: Presentation },
                      ].map((type) => (
                        <div key={type.value}>
                          <RadioGroupItem
                            value={type.value}
                            id={type.value}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={type.value}
                            className="flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50 transition-colors"
                          >
                            <type.icon className="w-5 h-5" />
                            <span className="text-xs text-center">{type.label}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Módulo Principal</Label>
                    <Select
                      value={config.module}
                      onValueChange={(v) => updateConfig({ module: v as typeof config.module, metrics: [] })}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engagement">Engajamento</SelectItem>
                        <SelectItem value="talents">Talentos</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Dados e Métricas</h3>
                
                <div className="space-y-6">
                  {/* Metrics Selection */}
                  <div>
                    <Label>Métricas Selecionadas ({config.metrics.length})</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {METRICS_BY_MODULE[config.module].map((metric) => (
                        <div
                          key={metric.id}
                          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            config.metrics.includes(metric.id)
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => toggleMetric(metric.id)}
                        >
                          <Checkbox checked={config.metrics.includes(metric.id)} />
                          <metric.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{metric.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Period */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Período</Label>
                      <RadioGroup
                        value={config.period}
                        onValueChange={(v) => updateConfig({ period: v as Period })}
                        className="mt-2 space-y-2"
                      >
                        {[
                          { value: "1m", label: "Último mês" },
                          { value: "3m", label: "Últimos 3 meses" },
                          { value: "6m", label: "Últimos 6 meses" },
                          { value: "1y", label: "Último ano" },
                          { value: "custom", label: "Personalizado" },
                        ].map((p) => (
                          <div key={p.value} className="flex items-center gap-2">
                            <RadioGroupItem value={p.value} id={`period-${p.value}`} />
                            <Label htmlFor={`period-${p.value}`} className="font-normal cursor-pointer">
                              {p.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                      
                      {config.period === "custom" && (
                        <div className="flex gap-2 mt-3">
                          <Input
                            type="date"
                            value={config.customDateStart}
                            onChange={(e) => updateConfig({ customDateStart: e.target.value })}
                          />
                          <Input
                            type="date"
                            value={config.customDateEnd}
                            onChange={(e) => updateConfig({ customDateEnd: e.target.value })}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Granularidade Temporal</Label>
                      <RadioGroup
                        value={config.granularity}
                        onValueChange={(v) => updateConfig({ granularity: v as Granularity })}
                        className="mt-2 space-y-2"
                      >
                        {[
                          { value: "weekly", label: "Semanal" },
                          { value: "monthly", label: "Mensal" },
                          { value: "quarterly", label: "Trimestral" },
                        ].map((g) => (
                          <div key={g.value} className="flex items-center gap-2">
                            <RadioGroupItem value={g.value} id={`gran-${g.value}`} />
                            <Label htmlFor={`gran-${g.value}`} className="font-normal cursor-pointer">
                              {g.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>

                  {/* Filters */}
                  <div>
                    <Label className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filtros
                    </Label>
                    <div className="mt-2 space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Departamentos</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {departments?.map((dept) => (
                            <Badge
                              key={dept.id}
                              variant={config.filters.departments.includes(dept.id) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => toggleDepartment(dept.id)}
                            >
                              {dept.name}
                            </Badge>
                          ))}
                          {(!departments || departments.length === 0) && (
                            <span className="text-sm text-muted-foreground">Nenhum departamento</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Visualização e Layout</h3>
                
                <div className="space-y-6">
                  {/* Layout */}
                  <div>
                    <Label>Layout</Label>
                    <RadioGroup
                      value={config.layout}
                      onValueChange={(v) => updateConfig({ layout: v as typeof config.layout })}
                      className="grid grid-cols-4 gap-3 mt-2"
                    >
                      {[
                        { value: "1col", label: "1 Coluna" },
                        { value: "2col", label: "2 Colunas" },
                        { value: "3col", label: "3 Colunas" },
                        { value: "grid", label: "Grid Livre" },
                      ].map((l) => (
                        <div key={l.value}>
                          <RadioGroupItem value={l.value} id={l.value} className="peer sr-only" />
                          <Label
                            htmlFor={l.value}
                            className="flex flex-col items-center gap-2 p-3 border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex gap-1">
                              {Array.from({ length: l.value === "1col" ? 1 : l.value === "2col" ? 2 : 3 }).map((_, i) => (
                                <div key={i} className="w-3 h-6 bg-muted rounded" />
                              ))}
                            </div>
                            <span className="text-xs">{l.label}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Theme */}
                  <div>
                    <Label>Tema de Cores</Label>
                    <RadioGroup
                      value={config.theme}
                      onValueChange={(v) => updateConfig({ theme: v as typeof config.theme })}
                      className="flex gap-4 mt-2"
                    >
                      {[
                        { value: "light", label: "Claro" },
                        { value: "dark", label: "Escuro" },
                        { value: "auto", label: "Automático" },
                      ].map((t) => (
                        <div key={t.value} className="flex items-center gap-2">
                          <RadioGroupItem value={t.value} id={`theme-${t.value}`} />
                          <Label htmlFor={`theme-${t.value}`} className="font-normal cursor-pointer">
                            {t.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Widgets */}
                  <div>
                    <Label className="flex items-center gap-2">
                      <Settings2 className="w-4 h-4" />
                      Widgets Incluídos
                    </Label>
                    
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2 mb-4">
                      {WIDGET_TYPES.map((widget) => (
                        <Button
                          key={widget.id}
                          variant="outline"
                          size="sm"
                          className="gap-2 text-xs"
                          onClick={() => addWidget(widget.id)}
                        >
                          <widget.icon className="w-3 h-3" />
                          {widget.name}
                        </Button>
                      ))}
                    </div>

                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {config.widgets.map((widget, index) => (
                          <div
                            key={widget.id}
                            className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
                          >
                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-medium">{widget.title}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Posição: {index + 1}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeWidget(widget.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {config.widgets.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Adicione widgets clicando nos botões acima</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {step === 4 && (
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Compartilhamento e Agendamento</h3>
                
                <div className="space-y-6">
                  {/* Save to Library */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Save className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Salvar na Biblioteca de Relatórios</p>
                        <p className="text-sm text-muted-foreground">
                          Disponível para consultas futuras
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={config.sharing.saveToLibrary}
                      onCheckedChange={(v) =>
                        updateConfig({ sharing: { ...config.sharing, saveToLibrary: v } })
                      }
                    />
                  </div>

                  {/* Schedule */}
                  <div className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Agendar envio automático</p>
                          <p className="text-sm text-muted-foreground">
                            Enviar relatório periodicamente por email
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={config.sharing.scheduleEnabled}
                        onCheckedChange={(v) =>
                          updateConfig({ sharing: { ...config.sharing, scheduleEnabled: v } })
                        }
                      />
                    </div>

                    {config.sharing.scheduleEnabled && (
                      <div className="grid md:grid-cols-3 gap-4 pt-2">
                        <div>
                          <Label>Frequência</Label>
                          <Select
                            value={config.sharing.scheduleFrequency}
                            onValueChange={(v) =>
                              updateConfig({
                                sharing: { ...config.sharing, scheduleFrequency: v as typeof config.sharing.scheduleFrequency },
                              })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Diário</SelectItem>
                              <SelectItem value="weekly">Semanal</SelectItem>
                              <SelectItem value="monthly">Mensal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Dia</Label>
                          <Select
                            value={config.sharing.scheduleDay}
                            onValueChange={(v) =>
                              updateConfig({
                                sharing: { ...config.sharing, scheduleDay: v },
                              })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monday">Segunda-feira</SelectItem>
                              <SelectItem value="first_monday">Primeira segunda-feira</SelectItem>
                              <SelectItem value="last_friday">Última sexta-feira</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Hora</Label>
                          <Input
                            type="time"
                            value={config.sharing.scheduleTime || "09:00"}
                            onChange={(e) =>
                              updateConfig({
                                sharing: { ...config.sharing, scheduleTime: e.target.value },
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Public Link */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <LinkIcon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Gerar link público (somente leitura)</p>
                        <p className="text-sm text-muted-foreground">
                          Compartilhar externamente sem login
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {config.sharing.publicLinkEnabled && (
                        <Select
                          value={String(config.sharing.publicLinkExpiry || 30)}
                          onValueChange={(v) =>
                            updateConfig({
                              sharing: { ...config.sharing, publicLinkExpiry: Number(v) },
                            })
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 dias</SelectItem>
                            <SelectItem value="30">30 dias</SelectItem>
                            <SelectItem value="90">90 dias</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <Switch
                        checked={config.sharing.publicLinkEnabled}
                        onCheckedChange={(v) =>
                          updateConfig({ sharing: { ...config.sharing, publicLinkEnabled: v } })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={step === 1 ? onBack : () => setStep((s) => s - 1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {step === 1 ? "Cancelar" : "Voltar"}
        </Button>

        <div className="flex gap-2">
          {step < totalSteps ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <>
              <Button variant="outline" className="gap-2">
                <Eye className="w-4 h-4" />
                Pré-visualizar
              </Button>
              <Button onClick={() => onSave(config)} className="gap-2">
                <Save className="w-4 h-4" />
                Salvar e Gerar
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export type { ReportConfig, Widget };
