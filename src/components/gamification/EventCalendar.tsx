import { memo } from "react";
import { motion } from "framer-motion";
import { Calendar, Sparkles, Gift, Clock, ChevronRight, Star, Zap, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  name: string;
  description: string;
  type: "seasonal" | "special" | "challenge" | "community";
  endsIn: string;
  progress: number;
  rewards: { xp: number; coins: number; special?: string };
  color: string;
}

const mockEvents: Event[] = [
  { id: "1", name: "Ano Novo Produtivo", description: "Complete metas para ganhar recompensas", type: "seasonal", endsIn: "5d", progress: 65, rewards: { xp: 2000, coins: 1000, special: "Badge Exclusivo" }, color: "from-blue-500 to-cyan-500" },
  { id: "2", name: "Desafio Relâmpago", description: "Complete 10 tarefas em 24h", type: "challenge", endsIn: "18h", progress: 40, rewards: { xp: 500, coins: 250 }, color: "from-yellow-500 to-orange-500" },
  { id: "3", name: "Semana da Colaboração", description: "Envie kudos para colegas", type: "community", endsIn: "3d", progress: 80, rewards: { xp: 750, coins: 400 }, color: "from-purple-500 to-pink-500" },
];

const typeIcons = { seasonal: Calendar, special: Sparkles, challenge: Trophy, community: Star };

export const EventCalendar = memo(function EventCalendar() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <Calendar className="h-5 w-5 text-white" />
            </motion.div>
            <div><span>Eventos Ativos</span><p className="text-xs font-normal text-muted-foreground">{mockEvents.length} em andamento</p></div>
          </div>
          <Badge className="bg-gradient-to-r from-pink-500 to-rose-500"><Sparkles className="h-3 w-3 mr-1" />Limitado</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockEvents.map((event, index) => {
          const TypeIcon = typeIcons[event.type];
          return (
            <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className={cn("p-4 rounded-xl border overflow-hidden relative")}>
              <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-r", event.color)} />
              <div className="relative">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br", event.color)}><TypeIcon className="h-4 w-4 text-white" /></div>
                    <div><h4 className="font-medium text-sm">{event.name}</h4><p className="text-[10px] text-muted-foreground">{event.description}</p></div>
                  </div>
                  <Badge variant="outline" className="text-[10px]"><Clock className="h-3 w-3 mr-1" />{event.endsIn}</Badge>
                </div>
                <div className="space-y-1 mb-3"><div className="flex justify-between text-xs"><span className="text-muted-foreground">Progresso</span><span className="font-medium">{event.progress}%</span></div><Progress value={event.progress} className="h-1.5" /></div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 text-xs"><span className="flex items-center gap-1 text-yellow-500"><Zap className="h-3 w-3" />+{event.rewards.xp}</span><span className="flex items-center gap-1 text-amber-500"><Star className="h-3 w-3" />+{event.rewards.coins}</span>{event.rewards.special && <Badge variant="secondary" className="text-[9px]"><Gift className="h-2.5 w-2.5 mr-1" />{event.rewards.special}</Badge>}</div>
                  <Button size="sm" className="h-7 text-xs">Participar<ChevronRight className="h-3 w-3 ml-1" /></Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
});
