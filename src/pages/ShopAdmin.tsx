import { useState } from "react";
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
} from "@/hooks/useShop";
import {
  shopService,
  type ShopReward,
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

function RewardsManager() {
  const { data: rewards, isLoading } = useAdminRewards();
  const createMutation = useCreateReward();
  const updateMutation = useUpdateReward();
  const deleteMutation = useDeleteReward();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<ShopReward | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ShopReward | null>(null);

  const handleCreate = () => {
    setEditingReward(null);
    setDialogOpen(true);
  };

  const handleEdit = (reward: ShopReward) => {
    setEditingReward(reward);
    setDialogOpen(true);
  };

  const handleSave = (data: RewardFormData) => {
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
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm.id, {
        onSuccess: () => setDeleteConfirm(null),
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando recompensas...</div>;
  }

  return (
    <div className="space-y-4">
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
              className="bg-destructive text-destructive-foreground"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PurchasesManager() {
  const { data: purchases, isLoading } = useAdminPurchases();
  const updateStatusMutation = useUpdatePurchaseStatus();

  const statusConfig: Record<
    PurchaseStatus,
    { label: string; color: string; icon: React.ReactNode }
  > = {
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
  };

  const handleStatusChange = (purchaseId: string, status: PurchaseStatus) => {
    updateStatusMutation.mutate({ purchaseId, status });
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando pedidos...</div>;
  }

  const pendingCount = purchases?.filter((p) => p.status === "pending").length || 0;

  return (
    <div className="space-y-4">
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
                          disabled={updateStatusMutation.isPending}
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
}

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
              <p className="text-white/80">
                Gerencie recompensas e processe pedidos
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <Tabs defaultValue="rewards" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Recompensas
            </TabsTrigger>
            <TabsTrigger value="purchases" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Pedidos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rewards">
            <RewardsManager />
          </TabsContent>

          <TabsContent value="purchases">
            <PurchasesManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
