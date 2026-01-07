import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Swords, Trophy, Crown, Users, Clock, Medal, Zap, ChevronRight, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  score?: number;
  isWinner?: boolean;
  isCurrentUser?: boolean;
}

interface Match {
  id: string;
  round: number;
  participants: [Participant | null, Participant | null];
  status: "upcoming" | "live" | "completed";
  scheduledAt?: string;
}

interface Tournament {
  id: string;
  name: string;
  description: string;
  status: "registration" | "ongoing" | "completed";
  currentRound: number;
  totalRounds: number;
  prize: { xp: number; coins: number; title?: string };
  participants: number;
  maxParticipants: number;
  endsAt: string;
}

const mockTournament: Tournament = {
  id: "1",
  name: "Campeonato de Produtividade",
  description: "Compita para ser o mais produtivo da semana",
  status: "ongoing",
  currentRound: 2,
  totalRounds: 4,
  prize: { xp: 5000, coins: 1000, title: "Campeão Produtivo" },
  participants: 16,
  maxParticipants: 16,
  endsAt: "2024-12-20",
};

const mockMatches: Match[] = [
  { id: "1", round: 2, participants: [
    { id: "1", name: "Você", isCurrentUser: true, score: 850 },
    { id: "2", name: "Ana Costa", score: 780 }
  ], status: "live" },
  { id: "2", round: 2, participants: [
    { id: "3", name: "Pedro Lima", score: 920, isWinner: true },
    { id: "4", name: "Julia F.", score: 870 }
  ], status: "completed" },
  { id: "3", round: 2, participants: [
    { id: "5", name: "Carlos M." },
    { id: "6", name: "Maria S." }
  ], status: "upcoming", scheduledAt: "15:00" },
  { id: "4", round: 2, participants: [
    { id: "7", name: "Lucas R." },
    { id: "8", name: "Fernanda B." }
  ], status: "upcoming", scheduledAt: "16:00" },
];

const statusConfig = {
  live: { label: "Ao Vivo", color: "bg-red-500", textColor: "text-red-500" },
  upcoming: { label: "Em Breve", color: "bg-blue-500", textColor: "text-blue-500" },
  completed: { label: "Finalizado", color: "bg-green-500", textColor: "text-green-500" },
};

export const TournamentBracket = memo(function TournamentBracket() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Swords className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="block">{mockTournament.name}</span>
              <span className="text-xs font-normal text-muted-foreground">
                Rodada {mockTournament.currentRound} de {mockTournament.totalRounds}
              </span>
            </div>
          </div>
          <Badge variant="destructive" className="gap-1 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
            Ao Vivo
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tournament Progress */}
        <div className="p-3 rounded-xl bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso do Torneio</span>
            <span className="text-xs text-muted-foreground">
              {mockTournament.currentRound}/{mockTournament.totalRounds} rodadas
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: mockTournament.totalRounds }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 h-2 rounded-full transition-all",
                  i < mockTournament.currentRound ? "bg-primary" :
                  i === mockTournament.currentRound ? "bg-primary/50" : "bg-muted"
                )}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>Oitavas</span>
            <span>Quartas</span>
            <span>Semi</span>
            <span>Final</span>
          </div>
        </div>

        {/* Current Round Matches */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            Quartas de Final
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {mockMatches.map((match, index) => {
              const config = statusConfig[match.status];
              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedMatch(match)}
                  className={cn(
                    "p-3 rounded-xl border cursor-pointer transition-all hover:border-primary/50",
                    match.status === "live" && "border-red-500/50 bg-red-500/5"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className={cn("text-[10px] gap-1", config.textColor)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", config.color)} />
                      {config.label}
                    </Badge>
                    {match.scheduledAt && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />{match.scheduledAt}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {match.participants.map((p, pIdx) => (
                      <div
                        key={pIdx}
                        className={cn(
                          "flex items-center gap-2 p-1.5 rounded-lg",
                          p?.isWinner && "bg-green-500/10",
                          p?.isCurrentUser && "bg-primary/10"
                        )}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={p?.avatar} />
                          <AvatarFallback className="text-[10px]">
                            {p?.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium flex-1 truncate">
                          {p?.name || "TBD"}
                        </span>
                        {p?.score !== undefined && (
                          <span className="text-xs font-bold">{p.score}</span>
                        )}
                        {p?.isWinner && <Crown className="h-3 w-3 text-amber-500" />}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Your Match Status */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-semibold">Sua Partida</span>
            </div>
            <Badge variant="destructive" className="gap-1">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Ao Vivo
            </Badge>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border-2 border-primary">
                <AvatarFallback>V</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Você</p>
                <p className="text-xs text-muted-foreground">850 pts</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">VS</div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium">Ana Costa</p>
                <p className="text-xs text-muted-foreground">780 pts</p>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback>AC</AvatarFallback>
              </Avatar>
            </div>
          </div>
          <Progress value={52} className="h-2 mb-2" />
          <p className="text-xs text-center text-muted-foreground">
            Você está 70 pts na frente • Termina em 2h 15min
          </p>
        </div>

        {/* Prize Pool */}
        <div className="p-3 rounded-xl border bg-gradient-to-r from-amber-500/10 to-yellow-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Medal className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold">Premiação</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-amber-500/20">
              <Crown className="h-4 w-4 mx-auto text-amber-500 mb-1" />
              <p className="text-xs font-bold">1º Lugar</p>
              <p className="text-[10px] text-muted-foreground">5000 XP + Título</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-gray-400/20">
              <Medal className="h-4 w-4 mx-auto text-gray-400 mb-1" />
              <p className="text-xs font-bold">2º Lugar</p>
              <p className="text-[10px] text-muted-foreground">3000 XP</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-amber-700/20">
              <Medal className="h-4 w-4 mx-auto text-amber-700 mb-1" />
              <p className="text-xs font-bold">3º Lugar</p>
              <p className="text-[10px] text-muted-foreground">1500 XP</p>
            </div>
          </div>
        </div>

        <Button variant="outline" className="w-full gap-2">
          Ver Chave Completa
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
});
