import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Sparkles,
  Crown,
  Medal,
  Award,
  Shield,
  Star,
  Zap,
  Palette,
  ChevronRight,
  Settings2,
  Copy,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDepartments } from "@/hooks/useDepartments";
import {
  useGamificationThemes,
  useCreateTheme,
  useUpdateTheme,
  useDeleteTheme,
  useCustomRanks,
  useCreateRank,
  useUpdateRank,
  useDeleteRank,
  useCustomBadges,
  useCreateBadge,
  useUpdateBadge,
  useDeleteBadge,
  useCustomTitles,
  useCreateTitle,
  useUpdateTitle,
  useDeleteTitle,
  useApplyPreset,
} from "@/hooks/useGamificationAdmin";
import { 
  THEME_PRESETS, 
  GamificationTheme, 
  CustomRank, 
  CustomBadge, 
  CustomTitle 
} from "@/services/gamificationAdminService";

const RARITY_CONFIG = {
  common: { label: "Comum", color: "#9ca3af", icon: "⚪" },
  uncommon: { label: "Incomum", color: "#22c55e", icon: "🟢" },
  rare: { label: "Raro", color: "#3b82f6", icon: "🔵" },
  epic: { label: "Épico", color: "#a855f7", icon: "🟣" },
  legendary: { label: "Lendário", color: "#f59e0b", icon: "🟠" },
  mythic: { label: "Mítico", color: "#ef4444", icon: "🔴" },
};

const EMOJI_PICKER = ["⚔️", "🛡️", "👑", "🏆", "⭐", "🌟", "💎", "🔥", "⚡", "🎯", "🚀", "🌙", "✨", "🎮", "🥷", "🧙", "🐉", "🦅", "🐺", "🦁", "🌿", "🍃", "🌊", "❄️", "☀️"];

type UnlockType = 'level' | 'achievement' | 'purchase' | 'manual' | 'event';
type EditableItem = GamificationTheme | CustomRank | CustomBadge | CustomTitle | null;

export function GamificationManager() {
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("themes");
  const [themeDialog, setThemeDialog] = useState(false);
  const [rankDialog, setRankDialog] = useState(false);
  const [badgeDialog, setBadgeDialog] = useState(false);
  const [titleDialog, setTitleDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<EditableItem>(null);
  const [presetDialog, setPresetDialog] = useState(false);

  const { data: departments } = useDepartments();
  const { data: themes, isLoading: themesLoading } = useGamificationThemes();
  const { data: ranks } = useCustomRanks(selectedThemeId);
  const { data: badges } = useCustomBadges(selectedThemeId);
  const { data: titles } = useCustomTitles(selectedThemeId);

  const createTheme = useCreateTheme();
  const updateTheme = useUpdateTheme();
  const deleteTheme = useDeleteTheme();
  const createRank = useCreateRank();
  const updateRank = useUpdateRank();
  const deleteRank = useDeleteRank();
  const createBadge = useCreateBadge();
  const updateBadge = useUpdateBadge();
  const deleteBadge = useDeleteBadge();
  const createTitle = useCreateTitle();
  const updateTitle = useUpdateTitle();
  const deleteTitle = useDeleteTitle();
  const applyPreset = useApplyPreset();

  const selectedTheme = themes?.find((t) => t.id === selectedThemeId);

  // Theme Form State
  const [themeForm, setThemeForm] = useState({
    name: "",
    description: "",
    icon: "🎮",
    color_primary: "#6366f1",
    color_secondary: "#8b5cf6",
    department_id: null as string | null,
    is_active: true,
  });

  // Rank Form State
  const [rankForm, setRankForm] = useState({
    name: "",
    title: "",
    description: "",
    icon: "⭐",
    color: "#fbbf24",
    min_level: 1,
    max_level: null as number | null,
    xp_multiplier: 1,
    coin_multiplier: 1,
    order_index: 0,
  });

  // Badge Form State
  const [badgeForm, setBadgeForm] = useState({
    name: "",
    description: "",
    icon: "🏆",
    color: "#fbbf24",
    rarity: "common" as keyof typeof RARITY_CONFIG,
    category: "achievement",
    xp_reward: 50,
    coin_reward: 25,
    is_active: true,
    order_index: 0,
  });

  // Title Form State
  const [titleForm, setTitleForm] = useState({
    name: "",
    prefix: "",
    suffix: "",
    description: "",
    icon: "👑",
    color: "#fbbf24",
    unlock_type: "level" as string,
    is_limited: false,
    max_holders: null as number | null,
    is_active: true,
    order_index: 0,
  });

  const handleSaveTheme = async () => {
    if (editingItem) {
      await updateTheme.mutateAsync({ id: editingItem.id, updates: themeForm });
    } else {
      await createTheme.mutateAsync(themeForm);
    }
    setThemeDialog(false);
    setEditingItem(null);
    resetThemeForm();
  };

  const handleSaveRank = async () => {
    if (!selectedThemeId) return;
    if (editingItem) {
      await updateRank.mutateAsync({ id: editingItem.id, updates: rankForm });
    } else {
      await createRank.mutateAsync({ ...rankForm, theme_id: selectedThemeId, badge_url: null, special_perks: [] });
    }
    setRankDialog(false);
    setEditingItem(null);
    resetRankForm();
  };

  const handleSaveBadge = async () => {
    if (!selectedThemeId) return;
    if (editingItem) {
      await updateBadge.mutateAsync({ id: editingItem.id, updates: badgeForm });
    } else {
      await createBadge.mutateAsync({ ...badgeForm, theme_id: selectedThemeId, unlock_condition: {} });
    }
    setBadgeDialog(false);
    setEditingItem(null);
    resetBadgeForm();
  };

  const handleSaveTitle = async () => {
    if (!selectedThemeId) return;
    const formData = { ...titleForm, unlock_type: titleForm.unlock_type as UnlockType };
    if (editingItem) {
      await updateTitle.mutateAsync({ id: editingItem.id, updates: formData });
    } else {
      await createTitle.mutateAsync({ ...formData, theme_id: selectedThemeId, unlock_requirement: {} });
    }
    setTitleDialog(false);
    setEditingItem(null);
    resetTitleForm();
  };

  const handleApplyPreset = async (presetKey: keyof typeof THEME_PRESETS) => {
    if (!selectedThemeId) return;
    await applyPreset.mutateAsync({ themeId: selectedThemeId, presetKey });
    setPresetDialog(false);
  };

  const resetThemeForm = () => setThemeForm({ name: "", description: "", icon: "🎮", color_primary: "#6366f1", color_secondary: "#8b5cf6", department_id: null, is_active: true });
  const resetRankForm = () => setRankForm({ name: "", title: "", description: "", icon: "⭐", color: "#fbbf24", min_level: 1, max_level: null, xp_multiplier: 1, coin_multiplier: 1, order_index: 0 });
  const resetBadgeForm = () => setBadgeForm({ name: "", description: "", icon: "🏆", color: "#fbbf24", rarity: "common", category: "achievement", xp_reward: 50, coin_reward: 25, is_active: true, order_index: 0 });
  const resetTitleForm = () => setTitleForm({ name: "", prefix: "", suffix: "", description: "", icon: "👑", color: "#fbbf24", unlock_type: "level", is_limited: false, max_holders: null, is_active: true, order_index: 0 });

  const openEditTheme = (theme: GamificationTheme) => {
    setThemeForm({
      name: theme.name,
      description: theme.description || "",
      icon: theme.icon,
      color_primary: theme.color_primary,
      color_secondary: theme.color_secondary,
      department_id: theme.department_id,
      is_active: theme.is_active,
    });
    setEditingItem(theme);
    setThemeDialog(true);
  };

  const openEditRank = (rank: CustomRank) => {
    setRankForm({
      name: rank.name,
      title: rank.title,
      description: rank.description || "",
      icon: rank.icon,
      color: rank.color,
      min_level: rank.min_level,
      max_level: rank.max_level,
      xp_multiplier: rank.xp_multiplier,
      coin_multiplier: rank.coin_multiplier,
      order_index: rank.order_index,
    });
    setEditingItem(rank);
    setRankDialog(true);
  };

  const openEditBadge = (badge: CustomBadge) => {
    setBadgeForm({
      name: badge.name,
      description: badge.description || "",
      icon: badge.icon,
      color: badge.color,
      rarity: badge.rarity,
      category: badge.category,
      xp_reward: badge.xp_reward,
      coin_reward: badge.coin_reward,
      is_active: badge.is_active,
      order_index: badge.order_index,
    });
    setEditingItem(badge);
    setBadgeDialog(true);
  };

  const openEditTitle = (title: CustomTitle) => {
    setTitleForm({
      name: title.name,
      prefix: title.prefix || "",
      suffix: title.suffix || "",
      description: title.description || "",
      icon: title.icon,
      color: title.color,
      unlock_type: title.unlock_type,
      is_limited: title.is_limited,
      max_holders: title.max_holders,
      is_active: title.is_active,
      order_index: title.order_index,
    });
    setEditingItem(title);
    setTitleDialog(true);
  };

  if (themesLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted/50 rounded-lg animate-pulse" />
        <div className="h-64 bg-muted/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            Gamificação Customizada
          </h2>
          <p className="text-muted-foreground">
            Crie universos únicos com hierarquias, títulos e conquistas personalizadas por departamento
          </p>
        </div>
        <Dialog open={themeDialog} onOpenChange={setThemeDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => { resetThemeForm(); setEditingItem(null); }}>
              <Plus className="h-4 w-4" />
              Novo Tema
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar Tema" : "Criar Novo Tema"}</DialogTitle>
              <DialogDescription>
                Configure o tema de gamificação para um departamento
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Nome do Tema</Label>
                  <Input
                    value={themeForm.name}
                    onChange={(e) => setThemeForm({ ...themeForm, name: e.target.value })}
                    placeholder="Ex: Reino Medieval"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={themeForm.description}
                    onChange={(e) => setThemeForm({ ...themeForm, description: e.target.value })}
                    placeholder="Descreva o universo do tema..."
                  />
                </div>
                <div>
                  <Label>Departamento</Label>
                  <Select
                    value={themeForm.department_id || "global"}
                    onValueChange={(v) => setThemeForm({ ...themeForm, department_id: v === "global" ? null : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">🌐 Global (Todos)</SelectItem>
                      {departments?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ícone</Label>
                  <Select value={themeForm.icon} onValueChange={(v) => setThemeForm({ ...themeForm, icon: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="grid grid-cols-5 gap-1 p-2">
                        {EMOJI_PICKER.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            className="p-2 hover:bg-muted rounded-md text-lg transition-colors"
                            onClick={() => setThemeForm({ ...themeForm, icon: emoji })}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={themeForm.color_primary}
                      onChange={(e) => setThemeForm({ ...themeForm, color_primary: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={themeForm.color_primary}
                      onChange={(e) => setThemeForm({ ...themeForm, color_primary: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={themeForm.color_secondary}
                      onChange={(e) => setThemeForm({ ...themeForm, color_secondary: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={themeForm.color_secondary}
                      onChange={(e) => setThemeForm({ ...themeForm, color_secondary: e.target.value })}
                    />
                  </div>
                </div>
                <div className="col-span-2 flex items-center justify-between">
                  <Label>Tema Ativo</Label>
                  <Switch
                    checked={themeForm.is_active}
                    onCheckedChange={(v) => setThemeForm({ ...themeForm, is_active: v })}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setThemeDialog(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSaveTheme} disabled={!themeForm.name}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Themes Grid */}
      {!selectedThemeId && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes?.map((theme, index) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="cursor-pointer hover:border-primary/50 transition-all group relative overflow-hidden"
                onClick={() => setSelectedThemeId(theme.id)}
              >
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: `linear-gradient(135deg, ${theme.color_primary}, ${theme.color_secondary})`,
                  }}
                />
                <CardHeader className="pb-2 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${theme.color_primary}20` }}
                      >
                        {theme.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{theme.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {departments?.find((d) => d.id === theme.department_id)?.name || "Global"}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); openEditTheme(theme); }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir tema?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Todos os ranks, badges e títulos associados serão removidos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteTheme.mutate(theme.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {theme.description || "Sem descrição"}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant={theme.is_active ? "default" : "secondary"}>
                      {theme.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {(!themes || themes.length === 0) && (
            <Card className="col-span-full p-8 text-center border-dashed">
              <Wand2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum tema criado</h3>
              <p className="text-muted-foreground mb-4">
                Crie seu primeiro tema de gamificação para começar a personalizar a experiência
              </p>
              <Button onClick={() => { resetThemeForm(); setThemeDialog(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Tema
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Theme Detail View */}
      {selectedTheme && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Theme Header */}
          <Card
            className="overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${selectedTheme.color_primary}15, ${selectedTheme.color_secondary}15)`,
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedThemeId(null)}>
                    <X className="h-5 w-5" />
                  </Button>
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                    style={{ backgroundColor: `${selectedTheme.color_primary}30` }}
                  >
                    {selectedTheme.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedTheme.name}</h3>
                    <p className="text-muted-foreground">
                      {departments?.find((d) => d.id === selectedTheme.department_id)?.name || "Aplicado globalmente"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog open={presetDialog} onOpenChange={setPresetDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Copy className="h-4 w-4" />
                        Aplicar Preset
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Aplicar Preset de Tema</DialogTitle>
                        <DialogDescription>
                          Escolha um preset para aplicar ranks e níveis pré-configurados
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(THEME_PRESETS).map(([key, preset]) => (
                          <Button
                            key={key}
                            variant="outline"
                            className="h-auto p-4 flex flex-col items-start gap-2"
                            onClick={() => handleApplyPreset(key as keyof typeof THEME_PRESETS)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{preset.icon}</span>
                              <span className="font-semibold">{preset.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {preset.ranks.length} ranks incluídos
                            </span>
                          </Button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" className="gap-2" onClick={() => openEditTheme(selectedTheme)}>
                    <Settings2 className="h-4 w-4" />
                    Configurações
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="ranks" className="gap-2">
                <Crown className="h-4 w-4" />
                Hierarquias ({ranks?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="badges" className="gap-2">
                <Medal className="h-4 w-4" />
                Badges ({badges?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="titles" className="gap-2">
                <Award className="h-4 w-4" />
                Títulos ({titles?.length || 0})
              </TabsTrigger>
            </TabsList>

            {/* Ranks Tab */}
            <TabsContent value="ranks" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground">
                  Configure os níveis de hierarquia do tema
                </p>
                <Dialog open={rankDialog} onOpenChange={setRankDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetRankForm(); setEditingItem(null); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Rank
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingItem ? "Editar Rank" : "Criar Novo Rank"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Nome (interno)</Label>
                          <Input
                            value={rankForm.name}
                            onChange={(e) => setRankForm({ ...rankForm, name: e.target.value })}
                            placeholder="knight_gold"
                          />
                        </div>
                        <div>
                          <Label>Título (exibido)</Label>
                          <Input
                            value={rankForm.title}
                            onChange={(e) => setRankForm({ ...rankForm, title: e.target.value })}
                            placeholder="Cavaleiro Dourado"
                          />
                        </div>
                        <div>
                          <Label>Nível Mínimo</Label>
                          <Input
                            type="number"
                            value={rankForm.min_level}
                            onChange={(e) => setRankForm({ ...rankForm, min_level: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>Nível Máximo</Label>
                          <Input
                            type="number"
                            value={rankForm.max_level || ""}
                            onChange={(e) => setRankForm({ ...rankForm, max_level: e.target.value ? parseInt(e.target.value) : null })}
                            placeholder="Infinito"
                          />
                        </div>
                        <div>
                          <Label>Ícone</Label>
                          <Select value={rankForm.icon} onValueChange={(v) => setRankForm({ ...rankForm, icon: v })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="grid grid-cols-5 gap-1 p-2">
                                {EMOJI_PICKER.map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    className="p-2 hover:bg-muted rounded-md text-lg transition-colors"
                                    onClick={() => setRankForm({ ...rankForm, icon: emoji })}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Cor</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={rankForm.color}
                              onChange={(e) => setRankForm({ ...rankForm, color: e.target.value })}
                              className="w-12 h-10 p-1"
                            />
                            <Input
                              value={rankForm.color}
                              onChange={(e) => setRankForm({ ...rankForm, color: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Multiplicador XP</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={rankForm.xp_multiplier}
                            onChange={(e) => setRankForm({ ...rankForm, xp_multiplier: parseFloat(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>Multiplicador Coins</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={rankForm.coin_multiplier}
                            onChange={(e) => setRankForm({ ...rankForm, coin_multiplier: parseFloat(e.target.value) })}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Descrição</Label>
                          <Textarea
                            value={rankForm.description}
                            onChange={(e) => setRankForm({ ...rankForm, description: e.target.value })}
                            placeholder="Descrição do rank..."
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setRankDialog(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveRank} disabled={!rankForm.name || !rankForm.title}>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ranks?.map((rank, index) => (
                  <motion.div
                    key={rank.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="hover:border-primary/40 transition-colors group">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                              style={{ backgroundColor: `${rank.color}20`, color: rank.color }}
                            >
                              {rank.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold">{rank.title}</h4>
                              <p className="text-xs text-muted-foreground">
                                Nível {rank.min_level} - {rank.max_level || "∞"}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => openEditRank(rank)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteRank.mutate(rank.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2 text-xs">
                          <Badge variant="secondary">
                            <Zap className="h-3 w-3 mr-1" />
                            {rank.xp_multiplier}x XP
                          </Badge>
                          <Badge variant="secondary">
                            <Star className="h-3 w-3 mr-1" />
                            {rank.coin_multiplier}x Coins
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {(!ranks || ranks.length === 0) && (
                  <Card className="col-span-full p-8 text-center border-dashed">
                    <Crown className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      Nenhum rank criado. Use um preset ou crie manualmente.
                    </p>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Badges Tab */}
            <TabsContent value="badges" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground">
                  Configure as conquistas e badges do tema
                </p>
                <Dialog open={badgeDialog} onOpenChange={setBadgeDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetBadgeForm(); setEditingItem(null); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Badge
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingItem ? "Editar Badge" : "Criar Nova Badge"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label>Nome</Label>
                          <Input
                            value={badgeForm.name}
                            onChange={(e) => setBadgeForm({ ...badgeForm, name: e.target.value })}
                            placeholder="Conquistador Supremo"
                          />
                        </div>
                        <div>
                          <Label>Ícone</Label>
                          <Select value={badgeForm.icon} onValueChange={(v) => setBadgeForm({ ...badgeForm, icon: v })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="grid grid-cols-5 gap-1 p-2">
                                {EMOJI_PICKER.map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    className="p-2 hover:bg-muted rounded-md text-lg transition-colors"
                                    onClick={() => setBadgeForm({ ...badgeForm, icon: emoji })}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Raridade</Label>
                          <Select value={badgeForm.rarity} onValueChange={(v) => setBadgeForm({ ...badgeForm, rarity: v as keyof typeof RARITY_CONFIG })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(RARITY_CONFIG).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  <span className="flex items-center gap-2">
                                    {config.icon} {config.label}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Recompensa XP</Label>
                          <Input
                            type="number"
                            value={badgeForm.xp_reward}
                            onChange={(e) => setBadgeForm({ ...badgeForm, xp_reward: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>Recompensa Coins</Label>
                          <Input
                            type="number"
                            value={badgeForm.coin_reward}
                            onChange={(e) => setBadgeForm({ ...badgeForm, coin_reward: parseInt(e.target.value) })}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Descrição</Label>
                          <Textarea
                            value={badgeForm.description}
                            onChange={(e) => setBadgeForm({ ...badgeForm, description: e.target.value })}
                            placeholder="Descrição da badge..."
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-between">
                          <Label>Badge Ativa</Label>
                          <Switch
                            checked={badgeForm.is_active}
                            onCheckedChange={(v) => setBadgeForm({ ...badgeForm, is_active: v })}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setBadgeDialog(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveBadge} disabled={!badgeForm.name}>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {badges?.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="hover:border-primary/40 transition-colors group">
                      <CardContent className="p-4 text-center">
                        <div
                          className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-3"
                          style={{
                            backgroundColor: `${RARITY_CONFIG[badge.rarity as keyof typeof RARITY_CONFIG]?.color || badge.color}20`,
                            borderColor: RARITY_CONFIG[badge.rarity as keyof typeof RARITY_CONFIG]?.color || badge.color,
                            borderWidth: 2,
                          }}
                        >
                          {badge.icon}
                        </div>
                        <h4 className="font-semibold text-sm">{badge.name}</h4>
                        <Badge
                          className="mt-2 text-xs"
                          style={{
                            backgroundColor: `${RARITY_CONFIG[badge.rarity as keyof typeof RARITY_CONFIG]?.color}20`,
                            color: RARITY_CONFIG[badge.rarity as keyof typeof RARITY_CONFIG]?.color,
                          }}
                        >
                          {RARITY_CONFIG[badge.rarity as keyof typeof RARITY_CONFIG]?.label || badge.rarity}
                        </Badge>
                        <div className="mt-2 text-xs text-muted-foreground">
                          +{badge.xp_reward} XP · +{badge.coin_reward} 🪙
                        </div>
                        <div className="flex gap-1 justify-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => openEditBadge(badge)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteBadge.mutate(badge.id)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {(!badges || badges.length === 0) && (
                  <Card className="col-span-full p-8 text-center border-dashed">
                    <Medal className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      Nenhuma badge criada. Adicione conquistas personalizadas.
                    </p>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Titles Tab */}
            <TabsContent value="titles" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground">
                  Configure títulos especiais que os usuários podem exibir
                </p>
                <Dialog open={titleDialog} onOpenChange={setTitleDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetTitleForm(); setEditingItem(null); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Título
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingItem ? "Editar Título" : "Criar Novo Título"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label>Nome do Título</Label>
                          <Input
                            value={titleForm.name}
                            onChange={(e) => setTitleForm({ ...titleForm, name: e.target.value })}
                            placeholder="O Invencível"
                          />
                        </div>
                        <div>
                          <Label>Prefixo (opcional)</Label>
                          <Input
                            value={titleForm.prefix}
                            onChange={(e) => setTitleForm({ ...titleForm, prefix: e.target.value })}
                            placeholder="Sir"
                          />
                        </div>
                        <div>
                          <Label>Sufixo (opcional)</Label>
                          <Input
                            value={titleForm.suffix}
                            onChange={(e) => setTitleForm({ ...titleForm, suffix: e.target.value })}
                            placeholder="o Grande"
                          />
                        </div>
                        <div>
                          <Label>Ícone</Label>
                          <Select value={titleForm.icon} onValueChange={(v) => setTitleForm({ ...titleForm, icon: v })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="grid grid-cols-5 gap-1 p-2">
                                {EMOJI_PICKER.map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    className="p-2 hover:bg-muted rounded-md text-lg transition-colors"
                                    onClick={() => setTitleForm({ ...titleForm, icon: emoji })}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Tipo de Desbloqueio</Label>
                          <Select value={titleForm.unlock_type} onValueChange={(v) => setTitleForm({ ...titleForm, unlock_type: v as typeof titleForm.unlock_type })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="level">Por Nível</SelectItem>
                              <SelectItem value="achievement">Por Conquista</SelectItem>
                              <SelectItem value="purchase">Por Compra</SelectItem>
                              <SelectItem value="manual">Atribuição Manual</SelectItem>
                              <SelectItem value="event">Por Evento</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Label>Descrição</Label>
                          <Textarea
                            value={titleForm.description}
                            onChange={(e) => setTitleForm({ ...titleForm, description: e.target.value })}
                            placeholder="Como conquistar este título..."
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Título Limitado</Label>
                          <Switch
                            checked={titleForm.is_limited}
                            onCheckedChange={(v) => setTitleForm({ ...titleForm, is_limited: v })}
                          />
                        </div>
                        {titleForm.is_limited && (
                          <div>
                            <Label>Máximo de Portadores</Label>
                            <Input
                              type="number"
                              value={titleForm.max_holders || ""}
                              onChange={(e) => setTitleForm({ ...titleForm, max_holders: e.target.value ? parseInt(e.target.value) : null })}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setTitleDialog(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveTitle} disabled={!titleForm.name}>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {titles?.map((title, index) => (
                  <motion.div
                    key={title.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="hover:border-primary/40 transition-colors group">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                              style={{ backgroundColor: `${title.color}20` }}
                            >
                              {title.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold">{title.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {title.prefix && `${title.prefix} `}[Nome]{title.suffix && ` ${title.suffix}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => openEditTitle(title)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteTitle.mutate(title.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Badge variant="outline">
                            {title.unlock_type === "level" && "Por Nível"}
                            {title.unlock_type === "achievement" && "Por Conquista"}
                            {title.unlock_type === "purchase" && "Por Compra"}
                            {title.unlock_type === "manual" && "Manual"}
                            {title.unlock_type === "event" && "Por Evento"}
                          </Badge>
                          {title.is_limited && (
                            <Badge variant="secondary">
                              Limitado ({title.max_holders})
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {(!titles || titles.length === 0) && (
                  <Card className="col-span-full p-8 text-center border-dashed">
                    <Award className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      Nenhum título criado. Adicione títulos especiais.
                    </p>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </div>
  );
}
