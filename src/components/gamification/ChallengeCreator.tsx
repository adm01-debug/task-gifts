import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Target, Users, Clock, Trophy, Sparkles, X, Star, Zap, Send, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChallengeTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  suggestedXP: number;
  suggestedDuration: string;
}

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  department: string;
}

const templates: ChallengeTemplate[] = [
  { id: "1", name: "Sprint Produtivo", description: "Complete X tarefas em Y tempo", icon: Zap, category: "Produtividade", suggestedXP: 500, suggestedDuration: "1 semana" },
  { id: "2", name: "Maratona de Aprendizado", description: "Complete cursos ou treinamentos", icon: Star, category: "Aprendizado", suggestedXP: 750, suggestedDuration: "2 semanas" },
  { id: "3", name: "Colaboração em Equipe", description: "Trabalhe junto com colegas", icon: Users, category: "Social", suggestedXP: 600, suggestedDuration: "1 semana" },
  { id: "4", name: "Desafio de Inovação", description: "Proponha e implemente melhorias", icon: Sparkles, category: "Inovação", suggestedXP: 1000, suggestedDuration: "1 mês" },
];

const teamMembers: TeamMember[] = [
  { id: "1", name: "Ana Costa", department: "Design" },
  { id: "2", name: "Pedro Lima", department: "Tech" },
  { id: "3", name: "Julia Ferreira", department: "Marketing" },
  { id: "4", name: "Carlos Mendes", department: "RH" },
  { id: "5", name: "Maria Silva", department: "Finance" },
];

export const ChallengeCreator = memo(function ChallengeCreator() {
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<ChallengeTemplate | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [challengeData, setChallengeData] = useState({
    title: "",
    description: "",
    xpReward: 500,
    duration: "1 semana",
  });

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleTemplateSelect = (template: ChallengeTemplate) => {
    setSelectedTemplate(template);
    setChallengeData({
      ...challengeData,
      title: template.name,
      description: template.description,
      xpReward: template.suggestedXP,
      duration: template.suggestedDuration,
    });
    setStep(2);
  };

  const resetCreator = () => {
    setIsCreating(false);
    setStep(1);
    setSelectedTemplate(null);
    setSelectedMembers([]);
    setChallengeData({ title: "", description: "", xpReward: 500, duration: "1 semana" });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <span>Criar Desafio</span>
          </div>
          {!isCreating && (
            <Button size="sm" onClick={() => setIsCreating(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {!isCreating ? (
            <motion.div
              key="templates"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <p className="text-sm text-muted-foreground">Templates rápidos</p>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <motion.button
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsCreating(true);
                        handleTemplateSelect(template);
                      }}
                      className="p-3 rounded-xl border text-left hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <Icon className="h-5 w-5 text-primary mb-2" />
                      <p className="text-sm font-medium">{template.name}</p>
                      <p className="text-xs text-muted-foreground">{template.category}</p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="creator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Progress Steps */}
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                      step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {s}
                    </div>
                    {s < 3 && <div className={cn("w-8 h-0.5", step > s ? "bg-primary" : "bg-muted")} />}
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={resetCreator} className="ml-auto">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Step 1: Template Selection */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-3"
                >
                  <h4 className="font-semibold">Escolha um template</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map((template) => {
                      const Icon = template.icon;
                      return (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateSelect(template)}
                          className={cn(
                            "p-3 rounded-xl border text-left transition-all",
                            selectedTemplate?.id === template.id
                              ? "border-primary bg-primary/10"
                              : "hover:border-primary/50"
                          )}
                        >
                          <Icon className="h-5 w-5 text-primary mb-2" />
                          <p className="text-sm font-medium">{template.name}</p>
                          <Badge variant="secondary" className="text-[10px] mt-1">
                            {template.suggestedXP} XP
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Challenge Details */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <h4 className="font-semibold">Detalhes do Desafio</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Título</label>
                      <Input
                        value={challengeData.title}
                        onChange={(e) => setChallengeData({ ...challengeData, title: e.target.value })}
                        placeholder="Nome do desafio"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Descrição</label>
                      <Textarea
                        value={challengeData.description}
                        onChange={(e) => setChallengeData({ ...challengeData, description: e.target.value })}
                        placeholder="Descreva o desafio..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-muted-foreground flex items-center gap-1">
                          <Star className="h-3 w-3" /> XP Recompensa
                        </label>
                        <Input
                          type="number"
                          value={challengeData.xpReward}
                          onChange={(e) => setChallengeData({ ...challengeData, xpReward: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Duração
                        </label>
                        <Input
                          value={challengeData.duration}
                          onChange={(e) => setChallengeData({ ...challengeData, duration: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
                    <Button onClick={() => setStep(3)} className="flex-1">Próximo</Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Invite Members */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <h4 className="font-semibold">Convidar Participantes</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {teamMembers.map((member) => (
                      <motion.button
                        key={member.id}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => toggleMember(member.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl border transition-all",
                          selectedMembers.includes(member.id)
                            ? "border-primary bg-primary/10"
                            : "hover:border-primary/50"
                        )}
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-left flex-1">
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.department}</p>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 transition-all",
                          selectedMembers.includes(member.id)
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/30"
                        )}>
                          {selectedMembers.includes(member.id) && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-full h-full flex items-center justify-center"
                            >
                              <span className="text-white text-xs">✓</span>
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Participantes selecionados</span>
                      <Badge variant="secondary">{selectedMembers.length}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(2)}>Voltar</Button>
                    <Button onClick={resetCreator} className="flex-1 gap-2">
                      <Send className="h-4 w-4" />
                      Criar Desafio
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
});
