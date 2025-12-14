import { useState, useEffect, forwardRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Settings,
  Zap,
  Percent,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog";
import {
  useAdminRewards,
  useAdminPurchases,
  useCreateReward,
  useUpdateReward,
  useDeleteReward,
  useUpdatePurchaseStatus,
  useAdminPromotions,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
} from "@/hooks/useShop";
import {
  shopService,
  type ShopReward,
  type ShopPromotion,
  type RewardCategory,
  type RewardRarity,
  type PurchaseStatus,
} from "@/services/shopService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RewardFormData {
  name: string;
  description: string;
  category: RewardCategory;
  price_coins: number;
  stock: number | null;
  rarity: RewardRarity;
  is_active: boolean;
  image_url: string;
}

const emptyFormData: RewardFormData = {
  name: "",
  description: "",
  category: "product",
  price_coins: 100,
  stock: null,
  rarity: "common",
  is_active: true,
  image_url: "",
};

function RewardFormDialog({
  open,
  onOpenChange,
  editingReward,
  onSave,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingReward: ShopReward | null;
  onSave: (data: RewardFormData) => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState<RewardFormData>(
    editingReward
      ? {
          name: editingReward.name,
          description: editingReward.description || "",
          category: editingReward.category,
          price_coins: editingReward.price_coins,
          stock: editingReward.stock,
          rarity: editingReward.rarity,
          is_active: editingReward.is_active,
          image_url: editingReward.image_url || "",
        }
      : emptyFormData
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingReward ? "Editar Recompensa" : "Nova Recompensa"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da recompensa
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(v) =>
                  setFormData({ ...formData, category: v as RewardCategory })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">🎁 Produto</SelectItem>
                  <SelectItem value="benefit">🌟 Benefício</SelectItem>
                  <SelectItem value="experience">🎯 Experiência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Raridade</Label>
              <Select
                value={formData.rarity}
                onValueChange={(v) =>
                  setFormData({ ...formData, rarity: v as RewardRarity })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="common">Comum</SelectItem>
                  <SelectItem value="rare">Raro</SelectItem>
                  <SelectItem value="epic">Épico</SelectItem>
                  <SelectItem value="legendary">Lendário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (moedas)</Label>
              <Input
                id="price"
                type="number"
                min={1}
                value={formData.price_coins}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price_coins: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Estoque (vazio = ilimitado)</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                value={formData.stock ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder="Ilimitado"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">URL da Imagem (opcional)</Label>
            <Input
              id="image"
              type="url"
              value={formData.image_url}
              onChange={(e) =>
                setFormData({ ...formData, image_url: e.target.value })
              }
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="active">Ativo na loja</Label>
            <Switch
              id="active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const RewardsManager = forwardRef<HTMLDivElement>(function RewardsManager(_, ref) {
  const { data: rewards, isLoading } = useAdminRewards();
  const createMutation = useCreateReward();
  const updateMutation = useUpdateReward();
  const deleteMutation = useDeleteReward();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<ShopReward | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ShopReward | null>(null);
  const [deletingRewardId, setDeletingRewardId] = useState<string | null>(null);

  const handleCreate = useCallback(() => {
    setEditingReward(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((reward: ShopReward) => {
    setEditingReward(reward);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback((data: RewardFormData) => {
    if (editingReward) {
      updateMutation.mutate(
        { id: editingReward.id, updates: data },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createMutation.mutate(data as any, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  }, [editingReward, updateMutation, createMutation]);

  const handleDelete = useCallback(() => {
    if (deleteConfirm) {
      setDeletingRewardId(deleteConfirm.id);
      deleteMutation.mutate(deleteConfirm.id, {
        onSettled: () => {
          setDeletingRewardId(null);
          setDeleteConfirm(null);
        },
      });
    }
  }, [deleteConfirm, deleteMutation]);

  if (isLoading) {
    return <div ref={ref} className="text-center py-8">Carregando recompensas...</div>;
  }

  return (
    <div ref={ref} className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          Recompensas ({rewards?.length || 0})
        </h2>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Recompensa
        </Button>
      </div>

      <div className="grid gap-3">
        <AnimatePresence mode="popLayout">
          {rewards?.map((reward, index) => {
            const rarityConfig = shopService.getRarityConfig(reward.rarity);
            const categoryConfig = shopService.getCategoryConfig(reward.category);

            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.02 }}
              >
                <Card
                  className={`${
                    !reward.is_active ? "opacity-60" : ""
                  } border-l-4 ${rarityConfig.borderColor}`}
                >
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                            reward.rarity === "legendary"
                              ? "bg-amber-100 dark:bg-amber-900/30"
                              : reward.rarity === "epic"
                              ? "bg-purple-100 dark:bg-purple-900/30"
                              : reward.rarity === "rare"
                              ? "bg-blue-100 dark:bg-blue-900/30"
                              : "bg-muted"
                          }`}
                        >
                          {categoryConfig.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{reward.name}</span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${rarityConfig.textColor}`}
                            >
                              {rarityConfig.label}
                            </Badge>
                            {!reward.is_active && (
                              <Badge variant="secondary" className="text-xs">
                                Inativo
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              🪙 {reward.price_coins}
                            </span>
                            <span>
                              {reward.stock === null
                                ? "∞ estoque"
                                : `${reward.stock} restantes`}
                            </span>
                            <span>{categoryConfig.label}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(reward)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(reward)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <RewardFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingReward={editingReward}
        onSave={handleSave}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteConfirm?.name}"? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletingRewardId === deleteConfirm?.id}
              className="bg-destructive text-destructive-foreground"
            >
              {deletingRewardId === deleteConfirm?.id ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

const PurchasesManager = forwardRef<HTMLDivElement>(function PurchasesManager(_, ref) {
  const { data: purchases, isLoading } = useAdminPurchases();
  const updateStatusMutation = useUpdatePurchaseStatus();
  const [updatingPurchaseId, setUpdatingPurchaseId] = useState<string | null>(null);

  const statusConfig = useMemo(() => ({
    pending: {
      label: "Pendente",
      color: "bg-yellow-500",
      icon: <Clock className="w-4 h-4" />,
    },
    approved: {
      label: "Aprovado",
      color: "bg-blue-500",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    delivered: {
      label: "Entregue",
      color: "bg-green-500",
      icon: <Truck className="w-4 h-4" />,
    },
    cancelled: {
      label: "Cancelado",
      color: "bg-red-500",
      icon: <XCircle className="w-4 h-4" />,
    },
  } as Record<PurchaseStatus, { label: string; color: string; icon: React.ReactNode }>), []);

  const handleStatusChange = useCallback((purchaseId: string, status: PurchaseStatus) => {
    setUpdatingPurchaseId(purchaseId);
    updateStatusMutation.mutate(
      { purchaseId, status },
      {
        onSettled: () => setUpdatingPurchaseId(null),
      }
    );
  }, [updateStatusMutation]);

  const pendingCount = useMemo(() => 
    purchases?.filter((p) => p.status === "pending").length || 0
  , [purchases]);

  if (isLoading) {
    return <div ref={ref} className="text-center py-8">Carregando pedidos...</div>;
  }

  return (
    <div ref={ref} className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Pedidos ({purchases?.length || 0})</h2>
        {pendingCount > 0 && (
          <Badge variant="destructive">{pendingCount} pendente(s)</Badge>
        )}
      </div>

      {purchases?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum pedido realizado ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {purchases?.map((purchase, index) => {
            const config = statusConfig[purchase.status];

            return (
              <motion.div
                key={purchase.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <Card
                  className={`${
                    purchase.status === "pending" ? "border-yellow-500" : ""
                  }`}
                >
                  <CardContent className="py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                          {purchase.reward
                            ? shopService.getCategoryConfig(purchase.reward.category)
                                .icon
                            : "🎁"}
                        </div>
                        <div>
                          <div className="font-medium">
                            {purchase.reward?.name || "Recompensa"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">
                              {purchase.profile?.display_name ||
                                purchase.profile?.email ||
                                "Usuário"}
                            </span>
                            {" • "}
                            {format(
                              new Date(purchase.created_at),
                              "dd/MM/yyyy HH:mm",
                              { locale: ptBR }
                            )}
                          </div>
                          <div className="text-sm">
                            <span className="text-amber-600 font-medium">
                              🪙 {purchase.total_coins} moedas
                            </span>
                            {purchase.quantity > 1 && (
                              <span className="text-muted-foreground">
                                {" "}
                                (x{purchase.quantity})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge className={`${config.color} text-white`}>
                          {config.icon}
                          <span className="ml-1">{config.label}</span>
                        </Badge>

                        <Select
                          value={purchase.status}
                          onValueChange={(v) =>
                            handleStatusChange(purchase.id, v as PurchaseStatus)
                          }
                          disabled={updatingPurchaseId === purchase.id}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Alterar status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="approved">Aprovar</SelectItem>
                            <SelectItem value="delivered">Entregue</SelectItem>
                            <SelectItem value="cancelled">Cancelar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {purchase.notes && (
                      <div className="mt-2 text-sm text-muted-foreground bg-muted p-2 rounded">
                        📝 {purchase.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
});

interface PromotionFormData {
  reward_id: string;
  title: string;
  description: string;
  discount_percent: number | null;
  discount_coins: number | null;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  max_claims: number | null;
}

const emptyPromotionForm: PromotionFormData = {
  reward_id: "",
  title: "",
  description: "",
  discount_percent: null,
  discount_coins: null,
  starts_at: new Date().toISOString().slice(0, 16),
  ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  is_active: true,
  max_claims: null,
};

interface PromotionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPromotion: ShopPromotion | null;
  rewards: ShopReward[];
  onSave: (data: PromotionFormData) => void;
  isSaving: boolean;
}

const PromotionFormDialog = forwardRef<HTMLDivElement, PromotionFormDialogProps>(
  function PromotionFormDialog({ open, onOpenChange, editingPromotion, rewards, onSave, isSaving }, ref) {
  const [formData, setFormData] = useState<PromotionFormData>(emptyPromotionForm);
  const [discountType, setDiscountType] = useState<"percent" | "coins">("percent");

  useEffect(() => {
    if (editingPromotion) {
      setFormData({
        reward_id: editingPromotion.reward_id,
        title: editingPromotion.title,
        description: editingPromotion.description || "",
        discount_percent: editingPromotion.discount_percent,
        discount_coins: editingPromotion.discount_coins,
        starts_at: new Date(editingPromotion.starts_at).toISOString().slice(0, 16),
        ends_at: new Date(editingPromotion.ends_at).toISOString().slice(0, 16),
        is_active: editingPromotion.is_active,
        max_claims: editingPromotion.max_claims,
      });
      setDiscountType(editingPromotion.discount_percent ? "percent" : "coins");
    } else {
      setFormData(emptyPromotionForm);
      setDiscountType("percent");
    }
  }, [editingPromotion, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      discount_percent: discountType === "percent" ? formData.discount_percent : null,
      discount_coins: discountType === "coins" ? formData.discount_coins : null,
    };
    onSave(submitData);
  };

  const selectedReward = rewards.find((r) => r.id === formData.reward_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPromotion ? "Editar Promoção" : "Nova Promoção"}
          </DialogTitle>
          <DialogDescription>Configure os detalhes da oferta temporária</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Recompensa</Label>
            <Select
              value={formData.reward_id}
              onValueChange={(v) => setFormData({ ...formData, reward_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma recompensa" />
              </SelectTrigger>
              <SelectContent>
                {rewards.map((reward) => (
                  <SelectItem key={reward.id} value={reward.id}>
                    {reward.name} - 🪙 {reward.price_coins}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-title">Título da Promoção</Label>
            <Input
              id="promo-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Black Friday - 50% OFF!"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-desc">Descrição (opcional)</Label>
            <Textarea
              id="promo-desc"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="Descreva os detalhes da promoção..."
            />
          </div>

          <div className="space-y-3">
            <Label>Tipo de Desconto</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={discountType === "percent" ? "default" : "outline"}
                size="sm"
                onClick={() => setDiscountType("percent")}
              >
                <Percent className="w-4 h-4 mr-1" />
                Percentual
              </Button>
              <Button
                type="button"
                variant={discountType === "coins" ? "default" : "outline"}
                size="sm"
                onClick={() => setDiscountType("coins")}
              >
                🪙 Moedas Fixas
              </Button>
            </div>

            {discountType === "percent" ? (
              <div className="space-y-2">
                <Label htmlFor="discount-percent">Desconto (%)</Label>
                <Input
                  id="discount-percent"
                  type="number"
                  min={1}
                  max={100}
                  value={formData.discount_percent ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount_percent: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  placeholder="Ex: 30"
                />
                {selectedReward && formData.discount_percent && (
                  <p className="text-sm text-muted-foreground">
                    Preço final: 🪙{" "}
                    {Math.round(selectedReward.price_coins * (1 - formData.discount_percent / 100))}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="discount-coins">Desconto em Moedas</Label>
                <Input
                  id="discount-coins"
                  type="number"
                  min={1}
                  value={formData.discount_coins ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount_coins: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  placeholder="Ex: 50"
                />
                {selectedReward && formData.discount_coins && (
                  <p className="text-sm text-muted-foreground">
                    Preço final: 🪙 {Math.max(0, selectedReward.price_coins - formData.discount_coins)}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="starts-at">Início</Label>
              <Input
                id="starts-at"
                type="datetime-local"
                value={formData.starts_at}
                onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ends-at">Término</Label>
              <Input
                id="ends-at"
                type="datetime-local"
                value={formData.ends_at}
                onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-claims">Limite de Resgates (opcional)</Label>
            <Input
              id="max-claims"
              type="number"
              min={1}
              value={formData.max_claims ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  max_claims: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              placeholder="Ilimitado"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="promo-active">Promoção Ativa</Label>
            <Switch
              id="promo-active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving || !formData.reward_id}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

const PromotionsManager = forwardRef<HTMLDivElement>(function PromotionsManager(_, ref) {
  const { data: promotions, isLoading } = useAdminPromotions();
  const { data: rewards } = useAdminRewards();
  const createMutation = useCreatePromotion();
  const updateMutation = useUpdatePromotion();
  const deleteMutation = useDeletePromotion();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<ShopPromotion | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ShopPromotion | null>(null);
  const [deletingPromoId, setDeletingPromoId] = useState<string | null>(null);

  const handleCreate = useCallback(() => {
    setEditingPromotion(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((promo: ShopPromotion) => {
    setEditingPromotion(promo);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback((data: PromotionFormData) => {
    const payload = {
      ...data,
      starts_at: new Date(data.starts_at).toISOString(),
      ends_at: new Date(data.ends_at).toISOString(),
    };

    if (editingPromotion) {
      updateMutation.mutate(
        { id: editingPromotion.id, updates: payload },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createMutation.mutate(payload as any, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  }, [editingPromotion, updateMutation, createMutation]);

  const handleDelete = useCallback(() => {
    if (deleteConfirm) {
      setDeletingPromoId(deleteConfirm.id);
      deleteMutation.mutate(deleteConfirm.id, {
        onSettled: () => {
          setDeletingPromoId(null);
          setDeleteConfirm(null);
        },
      });
    }
  }, [deleteConfirm, deleteMutation]);

  const getPromoStatus = useCallback((promo: ShopPromotion) => {
    const now = new Date();
    const start = new Date(promo.starts_at);
    const end = new Date(promo.ends_at);

    if (!promo.is_active) return { label: "Inativa", color: "bg-muted text-muted-foreground" };
    if (now < start) return { label: "Agendada", color: "bg-blue-500 text-white" };
    if (now > end) return { label: "Expirada", color: "bg-red-500 text-white" };
    return { label: "Ativa", color: "bg-green-500 text-white" };
  }, []);

  if (isLoading) {
    return <div ref={ref} className="text-center py-8">Carregando promoções...</div>;
  }

  return (
    <div ref={ref} className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Promoções ({promotions?.length || 0})</h2>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Promoção
        </Button>
      </div>

      {promotions?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhuma promoção criada ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          <AnimatePresence mode="popLayout">
            {promotions?.map((promo, index) => {
              const status = getPromoStatus(promo);
              const reward = rewards?.find((r) => r.id === promo.reward_id);

              return (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white">
                            <Zap className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{promo.title}</span>
                              <Badge className={status.color}>{status.label}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {reward?.name || "Recompensa removida"}
                              {" • "}
                              {promo.discount_percent
                                ? `${promo.discount_percent}% OFF`
                                : `🪙 ${promo.discount_coins} OFF`}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(promo.starts_at), "dd/MM HH:mm")} -{" "}
                                {format(new Date(promo.ends_at), "dd/MM HH:mm")}
                              </span>
                              {promo.max_claims && (
                                <span>
                                  {promo.current_claims}/{promo.max_claims} resgates
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(promo)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(promo)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <PromotionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingPromotion={editingPromotion}
        rewards={rewards || []}
        onSave={handleSave}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a promoção "{deleteConfirm?.title}"? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletingPromoId === deleteConfirm?.id}
              className="bg-destructive text-destructive-foreground"
            >
              {deletingPromoId === deleteConfirm?.id ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

export default function ShopAdmin() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <Settings className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Admin da Loja</h1>
              <p className="text-white/80">Gerencie recompensas, pedidos e promoções</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <Tabs defaultValue="rewards" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Recompensas
            </TabsTrigger>
            <TabsTrigger value="purchases" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="promotions" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Promoções
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rewards">
            <RewardsManager />
          </TabsContent>

          <TabsContent value="purchases">
            <PurchasesManager />
          </TabsContent>

          <TabsContent value="promotions">
            <PromotionsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
