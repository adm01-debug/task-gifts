import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useCreateOpinion, useReceivedOpinions, useOpinionStats } from "@/hooks/useOpinions";
import { OpinionCategory, OpinionUrgency } from "@/services/opinionsService";
import { MessageSquarePlus, Send, AlertCircle, CheckCircle, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CATEGORY_LABELS: Record<OpinionCategory, { label: string; icon: string }> = {
  suggestion: { label: 'Sugestão', icon: '💡' },
  complaint: { label: 'Reclamação', icon: '⚠️' },
  compliment: { label: 'Elogio', icon: '👏' },
  question: { label: 'Dúvida', icon: '❓' },
  other: { label: 'Outro', icon: '📝' },
};

const URGENCY_LABELS: Record<OpinionUrgency, { label: string; color: string }> = {
  low: { label: 'Baixa', color: 'bg-green-500' },
  normal: { label: 'Normal', color: 'bg-yellow-500' },
  high: { label: 'Alta', color: 'bg-red-500' },
};

const RECIPIENT_TYPES = [
  { value: 'direct_manager', label: 'Minha Liderança Direta' },
  { value: 'hr', label: 'RH / Gestão de Pessoas' },
  { value: 'ceo', label: 'CEO / Direção' },
  { value: 'other', label: 'Outro' },
];

export function OpinionsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<OpinionCategory>('suggestion');
  const [urgency, setUrgency] = useState<OpinionUrgency>('normal');
  const [recipientType, setRecipientType] = useState('direct_manager');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);

  const { mutate: createOpinion, isPending } = useCreateOpinion();
  const { data: receivedOpinions = [] } = useReceivedOpinions();
  const { data: stats } = useOpinionStats();

  const handleSubmit = () => {
    if (!content.trim()) return;

    createOpinion({
      recipientType,
      category,
      subject: subject || undefined,
      content,
      urgency,
      isAnonymous,
    }, {
      onSuccess: () => {
        setIsOpen(false);
        setSubject('');
        setContent('');
        setCategory('suggestion');
        setUrgency('normal');
        setIsAnonymous(true);
      }
    });
  };

  const unreadCount = receivedOpinions.filter(o => o.status === 'new').length;

  return (
    <div className="space-y-6">
      {/* Header com botão de nova opinião */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Opiniões</h2>
          <p className="text-muted-foreground">Envie sugestões, elogios ou reclamações de forma anônima</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <MessageSquarePlus className="h-4 w-4 mr-2" />
              Nova Opinião
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Enviar Opinião</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Para quem</Label>
                <RadioGroup value={recipientType} onValueChange={setRecipientType} className="mt-2">
                  {RECIPIENT_TYPES.map(type => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={type.value} id={type.value} />
                      <Label htmlFor={type.value} className="cursor-pointer">{type.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label>Categoria</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as OpinionCategory)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([key, { label, icon }]) => (
                      <SelectItem key={key} value={key}>
                        {icon} {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Assunto (opcional)</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Resumo breve"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Sua opinião *</Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Descreva sua opinião, sugestão ou reclamação..."
                  className="mt-2 min-h-[120px]"
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground mt-1">{content.length}/1000 caracteres</p>
              </div>

              <div>
                <Label>Urgência</Label>
                <RadioGroup value={urgency} onValueChange={(v) => setUrgency(v as OpinionUrgency)} className="mt-2 flex gap-4">
                  {Object.entries(URGENCY_LABELS).map(([key, { label }]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <RadioGroupItem value={key} id={`urgency-${key}`} />
                      <Label htmlFor={`urgency-${key}`} className="cursor-pointer">{label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <Label htmlFor="anonymous">Enviar de forma anônima</Label>
                  {isAnonymous && (
                    <p className="text-xs text-muted-foreground">
                      Opiniões anônimas não podem ser respondidas diretamente
                    </p>
                  )}
                </div>
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
              </div>

              <Button onClick={handleSubmit} disabled={!content.trim() || isPending} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                {isPending ? 'Enviando...' : 'Enviar Opinião'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <MessageSquarePlus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.resolved}</p>
                <p className="text-xs text-muted-foreground">Resolvidas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                <AlertCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgResolutionDays}d</p>
                <p className="text-xs text-muted-foreground">Tempo médio</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de opiniões recebidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Opiniões Recebidas
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} nova{unreadCount > 1 ? 's' : ''}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {receivedOpinions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma opinião recebida ainda</p>
          ) : (
            <div className="space-y-3">
              {receivedOpinions.slice(0, 10).map(opinion => (
                <div
                  key={opinion.id}
                  className={`p-4 border rounded-lg ${opinion.status === 'new' ? 'bg-primary/5 border-primary/20' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {opinion.status === 'new' && <Badge variant="destructive" className="text-xs">Nova</Badge>}
                      <Badge variant="outline">
                        {CATEGORY_LABELS[opinion.category]?.icon} {CATEGORY_LABELS[opinion.category]?.label}
                      </Badge>
                      <Badge className={URGENCY_LABELS[opinion.urgency]?.color}>
                        {URGENCY_LABELS[opinion.urgency]?.label}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(opinion.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  {opinion.subject && (
                    <p className="font-medium mt-2">{opinion.subject}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{opinion.content}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    {opinion.is_anonymous ? 'Anônimo' : 'Identificado'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
