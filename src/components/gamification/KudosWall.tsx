import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Send, MessageCircle, Star, Sparkles, Users, ChevronRight, X,
  ThumbsUp, Flame, Trophy, Crown, Zap, Gift, PartyPopper, Medal,
  TrendingUp, Award, Filter, Search, MoreHorizontal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface KudosEntry {
  id: string;
  from: { name: string; avatar?: string; level?: number };
  to: { name: string; avatar?: string };
  message: string;
  category: string;
  reactions: { emoji: string; count: number }[];
  date: string;
  xpReward: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  department: string;
  kudosReceived: number;
}

const mockKudos: KudosEntry[] = [
  { 
    id: "1", 
    from: { name: "Ana Costa", level: 15 }, 
    to: { name: "Você" }, 
    message: "Obrigada pela ajuda no projeto! Sua contribuição foi fundamental para entregarmos no prazo. 🎉", 
    category: "Colaboração", 
    reactions: [{ emoji: "❤️", count: 8 }, { emoji: "🔥", count: 4 }], 
    date: "2h",
    xpReward: 25,
    isNew: true
  },
  { 
    id: "2", 
    from: { name: "Pedro Lima", level: 22 }, 
    to: { name: "Julia Ferreira" }, 
    message: "Apresentação incrível na reunião de ontem! Todos ficaram impressionados.", 
    category: "Excelência", 
    reactions: [{ emoji: "👏", count: 12 }, { emoji: "⭐", count: 5 }], 
    date: "5h",
    xpReward: 20,
    isFeatured: true
  },
  { 
    id: "3", 
    from: { name: "Você", level: 18 }, 
    to: { name: "Carlos Mendes" }, 
    message: "Sempre disposto a ajudar a equipe! Seu espírito colaborativo é inspirador.", 
    category: "Espírito de Equipe", 
    reactions: [{ emoji: "💪", count: 15 }, { emoji: "🙌", count: 8 }], 
    date: "1d",
    xpReward: 15
  },
  { 
    id: "4", 
    from: { name: "Marina Silva", level: 25 }, 
    to: { name: "Você" }, 
    message: "Ideia genial na sprint planning! Isso vai revolucionar nosso processo.", 
    category: "Inovação", 
    reactions: [{ emoji: "💡", count: 20 }, { emoji: "🚀", count: 10 }], 
    date: "2d",
    xpReward: 30
  },
];

const teamMembers: TeamMember[] = [
  { id: "1", name: "Ana Costa", department: "Design", kudosReceived: 45 },
  { id: "2", name: "Pedro Lima", department: "Tech", kudosReceived: 38 },
  { id: "3", name: "Julia Ferreira", department: "Marketing", kudosReceived: 52 },
  { id: "4", name: "Carlos Mendes", department: "RH", kudosReceived: 41 },
  { id: "5", name: "Marina Silva", department: "Produto", kudosReceived: 67 },
  { id: "6", name: "Lucas Santos", department: "Tech", kudosReceived: 33 },
];

const categories = [
  { name: "Colaboração", icon: Users, color: "from-blue-500 to-cyan-500" },
  { name: "Inovação", icon: Zap, color: "from-purple-500 to-pink-500" },
  { name: "Excelência", icon: Trophy, color: "from-amber-500 to-orange-500" },
  { name: "Espírito de Equipe", icon: Heart, color: "from-green-500 to-emerald-500" },
  { name: "Liderança", icon: Crown, color: "from-red-500 to-rose-500" },
  { name: "Mentoria", icon: Award, color: "from-cyan-500 to-teal-500" },
];

const categoryColors: Record<string, string> = {
  "Colaboração": "bg-blue-500/10 text-blue-500 border-blue-500/30",
  "Inovação": "bg-purple-500/10 text-purple-500 border-purple-500/30",
  "Excelência": "bg-amber-500/10 text-amber-500 border-amber-500/30",
  "Espírito de Equipe": "bg-green-500/10 text-green-500 border-green-500/30",
  "Liderança": "bg-red-500/10 text-red-500 border-red-500/30",
  "Mentoria": "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
};

const reactionEmojis = ["❤️", "🔥", "👏", "⭐", "💪", "🚀", "💡", "🙌"];

export const KudosWall = memo(function KudosWall() {
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<"all" | "received" | "sent">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);

  const receivedCount = mockKudos.filter(k => k.to.name === "Você").length;
  const sentCount = mockKudos.filter(k => k.from.name === "Você").length;
  const totalXP = mockKudos.filter(k => k.to.name === "Você").reduce((acc, k) => acc + k.xpReward, 0);

  const filteredKudos = mockKudos.filter(k => {
    if (filter === "received") return k.to.name === "Você";
    if (filter === "sent") return k.from.name === "Você";
    return true;
  });

  const handleReaction = useCallback((kudosId: string, emoji: string) => {
    setCelebratingId(kudosId);
    setTimeout(() => setCelebratingId(null), 1000);
    setShowReactions(null);
  }, []);

  const handleSend = useCallback(() => {
    setShowSendModal(false);
    setSelectedMember(null);
    setSelectedCategory("");
    setMessage("");
  }, []);

  return (
    <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-background via-background to-pink-500/5 relative">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-500/10 to-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <CardHeader className="pb-3 relative">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">Mural de Kudos</span>
                {receivedCount > 0 && (
                  <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0">
                    +{receivedCount} novos
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                Reconheça seus colegas
              </span>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={() => setShowSendModal(true)} 
              className="gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/30"
            >
              <Send className="h-4 w-4" />
              Enviar
            </Button>
          </motion.div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 relative">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Heart, value: receivedCount * 6, label: "Recebidos", color: "from-pink-500 to-rose-500", bg: "bg-pink-500/10" },
            { icon: Send, value: sentCount * 6, label: "Enviados", color: "from-purple-500 to-violet-500", bg: "bg-purple-500/10" },
            { icon: Star, value: `+${totalXP * 5}`, label: "XP Ganho", color: "from-amber-500 to-orange-500", bg: "bg-amber-500/10" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn("p-3 rounded-xl text-center relative overflow-hidden", stat.bg)}
              whileHover={{ scale: 1.02 }}
            >
              <div className={cn("w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-1 bg-gradient-to-br shadow-lg", stat.color)}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="grid grid-cols-3 h-9">
            <TabsTrigger value="all" className="text-xs gap-1">
              <MessageCircle className="h-3 w-3" />
              Todos
            </TabsTrigger>
            <TabsTrigger value="received" className="text-xs gap-1">
              <Gift className="h-3 w-3" />
              Recebidos
            </TabsTrigger>
            <TabsTrigger value="sent" className="text-xs gap-1">
              <Send className="h-3 w-3" />
              Enviados
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Kudos Feed */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {filteredKudos.map((kudos, index) => {
              const isForMe = kudos.to.name === "Você";
              const isCelebrating = celebratingId === kudos.id;
              
              return (
                <motion.div
                  key={kudos.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "relative p-4 rounded-2xl border-2 transition-all group",
                    isForMe 
                      ? "bg-gradient-to-br from-pink-500/10 to-rose-500/5 border-pink-500/40" 
                      : "bg-muted/30 border-transparent hover:border-pink-500/20",
                    kudos.isFeatured && "ring-2 ring-amber-500/30"
                  )}
                >
                  {/* Featured Badge */}
                  {kudos.isFeatured && (
                    <motion.div
                      className="absolute -top-2 -right-2 z-10"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg gap-1">
                        <Trophy className="h-3 w-3" />
                        Destaque
                      </Badge>
                    </motion.div>
                  )}

                  {/* New Badge */}
                  {kudos.isNew && (
                    <motion.div
                      className="absolute top-3 right-3"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500" />
                      </span>
                    </motion.div>
                  )}

                  {/* Celebration Effect */}
                  {isCelebrating && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute text-2xl"
                          initial={{ top: "50%", left: "50%", scale: 0 }}
                          animate={{ 
                            top: `${20 + Math.random() * 60}%`,
                            left: `${10 + Math.random() * 80}%`,
                            scale: [0, 1.5, 0],
                            opacity: [0, 1, 0]
                          }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                        >
                          ❤️
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  <div className="flex items-start gap-3">
                    {/* Sender Avatar */}
                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-2 ring-background">
                        <AvatarImage src={kudos.from.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                          {kudos.from.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {kudos.from.level && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-background">
                          {kudos.from.level}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-1 text-sm mb-1 flex-wrap">
                        <span className="font-bold">{kudos.from.name}</span>
                        <motion.span 
                          className="text-pink-500"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          →
                        </motion.span>
                        <span className={cn("font-bold", isForMe && "text-pink-500")}>
                          {kudos.to.name}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">{kudos.date}</span>
                      </div>

                      {/* Message */}
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {kudos.message}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline" 
                          className={cn("text-[10px] font-medium", categoryColors[kudos.category])}
                        >
                          {kudos.category}
                        </Badge>

                        {/* Reactions */}
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-1">
                            {kudos.reactions.slice(0, 3).map((reaction, i) => (
                              <motion.button
                                key={i}
                                whileHover={{ scale: 1.2, y: -2 }}
                                className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs ring-2 ring-background"
                              >
                                {reaction.emoji}
                              </motion.button>
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground ml-1">
                            {kudos.reactions.reduce((acc, r) => acc + r.count, 0)}
                          </span>
                          
                          {/* Add Reaction */}
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setShowReactions(showReactions === kudos.id ? null : kudos.id)}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            
                            <AnimatePresence>
                              {showReactions === kudos.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                  className="absolute bottom-full right-0 mb-2 p-2 bg-background rounded-xl shadow-xl border flex gap-1 z-10"
                                >
                                  {reactionEmojis.map((emoji) => (
                                    <motion.button
                                      key={emoji}
                                      whileHover={{ scale: 1.3 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleReaction(kudos.id, emoji)}
                                      className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-lg"
                                    >
                                      {emoji}
                                    </motion.button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      {/* XP Reward */}
                      {isForMe && (
                        <motion.div
                          className="mt-2 flex items-center gap-1 text-xs text-amber-600"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>+{kudos.xpReward} XP recebido</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Top Recognizers */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 border border-purple-500/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Medal className="h-4 w-4 text-purple-500" />
              Top Reconhecedores
            </h4>
            <Badge variant="outline" className="text-xs">Esta semana</Badge>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {teamMembers.slice(0, 5).map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center shrink-0"
              >
                <div className="relative">
                  <Avatar className={cn(
                    "h-12 w-12 ring-2",
                    index === 0 ? "ring-amber-500" : index === 1 ? "ring-slate-400" : index === 2 ? "ring-amber-700" : "ring-muted"
                  )}>
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {index < 3 && (
                    <div className={cn(
                      "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-background",
                      index === 0 ? "bg-amber-500 text-white" : index === 1 ? "bg-slate-400 text-white" : "bg-amber-700 text-white"
                    )}>
                      {index + 1}
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium mt-1 text-center truncate w-14">{member.name.split(" ")[0]}</p>
                <p className="text-[10px] text-muted-foreground">{member.kudosReceived}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            variant="outline" 
            className="w-full h-12 gap-2 border-2 hover:border-pink-500/50 hover:bg-pink-500/5"
          >
            <Heart className="h-5 w-5 text-pink-500" />
            Ver Todos os Kudos
            <ChevronRight className="h-5 w-5" />
          </Button>
        </motion.div>
      </CardContent>

      {/* Send Kudos Modal */}
      <AnimatePresence>
        {showSendModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSendModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-background rounded-3xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Enviar Kudos</h3>
                    <p className="text-xs text-muted-foreground">Reconheça um colega</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowSendModal(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Search Members */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar colega..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Select Member */}
              <div className="mb-4">
                <label className="text-sm font-semibold mb-2 block">Para quem?</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {teamMembers.filter(m => 
                    m.name.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((member) => (
                    <motion.button
                      key={member.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedMember(member)}
                      className={cn(
                        "p-3 rounded-xl border-2 text-left transition-all flex items-center gap-2",
                        selectedMember?.id === member.id
                          ? "border-pink-500 bg-pink-500/10"
                          : "border-transparent bg-muted/50 hover:border-pink-500/50"
                      )}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.department}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Select Category */}
              <div className="mb-4">
                <label className="text-sm font-semibold mb-2 block">Categoria</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <motion.button
                        key={cat.name}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={cn(
                          "p-3 rounded-xl border-2 text-left transition-all flex items-center gap-2",
                          selectedCategory === cat.name
                            ? "border-pink-500 bg-pink-500/10"
                            : "border-transparent bg-muted/50 hover:border-pink-500/50"
                        )}
                      >
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br", cat.color)}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">{cat.name}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div className="mb-4">
                <label className="text-sm font-semibold mb-2 block">Mensagem</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escreva uma mensagem de reconhecimento..."
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {message.length}/200
                </p>
              </div>

              {/* XP Reward Info */}
              <motion.div 
                className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 mb-6"
                animate={{ scale: [1, 1.01, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Você ganhará +15 XP</p>
                    <p className="text-xs text-muted-foreground">Por enviar este kudos</p>
                  </div>
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleSend}
                  disabled={!selectedMember || !selectedCategory || !message}
                  className="w-full h-12 gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg"
                >
                  <PartyPopper className="h-5 w-5" />
                  Enviar Kudos
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
});
