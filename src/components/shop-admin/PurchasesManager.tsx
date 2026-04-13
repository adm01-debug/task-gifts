import { useState, useCallback, useMemo, forwardRef } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  ShoppingCart,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAdminPurchases,
  useUpdatePurchaseStatus,
} from "@/hooks/useShop";
import { shopService, type PurchaseStatus } from "@/services/shopService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const PurchasesManager = forwardRef<HTMLDivElement>(function PurchasesManager(_, ref) {
  const { data: purchases, isLoading } = useAdminPurchases();
  const updateStatusMutation = useUpdatePurchaseStatus();
  const [updatingPurchaseIds, setUpdatingPurchaseIds] = useState<Set<string>>(new Set());

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
    setUpdatingPurchaseIds(prev => new Set(prev).add(purchaseId));
    updateStatusMutation.mutate(
      { purchaseId, status },
      {
        onSettled: () => setUpdatingPurchaseIds(prev => {
          const next = new Set(prev);
          next.delete(purchaseId);
          return next;
        }),
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
                            ? shopService.getCategoryConfig(purchase.reward.category).icon
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
                          disabled={updatingPurchaseIds.has(purchase.id)}
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
