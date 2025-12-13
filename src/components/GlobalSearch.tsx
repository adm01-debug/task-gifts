import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Target, User, Zap, Clock, Award, Command, Filter, X, ChevronDown } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePublishedTrails } from "@/hooks/useTrails";
import { useQuests } from "@/hooks/useQuests";
import { useProfiles } from "@/hooks/useProfiles";
import { useDepartments } from "@/hooks/useDepartments";
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  trigger?: React.ReactNode;
}

type CategoryFilter = "all" | "trails" | "quests" | "users";
type DifficultyFilter = "all" | "easy" | "medium" | "hard" | "expert";

export function GlobalSearch({ trigger }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  
  const navigate = useNavigate();
  const { data: trails } = usePublishedTrails();
  const { data: quests } = useQuests();
  const { data: profiles } = useProfiles();
  const { data: departments } = useDepartments();

  // Reset filters when dialog closes
  useEffect(() => {
    if (!open) {
      setShowFilters(false);
    }
  }, [open]);

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
        navigate("/manager");
        break;
      case "user":
        navigate(`/profile`);
        break;
      default:
        break;
    }
  }, [navigate]);

  const toggleDepartment = (deptId: string) => {
    setSelectedDepartments(prev => 
      prev.includes(deptId) 
        ? prev.filter(id => id !== deptId)
        : [...prev, deptId]
    );
  };

  const clearFilters = () => {
    setCategoryFilter("all");
    setDifficultyFilter("all");
    setSelectedDepartments([]);
  };

  const hasActiveFilters = categoryFilter !== "all" || difficultyFilter !== "all" || selectedDepartments.length > 0;

  // Filtered data
  const filteredTrails = useMemo(() => {
    if (!trails) return [];
    let result = trails;
    
    if (selectedDepartments.length > 0) {
      result = result.filter(t => t.department_id && selectedDepartments.includes(t.department_id));
    }
    
    return result;
  }, [trails, selectedDepartments]);

  const filteredQuests = useMemo(() => {
    if (!quests) return [];
    let result = quests;
    
    if (difficultyFilter !== "all") {
      result = result.filter(q => q.difficulty === difficultyFilter);
    }
    
    if (selectedDepartments.length > 0) {
      result = result.filter(q => q.department_id && selectedDepartments.includes(q.department_id));
    }
    
    return result;
  }, [quests, difficultyFilter, selectedDepartments]);

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

  const getDifficultyLabel = (diff: DifficultyFilter) => {
    switch (diff) {
      case "all": return "Todas";
      case "easy": return "Fácil";
      case "medium": return "Médio";
      case "hard": return "Difícil";
      case "expert": return "Expert";
    }
  };

  const getCategoryLabel = (cat: CategoryFilter) => {
    switch (cat) {
      case "all": return "Todos";
      case "trails": return "Trilhas";
      case "quests": return "Quests";
      case "users": return "Usuários";
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
        <div className="flex items-center border-b border-border">
          <CommandInput placeholder="Buscar trilhas, quests, usuários..." className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "mr-2 gap-1.5 h-8",
              hasActiveFilters && "text-primary"
            )}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Filtros</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                {(categoryFilter !== "all" ? 1 : 0) + (difficultyFilter !== "all" ? 1 : 0) + (selectedDepartments.length > 0 ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-b border-border"
            >
              <div className="p-3 flex flex-wrap gap-2 items-center bg-muted/30">
                {/* Category Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
                      <Target className="w-3 h-3" />
                      {getCategoryLabel(categoryFilter)}
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel className="text-xs">Categoria</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(["all", "trails", "quests", "users"] as CategoryFilter[]).map((cat) => (
                      <DropdownMenuCheckboxItem
                        key={cat}
                        checked={categoryFilter === cat}
                        onCheckedChange={() => setCategoryFilter(cat)}
                      >
                        {getCategoryLabel(cat)}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Difficulty Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
                      <Zap className="w-3 h-3" />
                      {getDifficultyLabel(difficultyFilter)}
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel className="text-xs">Dificuldade</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(["all", "easy", "medium", "hard", "expert"] as DifficultyFilter[]).map((diff) => (
                      <DropdownMenuCheckboxItem
                        key={diff}
                        checked={difficultyFilter === diff}
                        onCheckedChange={() => setDifficultyFilter(diff)}
                        className={diff !== "all" ? getDifficultyColor(diff) : ""}
                      >
                        {getDifficultyLabel(diff)}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Department Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
                      <BookOpen className="w-3 h-3" />
                      {selectedDepartments.length === 0 
                        ? "Departamento" 
                        : `${selectedDepartments.length} selecionado${selectedDepartments.length > 1 ? 's' : ''}`
                      }
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="max-h-[200px] overflow-y-auto">
                    <DropdownMenuLabel className="text-xs">Departamento</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {departments?.map((dept) => (
                      <DropdownMenuCheckboxItem
                        key={dept.id}
                        checked={selectedDepartments.includes(dept.id)}
                        onCheckedChange={() => toggleDepartment(dept.id)}
                      >
                        <span className="flex items-center gap-2">
                          <span 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: dept.color || '#6366f1' }}
                          />
                          {dept.name}
                        </span>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                    Limpar
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <CommandList>
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 py-4">
              <Search className="w-8 h-8 text-muted-foreground/50" />
              <p className="text-muted-foreground">Nenhum resultado encontrado.</p>
              {hasActiveFilters && (
                <Button variant="link" size="sm" onClick={clearFilters} className="text-xs">
                  Limpar filtros
                </Button>
              )}
            </div>
          </CommandEmpty>

          {/* Quick Actions - only show when no category filter or 'all' */}
          {categoryFilter === "all" && (
            <>
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
            </>
          )}

          {/* Trails */}
          {(categoryFilter === "all" || categoryFilter === "trails") && filteredTrails.length > 0 && (
            <>
              <CommandGroup heading="Trilhas de Aprendizado">
                {filteredTrails.slice(0, 8).map((trail) => (
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
              <CommandSeparator />
            </>
          )}

          {/* Quests */}
          {(categoryFilter === "all" || categoryFilter === "quests") && filteredQuests.length > 0 && (
            <>
              <CommandGroup heading="Quests">
                {filteredQuests.slice(0, 8).map((quest) => (
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
              <CommandSeparator />
            </>
          )}

          {/* Users */}
          {(categoryFilter === "all" || categoryFilter === "users") && profiles && profiles.length > 0 && (
            <CommandGroup heading="Usuários">
              {profiles.slice(0, 8).map((profile) => (
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
