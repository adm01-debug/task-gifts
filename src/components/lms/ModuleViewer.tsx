import { useState } from "react";
import { motion } from "framer-motion";
import { 
  X, CheckCircle2, ChevronLeft, ChevronRight, 
  Video, FileText, HelpCircle, Layers, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { TrailModule } from "@/services/trailsService";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface FlashCard {
  front: string;
  back: string;
}

interface ChecklistItem {
  text: string;
  checked?: boolean;
}

interface ModuleViewerProps {
  module: TrailModule;
  onComplete: (score?: number) => void;
  onClose: () => void;
}

function VideoContent({ videoUrl }: { videoUrl: string }) {
  const isYoutube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  
  if (isYoutube) {
    const videoId = videoUrl.includes("youtu.be") 
      ? videoUrl.split("/").pop() 
      : new URL(videoUrl).searchParams.get("v");
    
    return (
      <div className="aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-black">
      <video src={videoUrl} controls className="w-full h-full" />
    </div>
  );
}

function TextContent({ content }: { content: { text?: string; html?: string } }) {
  if (content.html) {
    return (
      <div 
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content.html }}
      />
    );
  }

  return (
    <div className="prose prose-invert max-w-none whitespace-pre-wrap">
      {content.text || "Conteúdo não disponível"}
    </div>
  );
}

function QuizContent({ 
  questions, 
  onComplete 
}: { 
  questions: QuizQuestion[]; 
  onComplete: (score: number) => void;
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    const correct = questions.reduce((acc, q, i) => {
      return acc + (answers[i] === q.correct ? 1 : 0);
    }, 0);
    return Math.round((correct / questions.length) * 100);
  };

  if (showResults) {
    const score = calculateScore();
    const passed = score >= 70;

    return (
      <div className="text-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
            passed ? "bg-emerald-500/20" : "bg-red-500/20"
          }`}
        >
          <span className="text-4xl font-bold">{score}%</span>
        </motion.div>
        
        <h3 className="text-xl font-semibold mb-2">
          {passed ? "🎉 Parabéns!" : "😕 Quase lá!"}
        </h3>
        <p className="text-muted-foreground mb-6">
          {passed 
            ? `Você acertou ${answers.filter((a, i) => a === questions[i].correct).length} de ${questions.length} questões!`
            : "Você precisa de 70% para passar. Tente novamente!"}
        </p>
        
        <Button 
          onClick={() => onComplete(score)} 
          disabled={!passed}
          className="gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          {passed ? "Concluir Módulo" : "Tentar Novamente"}
        </Button>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Questão {currentQuestion + 1} de {questions.length}
        </span>
        <Progress value={(currentQuestion / questions.length) * 100} className="w-32 h-2" />
      </div>

      <h3 className="text-lg font-medium">{question.question}</h3>

      <RadioGroup
        value={answers[currentQuestion]?.toString()}
        onValueChange={(value) => handleAnswer(parseInt(value))}
        className="space-y-3"
      >
        {question.options.map((option, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Label
              htmlFor={`option-${index}`}
              className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                answers[currentQuestion] === index
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <span>{option}</span>
            </Label>
          </motion.div>
        ))}
      </RadioGroup>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        <Button
          onClick={handleNext}
          disabled={answers[currentQuestion] === undefined}
        >
          {currentQuestion === questions.length - 1 ? "Finalizar" : "Próxima"}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function FlashcardsContent({ 
  cards,
  onComplete,
}: { 
  cards: FlashCard[];
  onComplete: () => void;
}) {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewed, setReviewed] = useState<Set<number>>(new Set());

  const handleNext = () => {
    setReviewed(new Set([...reviewed, currentCard]));
    setIsFlipped(false);
    
    if (currentCard < cards.length - 1) {
      setCurrentCard(currentCard + 1);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentCard(Math.max(0, currentCard - 1));
  };

  const allReviewed = reviewed.size === cards.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Card {currentCard + 1} de {cards.length}
        </span>
        <Progress value={(reviewed.size / cards.length) * 100} className="w-32 h-2" />
      </div>

      <motion.div
        className="relative h-64 cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="absolute inset-0 rounded-xl border bg-card p-6 flex items-center justify-center text-center backface-hidden"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div>
            <p className="text-xs text-muted-foreground mb-2">Pergunta</p>
            <p className="text-lg font-medium">{cards[currentCard].front}</p>
            <p className="text-xs text-muted-foreground mt-4">Clique para virar</p>
          </div>
        </motion.div>

        <motion.div
          className="absolute inset-0 rounded-xl border bg-primary/10 p-6 flex items-center justify-center text-center"
          initial={{ rotateY: 180 }}
          animate={{ rotateY: isFlipped ? 0 : -180 }}
          transition={{ duration: 0.6 }}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div>
            <p className="text-xs text-primary mb-2">Resposta</p>
            <p className="text-lg font-medium">{cards[currentCard].back}</p>
          </div>
        </motion.div>
      </motion.div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handlePrev} disabled={currentCard === 0}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        
        {allReviewed ? (
          <Button onClick={() => onComplete()} className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Concluir
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={currentCard === cards.length - 1}>
            Próximo
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

function ChecklistContent({ 
  items: initialItems,
  onComplete,
}: { 
  items: ChecklistItem[];
  onComplete: () => void;
}) {
  const [items, setItems] = useState(initialItems.map(i => ({ ...i, checked: false })));

  const toggleItem = (index: number) => {
    const newItems = [...items];
    newItems[index].checked = !newItems[index].checked;
    setItems(newItems);
  };

  const allChecked = items.every(i => i.checked);

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Complete todas as tarefas para avançar:
      </p>

      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Label
              className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                item.checked
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => toggleItem(index)}
            >
              <Checkbox checked={item.checked} />
              <span className={item.checked ? "line-through text-muted-foreground" : ""}>
                {item.text}
              </span>
            </Label>
          </motion.div>
        ))}
      </div>

      <Button 
        onClick={() => onComplete()} 
        disabled={!allChecked}
        className="w-full gap-2"
      >
        <CheckCircle2 className="h-4 w-4" />
        Concluir Módulo
      </Button>
    </div>
  );
}

export default function ModuleViewer({ module, onComplete, onClose }: ModuleViewerProps) {
  const [videoWatched, setVideoWatched] = useState(false);
  const [textRead, setTextRead] = useState(false);

  const content = module.content as Record<string, unknown>;

  const renderContent = () => {
    switch (module.content_type) {
      case "video":
        return (
          <div className="space-y-4">
            <VideoContent videoUrl={module.video_url || ""} />
            <Button 
              onClick={() => onComplete()} 
              className="w-full gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Marcar como Assistido
            </Button>
          </div>
        );

      case "text":
        return (
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto p-4 rounded-lg bg-muted/50">
              <TextContent content={content as { text?: string; html?: string }} />
            </div>
            <Button 
              onClick={() => onComplete()} 
              className="w-full gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Marcar como Lido
            </Button>
          </div>
        );

      case "quiz":
        return (
          <QuizContent 
            questions={(content.questions as QuizQuestion[]) || []} 
            onComplete={onComplete}
          />
        );

      case "flashcard":
        return (
          <FlashcardsContent 
            cards={(content.cards as FlashCard[]) || []} 
            onComplete={() => onComplete()}
          />
        );

      case "checklist":
        return (
          <ChecklistContent 
            items={(content.items as ChecklistItem[]) || []} 
            onComplete={() => onComplete()}
          />
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Tipo de conteúdo não suportado</p>
            <Button onClick={() => onComplete()} className="mt-4">
              Pular Módulo
            </Button>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto"
    >
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">{module.title}</h2>
            {module.description && (
              <p className="text-muted-foreground">{module.description}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
