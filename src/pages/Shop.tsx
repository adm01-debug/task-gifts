import { useState, useCallback, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Package, Star, Target, ShoppingBag, History, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CelebrationEffect } from "@/components/CelebrationEffect";
import { FlashSalesBanner } from "@/components/FlashSalesBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useShopRewards, useUserPurchases, usePurchaseReward } from "@/hooks/useShop";
import { useProfile } from "@/hooks/useProfiles";
import { useAuth } from "@/hooks/useAuth";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useScrollHeader } from "@/hooks/useScrollHeader";
import { shopService, type ShopReward, type RewardCategory } from "@/services/shopService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { PageWrapper } from "@/components/PageWrapper";
import { SEOHead } from "@/components/SEOHead";
import { useSEO } from "@/hooks/useSEO";

interface RewardCardProps {
  reward: ShopReward;
  userCoins: number;
  onPurchase: (reward: ShopReward) => void;
  purchasingRewardId: string | null;
}

const RewardCard = forwardRef<HTMLDivElement, RewardCardProps>(function RewardCard(
  {
    reward,
    userCoins,
    onPurchase,
    purchasingRewardId,
  },
  ref
) {
  const isPurchasing = purchasingRewardId === reward.id;
  const rarityConfig = shopService.getRarityConfig(reward.rarity);
  const categoryConfig = shopService.getCategoryConfig(reward.category);
  const canAfford = userCoins >= reward.price_coins;
  const inStock = reward.stock === null || reward.stock > 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="h-full"
    >
      <Card
        className={`relative overflow-hidden h-full border-2 transition-all duration-300 ${
          rarityConfig.borderColor
        } ${rarityConfig.bgGlow} shadow-lg hover:shadow-xl`}
      >
        {/* Rarity glow effect */}
        {reward.rarity !== "common" && (
          <div
            className={`absolute inset-0 opacity-10 ${rarityConfig.color}`}
          />
        )}

        {/* Rarity badge */}
        <div className="absolute top-2 right-2 z-10">
          <Badge
            className={`${rarityConfig.color} text-white text-xs font-bold`}
          >
            {rarityConfig.label}
          </Badge>
        </div>

        {/* Stock badge */}
        {reward.stock !== null && (
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="secondary" className="text-xs">
              {reward.stock > 0 ? `${reward.stock} restantes` : "Esgotado"}
            </Badge>
          </div>
        )}

        <CardContent className="pt-12 pb-4 flex flex-col h-full">
          {/* Icon/Image */}
          <div className="flex justify-center mb-4">
            <div
              className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${
                reward.rarity === "legendary"
                  ? "bg-gradient-to-br from-amber-400 to-orange-500 animate-pulse"
                  : reward.rarity === "epic"
                  ? "bg-gradient-to-br from-purple-400 to-pink-500"
                  : reward.rarity === "rare"
                  ? "bg-gradient-to-br from-blue-400 to-cyan-500"
                  : "bg-muted"
              }`}
            >
              {categoryConfig.icon}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="font-bold text-lg text-center mb-1">{reward.name}</h3>
            <p className="text-sm text-muted-foreground text-center mb-3 line-clamp-2">
              {reward.description}
            </p>

            {/* Category tag */}
            <div className="flex justify-center mb-4">
              <Badge variant="outline" className="text-xs">
                {categoryConfig.label}
              </Badge>
            </div>
          </div>

          {/* Price and action */}
          <div className="mt-auto">
            <div className="flex items-center justify-center gap-1 mb-3">
              <Coins className="w-5 h-5 text-amber-500" />
              <span className="text-xl font-bold">{reward.price_coins}</span>
            </div>

            <Button
              onClick={() => onPurchase(reward)}
              disabled={!canAfford || !inStock || isPurchasing}
              className={`w-full ${
                reward.rarity === "legendary"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  : reward.rarity === "epic"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  : ""
              }`}
            >
              {!inStock
                ? "Esgotado"
                : !canAfford
                ? "Moedas insuficientes"
                : isPurchasing
                ? "Resgatando..."
                : "Resgatar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

function PurchaseHistory() {
  const { data: purchases, isLoading } = useUserPurchases();

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando histórico...
      </div>
    );
  }

  if (!purchases || purchases.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Você ainda não resgatou nenhuma recompensa
          </p>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = {
    pending: { label: "Pendente", color: "bg-yellow-500" },
    approved: { label: "Aprovado", color: "bg-blue-500" },
    delivered: { label: "Entregue", color: "bg-green-500" },
    cancelled: { label: "Cancelado", color: "bg-red-500" },
  };

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
                    {purchase.reward
                      ? shopService.getCategoryConfig(purchase.reward.category).icon
                      : "🎁"}
                  </div>
                  <div>
                    <p className="font-medium">
                      {purchase.reward?.name || "Recompensa"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(purchase.created_at), "dd MMM yyyy, HH:mm", {
                        locale: ptBR,
                      })}
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

export default function Shop() {
  const seoConfig = useSEO();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id ?? "");
  const { data: rewards, isLoading } = useShopRewards();
  const purchaseMutation = usePurchaseReward();
  const { playEpicCelebrationSound, playLegendaryCelebrationSound } = useSoundEffects();
  const [selectedReward, setSelectedReward] = useState<ShopReward | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | RewardCategory>("all");
  const [celebration, setCelebration] = useState<{ active: boolean; type: "epic" | "legendary" } | null>(null);
  const [purchasingRewardId, setPurchasingRewardId] = useState<string | null>(null);
  const isScrolled = useScrollHeader(10);

  const triggerCelebration = useCallback((rarity: string) => {
    if (rarity === "legendary") {
      setCelebration({ active: true, type: "legendary" });
      playLegendaryCelebrationSound();
    } else if (rarity === "epic") {
      setCelebration({ active: true, type: "epic" });
      playEpicCelebrationSound();
    }
  }, [playEpicCelebrationSound, playLegendaryCelebrationSound]);

  const userCoins = profile?.coins ?? 0;

  const filteredRewards =
    activeCategory === "all"
      ? rewards
      : rewards?.filter((r) => r.category === activeCategory);

  const handlePurchase = (reward: ShopReward) => {
    setSelectedReward(reward);
  };

  const confirmPurchase = () => {
    if (!selectedReward) return;
    const rewardRarity = selectedReward.rarity;
    const rewardId = selectedReward.id;
    setPurchasingRewardId(rewardId);
    purchaseMutation.mutate(
      { rewardId },
      {
        onSuccess: () => {
          setSelectedReward(null);
          triggerCelebration(rewardRarity);
        },
        onSettled: () => setPurchasingRewardId(null),
      }
    );
  };

  return (
    <PageWrapper pageName="Loja" className="min-h-screen bg-background pb-20">
      <SEOHead title={seoConfig.title} description={seoConfig.description} keywords={seoConfig.keywords} />
      {/* Celebration Effect */}
      {celebration && (
        <CelebrationEffect
          isActive={celebration.active}
          type={celebration.type}
          onComplete={() => setCelebration(null)}
        />
      )}

      {/* Header */}
      <div 
        className={cn(
          "header-sticky bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white",
          isScrolled && "scrolled"
        )}
      >
        <div className="max-w-6xl mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/")}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  Loja de Recompensas
                </h1>
                <p className="text-white/80 mt-1">
                  Troque suas moedas por produtos e benefícios exclusivos
                </p>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2"
            >
              <Coins className="w-6 h-6 text-amber-200" />
              <span className="text-2xl font-bold">{userCoins}</span>
              <span className="text-white/80 text-sm">moedas</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <Tabs defaultValue="shop" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="shop" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Loja
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Meus Resgates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shop" className="space-y-6">
            {/* Flash Sales */}
            <FlashSalesBanner onPurchase={(rewardId) => {
              const reward = rewards?.find(r => r.id === rewardId);
              if (reward) handlePurchase(reward);
            }} />

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory("all")}
              >
                Todos
              </Button>
              <Button
                variant={activeCategory === "product" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory("product")}
              >
                <Package className="w-4 h-4 mr-1" />
                Produtos
              </Button>
              <Button
                variant={activeCategory === "benefit" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory("benefit")}
              >
                <Star className="w-4 h-4 mr-1" />
                Benefícios
              </Button>
              <Button
                variant={activeCategory === "experience" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory("experience")}
              >
                <Target className="w-4 h-4 mr-1" />
                Experiências
              </Button>
            </div>

            {/* Rewards grid */}
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Carregando recompensas...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredRewards?.map((reward) => (
                    <RewardCard
                      key={reward.id}
                      reward={reward}
                      userCoins={userCoins}
                      onPurchase={handlePurchase}
                      purchasingRewardId={purchasingRewardId}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <PurchaseHistory />
          </TabsContent>
        </Tabs>
      </div>

      {/* Purchase confirmation dialog */}
      <Dialog open={!!selectedReward} onOpenChange={() => setSelectedReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Resgate</DialogTitle>
            <DialogDescription>
              Você está prestes a resgatar esta recompensa
            </DialogDescription>
          </DialogHeader>

          {selectedReward && (
            <div className="py-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                    selectedReward.rarity === "legendary"
                      ? "bg-gradient-to-br from-amber-400 to-orange-500"
                      : selectedReward.rarity === "epic"
                      ? "bg-gradient-to-br from-purple-400 to-pink-500"
                      : selectedReward.rarity === "rare"
                      ? "bg-gradient-to-br from-blue-400 to-cyan-500"
                      : "bg-muted"
                  }`}
                >
                  {shopService.getCategoryConfig(selectedReward.category).icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedReward.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedReward.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Custo:</span>
                  <div className="flex items-center gap-1">
                    <Coins className="w-5 h-5 text-amber-500" />
                    <span className="font-bold text-lg">
                      {selectedReward.price_coins}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-muted-foreground">Seu saldo após:</span>
                  <div className="flex items-center gap-1">
                    <Coins className="w-5 h-5 text-amber-500" />
                    <span className="font-bold">
                      {userCoins - selectedReward.price_coins}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReward(null)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmPurchase}
              disabled={purchaseMutation.isPending}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {purchaseMutation.isPending ? "Resgatando..." : "Confirmar Resgate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
