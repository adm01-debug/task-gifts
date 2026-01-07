import { memo, useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, Send, X, Users, Smile,
  Image, Heart, ThumbsUp, Laugh, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
  reactions: { emoji: string; count: number; reacted: boolean }[];
  type: "message" | "achievement" | "kudos";
}

const mockMessages: ChatMessage[] = [
  {
    id: "1",
    userId: "u1",
    userName: "Ana Silva",
    userAvatar: "AS",
    content: "Bom dia pessoal! Quem vai fazer o quiz hoje? 🎯",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    reactions: [
      { emoji: "👋", count: 3, reacted: true },
      { emoji: "🔥", count: 2, reacted: false },
    ],
    type: "message",
  },
  {
    id: "2",
    userId: "u2",
    userName: "Carlos Mendes",
    userAvatar: "CM",
    content: "Acabei de bater minha meta semanal! 💪",
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    reactions: [
      { emoji: "🎉", count: 5, reacted: false },
      { emoji: "👏", count: 4, reacted: true },
    ],
    type: "achievement",
  },
  {
    id: "3",
    userId: "u3",
    userName: "Maria Santos",
    userAvatar: "MS",
    content: "Alguém pode me ajudar com a trilha de vendas?",
    timestamp: new Date(Date.now() - 1000 * 60 * 1),
    reactions: [],
    type: "message",
  },
];

const quickReactions = ["👍", "❤️", "😄", "🎉", "🔥"];

interface TeamChatProps {
  className?: string;
  minimized?: boolean;
}

export const TeamChat = memo(function TeamChat({ 
  className,
  minimized = true
}: TeamChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [inputValue, setInputValue] = useState("");
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(2);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [isOpen, scrollToBottom]);

  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: "me",
      userName: "Você",
      userAvatar: "EU",
      content: inputValue,
      timestamp: new Date(),
      reactions: [],
      type: "message",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setTimeout(scrollToBottom, 100);
  }, [inputValue, scrollToBottom]);

  const handleReaction = useCallback((messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        
        const existingReaction = msg.reactions.find((r) => r.emoji === emoji);
        if (existingReaction) {
          return {
            ...msg,
            reactions: msg.reactions.map((r) =>
              r.emoji === emoji
                ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted }
                : r
            ).filter((r) => r.count > 0),
          };
        } else {
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, count: 1, reacted: true }],
          };
        }
      })
    );
    setShowReactions(null);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  if (minimized && !isOpen) {
    return (
      <motion.div
        className={cn("fixed bottom-24 left-6 z-40 md:bottom-6", className)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.2, type: "spring" }}
      >
        <Button
          size="lg"
          onClick={() => setIsOpen(true)}
          className={cn(
            "h-14 w-14 rounded-full shadow-lg relative",
            "bg-gradient-to-br from-blue-500 to-purple-600",
            "hover:shadow-xl hover:scale-105 transition-all"
          )}
        >
          <Users className="w-6 h-6" />
          
          {/* Unread badge */}
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold"
            >
              {unreadCount}
            </motion.div>
          )}
        </Button>
        
        {/* Online indicator */}
        <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background" />
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={cn(
            "fixed bottom-24 left-6 z-50 w-80 md:w-96 md:bottom-6",
            className
          )}
        >
          <Card className="flex flex-col h-[450px] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-white/20">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Chat da Equipe</h4>
                  <p className="text-xs text-white/70">12 online agora</p>
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
              {messages.map((message) => {
                const isMe = message.userId === "me";
                
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-2",
                      isMe && "flex-row-reverse"
                    )}
                  >
                    {/* Avatar */}
                    <div className={cn(
                      "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold",
                      message.type === "achievement"
                        ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                        : "bg-primary/20 text-primary"
                    )}>
                      {message.userAvatar}
                    </div>

                    <div className={cn("flex-1 min-w-0", isMe && "text-right")}>
                      {/* Name & Time */}
                      <div className={cn(
                        "flex items-center gap-2 mb-1",
                        isMe && "flex-row-reverse"
                      )}>
                        <span className="text-xs font-medium">{message.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>

                      {/* Content */}
                      <div
                        className={cn(
                          "inline-block px-3 py-2 rounded-2xl text-sm max-w-[85%]",
                          isMe
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : message.type === "achievement"
                              ? "bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-foreground rounded-bl-md border border-amber-200 dark:border-amber-800"
                              : "bg-muted rounded-bl-md"
                        )}
                        onMouseEnter={() => setShowReactions(message.id)}
                        onMouseLeave={() => setShowReactions(null)}
                      >
                        {message.type === "achievement" && (
                          <Star className="w-3 h-3 inline mr-1 text-amber-500" />
                        )}
                        {message.content}

                        {/* Quick reactions popup */}
                        <AnimatePresence>
                          {showReactions === message.id && !isMe && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="absolute mt-1 flex gap-1 p-1 rounded-full bg-background border shadow-lg"
                            >
                              {quickReactions.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReaction(message.id, emoji)}
                                  className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Reactions */}
                      {message.reactions.length > 0 && (
                        <div className={cn(
                          "flex gap-1 mt-1",
                          isMe && "justify-end"
                        )}>
                          {message.reactions.map((reaction, i) => (
                            <button
                              key={i}
                              onClick={() => handleReaction(message.id, reaction.emoji)}
                              className={cn(
                                "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs transition-colors",
                                reaction.reacted
                                  ? "bg-primary/20 text-primary"
                                  : "bg-muted hover:bg-muted/80"
                              )}
                            >
                              <span>{reaction.emoji}</span>
                              <span>{reaction.count}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <Smile className="w-5 h-5 text-muted-foreground" />
                </Button>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Digite uma mensagem..."
                  className={cn(
                    "flex-1 px-3 py-2 rounded-full text-sm",
                    "bg-background border border-border",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50"
                  )}
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="rounded-full flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
