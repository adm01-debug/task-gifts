import { memo, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { 
  Settings, GripVertical, Eye, EyeOff, X, 
  RotateCcw, Check, Sparkles, LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface WidgetConfig {
  id: string;
  label: string;
  description: string;
  visible: boolean;
  order: number;
  category: "stats" | "progress" | "social" | "challenges" | "analytics";
}

const defaultWidgets: WidgetConfig[] = [
  { id: "stats", label: "Estatísticas", description: "XP, coins e nível", visible: true, order: 0, category: "stats" },
  { id: "streak", label: "Sequência", description: "Dias consecutivos", visible: true, order: 1, category: "progress" },
  { id: "next-mission", label: "Próxima Missão", description: "Sua tarefa prioritária", visible: true, order: 2, category: "progress" },
  { id: "daily-quests", label: "Missões Diárias", description: "Tarefas do dia", visible: true, order: 3, category: "challenges" },
  { id: "weekly-goals", label: "Metas Semanais", description: "Progresso da semana", visible: true, order: 4, category: "progress" },
  { id: "leaderboard", label: "Ranking", description: "Top colaboradores", visible: true, order: 5, category: "social" },
  { id: "achievements", label: "Conquistas", description: "Badges recentes", visible: true, order: 6, category: "progress" },
  { id: "team-challenges", label: "Desafios em Equipe", description: "Competições ativas", visible: false, order: 7, category: "challenges" },
  { id: "activity-heatmap", label: "Mapa de Atividade", description: "Histórico visual", visible: false, order: 8, category: "analytics" },
  { id: "mood-tracker", label: "Humor", description: "Como você está?", visible: true, order: 9, category: "progress" },
  { id: "announcements", label: "Anúncios", description: "Comunicados da empresa", visible: true, order: 10, category: "social" },
  { id: "rewards-shop", label: "Loja", description: "Recompensas disponíveis", visible: false, order: 11, category: "progress" },
];

const categoryLabels = {
  stats: "Estatísticas",
  progress: "Progresso",
  social: "Social",
  challenges: "Desafios",
  analytics: "Análises",
};

interface CustomizableDashboardProps {
  onConfigChange?: (config: WidgetConfig[]) => void;
}

export const useCustomizableDashboard = () => {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem("dashboard_widget_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultWidgets;
      }
    }
    return defaultWidgets;
  });

  const updateWidgets = useCallback((newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
    localStorage.setItem("dashboard_widget_config", JSON.stringify(newWidgets));
  }, []);

  const toggleWidget = useCallback((id: string) => {
    setWidgets((prev) => {
      const updated = prev.map((w) =>
        w.id === id ? { ...w, visible: !w.visible } : w
      );
      localStorage.setItem("dashboard_widget_config", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetToDefault = useCallback(() => {
    setWidgets(defaultWidgets);
    localStorage.setItem("dashboard_widget_config", JSON.stringify(defaultWidgets));
  }, []);

  const isWidgetVisible = useCallback((id: string) => {
    return widgets.find((w) => w.id === id)?.visible ?? true;
  }, [widgets]);

  const getVisibleWidgets = useCallback(() => {
    return widgets
      .filter((w) => w.visible)
      .sort((a, b) => a.order - b.order);
  }, [widgets]);

  return {
    widgets,
    updateWidgets,
    toggleWidget,
    resetToDefault,
    isWidgetVisible,
    getVisibleWidgets,
  };
};

export const DashboardCustomizer = memo(function DashboardCustomizer({
  onConfigChange,
}: CustomizableDashboardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { widgets, updateWidgets, toggleWidget, resetToDefault } = useCustomizableDashboard();
  const [localWidgets, setLocalWidgets] = useState(widgets);

  useEffect(() => {
    setLocalWidgets(widgets);
  }, [widgets]);

  const handleReorder = useCallback((newOrder: WidgetConfig[]) => {
    const updatedWidgets = newOrder.map((w, i) => ({ ...w, order: i }));
    setLocalWidgets(updatedWidgets);
  }, []);

  const handleSave = useCallback(() => {
    updateWidgets(localWidgets);
    onConfigChange?.(localWidgets);
    setIsOpen(false);
  }, [localWidgets, updateWidgets, onConfigChange]);

  const handleToggle = useCallback((id: string) => {
    setLocalWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w))
    );
  }, []);

  const visibleCount = localWidgets.filter((w) => w.visible).length;

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="hidden sm:inline">Personalizar</span>
      </Button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[80vh] overflow-hidden"
            >
              <Card className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Personalizar Dashboard</h3>
                      <p className="text-xs text-muted-foreground">
                        {visibleCount} widgets visíveis
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Widget List */}
                <div className="flex-1 overflow-y-auto p-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Arraste para reordenar e toggle para mostrar/ocultar widgets.
                  </p>

                  <Reorder.Group
                    axis="y"
                    values={localWidgets}
                    onReorder={handleReorder}
                    className="space-y-2"
                  >
                    {localWidgets.map((widget) => (
                      <Reorder.Item
                        key={widget.id}
                        value={widget}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-grab active:cursor-grabbing",
                          widget.visible
                            ? "bg-card border-border"
                            : "bg-muted/30 border-transparent opacity-60"
                        )}
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">
                              {widget.label}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              {categoryLabels[widget.category]}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {widget.description}
                          </p>
                        </div>

                        <Switch
                          checked={widget.visible}
                          onCheckedChange={() => handleToggle(widget.id)}
                        />
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetToDefault}
                    className="gap-2 text-muted-foreground"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restaurar Padrão
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      className="gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Salvar
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

// Wrapper component that conditionally renders widgets
interface ConditionalWidgetProps {
  widgetId: string;
  children: React.ReactNode;
  className?: string;
}

export const ConditionalWidget = memo(function ConditionalWidget({
  widgetId,
  children,
  className,
}: ConditionalWidgetProps) {
  const { isWidgetVisible } = useCustomizableDashboard();

  if (!isWidgetVisible(widgetId)) {
    return null;
  }

  return <div className={className}>{children}</div>;
});

export { defaultWidgets };
export type { WidgetConfig };
