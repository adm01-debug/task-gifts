import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Sparkles,
  Target,
  Users,
  Clock,
  Tag,
  X,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { QuestPreview } from "@/components/quest-builder/QuestPreview";
import { QuestStepEditor } from "@/components/quest-builder/QuestStepEditor";
import { IconPicker } from "@/components/quest-builder/IconPicker";

interface QuestStep {
  id: string;
  title: string;
  description: string;
  xpReward: number;
}

export default function QuestBuilder() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📚");
  const [difficulty, setDifficulty] = useState("medium");
  const [xpReward, setXpReward] = useState(100);
  const [coinReward, setCoinReward] = useState(50);
  const [deadlineDays, setDeadlineDays] = useState<number | null>(null);
  const [maxParticipants, setMaxParticipants] = useState<number | null>(null);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [hasMaxParticipants, setHasMaxParticipants] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [steps, setSteps] = useState<QuestStep[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const calculateTotalXP = () => {
    const stepsXP = steps.reduce((acc, step) => acc + step.xpReward, 0);
    return xpReward + stepsXP;
  };

  const handleSave = async (status: "draft" | "active") => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar quests.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, adicione um título para a quest.",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, adicione uma descrição para a quest.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Insert the quest
      const { data: quest, error: questError } = await supabase
        .from("custom_quests")
        .insert({
          title: title.trim(),
          description: description.trim(),
          icon,
          difficulty: difficulty as "easy" | "medium" | "hard" | "expert",
          xp_reward: xpReward,
          coin_reward: coinReward,
          status: status as "draft" | "active" | "archived",
          deadline_days: hasDeadline ? deadlineDays : null,
          max_participants: hasMaxParticipants ? maxParticipants : null,
          tags,
          created_by: user.id,
        })
        .select()
        .single();

      if (questError) throw questError;

      // Insert steps if any
      if (steps.length > 0 && quest) {
        const stepsToInsert = steps.map((step, index) => ({
          quest_id: quest.id,
          title: step.title,
          description: step.description,
          order_index: index,
          xp_reward: step.xpReward,
        }));

        const { error: stepsError } = await supabase
          .from("quest_steps")
          .insert(stepsToInsert);

        if (stepsError) throw stepsError;
      }

      setSaveSuccess(true);
      
      toast({
        title: status === "active" ? "Quest Publicada!" : "Rascunho Salvo!",
        description: status === "active" 
          ? "A quest está disponível para os colaboradores." 
          : "Você pode continuar editando depois.",
      });

      setTimeout(() => {
        navigate("/manager");
      }, 1500);

    } catch (error: any) {
      console.error("Error saving quest:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar a quest.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Criar Nova Quest</h1>
              <p className="text-sm text-muted-foreground">
                Monte uma trilha de aprendizado para sua equipe
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="hidden gap-2 md:flex"
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? "Ocultar Preview" : "Mostrar Preview"}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleSave("draft")}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Rascunho
            </Button>
            
            <Button
              onClick={() => handleSave("active")}
              disabled={isSaving}
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {saveSuccess ? (
                <CheckCircle className="h-4 w-4" />
              ) : isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Publicar Quest
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className={`grid gap-8 ${showPreview ? "lg:grid-cols-2" : "lg:grid-cols-1 max-w-3xl mx-auto"}`}>
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Basic info section */}
            <section className="space-y-6 rounded-xl border border-border/50 bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Informações Básicas</h2>
              </div>

              <div className="flex gap-4">
                <div>
                  <Label className="mb-2 block text-sm">Ícone</Label>
                  <IconPicker value={icon} onChange={setIcon} />
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <Label htmlFor="title">Título da Quest *</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Onboarding de Novos Colaboradores"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva os objetivos e o que o colaborador vai aprender..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="difficulty">Dificuldade</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger id="difficulty" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">🟢 Fácil</SelectItem>
                      <SelectItem value="medium">🟡 Médio</SelectItem>
                      <SelectItem value="hard">🟠 Difícil</SelectItem>
                      <SelectItem value="expert">🔴 Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="xp">XP (Conclusão)</Label>
                  <Input
                    id="xp"
                    type="number"
                    min={0}
                    value={xpReward}
                    onChange={(e) => setXpReward(parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="coins">Coins (Conclusão)</Label>
                  <Input
                    id="coins"
                    type="number"
                    min={0}
                    value={coinReward}
                    onChange={(e) => setCoinReward(parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>
            </section>

            {/* Advanced settings */}
            <section className="space-y-6 rounded-xl border border-border/50 bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Configurações Avançadas</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Prazo para conclusão</p>
                      <p className="text-sm text-muted-foreground">Definir tempo limite para completar</p>
                    </div>
                  </div>
                  <Switch checked={hasDeadline} onCheckedChange={setHasDeadline} />
                </div>
                
                <AnimatePresence>
                  {hasDeadline && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 pl-12">
                        <Input
                          type="number"
                          min={1}
                          value={deadlineDays || ""}
                          onChange={(e) => setDeadlineDays(parseInt(e.target.value) || null)}
                          placeholder="7"
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">dias para completar</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Limite de participantes</p>
                      <p className="text-sm text-muted-foreground">Restringir número de vagas</p>
                    </div>
                  </div>
                  <Switch checked={hasMaxParticipants} onCheckedChange={setHasMaxParticipants} />
                </div>

                <AnimatePresence>
                  {hasMaxParticipants && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 pl-12">
                        <Input
                          type="number"
                          min={1}
                          value={maxParticipants || ""}
                          onChange={(e) => setMaxParticipants(parseInt(e.target.value) || null)}
                          placeholder="20"
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">participantes máximos</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tags */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <Label>Tags</Label>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {tags.map((tag) => (
                    <motion.div
                      key={tag}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <Badge variant="secondary" className="gap-1 pr-1">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    </motion.div>
                  ))}
                  <Input
                    placeholder="Adicionar tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={addTag}
                    className="w-32 flex-shrink-0"
                  />
                </div>
              </div>
            </section>

            {/* Steps section */}
            <section className="space-y-6 rounded-xl border border-border/50 bg-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Etapas da Trilha</h2>
                    <p className="text-sm text-muted-foreground">
                      Total: {calculateTotalXP()} XP
                    </p>
                  </div>
                </div>
              </div>

              <QuestStepEditor steps={steps} onStepsChange={setSteps} />
            </section>
          </motion.div>

          {/* Preview */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="lg:sticky lg:top-24 lg:self-start"
              >
                <div className="mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  <h2 className="font-semibold text-foreground">Preview da Quest</h2>
                </div>
                <QuestPreview
                  title={title}
                  description={description}
                  icon={icon}
                  difficulty={difficulty}
                  xpReward={xpReward}
                  coinReward={coinReward}
                  deadlineDays={hasDeadline ? deadlineDays : null}
                  maxParticipants={hasMaxParticipants ? maxParticipants : null}
                  tags={tags}
                  steps={steps}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
