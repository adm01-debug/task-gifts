import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useDemographics } from "@/hooks/useDemographics";
import { LoadingState } from "@/components/ui/loading-state";
import { Plus, Edit, Trash2, Eye, Globe, BarChart3, Lock, ChevronDown, ChevronUp } from "lucide-react";

interface DemographicOption {
  pt: string;
  en: string;
  es: string;
}

interface AttributeFormData {
  name: string;
  name_en: string;
  name_es: string;
  attribute_type: string;
  is_required: boolean;
  is_visible_in_reports: boolean;
  allow_prefer_not_answer: boolean;
  is_restricted: boolean;
  options: DemographicOption[];
}

const defaultFormData: AttributeFormData = {
  name: '',
  name_en: '',
  name_es: '',
  attribute_type: 'select',
  is_required: false,
  is_visible_in_reports: true,
  allow_prefer_not_answer: true,
  is_restricted: false,
  options: [],
};

export const DemographicsManager = () => {
  const { attributes, isLoading, createAttribute, updateAttribute, getAttributeStats } = useDemographics();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<string | null>(null);
  const [expandedAttribute, setExpandedAttribute] = useState<string | null>(null);
  const [formData, setFormData] = useState<AttributeFormData>(defaultFormData);

  // Mock stats for display
  const mockStats: Record<string, { total: number; filled: number; distribution: Record<string, number> }> = {
    gender: { total: 150, filled: 142, distribution: { 'Masculino': 78, 'Feminino': 60, 'Prefiro não informar': 4 } },
    location: { total: 150, filled: 150, distribution: { 'São Paulo': 85, 'Rio de Janeiro': 35, 'Belo Horizonte': 20, 'Remoto': 10 } },
    education: { total: 150, filled: 130, distribution: { 'Superior Completo': 80, 'Pós-Graduação': 35, 'Ensino Médio': 15 } },
  };

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { pt: '', en: '', es: '' }],
    });
  };

  const handleRemoveOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  };

  const handleOptionChange = (index: number, lang: 'pt' | 'en' | 'es', value: string) => {
    const newOptions = [...formData.options];
    newOptions[index][lang] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = () => {
    if (editingAttribute) {
      updateAttribute({
        id: editingAttribute,
        updates: {
          name: formData.name,
          name_en: formData.name_en,
          name_es: formData.name_es,
          attribute_type: formData.attribute_type,
          is_required: formData.is_required,
          is_visible_in_reports: formData.is_visible_in_reports,
          allow_prefer_not_answer: formData.allow_prefer_not_answer,
          is_restricted: formData.is_restricted,
          options: formData.options.map(o => ({ value: o.pt, label: o.pt })),
        },
      });
    } else {
      createAttribute({
        name: formData.name,
        name_en: formData.name_en,
        name_es: formData.name_es,
        attribute_type: formData.attribute_type,
        is_required: formData.is_required,
        is_visible_in_reports: formData.is_visible_in_reports,
        allow_prefer_not_answer: formData.allow_prefer_not_answer,
        is_restricted: formData.is_restricted,
        options: formData.options.map(o => ({ value: o.pt, label: o.pt })),
        order_index: attributes.length,
        is_active: true,
      });
    }
    setShowCreateDialog(false);
    setEditingAttribute(null);
    setFormData(defaultFormData);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'select': return 'Seleção Única';
      case 'multi_select': return 'Seleção Múltipla';
      case 'text': return 'Texto Livre';
      case 'number': return 'Número';
      case 'date': return 'Data';
      case 'calculated': return 'Calculado';
      default: return type;
    }
  };

  if (isLoading) return <LoadingState message="Carregando atributos..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Atributos Demográficos</h2>
          <p className="text-muted-foreground">
            Campos personalizados para segmentar análises de engajamento, clima e performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Importar</Button>
          <Button variant="outline">Exportar</Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" /> Criar Atributo
          </Button>
        </div>
      </div>

      {/* Anonymity Protection Notice */}
      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200">
        <CardContent className="p-4 flex items-center gap-3">
          <Lock className="h-5 w-5 text-amber-600" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            💡 <strong>Proteção de Anonimato:</strong> Grupos com menos de 5 pessoas não exibem dados segmentados para proteger identidade individual.
          </p>
        </CardContent>
      </Card>

      {/* Attributes List */}
      <div className="space-y-4">
        {attributes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Nenhum atributo demográfico configurado. Crie o primeiro!
            </CardContent>
          </Card>
        ) : (
          attributes.map((attr) => {
            const stats = mockStats[attr.name.toLowerCase()] || { total: 150, filled: 0, distribution: {} };
            const fillRate = (stats.filled / stats.total) * 100;
            const isExpanded = expandedAttribute === attr.id;

            return (
              <Card key={attr.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{attr.name}</CardTitle>
                      <Badge variant="outline">{getTypeLabel(attr.attribute_type)}</Badge>
                      {attr.is_required && <Badge>Obrigatório</Badge>}
                      {attr.is_restricted && <Badge variant="secondary"><Lock className="h-3 w-3 mr-1" /> Restrito</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setExpandedAttribute(isExpanded ? null : attr.id)}>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        {isExpanded ? 'Recolher' : 'Expandir'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditingAttribute(attr.id);
                        setFormData({
                          name: attr.name,
                          name_en: attr.name_en || '',
                          name_es: attr.name_es || '',
                          attribute_type: attr.attribute_type,
                          is_required: attr.is_required,
                          is_visible_in_reports: attr.is_visible_in_reports,
                          allow_prefer_not_answer: attr.allow_prefer_not_answer,
                          is_restricted: attr.is_restricted,
                          options: (attr.options || []).map((o: { value: string; label: string }) => ({ pt: o.label, en: '', es: '' })),
                        });
                        setShowCreateDialog(true);
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Fill Rate */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Preenchimento:</span>
                        <span>{stats.filled}/{stats.total} ({fillRate.toFixed(0)}%)</span>
                      </div>
                      <Progress value={fillRate} className="h-2" />
                    </div>

                    {/* Options Preview */}
                    {attr.options && attr.options.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Opções ({attr.options.length}):</p>
                        <div className="flex flex-wrap gap-2">
                          {attr.options.slice(0, 5).map((option: { value: string; label: string }, i: number) => (
                            <Badge key={i} variant="secondary">{option.label}</Badge>
                          ))}
                          {attr.options.length > 5 && (
                            <Badge variant="outline">+{attr.options.length - 5} mais</Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Expanded: Distribution */}
                    {isExpanded && Object.keys(stats.distribution).length > 0 && (
                      <Card className="mt-4">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" /> Distribuição
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Object.entries(stats.distribution).map(([key, value]) => (
                              <div key={key} className="flex items-center gap-3">
                                <span className="w-32 text-sm truncate">{key}</span>
                                <Progress value={(value / stats.filled) * 100} className="flex-1 h-3" />
                                <span className="text-sm text-muted-foreground w-16 text-right">
                                  {value} ({((value / stats.filled) * 100).toFixed(0)}%)
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Multilingual indicator */}
                    {(attr.name_en || attr.name_es) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <span>Multilíngue: PT</span>
                        {attr.name_en && <Badge variant="outline" className="text-xs">EN</Badge>}
                        {attr.name_es && <Badge variant="outline" className="text-xs">ES</Badge>}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open);
        if (!open) {
          setEditingAttribute(null);
          setFormData(defaultFormData);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAttribute ? 'Editar' : 'Criar'} Atributo Demográfico</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Multilingual Name */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Nome (Multilíngue)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Português *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Escolaridade"
                  />
                </div>
                <div className="space-y-2">
                  <Label>English</Label>
                  <Input
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder="Ex: Education Level"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Español</Label>
                  <Input
                    value={formData.name_es}
                    onChange={(e) => setFormData({ ...formData, name_es: e.target.value })}
                    placeholder="Ex: Nivel Educativo"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Type */}
            <div className="space-y-2">
              <Label>Tipo de Atributo *</Label>
              <Select
                value={formData.attribute_type}
                onValueChange={(v) => setFormData({ ...formData, attribute_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select">Seleção Única</SelectItem>
                  <SelectItem value="multi_select">Seleção Múltipla</SelectItem>
                  <SelectItem value="text">Texto Livre</SelectItem>
                  <SelectItem value="number">Número</SelectItem>
                  <SelectItem value="date">Data</SelectItem>
                  <SelectItem value="calculated">Calculado Automaticamente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Options for select types */}
            {(formData.attribute_type === 'select' || formData.attribute_type === 'multi_select') && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">📋 Opções (Multilíngue)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Opção {index + 1}</span>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveOption(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          placeholder="Português"
                          value={option.pt}
                          onChange={(e) => handleOptionChange(index, 'pt', e.target.value)}
                        />
                        <Input
                          placeholder="English"
                          value={option.en}
                          onChange={(e) => handleOptionChange(index, 'en', e.target.value)}
                        />
                        <Input
                          placeholder="Español"
                          value={option.es}
                          onChange={(e) => handleOptionChange(index, 'es', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={handleAddOption} className="w-full">
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Opção
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Settings */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">⚙️ Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Obrigatório (colaborador deve preencher)</Label>
                  <Switch
                    checked={formData.is_required}
                    onCheckedChange={(c) => setFormData({ ...formData, is_required: c })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Visível em relatórios de engajamento</Label>
                  <Switch
                    checked={formData.is_visible_in_reports}
                    onCheckedChange={(c) => setFormData({ ...formData, is_visible_in_reports: c })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Permitir "Prefiro não informar"</Label>
                  <Switch
                    checked={formData.allow_prefer_not_answer}
                    onCheckedChange={(c) => setFormData({ ...formData, allow_prefer_not_answer: c })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Restrito (apenas RH visualiza)</Label>
                  <Switch
                    checked={formData.is_restricted}
                    onCheckedChange={(c) => setFormData({ ...formData, is_restricted: c })}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={!formData.name}>
                {editingAttribute ? 'Salvar Alterações' : 'Criar Atributo'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
