import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { 
  Calendar, Clock, Video, MapPin, Users, Plus, 
  CheckCircle2, Circle, Play, Pause, MessageSquare,
  Star, TrendingUp, FileText, ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface OneOnOneMeeting {
  id: string;
  with: { name: string; role: string };
  date: string;
  duration: number;
  location: 'online' | 'presential';
  locationDetail?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  rating?: number;
  agenda: AgendaItem[];
  notes?: string;
  actions: ActionItem[];
}

interface AgendaItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

interface ActionItem {
  id: string;
  title: string;
  responsible: string;
  deadline: string;
  status: 'pending' | 'completed';
}

const defaultAgendaItems = [
  { id: '1', title: 'Revisão de metas do período', isCompleted: false },
  { id: '2', title: 'Desafios enfrentados', isCompleted: false },
  { id: '3', title: 'Suporte necessário da liderança', isCompleted: false },
  { id: '4', title: 'Desenvolvimento profissional (PDI)', isCompleted: false },
  { id: '5', title: 'Bem-estar e clima', isCompleted: false },
];

const mockMeetings: OneOnOneMeeting[] = [
  {
    id: '1',
    with: { name: 'Maria Silva', role: 'Desenvolvedora Sr' },
    date: '2024-12-28T14:00:00',
    duration: 30,
    location: 'online',
    locationDetail: 'Google Meet',
    status: 'scheduled',
    agenda: defaultAgendaItems,
    actions: []
  },
  {
    id: '2',
    with: { name: 'Maria Silva', role: 'Desenvolvedora Sr' },
    date: '2024-12-14T14:00:00',
    duration: 28,
    location: 'presential',
    locationDetail: 'Sala Reunião 3',
    status: 'completed',
    rating: 4,
    agenda: defaultAgendaItems.map(a => ({ ...a, isCompleted: true })),
    notes: 'Discussão sobre PDI Q4, feedback de projeto. Maria está evoluindo bem em liderança.',
    actions: [
      { id: 'a1', title: 'Enviar link do curso', responsible: 'João', deadline: '2024-12-20', status: 'completed' },
      { id: 'a2', title: 'Ajustar backlog', responsible: 'João + PO', deadline: '2025-01-05', status: 'pending' },
    ]
  }
];

export const OneOnOnePanel = () => {
  const [meetings, setMeetings] = useState<OneOnOneMeeting[]>(mockMeetings);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<OneOnOneMeeting | null>(null);
  const [meetingNotes, setMeetingNotes] = useState('');
  const [newAction, setNewAction] = useState({ title: '', responsible: '', deadline: '' });

  const scheduledMeetings = meetings.filter(m => m.status === 'scheduled');
  const completedMeetings = meetings.filter(m => m.status === 'completed');
  const avgRating = completedMeetings.length > 0 
    ? (completedMeetings.reduce((sum, m) => sum + (m.rating || 0), 0) / completedMeetings.length).toFixed(1)
    : '0';

  const startMeeting = (meeting: OneOnOneMeeting) => {
    setActiveMeeting({ ...meeting, status: 'in_progress' });
  };

  const toggleAgendaItem = (itemId: string) => {
    if (!activeMeeting) return;
    setActiveMeeting({
      ...activeMeeting,
      agenda: activeMeeting.agenda.map(item =>
        item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
      )
    });
  };

  const addAction = () => {
    if (!activeMeeting || !newAction.title || !newAction.responsible) return;
    setActiveMeeting({
      ...activeMeeting,
      actions: [...activeMeeting.actions, {
        id: `action-${Date.now()}`,
        ...newAction,
        status: 'pending'
      }]
    });
    setNewAction({ title: '', responsible: '', deadline: '' });
  };

  const finishMeeting = (rating: number) => {
    if (!activeMeeting) return;
    const updatedMeeting = {
      ...activeMeeting,
      status: 'completed' as const,
      rating,
      notes: meetingNotes
    };
    setMeetings(prev => prev.map(m => m.id === activeMeeting.id ? updatedMeeting : m));
    setActiveMeeting(null);
    setMeetingNotes('');
    toast.success('Reunião finalizada! +50 XP');
  };

  // Active Meeting View
  if (activeMeeting) {
    const completedAgenda = activeMeeting.agenda.filter(a => a.isCompleted).length;
    const totalAgenda = activeMeeting.agenda.length;

    return (
      <div className="space-y-6">
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  1-ON-1: {activeMeeting.with.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(activeMeeting.date), "dd/MM/yyyy HH:mm")} | {activeMeeting.duration} min
                </p>
              </div>
              <Badge className="bg-red-500">Em andamento</Badge>
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Agenda */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                📋 Agenda
                <span className="text-sm font-normal text-muted-foreground">
                  {completedAgenda}/{totalAgenda}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeMeeting.agenda.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleAgendaItem(item.id)}
                    className="w-full flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    {item.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={item.isCompleted ? 'line-through text-muted-foreground' : ''}>
                      {item.title}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📝 Notas da Reunião</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                placeholder="Registre os pontos discutidos..."
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground mt-2">Auto-save ativado ✓</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">✅ Ações de Acompanhamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {activeMeeting.actions.map((action) => (
                <div key={action.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={action.status === 'completed'} />
                    <div>
                      <p className="font-medium">{action.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {action.responsible} • até {action.deadline}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Nova ação..."
                  value={newAction.title}
                  onChange={(e) => setNewAction(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="w-32 space-y-2">
                <Input
                  placeholder="Responsável"
                  value={newAction.responsible}
                  onChange={(e) => setNewAction(prev => ({ ...prev, responsible: e.target.value }))}
                />
              </div>
              <div className="w-32 space-y-2">
                <Input
                  type="date"
                  value={newAction.deadline}
                  onChange={(e) => setNewAction(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
              <Button onClick={addAction} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Finish Meeting */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">😊 Finalizar Reunião</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Como você avalia esta 1-on-1?</p>
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => finishMeeting(rating)}
                  className="w-12 h-12 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center text-lg font-bold"
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Ruim</span>
              <span>Excelente</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setActiveMeeting(null)}>
            <Pause className="h-4 w-4 mr-2" />
            Pausar
          </Button>
        </div>
      </div>
    );
  }

  // Normal View
  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reuniões</p>
                <p className="text-3xl font-bold">{meetings.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agendadas</p>
                <p className="text-3xl font-bold">{scheduledMeetings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Realizadas</p>
                <p className="text-3xl font-bold">{completedMeetings.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Satisfação Média</p>
                <p className="text-3xl font-bold">{avgRating}/5 ⭐</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agendar 1-on-1
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agendar Reunião 1-on-1</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Com</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma pessoa..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maria">Maria Silva (Desenvolvedora Sr)</SelectItem>
                    <SelectItem value="joao">João Santos (Tech Lead)</SelectItem>
                    <SelectItem value="ana">Ana Costa (Designer)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Hora</Label>
                  <Input type="time" defaultValue="14:00" />
                </div>
                <div className="space-y-2">
                  <Label>Duração</Label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Local</Label>
                <RadioGroup defaultValue="online" className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="online" id="loc-online" />
                    <label htmlFor="loc-online" className="flex items-center gap-1">
                      <Video className="h-4 w-4" /> Online
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="presential" id="loc-presential" />
                    <label htmlFor="loc-presential" className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> Presencial
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Recorrência</Label>
                <RadioGroup defaultValue="biweekly" className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="once" id="rec-once" />
                    <label htmlFor="rec-once">Reunião única</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="biweekly" id="rec-biweekly" />
                    <label htmlFor="rec-biweekly">Quinzenal</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="rec-monthly" />
                    <label htmlFor="rec-monthly">Mensal</label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="cal-invite" defaultChecked />
                  <label htmlFor="cal-invite" className="text-sm">Enviar convite</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="reminder-1d" defaultChecked />
                  <label htmlFor="reminder-1d" className="text-sm">Lembrete 1 dia antes</label>
                </div>
              </div>

              <Button className="w-full" onClick={() => { setIsDialogOpen(false); toast.success('1-on-1 agendada!'); }}>
                Agendar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Meetings List */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Próximas ({scheduledMeetings.length})</TabsTrigger>
          <TabsTrigger value="history">Histórico ({completedMeetings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {scheduledMeetings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Nenhuma reunião agendada</p>
                <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  Agendar primeira 1-on-1
                </Button>
              </CardContent>
            </Card>
          ) : (
            scheduledMeetings.map((meeting) => (
              <Card key={meeting.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{meeting.with.name}</h3>
                        <p className="text-sm text-muted-foreground">{meeting.with.role}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(meeting.date), "dd/MM/yyyy HH:mm")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {meeting.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            {meeting.location === 'online' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                            {meeting.locationDetail}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => startMeeting(meeting)}>
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar
                      </Button>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {completedMeetings.map((meeting) => (
            <Card key={meeting.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{meeting.with.name}</h3>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < (meeting.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(meeting.date), "dd/MM/yyyy")} | {meeting.duration} min
                      </p>
                      {meeting.notes && (
                        <p className="text-sm mt-1 line-clamp-1">{meeting.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {meeting.actions.filter(a => a.status === 'completed').length}/{meeting.actions.length} ações concluídas
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Ver Detalhes <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
