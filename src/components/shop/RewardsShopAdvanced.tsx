import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Coins, ShoppingBag, Star, Gift, Lock,
  Check, Sparkles, Crown, Zap, Heart
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: "powerup" | "cosmetic" | "perk" | "donation";
  price: number;
  originalPrice?: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  icon: React.ElementType;
  stock?: number;
  isPurchased?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
}

const mockItems: ShopItem[] = [
  { id: "1", name: "XP Boost 2x", description: "Dobra XP por 1 hora", category: "powerup", price: 100, rarity: "common", icon: Zap, stock: 10 },
  { id: "2", name: "Moldura Dourada", description: "Moldura exclusiva para avatar", category: "cosmetic", price: 500, rarity: "epic", icon: Crown, isNew: true },
  { id: "3", name: "Dia de Folga", description: "Ganhe um dia de folga extra", category: "perk", price: 2000, originalPrice: 2500, rarity: "legendary", icon: Gift, isFeatured: true },
  { id: "4", name: "Café para o Time", description: "Doe café para sua equipe", category: "donation", price: 50, rarity: "common", icon: Heart },
  { id: "5", name: "Proteção de Streak", description: "Protege streak por 24h", category: "powerup", price: 150, rarity: "rare", icon: Star },
  { id: "6", name: "Badge Colecionador", description: "Badge exclusivo limitado", category: "cosmetic", price: 800, rarity: "legendary", icon: Sparkles, stock: 5, isNew: true },
];

const rarityConfig = {
  common: { color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/30", glow: "" },
  rare: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30", glow: "shadow-blue-500/20" },
  epic: { color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/30", glow: "shadow-purple-500/30" },
  legendary: { color: "text-amber-500", bg: "bg-gradient-to-br from-amber-500/20 to-orange-500/20", border: "border-amber-500/50", glow: "shadow-amber-500/40 shadow-lg" }
};

const categoryLabels = {
  powerup: "Power-Up",
  cosmetic: "Cosmético",
  perk: "Benefício",
  donation: "Doação"
};

const ShopItemCard = memo(function ShopItemCard({ 
  item, 
  userCoins,
  onPurchase 
}: { 
  item: ShopItem;
  userCoins: number;
  onPurchase: (id: string) => void;
}) {
  const config = rarityConfig[item.rarity];
  const Icon = item.icon;
  const canAfford = userCoins >= item.price;
  const hasDiscount = item.originalPrice && item.originalPrice > item.price;
  const discountPercent = hasDiscount ? Math.round((1 - item.price / item.originalPrice!) * 100) : 0;

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      className={cn(
        "relative p-4 rounded-xl border-2 transition-all",
        config.bg,
        config.border,
        config.glow,
        item.isPurchased && "opacity-60",
        item.isFeatured && "ring-2 ring-primary"
      )}
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 flex gap-1">
        {item.isNew && (
          <Badge className="bg-green-500 text-white text-[10px] h-5">NOVO</Badge>
        )}
        {hasDiscount && (
          <Badge className="bg-red-500 text-white text-[10px] h-5">-{discountPercent}%</Badge>
        )}
        {item.isFeatured && (
          <Badge className="bg-primary text-primary-foreground text-[10px] h-5">Destaque</Badge>
        )}
      </div>

      {/* Rarity */}
      <Badge 
        variant="outline" 
        className={cn("absolute top-2 right-2 text-[10px] capitalize", config.color, config.border)}
      >
        {item.rarity}
      </Badge>

      {/* Icon */}
      <div className="flex justify-center mt-6 mb-3">
        <motion.div
          animate={item.isFeatured ? { 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          } : {}}
          transition={{ repeat: item.isFeatured ? Infinity : 0, duration: 3 }}
          className={cn("w-16 h-16 rounded-xl flex items-center justify-center", config.bg)}
        >
          <Icon className={cn("w-8 h-8", config.color)} />
        </motion.div>
      </div>

      {/* Info */}
      <div className="text-center mb-3">
        <Badge variant="secondary" className="text-[10px] mb-2">
          {categoryLabels[item.category]}
        </Badge>
        <h4 className="font-bold text-sm">{item.name}</h4>
        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
      </div>

      {/* Stock */}
      {item.stock !== undefined && (
        <p className="text-center text-xs text-muted-foreground mb-2">
          Restam: <span className={cn("font-medium", item.stock <= 3 && "text-red-500")}>{item.stock}</span>
        </p>
      )}

      {/* Price */}
      <div className="flex items-center justify-center gap-2 mb-3">
        {hasDiscount && (
          <span className="text-sm text-muted-foreground line-through">
            {item.originalPrice}
          </span>
        )}
        <div className="flex items-center gap-1">
          <Coins className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-lg">{item.price}</span>
        </div>
      </div>

      {/* Action */}
      <Button
        size="sm"
        className="w-full"
        variant={item.isPurchased ? "secondary" : canAfford ? "default" : "outline"}
        disabled={item.isPurchased || !canAfford || item.stock === 0}
        onClick={() => onPurchase(item.id)}
      >
        {item.isPurchased ? (
          <>
            <Check className="w-3 h-3 mr-1" />
            Adquirido
          </>
        ) : !canAfford ? (
          <>
            <Lock className="w-3 h-3 mr-1" />
            Moedas insuficientes
          </>
        ) : item.stock === 0 ? (
          "Esgotado"
        ) : (
          <>
            <ShoppingBag className="w-3 h-3 mr-1" />
            Comprar
          </>
        )}
      </Button>
    </motion.div>
  );
});

export const RewardsShopAdvanced = memo(function RewardsShopAdvanced({ 
  className 
}: { 
  className?: string;
}) {
  const [items, setItems] = useState(mockItems);
  const [userCoins, setUserCoins] = useState(1500);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredItems = activeCategory === "all" 
    ? items 
    : items.filter(i => i.category === activeCategory);

  const handlePurchase = useCallback((id: string) => {
    const item = items.find(i => i.id === id);
    if (!item || userCoins < item.price) return;

    setUserCoins(prev => prev - item.price);
    setItems(prev => prev.map(i => 
      i.id === id 
        ? { ...i, isPurchased: true, stock: i.stock ? i.stock - 1 : undefined }
        : i
    ));
  }, [items, userCoins]);

  const categories = [
    { id: "all", label: "Todos" },
    { id: "powerup", label: "Power-Ups" },
    { id: "cosmetic", label: "Cosméticos" },
    { id: "perk", label: "Benefícios" },
    { id: "donation", label: "Doações" }
  ];

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Loja de Recompensas</CardTitle>
              <p className="text-xs text-muted-foreground">
                {items.filter(i => !i.isPurchased).length} itens disponíveis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <Coins className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-lg">{userCoins.toLocaleString()}</span>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
          {categories.map(cat => (
            <Button
              key={cat.id}
              size="sm"
              variant={activeCategory === cat.id ? "default" : "ghost"}
              className="h-7 text-xs shrink-0"
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <AnimatePresence>
            {filteredItems.map(item => (
              <ShopItemCard
                key={item.id}
                item={item}
                userCoins={userCoins}
                onPurchase={handlePurchase}
              />
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
});

export default RewardsShopAdvanced;
