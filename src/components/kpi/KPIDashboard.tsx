import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useKPIs, useKPIDetail } from "@/hooks/useKPIs";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { 
  TrendingUp, TrendingDown, Minus, Plus, Settings, 
  BarChart3, Target, FileText, Download, Eye
} from "lucide-react";
import type { KPI } from "@/services/kpiService";

interface KPICardProps {
  kpi: KPI;
  onViewDetail: (kpi: KPI) => void;
  formatValue: (value: number, unit: KPI['unit']) => string;
  getStatusIcon: (status: KPI['status']) => string;
}

const KPICard = ({ kpi, onViewDetail, formatValue, getStatusIcon }: KPICardProps) => {
  const progressPercent = Math.min((kpi.current_value / kpi.target_value) * 100, 100);
  
  return (
    <div className="p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">{kpi.name}</span>
        <Badge variant={kpi.status === 'excellent' ? 'default' : kpi.status === 'good' ? 'secondary' : 'destructive'}>
          {getStatusIcon(kpi.status)} {kpi.status === 'excellent' ? 'Excelente' : kpi.status === 'good' ? 'Bom' : kpi.status === 'warning' ? 'Atenção' : 'Crítico'}
        </Badge>
      </div>
      
      <div className="flex items-center gap-4 mb-2">
        <span className="text-2xl font-bold">
          {formatValue(kpi.current_value, kpi.unit)}
        </span>
        <span className="text-sm text-muted-foreground">
          (meta: {formatValue(kpi.target_value, kpi.unit)})
        </span>
        {kpi.trend_percentage !== undefined && (
          <span className={`flex items-center text-sm ${kpi.trend === 'up' ? 'text-green-500' : kpi.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}`}>
            {kpi.trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : kpi.trend === 'down' ? <TrendingDown className="h-4 w-4 mr-1" /> : <Minus className="h-4 w-4 mr-1" />}
            {kpi.trend === 'up' ? '+' : ''}{kpi.trend_percentage?.toFixed(1)}% vs mês anterior
          </span>
        )}
      </div>
      
      <Progress value={progressPercent} className="h-2 mb-2" />
      
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => onViewDetail(kpi)}>
          <Eye className="h-4 w-4 mr-1" /> Ver Detalhes
        </Button>
      </div>
    </div>
  );
};

interface KPIDetailDialogProps {
  kpi: KPI | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const KPIDetailDialog = ({ kpi, open, onOpenChange }: KPIDetailDialogProps) => {
  const { history } = useKPIDetail(kpi?.id || '');
  const { formatValue, getStatusIcon, updateKPIValue } = useKPIs();
  const [newValue, setNewValue] = useState('');

  if (!kpi) return null;

  const handleUpdateValue = () => {
    const value = parseFloat(newValue);
    if (!isNaN(value)) {
      updateKPIValue({ id: kpi.id, value });
      setNewValue('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>KPI: {kpi.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Valor Atual</p>
              <p className="text-3xl font-bold">
                {formatValue(kpi.current_value, kpi.unit)} {getStatusIcon(kpi.status)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Meta</p>
              <p className="text-xl">{formatValue(kpi.target_value, kpi.unit)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Última Atualização</p>
              <p className="text-sm">{new Date(kpi.last_updated).toLocaleString('pt-BR')}</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">📈 Tendência (6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="flex items-end gap-2 h-32">
                  {history.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-primary rounded-t"
                        style={{ height: `${(h.value / Math.max(...history.map(x => x.value))) * 100}%` }}
                      />
                      <span className="text-xs text-muted-foreground">{h.month}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Sem histórico disponível</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">📊 Análise Estatística</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Variação mensal:</span>
                  <span className={`ml-2 ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {kpi.trend === 'up' ? '↑' : '↓'} {kpi.trend_percentage?.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Owner:</span>
                  <span className="ml-2">{kpi.owner_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Categoria:</span>
                  <span className="ml-2">{kpi.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Frequência:</span>
                  <span className="ml-2">{kpi.update_frequency === 'daily' ? 'Diária' : kpi.update_frequency === 'weekly' ? 'Semanal' : 'Mensal'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {kpi.data_source === 'manual' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">✏️ Atualizar Valor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Novo valor"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                  />
                  <Button onClick={handleUpdateValue}>Atualizar</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface CreateKPIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateKPIDialog = ({ open, onOpenChange }: CreateKPIDialogProps) => {
  const { createKPI, categories } = useKPIs();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: 'percentage' as KPI['unit'],
    data_source: 'manual' as KPI['data_source'],
    target_value: 0,
    current_value: 0,
    critical_threshold: 0,
    warning_threshold: 0,
    good_threshold: 0,
    excellent_threshold: 0,
    update_frequency: 'daily' as KPI['update_frequency'],
    is_visible_dashboard: true,
    is_visible_reports: true,
  });

  const handleSubmit = () => {
    createKPI({
      ...formData,
      owner_id: '1',
      owner_name: 'Usuário Atual',
      last_updated: new Date().toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Novo KPI</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do KPI *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Taxa de Conversão"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                  <SelectItem value="Nova Categoria">+ Nova Categoria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">📊 Métrica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Unidade</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(v) => setFormData({ ...formData, unit: v as KPI['unit'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">% Percentual</SelectItem>
                      <SelectItem value="currency">R$ Moeda</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="hours">Horas</SelectItem>
                      <SelectItem value="score">Pontuação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fonte de Dados</Label>
                  <Select
                    value={formData.data_source}
                    onValueChange={(v) => setFormData({ ...formData, data_source: v as KPI['data_source'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="sheets">Google Sheets</SelectItem>
                      <SelectItem value="sql">SQL Query</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">🎯 Metas e Alertas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>🔴 Crítico (abaixo de)</Label>
                  <Input
                    type="number"
                    value={formData.critical_threshold}
                    onChange={(e) => setFormData({ ...formData, critical_threshold: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>🟡 Atenção (abaixo de)</Label>
                  <Input
                    type="number"
                    value={formData.warning_threshold}
                    onChange={(e) => setFormData({ ...formData, warning_threshold: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>🟢 Bom (acima de)</Label>
                  <Input
                    type="number"
                    value={formData.good_threshold}
                    onChange={(e) => setFormData({ ...formData, good_threshold: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>⭐ Excelente (acima de)</Label>
                  <Input
                    type="number"
                    value={formData.excellent_threshold}
                    onChange={(e) => setFormData({ ...formData, excellent_threshold: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Meta do período</Label>
                <Input
                  type="number"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: parseFloat(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">⏱️ Frequência de Atualização</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.update_frequency}
                onValueChange={(v) => setFormData({ ...formData, update_frequency: v as KPI['update_frequency'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diária</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Visível no Dashboard principal</Label>
              <Switch
                checked={formData.is_visible_dashboard}
                onCheckedChange={(c) => setFormData({ ...formData, is_visible_dashboard: c })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Visível em Relatórios</Label>
              <Switch
                checked={formData.is_visible_reports}
                onCheckedChange={(c) => setFormData({ ...formData, is_visible_reports: c })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>Salvar KPI</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const KPIDashboard = () => {
  const { kpis, categories, isLoading, formatValue, getStatusIcon } = useKPIs();
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  if (isLoading) {
    return <LoadingState message="Carregando KPIs..." />;
  }

  const groupedKPIs = categories.reduce((acc, category) => {
    acc[category] = kpis.filter(k => k.category === category);
    return acc;
  }, {} as Record<string, KPI[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Painel de KPIs</h2>
          <p className="text-muted-foreground">Indicadores-chave de performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
              <SelectItem value="quarter">Este trimestre</SelectItem>
              <SelectItem value="year">Este ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" /> Adicionar KPI
          </Button>
        </div>
      </div>

      {Object.entries(groupedKPIs).map(([category, categoryKPIs]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {category === 'Vendas' ? '💰' : category === 'Customer Success' ? '🎯' : '⚙️'} {category}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {categoryKPIs.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="Nenhum KPI"
                description="Adicione KPIs para esta categoria"
              />
            ) : (
              categoryKPIs.map(kpi => (
                <KPICard
                  key={kpi.id}
                  kpi={kpi}
                  onViewDetail={setSelectedKPI}
                  formatValue={formatValue}
                  getStatusIcon={getStatusIcon}
                />
              ))
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-2">
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" /> Relatório
        </Button>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" /> Configurar
        </Button>
      </div>

      <KPIDetailDialog
        kpi={selectedKPI}
        open={!!selectedKPI}
        onOpenChange={(open) => !open && setSelectedKPI(null)}
      />

      <CreateKPIDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};
