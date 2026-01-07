import { memo, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, Send, X, Sparkles, Brain,
  Lightbulb, Target, TrendingUp, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AICoachMessage {
  id: string;
  type: "ai" | "user" | "suggestion";
  content: string;
  timestamp: Date;
}

interface AICoachFloatingProps {
  className?: string;
}

const quickSuggestions = [
  { icon: Target, text: "Como atingir minhas metas?", category: "goals" },
  { icon: TrendingUp, text: "Dicas para subir de nível", category: "level" },
  { icon: Lightbulb, text: "O que fazer hoje?", category: "daily" },
];

const aiResponses: Record<string, string> = {
  goals: "Para atingir suas metas, recomendo: 1) Divida em micro-objetivos diários, 2) Complete o quiz diário para XP bônus, 3) Mantenha sua sequência para multiplicadores. Você está a 340 XP do próximo nível!",
  level: "Dicas para subir de nível rápido: 1) Complete todas as missões diárias (+150 XP), 2) Participe de duelos (+200 XP por vitória), 3) Termine trilhas de aprendizado (+500 XP). Seu próximo nível desbloqueia o título 'Especialista'!",
  daily: "Hoje você tem: 1) Quiz Diário (60% completo), 2) 2 missões pendentes, 3) 1 feedback para responder. Completar tudo renderá +350 XP e 45 coins! Começar pelo quiz é o caminho mais rápido.",
  default: "Olá! Sou seu coach de gamificação. Posso te ajudar com metas, dicas de progresso, ou sugestões do que fazer hoje. Como posso te ajudar?",
};

export const AICoachFloating = memo(function AICoachFloating({
  className,
}: AICoachFloatingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AICoachMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "1",
          type: "ai",
          content: aiResponses.default,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const handleSend = useCallback((text: string, category?: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: AICoachMessage = {
      id: Date.now().toString(),
      type: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = category 
        ? aiResponses[category] 
        : aiResponses.default;
      
      const aiMessage: AICoachMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  }, []);

  const handleQuickSuggestion = useCallback((suggestion: typeof quickSuggestions[0]) => {
    handleSend(suggestion.text, suggestion.category);
  }, [handleSend]);

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className={cn("fixed bottom-24 right-6 z-40 md:bottom-6", className)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <Button
                size="lg"
                onClick={() => setIsOpen(true)}
                className={cn(
                  "h-14 w-14 rounded-full shadow-lg",
                  "bg-gradient-to-br from-primary to-purple-600",
                  "hover:shadow-xl hover:scale-105 transition-all"
                )}
              >
                <Brain className="w-6 h-6" />
              </Button>
              
              {/* Pulse animation */}
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/30"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "fixed bottom-24 right-6 z-50 w-80 md:w-96 md:bottom-6",
              className
            )}
          >
            <Card className="flex flex-col h-[450px] shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary to-purple-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-white/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">AI Coach</h4>
                    <p className="text-xs text-white/70">Sempre aqui para ajudar</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex",
                      message.type === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                        message.type === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      )}
                    >
                      {message.content}
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-muted-foreground"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-xs">Digitando...</span>
                  </motion.div>
                )}

                {/* Quick suggestions (only show at start) */}
                {messages.length <= 1 && !isTyping && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs text-muted-foreground">
                      Perguntas rápidas:
                    </p>
                    {quickSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.category}
                        onClick={() => handleQuickSuggestion(suggestion)}
                        className={cn(
                          "flex items-center gap-2 w-full p-2.5 rounded-lg",
                          "bg-muted/50 hover:bg-muted text-sm text-left",
                          "transition-colors group"
                        )}
                      >
                        <suggestion.icon className="w-4 h-4 text-primary" />
                        <span className="flex-1">{suggestion.text}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend(inputValue)}
                    placeholder="Digite sua pergunta..."
                    className={cn(
                      "flex-1 px-3 py-2 rounded-full text-sm",
                      "bg-background border border-border",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50"
                    )}
                  />
                  <Button
                    size="icon"
                    onClick={() => handleSend(inputValue)}
                    disabled={!inputValue.trim()}
                    className="rounded-full"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
