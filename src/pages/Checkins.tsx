import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Calendar, Clock, CheckCircle2, MessageSquare, Star, Brain, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { useCheckins } from "@/hooks/useCheckins";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useProfiles } from "@/hooks/useProfiles";
import { useOneOnOnePreparationManual } from "@/hooks/useOneOnOnePreparation";
import { OneOnOnePreparationPanel } from "@/components/checkins/OneOnOnePreparationPanel";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobilePageLayout } from "@/components/mobile";
import { DesktopBackButton, GlobalBreadcrumbs } from "@/components/navigation";
import type { Checkin, ActionItem, CheckinTemplate } from "@/services/checkinsService";

interface Profile {
  id: string;
  display_name: string | null;
  email: string;
  avatar_url: string | null;
}

export default function Checkins() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { templates, checkins, upcomingCheckins, isLoading, createCheckin, completeCheckin, addActionItem, toggleActionItem, isCreating } = useCheckins();
  const { data: profiles } = useProfiles();
  const { toast } = useToast();
  const { preparation, isLoading: isPreparationLoading, prepare: prepareOneOnOne, clear: clearPreparation } = useOneOnOnePreparationManual();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreparationDialogOpen, setIsPreparationDialogOpen] = useState(false);
  const [selectedCheckin, setSelectedCheckin] = useState<Checkin | null>(null);
  const [newCheckin, setNewCheckin] = useState({
    employee_id: "",
    template_id: "",
    scheduled_at: "",
    notes: "",
  });
  const [responses, setResponses] = useState<Record<string, string | number>>({});
  const [moodRating, setMoodRating] = useState<number>(3);
  const [newActionItem, setNewActionItem] = useState("");

  const handlePrepareOneOnOne = async (employeeId: string) => {
    try {
      await prepareOneOnOne(employeeId);
      setIsPreparationDialogOpen(true);
    } catch {
      toast({ title: "Erro ao preparar 1:1", variant: "destructive" });
    }
  };

  const handleCreateCheckin = () => {
    if (!newCheckin.employee_id || !newCheckin.scheduled_at) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    createCheckin({
      employee_id: newCheckin.employee_id,
      template_id: newCheckin.template_id || undefined,
      scheduled_at: new Date(newCheckin.scheduled_at).toISOString(),
      notes: newCheckin.notes || undefined,
    });
    setNewCheckin({ employee_id: "", template_id: "", scheduled_at: "", notes: "" });
    setIsDialogOpen(false);
  };

  const handleCompleteCheckin = () => {
    if (!selectedCheckin) return;
    completeCheckin({
      id: selectedCheckin.id,
      responses,
      moodRating,
    });
    setSelectedCheckin(null);
    setResponses({});
    setMoodRating(3);
  };

  const handleAddActionItem = () => {
    if (!selectedCheckin || !newActionItem.trim()) return;
    addActionItem({
      checkinId: selectedCheckin.id,
      item: { text: newActionItem, completed: false },
    });
    setNewActionItem("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-500">Concluído</Badge>;
      case "in_progress":
        return <Badge variant="default" className="bg-blue-500">Em Andamento</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">Agendado</Badge>;
    }
  };

  const moodEmojis = ["😢", "😕", "😐", "🙂", "😄"];

  const CheckinCard = ({ checkin }: { checkin: Checkin }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedCheckin(checkin)}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={checkin.employee?.avatar_url || undefined} />
                <AvatarFallback>
                  {checkin.employee?.display_name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">
                  1:1 com {checkin.employee?.display_name || "Colaborador"}
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(checkin.scheduled_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                </CardDescription>
              </div>
            </div>
            {getStatusBadge(checkin.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checkin.notes && (
              <p className="text-sm text-muted-foreground line-clamp-2">{checkin.notes}</p>
            )}
            
            {checkin.mood_rating && (
              <div className="flex items-center gap-2 text-sm">
                <span>Humor:</span>
                <span className="text-lg">{moodEmojis[checkin.mood_rating - 1]}</span>
              </div>
            )}

            {checkin.action_items && checkin.action_items.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {(checkin.action_items as ActionItem[]).filter((a) => a.completed).length}/{checkin.action_items.length} ações concluídas
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-primary">
              <Star className="h-4 w-4" />
              <span>{checkin.xp_reward} XP ao concluir</span>
            </div>

            {checkin.status !== "completed" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrepareOneOnOne(checkin.employee_id);
                }}
                disabled={isPreparationLoading}
              >
                <Brain className="h-4 w-4" />
                {isPreparationLoading ? "Preparando..." : "Preparar com IA"}
                <Sparkles className="h-3 w-3 text-primary" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const pageContent = (
    <main className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total</p>
                <p className="text-xl md:text-2xl font-bold">{checkins.length}</p>
              </div>
              <Users className="h-6 w-6 md:h-8 md:w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Próximos</p>
                <p className="text-xl md:text-2xl font-bold text-blue-600">{upcomingCheckins.length}</p>
              </div>
              <Calendar className="h-6 w-6 md:h-8 md:w-8 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Concluídos</p>
                <p className="text-xl md:text-2xl font-bold text-green-600">
                  {checkins.filter((c) => c.status === "completed").length}
                </p>
              </div>
              <CheckCircle2 className="h-6 w-6 md:h-8 md:w-8 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Templates</p>
                <p className="text-xl md:text-2xl font-bold">{templates.length}</p>
              </div>
              <MessageSquare className="h-6 w-6 md:h-8 md:w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Check-in
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Agendar Check-in 1:1</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Colaborador *</Label>
                  <Select value={newCheckin.employee_id} onValueChange={(v) => setNewCheckin({ ...newCheckin, employee_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um colaborador" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles?.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {(profile as Profile).display_name || (profile as Profile).email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Template (opcional)</Label>
                  <Select value={newCheckin.template_id} onValueChange={(v) => setNewCheckin({ ...newCheckin, template_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {(template as CheckinTemplate).name}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data e Hora *</Label>
                  <Input
                    type="datetime-local"
                    value={newCheckin.scheduled_at}
                    onChange={(e) => setNewCheckin({ ...newCheckin, scheduled_at: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Notas</Label>
                  <Textarea
                    value={newCheckin.notes}
                    onChange={(e) => setNewCheckin({ ...newCheckin, notes: e.target.value })}
                    placeholder="Observações para a reunião..."
                  />
                </div>
                <Button onClick={handleCreateCheckin} className="w-full" disabled={isCreating}>
                  {isCreating ? "Agendando..." : "Agendar Check-in"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">Próximos ({upcomingCheckins.length})</TabsTrigger>
            <TabsTrigger value="all">Todos ({checkins.length})</TabsTrigger>
            <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Carregando...</div>
            ) : upcomingCheckins.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">Nenhum check-in agendado</h3>
                  <p className="text-muted-foreground mb-4">Agende seu primeiro check-in 1:1!</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agendar Check-in
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingCheckins.map((checkin) => (
                  <CheckinCard key={checkin.id} checkin={checkin} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            {checkins.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium">Nenhum check-in realizado</h3>
                  <p className="text-muted-foreground">Seus check-ins aparecerão aqui</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {checkins.map((checkin) => (
                  <CheckinCard key={checkin.id} checkin={checkin} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates">
            {templates.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium">Nenhum template criado</h3>
                  <p className="text-muted-foreground">Templates de perguntas aparecerão aqui</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => {
                  const t = template as CheckinTemplate;
                  return (
                    <Card key={t.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{t.name}</CardTitle>
                          {t.is_default && <Badge>Padrão</Badge>}
                        </div>
                        {t.description && (
                          <CardDescription>{t.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {t.questions?.length || 0} perguntas
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Check-in Detail Dialog */}
        <Dialog open={!!selectedCheckin} onOpenChange={() => setSelectedCheckin(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Check-in</DialogTitle>
            </DialogHeader>
            {selectedCheckin && (
              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedCheckin.employee?.avatar_url || undefined} />
                      <AvatarFallback>
                        {selectedCheckin.employee?.display_name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedCheckin.employee?.display_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(selectedCheckin.scheduled_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(selectedCheckin.status)}
                </div>

                {/* Mood Rating */}
                {selectedCheckin.status !== "completed" && (
                  <div>
                    <Label className="mb-2 block">Como você está se sentindo?</Label>
                    <div className="flex gap-2">
                      {moodEmojis.map((emoji, index) => (
                        <Button
                          key={index}
                          variant={moodRating === index + 1 ? "default" : "outline"}
                          size="lg"
                          onClick={() => setMoodRating(index + 1)}
                          className="text-2xl"
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Items */}
                <div>
                  <Label className="mb-2 block">Ações de Acompanhamento</Label>
                  <div className="space-y-2 mb-3">
                    {(selectedCheckin.action_items as ActionItem[] | null)?.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => toggleActionItem({ checkinId: selectedCheckin.id, itemId: item.id })}
                        />
                        <span className={item.completed ? "line-through text-muted-foreground" : ""}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nova ação..."
                      value={newActionItem}
                      onChange={(e) => setNewActionItem(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddActionItem()}
                    />
                    <Button onClick={handleAddActionItem} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Notes */}
                {selectedCheckin.notes && (
                  <div>
                    <Label>Notas</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedCheckin.notes}</p>
                  </div>
                )}

                {/* Actions */}
                {selectedCheckin.status !== "completed" && (
                  <Button onClick={handleCompleteCheckin} className="w-full">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Concluir Check-in (+{selectedCheckin.xp_reward} XP)
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* AI Preparation Dialog */}
        <Dialog open={isPreparationDialogOpen} onOpenChange={(open) => {
          setIsPreparationDialogOpen(open);
          if (!open) clearPreparation();
        }}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Preparação Inteligente para 1:1
              </DialogTitle>
            </DialogHeader>
            <OneOnOnePreparationPanel 
              preparation={preparation} 
              isLoading={isPreparationLoading} 
            />
        </DialogContent>
      </Dialog>
    </main>
  );

  // Mobile: use MobilePageLayout
  if (isMobile) {
    return (
      <MobilePageLayout
        title="Check-ins 1:1"
        icon={Users}
        backPath="/"
        subtitle="Reuniões de acompanhamento"
      >
        {pageContent}
      </MobilePageLayout>
    );
  }

  // Desktop: original layout
  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:px-6">
        <DesktopBackButton />
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">Check-ins 1:1</h1>
        <span className="text-muted-foreground ml-2">Reuniões de acompanhamento</span>
      </header>
      <GlobalBreadcrumbs className="px-4 md:px-6 pt-3" />
      {pageContent}
    </div>
  );
}
