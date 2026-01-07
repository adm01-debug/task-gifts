import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Heart, Star, Sparkles, Send, Search,
  Award, Zap, ThumbsUp, MessageCircle, Gift
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KudosCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  xpBonus: number;
}

interface KudosMessage {
  id: string;
  from: { name: string; avatar?: string; department: string };
  to: { name: string; avatar?: string; department: string };
  message: string;
  category: string;
  timestamp: Date;
  reactions: { emoji: string; count: number }[];
  isPublic: boolean;
}

const categories: KudosCategory[] = [
  { id: "teamwork", name: "Trabalho em Equipe", icon: Heart, color: "text-pink-500 bg-pink-500/10", xpBonus: 20 },
  { id: "innovation", name: "Inovação", icon: Sparkles, color: "text-purple-500 bg-purple-500/10", xpBonus: 25 },
  { id: "leadership", name: "Liderança", icon: Award, color: "text-yellow-500 bg-yellow-500/10", xpBonus: 30 },
  { id: "excellence", name: "Excelência", icon: Star, color: "text-blue-500 bg-blue-500/10", xpBonus: 25 },
  { id: "support", name: "Suporte", icon: ThumbsUp, color: "text-green-500 bg-green-500/10", xpBonus: 20 },
  { id: "energy", name: "Energia Positiva", icon: Zap, color: "text-orange-500 bg-orange-500/10", xpBonus: 15 }
];

const mockKudos: KudosMessage[] = [
  {
    id: "1",
    from: { name: "Carlos Silva", department: "Tech" },
    to: { name: "Ana Costa", department: "Produto" },
    message: "Obrigado pela ajuda incrível no lançamento do novo recurso! Sua dedicação fez toda a diferença. 🚀",
    category: "teamwork",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    reactions: [{ emoji: "❤️", count: 5 }, { emoji: "🎉", count: 3 }],
    isPublic: true
  },
  {
    id: "2",
    from: { name: "Maria Santos", department: "RH" },
    to: { name: "João Pedro", department: "Marketing" },
    message: "Sua apresentação foi excepcional! Parabéns pela criatividade e preparo.",
    category: "excellence",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    reactions: [{ emoji: "⭐", count: 8 }, { emoji: "👏", count: 4 }],
    isPublic: true
  },
  {
    id: "3",
    from: { name: "Pedro Alves", department: "Tech" },
    to: { name: "Lucia Ferreira", department: "Vendas" },
    message: "Sua ideia para o novo processo de vendas foi genial! Inovação pura!",
    category: "innovation",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    reactions: [{ emoji: "💡", count: 12 }, { emoji: "🔥", count: 6 }],
    isPublic: true
  }
];

const mockUsers = [
  { id: "1", name: "Ana Costa", department: "Produto" },
  { id: "2", name: "Carlos Silva", department: "Tech" },
  { id: "3", name: "Maria Santos", department: "RH" },
  { id: "4", name: "João Pedro", department: "Marketing" },
  { id: "5", name: "Lucia Ferreira", department: "Vendas" }
];

const KudosCard = memo(function KudosCard({ 
  kudos, 
  onReact 
}: { 
  kudos: KudosMessage;
  onReact: (id: string, emoji: string) => void;
}) {
  const category = categories.find(c => c.id === kudos.category);
  const Icon = category?.icon || Heart;

  const timeAgo = () => {
    const diff = Date.now() - kudos.timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h atrás`;
    return `${minutes}m atrás`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl border bg-card hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex -space-x-3">
          <Avatar className="w-10 h-10 border-2 border-background">
            <AvatarImage src={kudos.from.avatar} />
            <AvatarFallback>{kudos.from.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <Avatar className="w-10 h-10 border-2 border-background">
            <AvatarImage src={kudos.to.avatar} />
            <AvatarFallback>{kudos.to.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex-1">
          <p className="text-sm">
            <span className="font-semibold">{kudos.from.name}</span>
            <span className="text-muted-foreground"> reconheceu </span>
            <span className="font-semibold">{kudos.to.name}</span>
          </p>
          <p className="text-xs text-muted-foreground">{timeAgo()}</p>
        </div>

        {category && (
          <Badge variant="secondary" className={cn("text-xs shrink-0", category.color)}>
            <Icon className="w-3 h-3 mr-1" />
            {category.name}
          </Badge>
        )}
      </div>

      {/* Message */}
      <p className="text-sm bg-muted/50 p-3 rounded-lg mb-3">
        {kudos.message}
      </p>

      {/* Reactions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {kudos.reactions.map((reaction, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onReact(kudos.id, reaction.emoji)}
              className="px-2 py-1 rounded-full bg-muted text-xs flex items-center gap-1 hover:bg-muted/80"
            >
              <span>{reaction.emoji}</span>
              <span className="text-muted-foreground">{reaction.count}</span>
            </motion.button>
          ))}
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full">
            <span className="text-lg">+</span>
          </Button>
        </div>

        <Button variant="ghost" size="sm" className="h-7 text-xs">
          <MessageCircle className="w-3 h-3 mr-1" />
          Comentar
        </Button>
      </div>
    </motion.div>
  );
});

export const KudosWall = memo(function KudosWall({ 
  className 
}: { 
  className?: string;
}) {
  const [kudos, setKudos] = useState(mockKudos);
  const [showSendForm, setShowSendForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [searchUser, setSearchUser] = useState("");

  const filteredUsers = mockUsers.filter(u => 
    u.name.toLowerCase().includes(searchUser.toLowerCase())
  );

  const handleReact = useCallback((id: string, emoji: string) => {
    setKudos(prev => prev.map(k => {
      if (k.id !== id) return k;
      const existingReaction = k.reactions.find(r => r.emoji === emoji);
      if (existingReaction) {
        return {
          ...k,
          reactions: k.reactions.map(r => 
            r.emoji === emoji ? { ...r, count: r.count + 1 } : r
          )
        };
      }
      return {
        ...k,
        reactions: [...k.reactions, { emoji, count: 1 }]
      };
    }));
  }, []);

  const handleSend = useCallback(() => {
    if (!selectedUser || !selectedCategory || !message.trim()) return;
    
    const user = mockUsers.find(u => u.id === selectedUser);
    if (!user) return;

    const newKudos: KudosMessage = {
      id: Date.now().toString(),
      from: { name: "Você", department: "Seu Depto" },
      to: { name: user.name, department: user.department },
      message: message,
      category: selectedCategory,
      timestamp: new Date(),
      reactions: [],
      isPublic: true
    };

    setKudos(prev => [newKudos, ...prev]);
    setShowSendForm(false);
    setSelectedCategory(null);
    setSelectedUser(null);
    setMessage("");
  }, [selectedUser, selectedCategory, message]);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-red-500/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Mural de Kudos</CardTitle>
              <p className="text-xs text-muted-foreground">
                {kudos.length} reconhecimentos hoje
              </p>
            </div>
          </div>

          <Button 
            size="sm" 
            onClick={() => setShowSendForm(!showSendForm)}
          >
            <Gift className="w-4 h-4 mr-1" />
            Enviar Kudos
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Send Form */}
        <AnimatePresence>
          {showSendForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-xl border bg-muted/50 space-y-4"
            >
              <h4 className="font-medium text-sm">Reconheça um colega</h4>

              {/* User Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar colega..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="pl-10"
                />
                {searchUser && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-10 max-h-40 overflow-auto">
                    {filteredUsers.map(user => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setSelectedUser(user.id);
                          setSearchUser(user.name);
                        }}
                        className="w-full p-2 text-left hover:bg-muted flex items-center gap-2"
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">{user.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.department}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Categories */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Categoria</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => {
                    const Icon = cat.icon;
                    return (
                      <Button
                        key={cat.id}
                        size="sm"
                        variant={selectedCategory === cat.id ? "default" : "outline"}
                        className={cn("h-8", selectedCategory !== cat.id && cat.color)}
                        onClick={() => setSelectedCategory(cat.id)}
                      >
                        <Icon className="w-3 h-3 mr-1" />
                        {cat.name}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <Textarea
                placeholder="Escreva sua mensagem de reconhecimento..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[80px]"
              />

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowSendForm(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSend}
                  disabled={!selectedUser || !selectedCategory || !message.trim()}
                >
                  <Send className="w-4 h-4 mr-1" />
                  Enviar Kudos
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kudos Feed */}
        <div className="space-y-3">
          <AnimatePresence>
            {kudos.map(k => (
              <KudosCard 
                key={k.id} 
                kudos={k}
                onReact={handleReact}
              />
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
});

export default KudosWall;
