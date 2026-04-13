import { motion } from "framer-motion";
import { Coins, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserPurchases } from "@/hooks/useShop";
import { shopService } from "@/services/shopService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig = {
  pending: { label: "Pendente", color: "bg-yellow-500" },
  approved: { label: "Aprovado", color: "bg-blue-500" },
  delivered: { label: "Entregue", color: "bg-green-500" },
  cancelled: { label: "Cancelado", color: "bg-red-500" },
} as const;

export function PurchaseHistory() {
  const { data: purchases, isLoading } = useUserPurchases();

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando histórico...</div>;
  }

  if (!purchases || purchases.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Você ainda não resgatou nenhuma recompensa</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {purchases.map((purchase, index) => (
        <motion.div
          key={purchase.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                    {purchase.reward ? shopService.getCategoryConfig(purchase.reward.category).icon : "🎁"}
                  </div>
                  <div>
                    <p className="font-medium">{purchase.reward?.name || "Recompensa"}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(purchase.created_at), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Coins className="w-4 h-4" />
                    <span className="font-medium">{purchase.total_coins}</span>
                  </div>
                  <Badge className={statusConfig[purchase.status].color}>
                    {statusConfig[purchase.status].label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
