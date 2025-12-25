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
import { 
  ThumbsUp, Lightbulb, Target, Send, MessageSquare, Heart,
  User, Calendar, Eye, EyeOff, Lock, Globe, Filter
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Feedback {
  id: string;
  type: 'positive' | 'constructive' | 'mixed';
  from: { name: string; avatar?: string };
  to?: { name: string };
  content: string;
  competency?: string;
  visibility: 'private' | 'public' | 'anonymous';
  project?: string;
  date: string;
  likes: number;
  comments: number;
  isRead: boolean;
}

const mockReceivedFeedbacks: Feedback[] = [
  {
    id: '1',
    type: 'positive',
    from: { name: 'João Santos' },
    content: 'Maria, queria reconhecer a excelente apresentação que você fez na Sprint Review de hoje. A forma como explicou a nova arquitetura foi clara e didática, todos conseguiram entender os benefícios da mudança. Continue assim!',
    competency: 'Comunicação',
    visibility: 'public',
    project: 'Refatoração API',
    date: '2024-12-23T16:45:00',
    likes: 3,
    comments: 1,
    isRead: true
  },
  {
    id: '2',
    type: 'constructive',
    from: { name: 'Pedro Costa' },
    content: 'Maria, notei que nas últimas dailys você tem chegado alguns minutos atrasada. Sei que sua agenda é corrida, mas isso impacta o time. Podemos conversar sobre como ajustar?',
    competency: 'Trabalho em Equipe',
    visibility: 'private',
    date: '2024-12-20T10:30:00',
    likes: 0,
    comments: 0,
    isRead: false
  }
];

const mockSentFeedbacks: Feedback[] = [
  {
    id: '3',
    type: 'positive',
    from: { name: 'Eu' },
    to: { name: 'Ana Costa' },
    content: 'Parabéns pela entrega do módulo de relatórios! Ficou impecável.',
    visibility: 'public',
    date: '2024-12-22T14:00:00',
    likes: 5,
    comments: 2,
    isRead: true
  }
];

const getFeedbackIcon = (type: string) => {
  switch (type) {
    case 'positive': return <ThumbsUp className="h-5 w-5 text-green-500" />;
    case 'constructive': return <Lightbulb className="h-5 w-5 text-yellow-500" />;
    default: return <Target className="h-5 w-5 text-blue-500" />;
  }
};

const getFeedbackBadge = (type: string) => {
  switch (type) {
    case 'positive': return <Badge className="bg-green-500/20 text-green-500">👍 Positivo</Badge>;
    case 'constructive': return <Badge className="bg-yellow-500/20 text-yellow-500">💡 Construtivo</Badge>;
    default: return <Badge className="bg-blue-500/20 text-blue-500">🎯 Misto</Badge>;
  }
};

const getVisibilityIcon = (visibility: string) => {
  switch (visibility) {
    case 'public': return <Globe className="h-4 w-4" />;
    case 'private': return <Lock className="h-4 w-4" />;
    default: return <EyeOff className="h-4 w-4" />;
  }
};

export const FeedbackPanel = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<string>('positive');
  const [visibility, setVisibility] = useState<string>('private');
  const [content, setContent] = useState('');
  const [recipient, setRecipient] = useState('');

  const handleSendFeedback = () => {
    if (!content.trim() || !recipient) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    toast.success('Feedback enviado com sucesso! +25 XP');
    setIsDialogOpen(false);
    setContent('');
    setRecipient('');
  };

  const positiveCount = mockReceivedFeedbacks.filter(f => f.type === 'positive').length;
  const constructiveCount = mockReceivedFeedbacks.filter(f => f.type === 'constructive').length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recebidos</p>
                <p className="text-3xl font-bold">{mockReceivedFeedbacks.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">👍 Positivos</p>
                <p className="text-3xl font-bold text-green-500">{positiveCount}</p>
              </div>
              <ThumbsUp className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">💡 Construtivos</p>
                <p className="text-3xl font-bold text-yellow-500">{constructiveCount}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enviados</p>
                <p className="text-3xl font-bold">{mockSentFeedbacks.length}</p>
              </div>
              <Send className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Enviar Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Enviar Feedback</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Para</Label>
                <Select value={recipient} onValueChange={setRecipient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma pessoa..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maria">Maria Silva</SelectItem>
                    <SelectItem value="joao">João Santos</SelectItem>
                    <SelectItem value="ana">Ana Costa</SelectItem>
                    <SelectItem value="pedro">Pedro Lima</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Feedback</Label>
                <RadioGroup value={feedbackType} onValueChange={setFeedbackType} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="positive" id="positive" />
                    <label htmlFor="positive" className="flex items-center gap-1 cursor-pointer">
                      👍 Positivo
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="constructive" id="constructive" />
                    <label htmlFor="constructive" className="flex items-center gap-1 cursor-pointer">
                      💡 Construtivo
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mixed" id="mixed" />
                    <label htmlFor="mixed" className="flex items-center gap-1 cursor-pointer">
                      🎯 Misto
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Projeto (opcional)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api">Refatoração API</SelectItem>
                      <SelectItem value="mobile">App Mobile</SelectItem>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Competência (opcional)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="communication">Comunicação</SelectItem>
                      <SelectItem value="teamwork">Trabalho em Equipe</SelectItem>
                      <SelectItem value="leadership">Liderança</SelectItem>
                      <SelectItem value="innovation">Inovação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Seu feedback *</Label>
                <Textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Descreva seu feedback de forma construtiva..."
                  className="min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground text-right">{content.length}/1000</p>
              </div>

              <div className="space-y-2">
                <Label>Visibilidade</Label>
                <RadioGroup value={visibility} onValueChange={setVisibility} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="v-private" />
                    <label htmlFor="v-private" className="flex items-center gap-2 cursor-pointer text-sm">
                      <Lock className="h-4 w-4" /> Privado (apenas destinatário e gestor)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="v-public" />
                    <label htmlFor="v-public" className="flex items-center gap-2 cursor-pointer text-sm">
                      <Globe className="h-4 w-4" /> Público (visível para o time)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="anonymous" id="v-anonymous" />
                    <label htmlFor="v-anonymous" className="flex items-center gap-2 cursor-pointer text-sm">
                      <EyeOff className="h-4 w-4" /> Anônimo (sem identificação)
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="notify-email" defaultChecked />
                  <label htmlFor="notify-email" className="text-sm">Notificar por email</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="notify-slack" />
                  <label htmlFor="notify-slack" className="text-sm">Notificar no Slack</label>
                </div>
              </div>

              <Button onClick={handleSendFeedback} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Enviar Feedback
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="received" className="space-y-4">
        <TabsList>
          <TabsTrigger value="received">Recebidos ({mockReceivedFeedbacks.length})</TabsTrigger>
          <TabsTrigger value="sent">Enviados ({mockSentFeedbacks.length})</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Badge variant="outline" className="cursor-pointer">Todos</Badge>
            <Badge variant="outline" className="cursor-pointer bg-green-500/10">👍 Positivos</Badge>
            <Badge variant="outline" className="cursor-pointer bg-yellow-500/10">💡 Construtivos</Badge>
          </div>

          {mockReceivedFeedbacks.map((feedback) => (
            <Card key={feedback.id} className={!feedback.isRead ? 'border-primary/50 bg-primary/5' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{feedback.from.name}</span>
                        {getFeedbackBadge(feedback.type)}
                        <Badge variant="outline" className="text-xs">
                          {getVisibilityIcon(feedback.visibility)}
                          <span className="ml-1 capitalize">{feedback.visibility === 'private' ? 'Privado' : feedback.visibility === 'public' ? 'Público' : 'Anônimo'}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(feedback.date), "dd/MM/yyyy HH:mm")}
                        {feedback.competency && (
                          <>
                            <span>•</span>
                            <span>{feedback.competency}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {!feedback.isRead && (
                    <Badge className="bg-primary">Novo</Badge>
                  )}
                </div>

                <p className="text-sm leading-relaxed mb-4">{feedback.content}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Heart className="h-4 w-4" />
                      {feedback.likes} curtidas
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <MessageSquare className="h-4 w-4" />
                      {feedback.comments} comentários
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Responder</Button>
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {mockSentFeedbacks.map((feedback) => (
            <Card key={feedback.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Para: {feedback.to?.name}</span>
                      {getFeedbackBadge(feedback.type)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(feedback.date), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                </div>
                <p className="text-sm">{feedback.content}</p>
                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                  <Heart className="h-4 w-4" /> {feedback.likes}
                  <MessageSquare className="h-4 w-4 ml-2" /> {feedback.comments}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Feedbacks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h4 className="font-medium">Feedbacks por competência (este ano)</h4>
                {[
                  { name: 'Comunicação', positive: 5, constructive: 3 },
                  { name: 'Trabalho em Equipe', positive: 5, constructive: 1 },
                  { name: 'Inovação', positive: 4, constructive: 1 },
                  { name: 'Liderança', positive: 4, constructive: 0 },
                ].map((stat) => (
                  <div key={stat.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="font-medium">{stat.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/20 text-green-500">{stat.positive}👍</Badge>
                      <Badge className="bg-yellow-500/20 text-yellow-500">{stat.constructive}💡</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
