import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, BookOpen, Target, User, Zap, Clock, Award, Command } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { usePublishedTrails } from "@/hooks/useTrails";
import { useQuests } from "@/hooks/useQuests";
import { useProfiles } from "@/hooks/useProfiles";
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  trigger?: React.ReactNode;
}

export function GlobalSearch({ trigger }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: trails } = usePublishedTrails();
  const { data: quests } = useQuests();
  const { data: profiles } = useProfiles();

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback((type: string, id: string) => {
    setOpen(false);
    switch (type) {
      case "trail":
        navigate(`/trails/${id}`);
        break;
      case "quest":
        navigate("/manager"); // Quests are managed here
        break;
      case "user":
        navigate(`/profile`); // For now, navigate to profile
        break;
      default:
        break;
    }
  }, [navigate]);

  const quickActions = [
    { label: "Dashboard", icon: "🏠", action: () => { setOpen(false); navigate("/"); } },
    { label: "Trilhas de Aprendizado", icon: "📚", action: () => { setOpen(false); navigate("/trails"); } },
    { label: "Quiz Diário", icon: "🎯", action: () => { setOpen(false); navigate("/quiz"); } },
    { label: "Loja de Recompensas", icon: "🛍️", action: () => { setOpen(false); navigate("/shop"); } },
    { label: "Conquistas", icon: "🏆", action: () => { setOpen(false); navigate("/achievements"); } },
    { label: "Perfil", icon: "👤", action: () => { setOpen(false); navigate("/profile"); } },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-500/20 text-green-600";
      case "medium": return "bg-yellow-500/20 text-yellow-600";
      case "hard": return "bg-orange-500/20 text-orange-600";
      case "expert": return "bg-red-500/20 text-red-600";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors min-w-[200px]"
        >
          <Search className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground flex-1 text-left">Buscar...</span>
          <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <Command className="w-3 h-3" />K
          </kbd>
        </motion.button>
      )}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar trilhas, quests, usuários..." />
        <CommandList>
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 py-4">
              <Search className="w-8 h-8 text-muted-foreground/50" />
              <p className="text-muted-foreground">Nenhum resultado encontrado.</p>
            </div>
          </CommandEmpty>

          {/* Quick Actions */}
          <CommandGroup heading="Ações Rápidas">
            {quickActions.map((action) => (
              <CommandItem
                key={action.label}
                onSelect={action.action}
                className="flex items-center gap-3 cursor-pointer"
              >
                <span className="text-lg">{action.icon}</span>
                <span>{action.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Trails */}
          {trails && trails.length > 0 && (
            <CommandGroup heading="Trilhas de Aprendizado">
              {trails.slice(0, 5).map((trail) => (
                <CommandItem
                  key={trail.id}
                  onSelect={() => handleSelect("trail", trail.id)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-sm">{trail.icon || "📚"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{trail.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {trail.estimated_hours && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {trail.estimated_hours}h
                        </span>
                      )}
                      {trail.xp_reward && (
                        <span className="flex items-center gap-1 text-primary">
                          <Zap className="w-3 h-3" />
                          {trail.xp_reward} XP
                        </span>
                      )}
                    </div>
                  </div>
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />

          {/* Quests */}
          {quests && quests.length > 0 && (
            <CommandGroup heading="Quests">
              {quests.slice(0, 5).map((quest) => (
                <CommandItem
                  key={quest.id}
                  onSelect={() => handleSelect("quest", quest.id)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <span className="text-sm">{quest.icon || "🎯"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{quest.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", getDifficultyColor(quest.difficulty))}>
                        {quest.difficulty}
                      </Badge>
                      <span className="flex items-center gap-1 text-primary">
                        <Zap className="w-3 h-3" />
                        {quest.xp_reward} XP
                      </span>
                    </div>
                  </div>
                  <Target className="w-4 h-4 text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />

          {/* Users */}
          {profiles && profiles.length > 0 && (
            <CommandGroup heading="Usuários">
              {profiles.slice(0, 5).map((profile) => (
                <CommandItem
                  key={profile.id}
                  onSelect={() => handleSelect("user", profile.id)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {(profile.display_name || profile.email || "U")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{profile.display_name || profile.email}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Nível {profile.level}
                      </span>
                      <span className="flex items-center gap-1 text-primary">
                        <Zap className="w-3 h-3" />
                        {profile.xp} XP
                      </span>
                    </div>
                  </div>
                  <User className="w-4 h-4 text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
