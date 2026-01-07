import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Send, MessageCircle, Star, Sparkles, Users, ChevronRight, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface KudosEntry {
  id: string;
  from: { name: string; avatar?: string };
  to: { name: string; avatar?: string };
  message: string;
  category: string;
  reactions: number;
  date: string;
}

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  department: string;
}

const mockKudos: KudosEntry[] = [
  { id: "1", from: { name: "Ana Costa" }, to: { name: "Você" }, message: "Obrigada pela ajuda no projeto! Sua contribuição foi fundamental.", category: "Colaboração", reactions: 12, date: "2h" },
  { id: "2", from: { name: "Pedro Lima" }, to: { name: "Julia Ferreira" }, message: "Apresentação incrível na reunião de ontem!", category: "Excelência", reactions: 8, date: "5h" },
  { id: "3", from: { name: "Você" }, to: { name: "Carlos Mendes" }, message: "Sempre disposto a ajudar a equipe!", category: "Espírito de Equipe", reactions: 15, date: "1d" },
];

const teamMembers: TeamMember[] = [
  { id: "1", name: "Ana Costa", department: "Design" },
  { id: "2", name: "Pedro Lima", department: "Tech" },
  { id: "3", name: "Julia Ferreira", department: "Marketing" },
  { id: "4", name: "Carlos Mendes", department: "RH" },
];

const categories = ["Colaboração", "Inovação", "Excelência", "Espírito de Equipe", "Liderança", "Mentoria"];

const categoryColors: Record<string, string> = {
  "Colaboração": "bg-blue-500/10 text-blue-500 border-blue-500/30",
  "Inovação": "bg-purple-500/10 text-purple-500 border-purple-500/30",
  "Excelência": "bg-amber-500/10 text-amber-500 border-amber-500/30",
  "Espírito de Equipe": "bg-green-500/10 text-green-500 border-green-500/30",
  "Liderança": "bg-red-500/10 text-red-500 border-red-500/30",
  "Mentoria": "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
};

export const KudosWall = memo(function KudosWall() {
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    // Send kudos logic
    setShowSendModal(false);
    setSelectedMember(null);
    setSelectedCategory("");
    setMessage("");
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="block">Mural de Kudos</span>
              <span className="text-xs font-normal text-muted-foreground">
                Reconheça seus colegas
              </span>
            </div>
          </div>
          <Button size="sm" onClick={() => setShowSendModal(true)} className="gap-2">
            <Send className="h-4 w-4" />
            Enviar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-xl bg-pink-500/10 text-center">
            <Heart className="h-4 w-4 mx-auto text-pink-500 mb-1" />
            <p className="text-lg font-bold">24</p>
            <p className="text-[10px] text-muted-foreground">Recebidos</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-center">
            <Send className="h-4 w-4 mx-auto text-purple-500 mb-1" />
            <p className="text-lg font-bold">18</p>
            <p className="text-[10px] text-muted-foreground">Enviados</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-center">
            <Star className="h-4 w-4 mx-auto text-amber-500 mb-1" />
            <p className="text-lg font-bold">+360</p>
            <p className="text-[10px] text-muted-foreground">XP Ganho</p>
          </div>
        </div>

        {/* Kudos Feed */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {mockKudos.map((kudos, index) => (
            <motion.div
              key={kudos.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-3 rounded-xl border",
                kudos.to.name === "Você" && "bg-pink-500/5 border-pink-500/30"
              )}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={kudos.from.avatar} />
                  <AvatarFallback>{kudos.from.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-sm mb-1">
                    <span className="font-medium">{kudos.from.name}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium">{kudos.to.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{kudos.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{kudos.message}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={cn("text-[10px]", categoryColors[kudos.category])}>
                      {kudos.category}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs">
                      <Heart className="h-3 w-3" />
                      {kudos.reactions}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <Button variant="outline" className="w-full gap-2">
          Ver Todos os Kudos
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>

      {/* Send Kudos Modal */}
      <AnimatePresence>
        {showSendModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSendModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  Enviar Kudos
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowSendModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Select Member */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Para quem?</label>
                <div className="grid grid-cols-2 gap-2">
                  {teamMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all flex items-center gap-2",
                        selectedMember?.id === member.id
                          ? "border-pink-500 bg-pink-500/10"
                          : "hover:border-pink-500/50"
                      )}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.department}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Category */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge
                      key={cat}
                      variant="outline"
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "cursor-pointer transition-all",
                        selectedCategory === cat
                          ? categoryColors[cat]
                          : "hover:bg-muted"
                      )}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Mensagem</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escreva uma mensagem de reconhecimento..."
                  rows={3}
                />
              </div>

              {/* XP Reward Info */}
              <div className="p-3 rounded-xl bg-amber-500/10 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Você ganhará <strong>+15 XP</strong> por enviar este kudos!</span>
                </div>
              </div>

              <Button
                onClick={handleSend}
                disabled={!selectedMember || !selectedCategory || !message}
                className="w-full gap-2"
              >
                <Send className="h-4 w-4" />
                Enviar Kudos
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
});
