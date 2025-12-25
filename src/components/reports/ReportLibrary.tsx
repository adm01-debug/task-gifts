import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  PieChart,
  Award,
  MessageSquare,
  GitBranch,
  Layers,
  Clock,
  Star,
  Play,
  Calendar,
  Filter,
  Search,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: "engagement" | "talents" | "performance";
  icon: React.ElementType;
  metrics: string[];
  popular?: boolean;
  lastUsed?: string;
  isFavorite?: boolean;
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  // Engajamento
  {
    id: "clima-organizacional",
    name: "Clima Organizacional",
    description: "Análise dos 10 pilares do clima com evolução temporal",
    category: "engagement",
    icon: TrendingUp,
    metrics: ["eNPS", "lNPS", "10 Pilares", "Participação"],
    popular: true,
  },
  {
    id: "enps-timeline",
    name: "eNPS Timeline",
    description: "Evolução do eNPS ao longo do tempo por departamento",
    category: "engagement",
    icon: BarChart3,
    metrics: ["eNPS", "Promotores", "Detratores", "Neutros"],
  },
  {
    id: "participacao-grupo",
    name: "Participação por Grupo",
    description: "Taxa de resposta em pesquisas segmentada por grupos",
    category: "engagement",
    icon: Users,
    metrics: ["Taxa Resposta", "Tempo Médio", "Grupos"],
  },
  {
    id: "benchmark-setorial",
    name: "Benchmark Setorial",
    description: "Comparação com médias do mercado e setor",
    category: "engagement",
    icon: Target,
    metrics: ["eNPS Mercado", "Clima Setor", "Posição Ranking"],
  },
  {
    id: "evolucao-cultural",
    name: "Evolução Cultural",
    description: "Transformação dos valores e comportamentos",
    category: "engagement",
    icon: Layers,
    metrics: ["Valores", "Comportamentos", "Aderência"],
  },
  {
    id: "opinioes-sentimentos",
    name: "Opiniões e Sentimentos",
    description: "Análise qualitativa de feedbacks e opiniões",
    category: "engagement",
    icon: MessageSquare,
    metrics: ["Sentimento", "Temas", "Word Cloud"],
  },
  // Talentos
  {
    id: "nine-box-matrix",
    name: "Performance 9-Box Matrix",
    description: "Distribuição de talentos no Nine Box",
    category: "talents",
    icon: PieChart,
    metrics: ["Distribuição", "High Potentials", "Low Performers"],
    popular: true,
  },
  {
    id: "distribuicao-avaliacoes",
    name: "Distribuição de Avaliações",
    description: "Notas e ratings de avaliações 360°",
    category: "talents",
    icon: BarChart3,
    metrics: ["Média Geral", "Por Competência", "Comparativo"],
  },
  {
    id: "pdi-conclusao",
    name: "Taxa de Conclusão PDI",
    description: "Progresso dos Planos de Desenvolvimento Individual",
    category: "talents",
    icon: Target,
    metrics: ["Conclusão", "Em Andamento", "Atrasados"],
  },
  {
    id: "feedback-report",
    name: "Feedback Report",
    description: "Feedbacks enviados e recebidos por colaborador",
    category: "talents",
    icon: MessageSquare,
    metrics: ["Enviados", "Recebidos", "Tipos"],
  },
  {
    id: "pipeline-sucessao",
    name: "Pipeline de Sucessão",
    description: "Mapeamento de sucessores para posições-chave",
    category: "talents",
    icon: GitBranch,
    metrics: ["Posições Críticas", "Sucessores", "Readiness"],
  },
  {
    id: "gaps-competencias",
    name: "Análise de Gaps",
    description: "Lacunas de competências técnicas e comportamentais",
    category: "talents",
    icon: Layers,
    metrics: ["Gaps Técnicos", "Gaps Soft Skills", "Prioridades"],
  },
  // Performance
  {
    id: "okr-progress",
    name: "OKR Progress Report",
    description: "Status e progresso de OKRs por nível",
    category: "performance",
    icon: Target,
    metrics: ["On Track", "At Risk", "Behind"],
    popular: true,
  },
  {
    id: "kpi-dashboard",
    name: "KPI Dashboard Executivo",
    description: "Painel consolidado de indicadores-chave",
    category: "performance",
    icon: BarChart3,
    metrics: ["KPIs Críticos", "Tendências", "Alertas"],
  },
  {
    id: "status-iniciativas",
    name: "Status de Iniciativas",
    description: "Acompanhamento de projetos e iniciativas",
    category: "performance",
    icon: Layers,
    metrics: ["Iniciativas", "Cronograma", "Budget"],
  },
  {
    id: "burndown-chart",
    name: "Burn-down Chart",
    description: "Velocidade de entrega e previsibilidade",
    category: "performance",
    icon: TrendingUp,
    metrics: ["Velocity", "Burndown", "Previsão"],
  },
  {
    id: "roi-iniciativas",
    name: "ROI de Iniciativas",
    description: "Retorno sobre investimento dos projetos",
    category: "performance",
    icon: Award,
    metrics: ["ROI", "Custo", "Benefício"],
  },
  {
    id: "health-score-okrs",
    name: "Health Score OKRs",
    description: "Saúde geral dos OKRs da organização",
    category: "performance",
    icon: Star,
    metrics: ["Score Geral", "Por Time", "Histórico"],
  },
];

const categoryColors = {
  engagement: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  talents: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  performance: "bg-green-500/10 text-green-500 border-green-500/30",
};

const categoryLabels = {
  engagement: "Engajamento",
  talents: "Talentos",
  performance: "Performance",
};

interface ReportLibraryProps {
  onSelectReport: (template: ReportTemplate) => void;
  onCreateCustom: () => void;
}

export default function ReportLibrary({ onSelectReport, onCreateCustom }: ReportLibraryProps) {
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("all");

  const filteredTemplates = REPORT_TEMPLATES.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || t.category === category;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const popularTemplates = REPORT_TEMPLATES.filter((t) => t.popular);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Biblioteca de Relatórios</h2>
          <p className="text-sm text-muted-foreground">
            {REPORT_TEMPLATES.length} relatórios pré-configurados disponíveis
          </p>
        </div>
        <Button onClick={onCreateCustom} className="gap-2">
          <FileText className="w-4 h-4" />
          Criar Relatório Customizado
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar relatórios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="engagement">Engajamento</TabsTrigger>
            <TabsTrigger value="talents">Talentos</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Popular Templates */}
      {category === "all" && !search && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Star className="w-4 h-4" />
            Mais Utilizados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {popularTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="p-4 cursor-pointer hover:border-primary/50 transition-all group relative overflow-hidden"
                  onClick={() => onSelectReport(template)}
                >
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(template.id);
                      }}
                    >
                      {favorites.includes(template.id) ? (
                        <BookmarkCheck className="w-4 h-4 text-primary" />
                      ) : (
                        <Bookmark className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${categoryColors[template.category]}`}>
                      <template.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {template.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {template.metrics.slice(0, 3).map((metric) => (
                      <Badge key={metric} variant="secondary" className="text-xs">
                        {metric}
                      </Badge>
                    ))}
                    {template.metrics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.metrics.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 w-full gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Play className="w-3 h-3" />
                    Gerar Relatório
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All Templates */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <FileText className="w-4 h-4" />
          {category === "all" ? "Todos os Relatórios" : categoryLabels[category as keyof typeof categoryLabels]}
        </h3>
        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="p-4 cursor-pointer hover:border-primary/50 transition-all group"
                  onClick={() => onSelectReport(template)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${categoryColors[template.category]}`}>
                        <template.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">
                          {template.name}
                        </h4>
                        <Badge variant="outline" className="text-xs mt-1">
                          {categoryLabels[template.category]}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(template.id);
                      }}
                    >
                      {favorites.includes(template.id) ? (
                        <BookmarkCheck className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {template.description}
                  </p>
                  
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {template.metrics.slice(0, 2).map((metric) => (
                      <Badge key={metric} variant="secondary" className="text-[10px]">
                        {metric}
                      </Badge>
                    ))}
                    {template.metrics.length > 2 && (
                      <Badge variant="outline" className="text-[10px]">
                        +{template.metrics.length - 2}
                      </Badge>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum relatório encontrado</p>
          <Button variant="outline" className="mt-4" onClick={() => setSearch("")}>
            Limpar busca
          </Button>
        </div>
      )}
    </div>
  );
}

export { REPORT_TEMPLATES };
export type { ReportTemplate };
