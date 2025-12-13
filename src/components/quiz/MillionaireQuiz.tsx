import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, HelpCircle, Users, Phone, Percent, 
  Timer, Zap, RotateCcw, X, Check, Sparkles,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import confetti from "canvas-confetti";
import { useRecordAnswer } from "@/hooks/useQuizStats";

export interface MillionaireQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  difficulty: "easy" | "medium" | "hard";
  explanation?: string;
}

interface MillionaireQuizProps {
  questions: MillionaireQuestion[];
  title?: string;
  onComplete?: (level: number, prize: number) => void;
}

const PRIZE_LADDER = [
  100, 200, 300, 500, 1000,
  2000, 4000, 8000, 16000, 32000,
  64000, 125000, 250000, 500000, 1000000
];

const CHECKPOINTS = [4, 9, 14]; // 0-indexed: 1000, 32000, 1000000

function formatPrize(value: number): string {
  if (value >= 1000000) return `${value / 1000000}M`;
  if (value >= 1000) return `${value / 1000}K`;
  return value.toString();
}

function AudienceHelp({ question, onClose }: { question: MillionaireQuestion; onClose: () => void }) {
  const [percentages, setPercentages] = useState<number[]>([]);

  useEffect(() => {
    // Simulate audience response
    const correctIndex = question.options.findIndex(o => o.isCorrect);
    const baseCorrect = question.difficulty === "easy" ? 70 : question.difficulty === "medium" ? 55 : 40;
    
    const probs = question.options.map((_, idx) => {
      if (idx === correctIndex) return baseCorrect + Math.random() * 15;
      return Math.random() * (100 - baseCorrect) / 3;
    });
    
    const total = probs.reduce((a, b) => a + b, 0);
    setPercentages(probs.map(p => Math.round((p / total) * 100)));
  }, [question]);

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Ajuda da Plateia
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {question.options.map((option, idx) => (
            <div key={option.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{String.fromCharCode(65 + idx)}</span>
                <span>{percentages[idx] || 0}%</span>
              </div>
              <div className="h-8 bg-muted rounded-lg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentages[idx] || 0}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="h-full bg-primary/60"
                />
              </div>
            </div>
          ))}
        </div>
        <Button onClick={onClose} className="w-full">Fechar</Button>
      </DialogContent>
    </Dialog>
  );
}

function PhoneHelp({ question, onClose }: { question: MillionaireQuestion; onClose: () => void }) {
  const [message, setMessage] = useState("");
  const correctOption = question.options.find(o => o.isCorrect);
  const correctLetter = String.fromCharCode(65 + question.options.findIndex(o => o.isCorrect));

  useEffect(() => {
    const confidence = question.difficulty === "easy" ? "tenho certeza" : 
                       question.difficulty === "medium" ? "acho que" : "não tenho certeza, mas chuto";
    
    const messages = [
      `Hmm, deixa eu pensar... Eu ${confidence} que é a alternativa ${correctLetter}!`,
      `Olha, ${confidence} a resposta é ${correctLetter}. ${correctOption?.text.slice(0, 30)}...`,
      `Essa é difícil! Mas ${confidence} que a certa é a ${correctLetter}.`,
    ];
    
    let idx = 0;
    const selected = messages[Math.floor(Math.random() * messages.length)];
    const interval = setInterval(() => {
      if (idx <= selected.length) {
        setMessage(selected.slice(0, idx));
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [question, correctLetter, correctOption]);

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-500" />
            Ligação para um Amigo
          </DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-2xl">
              🧑‍💼
            </div>
            <div className="flex-1 p-4 rounded-2xl bg-muted/50 border border-border/50">
              <p className="text-sm">{message}<span className="animate-pulse">|</span></p>
            </div>
          </div>
        </div>
        <Button onClick={onClose} className="w-full">Desligar</Button>
      </DialogContent>
    </Dialog>
  );
}

export function MillionaireQuiz({ questions, title = "Show do Milhão", onComplete }: MillionaireQuizProps) {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [wonPrize, setWonPrize] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const questionStartTime = useRef<number>(Date.now());
  const recordAnswer = useRecordAnswer();
  
  // Lifelines
  const [usedLifelines, setUsedLifelines] = useState({
    fifty: false,
    audience: false,
    phone: false,
  });
  const [eliminatedOptions, setEliminatedOptions] = useState<Set<string>>(new Set());
  const [showAudience, setShowAudience] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  const currentQuestion = questions[currentLevel];
  const currentPrize = PRIZE_LADDER[currentLevel];
  const guaranteedPrize = CHECKPOINTS.filter(cp => cp < currentLevel).length > 0
    ? PRIZE_LADDER[CHECKPOINTS.filter(cp => cp < currentLevel).pop()!]
    : 0;

  // Reset timer when question changes
  useEffect(() => {
    questionStartTime.current = Date.now();
  }, [currentLevel]);
  // Timer
  useEffect(() => {
    if (isRevealed || isGameOver || isTimerPaused || showAudience || showPhone) return;
    
    if (timeLeft === 0) {
      handleTimeout();
      return;
    }

    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isRevealed, isGameOver, isTimerPaused, showAudience, showPhone]);

  const handleTimeout = () => {
    setIsGameOver(true);
    setWonPrize(guaranteedPrize);
    onComplete?.(currentLevel, guaranteedPrize);
  };

  const handleSelectOption = (optionId: string) => {
    if (isRevealed || eliminatedOptions.has(optionId)) return;
    setSelectedOption(optionId);
  };

  const handleConfirm = () => {
    if (!selectedOption) return;
    
    setIsRevealed(true);
    const selectedOpt = currentQuestion.options.find(o => o.id === selectedOption);
    const isCorrect = selectedOpt?.isCorrect || false;
    const timeSpent = Date.now() - questionStartTime.current;

    // Record answer for statistics
    recordAnswer.mutate({
      question_id: currentQuestion.id,
      selected_option_id: selectedOption,
      is_correct: isCorrect,
      time_spent_ms: timeSpent,
    });

    if (isCorrect) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#fbbf24', '#f59e0b', '#d97706']
      });
    }
  };

  const handleNext = () => {
    const isCorrect = currentQuestion.options.find(o => o.id === selectedOption)?.isCorrect;
    
    if (!isCorrect) {
      setIsGameOver(true);
      setWonPrize(guaranteedPrize);
      onComplete?.(currentLevel, guaranteedPrize);
      return;
    }

    if (currentLevel >= questions.length - 1) {
      // Won the game!
      setIsGameOver(true);
      setWonPrize(PRIZE_LADDER[currentLevel]);
      onComplete?.(currentLevel + 1, PRIZE_LADDER[currentLevel]);
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.5 },
      });
      return;
    }

    // Next question
    setCurrentLevel(l => l + 1);
    setSelectedOption(null);
    setIsRevealed(false);
    setEliminatedOptions(new Set());
    setTimeLeft(30 - Math.floor(currentLevel / 5) * 5); // Less time for harder questions
  };

  const handleStopGame = () => {
    const prize = currentLevel > 0 ? PRIZE_LADDER[currentLevel - 1] : 0;
    setIsGameOver(true);
    setWonPrize(prize);
    onComplete?.(currentLevel, prize);
  };

  const handleFiftyFifty = () => {
    if (usedLifelines.fifty) return;
    setUsedLifelines(prev => ({ ...prev, fifty: true }));
    
    const correctOption = currentQuestion.options.find(o => o.isCorrect);
    const wrongOptions = currentQuestion.options.filter(o => !o.isCorrect);
    const toEliminate = wrongOptions.slice(0, 2).map(o => o.id);
    setEliminatedOptions(new Set(toEliminate));
  };

  const handleRestart = () => {
    setCurrentLevel(0);
    setSelectedOption(null);
    setIsRevealed(false);
    setIsGameOver(false);
    setWonPrize(0);
    setTimeLeft(30);
    setUsedLifelines({ fifty: false, audience: false, phone: false });
    setEliminatedOptions(new Set());
  };

  const getOptionStyle = (option: { id: string; isCorrect: boolean }) => {
    if (eliminatedOptions.has(option.id)) return "opacity-30 pointer-events-none";
    if (!isRevealed) {
      if (selectedOption === option.id) return "border-amber-500 bg-amber-500/20 shadow-lg shadow-amber-500/20";
      return "border-border/50 hover:border-primary/50";
    }
    if (option.isCorrect) return "border-emerald-500 bg-emerald-500/20";
    if (selectedOption === option.id && !option.isCorrect) return "border-red-500 bg-red-500/20";
    return "border-border/30 opacity-50";
  };

  if (isGameOver) {
    const isWinner = wonPrize === 1000000;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: isWinner ? [0, 10, -10, 0] : 0
          }}
          transition={{ duration: 0.5, repeat: isWinner ? Infinity : 0, repeatDelay: 2 }}
        >
          <Trophy className={`w-24 h-24 mx-auto mb-6 ${isWinner ? 'text-amber-400' : 'text-primary'}`} />
        </motion.div>
        
        <h2 className="text-3xl font-bold mb-2">
          {isWinner ? "VOCÊ É O MILIONÁRIO! 🎉" : wonPrize > 0 ? "Fim de Jogo!" : "Que pena! 😔"}
        </h2>
        
        <p className="text-muted-foreground mb-6">
          {isWinner 
            ? "Parabéns! Você acertou todas as perguntas!" 
            : wonPrize > 0 
              ? `Você garantiu ${formatPrize(wonPrize)} pontos!`
              : "Você não conseguiu nenhum prêmio desta vez."}
        </p>

        <div className="inline-block mb-8">
          <Card className="p-6 bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30">
            <p className="text-sm text-muted-foreground mb-1">Prêmio Final</p>
            <p className="text-4xl font-bold text-amber-400">
              🪙 {formatPrize(wonPrize)}
            </p>
          </Card>
        </div>

        <div className="flex gap-4 justify-center">
          <Button onClick={handleRestart} size="lg" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Jogar Novamente
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">
            Pergunta {currentLevel + 1} de {questions.length}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Timer */}
          <Badge 
            variant="outline" 
            className={`text-lg px-4 py-2 ${timeLeft <= 10 ? 'border-red-500 text-red-500 animate-pulse' : ''}`}
          >
            <Timer className="w-4 h-4 mr-1" />
            {timeLeft}s
          </Badge>
          
          {/* Current prize */}
          <Badge className="text-lg px-4 py-2 bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Zap className="w-4 h-4 mr-1" />
            {formatPrize(currentPrize)}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Prize ladder */}
        <Card className="lg:col-span-1 p-4 bg-gradient-to-b from-card to-primary/5 order-2 lg:order-1">
          <h3 className="text-sm font-semibold mb-3 text-center">Prêmios</h3>
          <div className="space-y-1">
            {[...PRIZE_LADDER].reverse().map((prize, idx) => {
              const level = PRIZE_LADDER.length - 1 - idx;
              const isCheckpoint = CHECKPOINTS.includes(level);
              const isCurrent = level === currentLevel;
              const isPassed = level < currentLevel;
              
              return (
                <div
                  key={level}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all ${
                    isCurrent 
                      ? 'bg-amber-500/30 text-amber-400 font-bold scale-105' 
                      : isPassed 
                        ? 'text-emerald-500' 
                        : isCheckpoint
                          ? 'text-primary font-medium'
                          : 'text-muted-foreground'
                  }`}
                >
                  <span>{level + 1}</span>
                  <span className="flex items-center gap-1">
                    {isPassed && <Check className="w-3 h-3" />}
                    {isCheckpoint && !isPassed && "🛡️"}
                    {formatPrize(prize)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Main game area */}
        <div className="lg:col-span-3 space-y-6 order-1 lg:order-2">
          {/* Lifelines */}
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="lg"
              className={`gap-2 ${usedLifelines.fifty ? 'opacity-30 line-through' : ''}`}
              onClick={handleFiftyFifty}
              disabled={usedLifelines.fifty || isRevealed}
            >
              <Percent className="w-4 h-4" />
              50/50
            </Button>
            <Button
              variant="outline"
              size="lg"
              className={`gap-2 ${usedLifelines.audience ? 'opacity-30 line-through' : ''}`}
              onClick={() => {
                if (usedLifelines.audience || isRevealed) return;
                setUsedLifelines(prev => ({ ...prev, audience: true }));
                setShowAudience(true);
              }}
              disabled={usedLifelines.audience || isRevealed}
            >
              <Users className="w-4 h-4" />
              Plateia
            </Button>
            <Button
              variant="outline"
              size="lg"
              className={`gap-2 ${usedLifelines.phone ? 'opacity-30 line-through' : ''}`}
              onClick={() => {
                if (usedLifelines.phone || isRevealed) return;
                setUsedLifelines(prev => ({ ...prev, phone: true }));
                setShowPhone(true);
              }}
              disabled={usedLifelines.phone || isRevealed}
            >
              <Phone className="w-4 h-4" />
              Ligar
            </Button>
          </div>

          {/* Question */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-primary/20 text-primary">
                {currentQuestion.difficulty === "easy" ? "Fácil" : 
                 currentQuestion.difficulty === "medium" ? "Média" : "Difícil"}
              </Badge>
            </div>
            <h3 className="text-xl font-semibold leading-relaxed">
              {currentQuestion.question}
            </h3>
          </Card>

          {/* Options */}
          <div className="grid sm:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, idx) => (
              <motion.button
                key={option.id}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3 ${getOptionStyle(option)}`}
                onClick={() => handleSelectOption(option.id)}
                disabled={isRevealed || eliminatedOptions.has(option.id)}
                whileHover={!isRevealed && !eliminatedOptions.has(option.id) ? { scale: 1.02 } : {}}
                whileTap={!isRevealed && !eliminatedOptions.has(option.id) ? { scale: 0.98 } : {}}
              >
                <span className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center font-bold shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{option.text}</span>
                {isRevealed && option.isCorrect && (
                  <Check className="w-6 h-6 text-emerald-500 shrink-0" />
                )}
                {isRevealed && selectedOption === option.id && !option.isCorrect && (
                  <X className="w-6 h-6 text-red-500 shrink-0" />
                )}
              </motion.button>
            ))}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {isRevealed && currentQuestion.explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="p-4 bg-muted/50 border-border/50">
                  <p className="text-sm text-muted-foreground">
                    💡 {currentQuestion.explanation}
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            {!isRevealed ? (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleStopGame}
                  className="gap-2"
                >
                  Parar e Levar {currentLevel > 0 ? formatPrize(PRIZE_LADDER[currentLevel - 1]) : 0}
                </Button>
                <Button
                  size="lg"
                  onClick={handleConfirm}
                  disabled={!selectedOption}
                  className="gap-2 bg-amber-500 hover:bg-amber-600"
                >
                  Confirmar Resposta
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button size="lg" onClick={handleNext} className="gap-2">
                {currentQuestion.options.find(o => o.id === selectedOption)?.isCorrect
                  ? currentLevel < questions.length - 1 ? "Próxima Pergunta" : "Ver Resultado"
                  : "Ver Resultado"}
                <Sparkles className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Lifeline modals */}
      {showAudience && (
        <AudienceHelp question={currentQuestion} onClose={() => setShowAudience(false)} />
      )}
      {showPhone && (
        <PhoneHelp question={currentQuestion} onClose={() => setShowPhone(false)} />
      )}
    </div>
  );
}