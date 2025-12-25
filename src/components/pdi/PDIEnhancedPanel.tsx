import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePDI } from "@/hooks/usePDI";
import { useAuth } from "@/hooks/useAuth";
import { FileText, UserPlus, Calendar, Target, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface PDIEnhancedPanelProps {
  planId: string;
}

export const PDIEnhancedPanel = ({ planId }: PDIEnhancedPanelProps) => {
  const { user } = useAuth();
  const { templates, mentors, checkins, addMentor, createCheckin, applyTemplate } = usePDI(planId);
  const [isMentorDialogOpen, setIsMentorDialogOpen] = useState(false);
  const [isCheckinDialogOpen, setIsCheckinDialogOpen] = useState(false);
  const [newMentor, setNewMentor] = useState({ mentor_id: '', role: 'mentor' });
  const [newCheckin, setNewCheckin] = useState({ progress_summary: '', blockers: '', next_steps: '', mood_rating: 3 });

  const handleAddMentor = () => {
    if (!newMentor.mentor_id) return;
    addMentor({ plan_id: planId, mentor_id: newMentor.mentor_id, role: newMentor.role, status: 'active' });
    setIsMentorDialogOpen(false);
    setNewMentor({ mentor_id: '', role: 'mentor' });
  };

  const handleCreateCheckin = () => {
    if (!user?.id) return;
    createCheckin({ 
      plan_id: planId, 
      checkin_date: new Date().toISOString(), 
      ...newCheckin, 
      created_by: user.id 
    });
    setIsCheckinDialogOpen(false);
    setNewCheckin({ progress_summary: '', blockers: '', next_steps: '', mood_rating: 3 });
  };

  const getMoodEmoji = (rating: number) => {
    const emojis = ['😢', '😕', '😐', '🙂', '😊'];
    return emojis[rating - 1] || '😐';
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-wrap gap-2">
        <Dialog open={isMentorDialogOpen} onOpenChange={setIsMentorDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline"><UserPlus className="h-4 w-4 mr-2" />Adicionar Mentor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Adicionar Mentor ao PDI</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>ID do Mentor</Label><Input value={newMentor.mentor_id} onChange={e => setNewMentor(p => ({ ...p, mentor_id: e.target.value }))} placeholder="ID do usuário mentor" /></div>
              <div>
                <Label>Papel</Label>
                <Select value={newMentor.role} onValueChange={v => setNewMentor(p => ({ ...p, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mentor">Mentor</SelectItem>
                    <SelectItem value="sponsor">Sponsor</SelectItem>
                    <SelectItem value="coach">Coach</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleAddMentor}>Adicionar</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isCheckinDialogOpen} onOpenChange={setIsCheckinDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline"><Calendar className="h-4 w-4 mr-2" />Registrar Check-in</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Check-in do PDI</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Resumo do Progresso</Label><Textarea value={newCheckin.progress_summary} onChange={e => setNewCheckin(p => ({ ...p, progress_summary: e.target.value }))} placeholder="O que você conquistou desde o último check-in?" /></div>
              <div><Label>Bloqueios</Label><Textarea value={newCheckin.blockers} onChange={e => setNewCheckin(p => ({ ...p, blockers: e.target.value }))} placeholder="Algum impedimento ou dificuldade?" /></div>
              <div><Label>Próximos Passos</Label><Textarea value={newCheckin.next_steps} onChange={e => setNewCheckin(p => ({ ...p, next_steps: e.target.value }))} placeholder="O que você pretende fazer até o próximo check-in?" /></div>
              <div>
                <Label>Como você está se sentindo?</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button key={rating} onClick={() => setNewCheckin(p => ({ ...p, mood_rating: rating }))} className={`text-2xl p-2 rounded-lg transition-all ${newCheckin.mood_rating === rating ? 'bg-primary/20 scale-110' : 'hover:bg-muted'}`}>
                      {getMoodEmoji(rating)}
                    </button>
                  ))}
                </div>
              </div>
              <Button className="w-full" onClick={handleCreateCheckin}>Registrar Check-in</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mentors */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><UserPlus className="h-5 w-5" />Mentores</CardTitle></CardHeader>
        <CardContent>
          {mentors.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum mentor atribuído</p>
          ) : (
            <div className="space-y-2">
              {mentors.map(mentor => (
                <div key={mentor.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Mentor ID: {mentor.mentor_id.slice(0, 8)}...</p>
                    <p className="text-sm text-muted-foreground capitalize">{mentor.role}</p>
                  </div>
                  <Badge variant={mentor.status === 'active' ? 'default' : 'secondary'}>{mentor.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Check-ins History */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Calendar className="h-5 w-5" />Histórico de Check-ins</CardTitle></CardHeader>
        <CardContent>
          {checkins.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum check-in registrado</p>
          ) : (
            <div className="space-y-4">
              {checkins.map(checkin => (
                <div key={checkin.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{new Date(checkin.checkin_date).toLocaleDateString('pt-BR')}</span>
                    <span className="text-xl">{getMoodEmoji(checkin.mood_rating || 3)}</span>
                  </div>
                  {checkin.progress_summary && (
                    <div><p className="text-xs font-medium text-muted-foreground">Progresso</p><p className="text-sm">{checkin.progress_summary}</p></div>
                  )}
                  {checkin.blockers && (
                    <div className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" /><p className="text-sm">{checkin.blockers}</p></div>
                  )}
                  {checkin.next_steps && (
                    <div><p className="text-xs font-medium text-muted-foreground">Próximos Passos</p><p className="text-sm">{checkin.next_steps}</p></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" />Templates Disponíveis</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(template => (
              <div key={template.id} className="p-4 border rounded-lg space-y-2">
                <h4 className="font-medium">{template.name}</h4>
                <p className="text-sm text-muted-foreground">{template.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{template.category}</Badge>
                  <Button size="sm" variant="outline" onClick={() => applyTemplate({ planId, templateId: template.id })}>Aplicar</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
