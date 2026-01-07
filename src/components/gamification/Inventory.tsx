import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Star,
  Sparkles,
  Gift,
  ChevronRight,
  Filter,
  Search,
  Crown,
  Shield,
  Zap,
  Palette,
  User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: "badge" | "title" | "avatar" | "theme" | "powerup" | "consumable";
  rarity: "common" | "rare" | "epic" | "legendary";
  quantity: number;
  equipped?: boolean;
  icon: React.ReactNode;
  obtainedAt: string;
}

const mockInventory: InventoryItem[] = [
  {
    id: "1",
    name: "Mestre das Tarefas",
    description: "Conquistado ao completar 100 tarefas",
    type: "badge",
    rarity: "epic",
    quantity: 1,
    equipped: true,
    icon: <Crown className="h-5 w-5" />,
    obtainedAt: "2025-01-05",
  },
  {
    id: "2",
    name: "Guardião do Streak",
    description: "Título especial por 30 dias de streak",
    type: "title",
    rarity: "legendary",
    quantity: 1,
    equipped: true,
    icon: <Shield className="h-5 w-5" />,
    obtainedAt: "2025-01-03",
  },
  {
    id: "3",
    name: "Avatar Cósmico",
    description: "Moldura de avatar exclusiva",
    type: "avatar",
    rarity: "rare",
    quantity: 1,
    equipped: false,
    icon: <User className="h-5 w-5" />,
    obtainedAt: "2025-01-01",
  },
  {
    id: "4",
    name: "Tema Neon",
    description: "Tema visual vibrante",
    type: "theme",
    rarity: "rare",
    quantity: 1,
    equipped: false,
    icon: <Palette className="h-5 w-5" />,
    obtainedAt: "2024-12-28",
  },
  {
    id: "5",
    name: "XP Boost x2",
    description: "Dobra XP por 1 hora",
    type: "powerup",
    rarity: "common",
    quantity: 5,
    icon: <Zap className="h-5 w-5" />,
    obtainedAt: "2025-01-06",
  },
  {
    id: "6",
    name: "Caixa Misteriosa",
    description: "Contém recompensa aleatória",
    type: "consumable",
    rarity: "epic",
    quantity: 2,
    icon: <Gift className="h-5 w-5" />,
    obtainedAt: "2025-01-04",
  },
];

const rarityConfig = {
  common: { label: "Comum", color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-400/50" },
  rare: { label: "Raro", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/50" },
  epic: { label: "Épico", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/50" },
  legendary: { label: "Lendário", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/50" },
};

const typeConfig = {
  badge: { label: "Badges", icon: Star },
  title: { label: "Títulos", icon: Crown },
  avatar: { label: "Avatar", icon: User },
  theme: { label: "Temas", icon: Palette },
  powerup: { label: "Power-Ups", icon: Zap },
  consumable: { label: "Consumíveis", icon: Gift },
};

export const Inventory = memo(function Inventory() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const filteredItems = mockInventory.filter(item => {
    const matchesTab = activeTab === "all" || item.type === activeTab;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalItems = mockInventory.reduce((acc, item) => acc + item.quantity, 0);
  const uniqueItems = mockInventory.length;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <span>Inventário</span>
              <p className="text-xs font-normal text-muted-foreground">
                {uniqueItems} itens únicos • {totalItems} total
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filtrar
          </Button>
        </CardTitle>

        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar itens..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4 h-auto p-1">
            <TabsTrigger value="all" className="text-xs py-1.5">Todos</TabsTrigger>
            <TabsTrigger value="badge" className="text-xs py-1.5">Badges</TabsTrigger>
            <TabsTrigger value="powerup" className="text-xs py-1.5">Power-Ups</TabsTrigger>
            <TabsTrigger value="consumable" className="text-xs py-1.5">Outros</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <div className="grid grid-cols-3 gap-2">
              {filteredItems.map((item, index) => {
                const rarity = rarityConfig[item.rarity];
                const TypeIcon = typeConfig[item.type].icon;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "relative p-3 rounded-xl border cursor-pointer transition-all hover:scale-105",
                      rarity.border,
                      rarity.bg,
                      item.equipped && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedItem(item)}
                  >
                    {/* Equipped Indicator */}
                    {item.equipped && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Star className="h-2.5 w-2.5 text-primary-foreground fill-current" />
                      </div>
                    )}

                    {/* Quantity Badge */}
                    {item.quantity > 1 && (
                      <Badge className="absolute -bottom-1 -right-1 text-[10px] h-5 px-1.5">
                        x{item.quantity}
                      </Badge>
                    )}

                    {/* Icon */}
                    <div className={cn(
                      "w-10 h-10 rounded-lg mx-auto flex items-center justify-center mb-2",
                      item.rarity === "legendary" 
                        ? "bg-gradient-to-br from-amber-400 to-orange-500" 
                        : item.rarity === "epic"
                          ? "bg-gradient-to-br from-purple-500 to-pink-500"
                          : item.rarity === "rare"
                            ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                            : "bg-muted"
                    )}>
                      <span className="text-white">{item.icon}</span>
                    </div>

                    <h5 className="text-[11px] font-medium text-center truncate">
                      {item.name}
                    </h5>
                    <p className={cn("text-[9px] text-center", rarity.color)}>
                      {rarity.label}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum item encontrado</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Item Detail Modal */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-center mb-4">
                  <motion.div
                    className={cn(
                      "w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-4",
                      selectedItem.rarity === "legendary" 
                        ? "bg-gradient-to-br from-amber-400 to-orange-500" 
                        : selectedItem.rarity === "epic"
                          ? "bg-gradient-to-br from-purple-500 to-pink-500"
                          : selectedItem.rarity === "rare"
                            ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                            : "bg-muted"
                    )}
                    animate={{ 
                      boxShadow: selectedItem.rarity === "legendary" 
                        ? ["0 0 20px rgba(251, 191, 36, 0.5)", "0 0 40px rgba(251, 191, 36, 0.3)", "0 0 20px rgba(251, 191, 36, 0.5)"]
                        : undefined
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-white scale-150">{selectedItem.icon}</span>
                  </motion.div>

                  <h3 className="text-xl font-bold">{selectedItem.name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge variant="outline" className={rarityConfig[selectedItem.rarity].color}>
                      {rarityConfig[selectedItem.rarity].label}
                    </Badge>
                    <Badge variant="secondary">
                      {typeConfig[selectedItem.type].label}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground text-center mb-4">
                  {selectedItem.description}
                </p>

                <div className="p-3 rounded-lg bg-muted mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Quantidade</span>
                    <span className="font-bold">{selectedItem.quantity}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Obtido em</span>
                    <span>{new Date(selectedItem.obtainedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedItem(null)}
                  >
                    Fechar
                  </Button>
                  {(selectedItem.type === "badge" || selectedItem.type === "title" || selectedItem.type === "avatar" || selectedItem.type === "theme") && (
                    <Button 
                      className="flex-1"
                      variant={selectedItem.equipped ? "secondary" : "default"}
                    >
                      {selectedItem.equipped ? (
                        <>
                          <Star className="h-4 w-4 mr-2 fill-current" />
                          Equipado
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Equipar
                        </>
                      )}
                    </Button>
                  )}
                  {selectedItem.type === "consumable" && (
                    <Button className="flex-1">
                      <Gift className="h-4 w-4 mr-2" />
                      Usar
                    </Button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button variant="outline" className="w-full">
          Ver Inventário Completo
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
});
