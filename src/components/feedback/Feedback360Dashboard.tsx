import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFeedback360 } from "@/hooks/useFeedback360";
import { Users, ClipboardCheck, BarChart3, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Feedback360Dashboard = () => {
  const { cycles, pendingRequests, receivedFeedback, isLoading, createCycle, startCycle } = useFeedback360();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCycle, setNewCycle] = useState({ name: '', description: '', starts_at: '', ends_at: '' });

  const activeCycles = cycles.filter(c => c.status === 'active');

  const handleCreateCycle = () => {
    if (!newCycle.name || !newCycle.starts_at || !newCycle.ends_at) return;
    createCycle({ 
      name: newCycle.name, 
      description: newCycle.description, 
      starts_at: newCycle.starts_at, 
      ends_at: newCycle.ends_at,
      questions: [],
    });
    setIsDialogOpen(false);
    setNewCycle({ name: '', description: '', starts_at: '', ends_at: '' });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      draft: { variant: 'outline', label: 'Rascunho' },
      active: { variant: 'default', label: 'Ativo' },
      collecting: { variant: 'secondary', label: 'Coletando' },
      completed: { variant: 'default', label: 'Concluído' },
    };
    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg"><Users className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{activeCycles.length}</p>
                <p className="text-sm text-muted-foreground">Ciclos Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg"><Clock className="h-5 w-5 text-amber-500" /></div>
              <div>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
                <p className="text-sm text-muted-foreground">Feedbacks Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg"><CheckCircle className="h-5 w-5 text-green-500" /></div>
              <div>
                <p className="text-2xl font-bold">{receivedFeedback.filter(f => f.status === 'submitted').length}</p>
                <p className="text-sm text-muted-foreground">Feedbacks Recebidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg"><BarChart3 className="h-5 w-5 text-blue-500" /></div>
              <div>
                <p className="text-2xl font-bold">{cycles.length}</p>
                <p className="text-sm text-muted-foreground">Total de Ciclos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="cycles" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="cycles">Ciclos</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="received">Recebidos</TabsTrigger>
          </TabsList>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Novo Ciclo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Ciclo de Avaliação 360°</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div><Label>Nome</Label><Input value={newCycle.name} onChange={e => setNewCycle(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Avaliação Q4 2024" /></div>
                <div><Label>Descrição</Label><Textarea value={newCycle.description} onChange={e => setNewCycle(p => ({ ...p, description: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Início</Label><Input type="date" value={newCycle.starts_at} onChange={e => setNewCycle(p => ({ ...p, starts_at: e.target.value }))} /></div>
                  <div><Label>Fim</Label><Input type="date" value={newCycle.ends_at} onChange={e => setNewCycle(p => ({ ...p, ends_at: e.target.value }))} /></div>
                </div>
                <Button className="w-full" onClick={handleCreateCycle}>Criar Ciclo</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="cycles" className="space-y-4">
          {cycles.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum ciclo de avaliação encontrado</CardContent></Card>
          ) : (
            cycles.map(cycle => (
              <Card key={cycle.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{cycle.name}</CardTitle>
                      <CardDescription>{cycle.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(cycle.status)}
                      {cycle.status === 'draft' && (
                        <Button size="sm" variant="outline" onClick={() => startCycle(cycle.id)}>Iniciar</Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>Início: {format(new Date(cycle.starts_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                    <span>Fim: {format(new Date(cycle.ends_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum feedback pendente</CardContent></Card>
          ) : (
            pendingRequests.map(request => (
              <Card key={request.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="font-medium">Feedback Pendente</p>
                        <p className="text-sm text-muted-foreground">Tipo: {request.relationship}</p>
                      </div>
                    </div>
                    <Button>Responder</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="received" className="space-y-4">
          {receivedFeedback.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum feedback recebido</CardContent></Card>
          ) : (
            receivedFeedback.filter(f => f.status === 'submitted').map(feedback => (
              <Card key={feedback.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Feedback de {feedback.relationship}</p>
                      <p className="text-sm text-muted-foreground">Recebido em {format(new Date(feedback.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
                    </div>
                    <Badge variant="default">Recebido</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
