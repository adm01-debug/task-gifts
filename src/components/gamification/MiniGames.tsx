import { memo, useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Gamepad2, Target, Brain, Zap, Trophy, 
  Play, Pause, RotateCcw, Star, Coins
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MiniGame {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  difficulty: "easy" | "medium" | "hard";
  xpReward: number;
  coinReward: number;
  highScore: number;
  playCount: number;
}

const games: MiniGame[] = [
  {
    id: "memory",
    name: "Memory Match",
    description: "Encontre os pares antes do tempo acabar",
    icon: Brain,
    difficulty: "easy",
    xpReward: 25,
    coinReward: 10,
    highScore: 1250,
    playCount: 15
  },
  {
    id: "reaction",
    name: "Reaction Time",
    description: "Clique o mais rápido possível",
    icon: Zap,
    difficulty: "medium",
    xpReward: 50,
    coinReward: 25,
    highScore: 180,
    playCount: 8
  },
  {
    id: "target",
    name: "Target Practice",
    description: "Acerte os alvos em movimento",
    icon: Target,
    difficulty: "hard",
    xpReward: 100,
    coinReward: 50,
    highScore: 2400,
    playCount: 3
  }
];

const difficultyConfig = {
  easy: { color: "text-green-500", bg: "bg-green-500/10" },
  medium: { color: "text-yellow-500", bg: "bg-yellow-500/10" },
  hard: { color: "text-red-500", bg: "bg-red-500/10" }
};

// Simple Reaction Time Game
const ReactionGame = memo(function ReactionGame({ 
  onComplete 
}: { 
  onComplete: (score: number) => void;
}) {
  const [gameState, setGameState] = useState<"waiting" | "ready" | "go" | "result">("waiting");
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [round, setRound] = useState(1);
  const [totalTime, setTotalTime] = useState(0);
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startRound = useCallback(() => {
    setGameState("ready");
    const delay = Math.random() * 3000 + 1500;
    timeoutRef.current = setTimeout(() => {
      setGameState("go");
      startTimeRef.current = Date.now();
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    if (gameState === "ready") {
      clearTimeout(timeoutRef.current);
      setGameState("waiting");
      alert("Muito cedo! Espere ficar verde.");
    } else if (gameState === "go") {
      const time = Date.now() - startTimeRef.current;
      setReactionTime(time);
      setTotalTime(prev => prev + time);
      
      if (round >= 3) {
        setGameState("result");
        onComplete(Math.max(0, 1000 - Math.floor((totalTime + time) / 3)));
      } else {
        setRound(r => r + 1);
        setGameState("waiting");
      }
    } else if (gameState === "waiting") {
      startRound();
    }
  }, [gameState, round, totalTime, startRound, onComplete]);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Rodada</span>
        <Badge variant="outline">{round}/3</Badge>
      </div>

      <motion.button
        onClick={handleClick}
        className={cn(
          "w-48 h-48 rounded-full flex items-center justify-center text-white font-bold text-lg transition-colors",
          gameState === "waiting" && "bg-blue-500 hover:bg-blue-600",
          gameState === "ready" && "bg-red-500 cursor-wait",
          gameState === "go" && "bg-green-500",
          gameState === "result" && "bg-primary"
        )}
        animate={gameState === "go" ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.5 }}
      >
        {gameState === "waiting" && "Clique para iniciar"}
        {gameState === "ready" && "Aguarde..."}
        {gameState === "go" && "CLIQUE!"}
        {gameState === "result" && "Fim!"}
      </motion.button>

      {reactionTime > 0 && gameState !== "result" && (
        <p className="text-sm text-muted-foreground">
          Última reação: <span className="font-bold text-foreground">{reactionTime}ms</span>
        </p>
      )}

      {gameState === "result" && (
        <div className="text-center">
          <p className="text-lg font-bold">
            Média: {Math.floor(totalTime / 3)}ms
          </p>
          <p className="text-sm text-muted-foreground">
            Pontuação: {Math.max(0, 1000 - Math.floor(totalTime / 3))}
          </p>
        </div>
      )}
    </div>
  );
});

export const MiniGames = memo(function MiniGames({ 
  className 
}: { 
  className?: string;
}) {
  const [selectedGame, setSelectedGame] = useState<MiniGame | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);

  const handleGameComplete = useCallback((score: number) => {
    setLastScore(score);
    setIsPlaying(false);
  }, []);

  const handlePlayAgain = useCallback(() => {
    setLastScore(null);
    setIsPlaying(true);
  }, []);

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <CardTitle className="text-lg">Mini Games</CardTitle>
            <p className="text-xs text-muted-foreground">
              Jogue e ganhe recompensas extras
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          {!selectedGame ? (
            <motion.div
              key="games-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-3"
            >
              {games.map(game => {
                const Icon = game.icon;
                const config = difficultyConfig[game.difficulty];
                
                return (
                  <motion.button
                    key={game.id}
                    onClick={() => setSelectedGame(game)}
                    className="p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors text-left"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("p-3 rounded-lg", config.bg)}>
                        <Icon className={cn("w-6 h-6", config.color)} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{game.name}</h4>
                          <Badge variant="outline" className={cn("text-xs capitalize", config.color)}>
                            {game.difficulty}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {game.description}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-xs">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span>{game.xpReward} XP</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Coins className="w-3 h-3 text-amber-500" />
                            <span>{game.coinReward}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Trophy className="w-3 h-3" />
                            <span>{game.highScore}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="game-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedGame(null);
                    setIsPlaying(false);
                    setLastScore(null);
                  }}
                >
                  ← Voltar
                </Button>
                <h3 className="font-semibold">{selectedGame.name}</h3>
                <div className="w-16" />
              </div>

              {!isPlaying && lastScore === null ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <selectedGame.icon className="w-10 h-10 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">{selectedGame.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedGame.description}
                  </p>
                  <div className="flex justify-center gap-4 mb-6">
                    <div className="text-center">
                      <p className="font-bold text-primary">{selectedGame.xpReward} XP</p>
                      <p className="text-xs text-muted-foreground">Recompensa</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-amber-500">{selectedGame.highScore}</p>
                      <p className="text-xs text-muted-foreground">Recorde</p>
                    </div>
                  </div>
                  <Button onClick={() => setIsPlaying(true)} size="lg">
                    <Play className="w-4 h-4 mr-2" />
                    Jogar
                  </Button>
                </div>
              ) : isPlaying ? (
                <div className="py-4">
                  {selectedGame.id === "reaction" && (
                    <ReactionGame onComplete={handleGameComplete} />
                  )}
                  {selectedGame.id !== "reaction" && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        Jogo em desenvolvimento...
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => handleGameComplete(Math.floor(Math.random() * 1000))}
                      >
                        Simular Conclusão
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"
                  >
                    <Trophy className="w-10 h-10 text-green-500" />
                  </motion.div>
                  <h4 className="font-bold text-2xl mb-2">{lastScore} pontos!</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {lastScore && lastScore > selectedGame.highScore 
                      ? "🎉 Novo recorde!" 
                      : `Recorde: ${selectedGame.highScore}`
                    }
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button onClick={handlePlayAgain}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Jogar Novamente
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedGame(null);
                        setLastScore(null);
                      }}
                    >
                      Outros Jogos
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
});

export default MiniGames;
