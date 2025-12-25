import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useDemographics } from "@/hooks/useDemographics";
import { useAuth } from "@/hooks/useAuth";
import { Users, Plus, Settings, BarChart3 } from "lucide-react";

export const DemographicsManager = () => {
  const { user } = useAuth();
  const { attributes, userValues, isLoading, createAttribute, updateAttribute, setValue, getUserValue } = useDemographics();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAttribute, setNewAttribute] = useState({
    name: '',
    attribute_type: 'text',
    is_required: false,
    is_active: true,
    is_restricted: false,
    is_visible_in_reports: true,
    allow_prefer_not_answer: true,
    order_index: 0,
  });

  const handleCreateAttribute = () => {
    createAttribute(newAttribute);
    setIsDialogOpen(false);
    setNewAttribute({
      name: '',
      attribute_type: 'text',
      is_required: false,
      is_active: true,
      is_restricted: false,
      is_visible_in_reports: true,
      allow_prefer_not_answer: true,
      order_index: 0,
    });
  };

  const handleValueChange = (attributeId: string, value: string) => {
    setValue({ attributeId, value });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Atributos Demográficos</h2>
          <p className="text-muted-foreground">Gerencie atributos para segmentação e análise</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Novo Atributo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Atributo Demográfico</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input value={newAttribute.name} onChange={e => setNewAttribute(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Geração, Localidade..." />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={newAttribute.attribute_type} onValueChange={v => setNewAttribute(p => ({ ...p, attribute_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="select">Seleção</SelectItem>
                    <SelectItem value="multi_select">Múltipla Seleção</SelectItem>
                    <SelectItem value="number">Número</SelectItem>
                    <SelectItem value="date">Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Obrigatório</Label>
                <Switch checked={newAttribute.is_required} onCheckedChange={v => setNewAttribute(p => ({ ...p, is_required: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Visível em Relatórios</Label>
                <Switch checked={newAttribute.is_visible_in_reports} onCheckedChange={v => setNewAttribute(p => ({ ...p, is_visible_in_reports: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Permitir "Prefiro não responder"</Label>
                <Switch checked={newAttribute.allow_prefer_not_answer} onCheckedChange={v => setNewAttribute(p => ({ ...p, allow_prefer_not_answer: v }))} />
              </div>
              <Button className="w-full" onClick={handleCreateAttribute}>Criar Atributo</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg"><Users className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{attributes.length}</p>
                <p className="text-sm text-muted-foreground">Atributos Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg"><Settings className="h-5 w-5 text-amber-500" /></div>
              <div>
                <p className="text-2xl font-bold">{attributes.filter(a => a.is_required).length}</p>
                <p className="text-sm text-muted-foreground">Obrigatórios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg"><BarChart3 className="h-5 w-5 text-green-500" /></div>
              <div>
                <p className="text-2xl font-bold">{attributes.filter(a => a.is_visible_in_reports).length}</p>
                <p className="text-sm text-muted-foreground">Em Relatórios</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attributes List */}
      <Card>
        <CardHeader>
          <CardTitle>Atributos Configurados</CardTitle>
        </CardHeader>
        <CardContent>
          {attributes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum atributo configurado</p>
          ) : (
            <div className="space-y-4">
              {attributes.map(attr => (
                <div key={attr.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{attr.name}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{attr.attribute_type}</Badge>
                      {attr.is_required && <Badge variant="destructive">Obrigatório</Badge>}
                      {attr.is_restricted && <Badge variant="secondary">Restrito</Badge>}
                      {attr.is_visible_in_reports && <Badge variant="default">Relatórios</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {attr.attribute_type === 'text' && (
                      <Input placeholder="Seu valor..." value={getUserValue(attr.id) || ''} onChange={(e) => handleValueChange(attr.id, e.target.value)} className="w-48" />
                    )}
                    {attr.attribute_type === 'select' && attr.options && (
                      <Select value={getUserValue(attr.id)} onValueChange={(v) => handleValueChange(attr.id, v)}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                          {attr.options.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                          {attr.allow_prefer_not_answer && <SelectItem value="prefer_not_answer">Prefiro não responder</SelectItem>}
                        </SelectContent>
                      </Select>
                    )}
                    <Switch checked={attr.is_active} onCheckedChange={(checked) => updateAttribute({ id: attr.id, updates: { is_active: checked } })} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
