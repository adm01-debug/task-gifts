import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Filter,
  ChevronDown,
  Eye,
  Edit2,
  Target,
  TrendingUp,
  TrendingDown,
  Star,
  AlertTriangle,
  Sparkles,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNineBoxEvaluations, useNineBoxPeriods, useCreateNineBoxEvaluation } from "@/hooks/useNineBox";
import { useProfiles } from "@/hooks/useProfiles";
import { useDepartments } from "@/hooks/useDepartments";
import { BOX_LABELS } from "@/services/nineBoxService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const BOX_COLORS: Record<number, string> = {
  1: "bg-red-500/20 border-red-500/40 hover:bg-red-500/30",
  2: "bg-orange-400/20 border-orange-400/40 hover:bg-orange-400/30",
  3: "bg-yellow-500/20 border-yellow-500/40 hover:bg-yellow-500/30",
  4: "bg-orange-500/20 border-orange-500/40 hover:bg-orange-500/30",
  5: "bg-blue-400/20 border-blue-400/40 hover:bg-blue-400/30",
  6: "bg-green-400/20 border-green-400/40 hover:bg-green-400/30",
  7: "bg-purple-400/20 border-purple-400/40 hover:bg-purple-400/30",
  8: "bg-emerald-500/20 border-emerald-500/40 hover:bg-emerald-500/30",
  9: "bg-amber-400/20 border-amber-400/40 hover:bg-amber-400/30",
};

export function NineBoxMatrix() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedBox, setSelectedBox] = useState<number | null>(null);

  const { data: evaluations, isLoading } = useNineBoxEvaluations(
    selectedDepartment !== "all" ? selectedDepartment : undefined,
    selectedPeriod || undefined
  );
  const { data: periods } = useNineBoxPeriods();
  const { data: profiles } = useProfiles();
  const { data: departments } = useDepartments();

  // Group evaluations by box position
  const evaluationsByBox: Record<number, typeof evaluations> = {};
  for (let i = 1; i <= 9; i++) {
    evaluationsByBox[i] = evaluations?.filter((e) => e.box_position === i) || [];
  }

  // Calculate box position from scores
  const calculateBoxPosition = (performance: number, potential: number): number => {
    const perfLevel = performance <= 33 ? 0 : performance <= 66 ? 1 : 2;
    const potLevel = potential <= 33 ? 0 : potential <= 66 ? 1 : 2;
    return potLevel * 3 + perfLevel + 1;
  };

  const getBoxIcon = (box: number) => {
    switch (box) {
      case 9:
        return Star;
      case 8:
        return TrendingUp;
      case 7:
        return Sparkles;
      case 6:
        return TrendingUp;
      case 5:
        return Target;
      case 4:
        return AlertTriangle;
      case 3:
        return Target;
      case 2:
        return TrendingDown;
      case 1:
        return AlertTriangle;
      default:
        return Target;
    }
  };

  const renderBox = (box: number, row: number, col: number) => {
    const people = evaluationsByBox[box] || [];
    const Icon = getBoxIcon(box);
    const label = BOX_LABELS[box];

    return (
      <motion.div
        key={box}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: (row * 3 + col) * 0.05 }}
        className={`relative p-3 rounded-xl border-2 transition-all cursor-pointer min-h-[140px] ${BOX_COLORS[box]}`}
        onClick={() => setSelectedBox(box)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-foreground/70" />
            <span className="text-xs font-semibold text-foreground/80">{label.name}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {people.length}
          </Badge>
        </div>

        <p className="text-[10px] text-muted-foreground mb-2 line-clamp-1">{label.description}</p>

        <div className="flex flex-wrap gap-1">
          {people.slice(0, 5).map((evaluation) => {
            const profile = profiles?.find((p) => p.id === evaluation.user_id);
            return (
              <TooltipProvider key={evaluation.id}>
                <Tooltip>
                  <TooltipTrigger>
                    <Avatar className="w-6 h-6 border-2 border-background">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback className="text-[10px]">
                        {profile?.display_name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{profile?.display_name}</p>
                    <p className="text-xs text-muted-foreground">
                      P: {evaluation.performance_score}% | Pot: {evaluation.potential_score}%
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
          {people.length > 5 && (
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
              +{people.length - 5}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Matriz 9-Box
          </h2>
          <p className="text-muted-foreground">
            Avalie desempenho e potencial da sua equipe
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {departments?.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {periods?.map((period) => (
                <SelectItem key={period} value={period}>
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Avaliação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <CreateEvaluationForm
                profiles={profiles || []}
                onClose={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Matrix Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribuição de Talentos</CardTitle>
          <CardDescription>
            {evaluations?.length || 0} avaliações no período selecionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Y-Axis Label */}
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-medium text-muted-foreground whitespace-nowrap">
              POTENCIAL →
            </div>

            {/* Grid */}
            <div className="ml-4">
              <div className="grid grid-cols-3 gap-3">
                {/* Row 3 (Alto Potencial) - boxes 7, 8, 9 */}
                {renderBox(7, 0, 0)}
                {renderBox(8, 0, 1)}
                {renderBox(9, 0, 2)}

                {/* Row 2 (Médio Potencial) - boxes 4, 5, 6 */}
                {renderBox(4, 1, 0)}
                {renderBox(5, 1, 1)}
                {renderBox(6, 1, 2)}

                {/* Row 1 (Baixo Potencial) - boxes 1, 2, 3 */}
                {renderBox(1, 2, 0)}
                {renderBox(2, 2, 1)}
                {renderBox(3, 2, 2)}
              </div>

              {/* X-Axis Label */}
              <div className="text-center mt-4 text-sm font-medium text-muted-foreground">
                DESEMPENHO →
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 grid grid-cols-3 md:grid-cols-5 gap-2">
            {Object.entries(BOX_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2 text-xs">
                <div className={`w-3 h-3 rounded ${label.color}`} />
                <span className="text-muted-foreground truncate">{label.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Box Detail Dialog */}
      <Dialog open={selectedBox !== null} onOpenChange={() => setSelectedBox(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedBox && (
            <BoxDetailView
              box={selectedBox}
              evaluations={evaluationsByBox[selectedBox] || []}
              profiles={profiles || []}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Create Evaluation Form Component
function CreateEvaluationForm({
  profiles,
  onClose,
}: {
  profiles: { id: string; display_name: string; avatar_url: string | null }[];
  onClose: () => void;
}) {
  const [selectedUser, setSelectedUser] = useState("");
  const [performanceScore, setPerformanceScore] = useState([50]);
  const [potentialScore, setPotentialScore] = useState([50]);
  const [period, setPeriod] = useState(format(new Date(), "yyyy-'Q'Q"));
  const [performanceNotes, setPerformanceNotes] = useState("");
  const [potentialNotes, setPotentialNotes] = useState("");
  const [strengths, setStrengths] = useState("");
  const [developmentAreas, setDevelopmentAreas] = useState("");

  const createEvaluation = useCreateNineBoxEvaluation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    await createEvaluation.mutateAsync({
      user_id: selectedUser,
      evaluation_period: period,
      performance_score: performanceScore[0],
      potential_score: potentialScore[0],
      performance_notes: performanceNotes || undefined,
      potential_notes: potentialNotes || undefined,
      strengths: strengths ? strengths.split(",").map((s) => s.trim()) : undefined,
      development_areas: developmentAreas ? developmentAreas.split(",").map((s) => s.trim()) : undefined,
    });

    onClose();
  };

  const boxPosition =
    (potentialScore[0] <= 33 ? 0 : potentialScore[0] <= 66 ? 1 : 2) * 3 +
    (performanceScore[0] <= 33 ? 0 : performanceScore[0] <= 66 ? 1 : 2) +
    1;

  return (
    <>
      <DialogHeader>
        <DialogTitle>Nova Avaliação 9-Box</DialogTitle>
        <DialogDescription>
          Avalie o desempenho e potencial do colaborador
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label>Colaborador</Label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={profile.avatar_url || ""} />
                      <AvatarFallback>{profile.display_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {profile.display_name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Período</Label>
          <Input
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="ex: 2024-Q1"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Desempenho</Label>
            <span className="text-sm font-medium">{performanceScore[0]}%</span>
          </div>
          <Slider
            value={performanceScore}
            onValueChange={setPerformanceScore}
            max={100}
            step={1}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Potencial</Label>
            <span className="text-sm font-medium">{potentialScore[0]}%</span>
          </div>
          <Slider
            value={potentialScore}
            onValueChange={setPotentialScore}
            max={100}
            step={1}
          />
        </div>

        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <p className="text-xs text-muted-foreground mb-1">Posição na Matriz</p>
          <Badge className={BOX_LABELS[boxPosition].color.replace("bg-", "bg-").replace("-500", "-500/80")}>
            {BOX_LABELS[boxPosition].name}
          </Badge>
        </div>

        <div className="space-y-2">
          <Label>Notas sobre Desempenho</Label>
          <Textarea
            value={performanceNotes}
            onChange={(e) => setPerformanceNotes(e.target.value)}
            placeholder="Observações sobre o desempenho..."
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Notas sobre Potencial</Label>
          <Textarea
            value={potentialNotes}
            onChange={(e) => setPotentialNotes(e.target.value)}
            placeholder="Observações sobre o potencial..."
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Pontos Fortes (separados por vírgula)</Label>
          <Input
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            placeholder="Liderança, Comunicação, Técnico..."
          />
        </div>

        <div className="space-y-2">
          <Label>Áreas de Desenvolvimento (separados por vírgula)</Label>
          <Input
            value={developmentAreas}
            onChange={(e) => setDevelopmentAreas(e.target.value)}
            placeholder="Gestão de tempo, Delegação..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!selectedUser || createEvaluation.isPending}>
            {createEvaluation.isPending ? "Salvando..." : "Criar Avaliação"}
          </Button>
        </div>
      </form>
    </>
  );
}

// Box Detail View Component
function BoxDetailView({
  box,
  evaluations,
  profiles,
}: {
  box: number;
  evaluations: {
    id: string;
    user_id: string;
    performance_score: number;
    potential_score: number;
    performance_notes: string | null;
    potential_notes: string | null;
    strengths: string[] | null;
    development_areas: string[] | null;
    evaluation_period: string;
    created_at: string;
  }[];
  profiles: { id: string; display_name: string; avatar_url: string | null; email: string }[];
}) {
  const label = BOX_LABELS[box];

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${label.color}`} />
          {label.name}
        </DialogTitle>
        <DialogDescription>{label.description}</DialogDescription>
      </DialogHeader>

      <div className="mt-4 space-y-4">
        {evaluations.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum colaborador nesta posição
          </p>
        ) : (
          evaluations.map((evaluation) => {
            const profile = profiles.find((p) => p.id === evaluation.user_id);
            return (
              <Card key={evaluation.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback>{profile?.display_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{profile?.display_name}</h4>
                          <p className="text-sm text-muted-foreground">{profile?.email}</p>
                        </div>
                        <Badge variant="outline">{evaluation.evaluation_period}</Badge>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Desempenho</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${evaluation.performance_score}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{evaluation.performance_score}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Potencial</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-purple-500"
                                style={{ width: `${evaluation.potential_score}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{evaluation.potential_score}%</span>
                          </div>
                        </div>
                      </div>

                      {(evaluation.strengths?.length || 0) > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground mb-1">Pontos Fortes</p>
                          <div className="flex flex-wrap gap-1">
                            {evaluation.strengths?.map((s, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {(evaluation.development_areas?.length || 0) > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Áreas de Desenvolvimento</p>
                          <div className="flex flex-wrap gap-1">
                            {evaluation.development_areas?.map((s, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </>
  );
}
