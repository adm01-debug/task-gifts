import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Target, User, Zap, Clock, Award, Command, Filter, X, ChevronDown, History } from "lucide-react";
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
import { useDebounce } from "@/hooks/useDebounce";
import { useFuseSearch, getHighlightSegments, SEARCH_PRESETS } from "@/hooks/useFuseSearch";
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  trigger?: React.ReactNode;
}

type CategoryFilter = "all" | "trails" | "quests" | "users";
type DifficultyFilter = "all" | "easy" | "medium" | "hard" | "expert";

interface RecentSearch {
  id: string;
  type: "trail" | "quest" | "user" | "action";
  label: string;
  icon: string;
  timestamp: number;
}

const RECENT_SEARCHES_KEY = "global-search-history";
const MAX_RECENT_SEARCHES = 5;

function getRecentSearches(): RecentSearch[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(search: Omit<RecentSearch, "timestamp">) {
  const searches = getRecentSearches();
  const filtered = searches.filter(s => !(s.id === search.id && s.type === search.type));
  const updated = [{ ...search, timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENT_SEARCHES);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  return updated;
}

function removeRecentSearch(id: string, type: string): RecentSearch[] {
  const searches = getRecentSearches();
  const updated = searches.filter(s => !(s.id === id && s.type === type));
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  return updated;
}

function clearRecentSearches(): RecentSearch[] {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
  return [];
}

// Highlight matching text in search results using Fuse.js indices
function HighlightText({ 
  text, 
  indices 
}: { 
  text: string; 
  indices?: [number, number][];
}) {
  const segments = getHighlightSegments(text, indices);
  
  return (
    <>
      {segments.map((segment, i) => 
        segment.isMatch ? (
          <mark key={i} className="bg-primary/30 text-foreground rounded px-0.5">
            {segment.text}
          </mark>
        ) : (
          <span key={i}>{segment.text}</span>
        )
      )}
    </>
  );
}

export function GlobalSearch({ trigger }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  
  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  const navigate = useNavigate();
  const { data: trails } = usePublishedTrails();
  const { data: quests } = useQuests();
  const { data: profiles } = useProfiles();
  const { data: departments } = useDepartments();

  const hasActiveFilters = categoryFilter !== "all" || difficultyFilter !== "all" || selectedDepartments.length > 0;

  const clearFilters = useCallback(() => {
    setCategoryFilter("all");
    setDifficultyFilter("all");
    setSelectedDepartments([]);
  }, []);

  // Load recent searches on mount and when dialog opens
  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
    }
  }, [open]);

  // Reset filters and search when dialog closes
  useEffect(() => {
    if (!open) {
      setShowFilters(false);
      setSearchQuery("");
    }
  }, [open]);

  // Keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K to open search
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      
      // Only handle filter shortcuts when dialog is open
      if (!open) return;
      
      // F to toggle filters panel
      if (e.key === "f" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // Only if not typing in input
        if (document.activeElement?.tagName !== "INPUT") {
          e.preventDefault();
          setShowFilters(prev => !prev);
        }
      }
      
      // Number keys 1-4 for category filter (when filters visible)
      if (showFilters && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const categoryMap: Record<string, CategoryFilter> = {
          "1": "all",
          "2": "trails", 
          "3": "quests",
          "4": "users",
        };
        if (categoryMap[e.key]) {
          e.preventDefault();
          setCategoryFilter(categoryMap[e.key]);
        }
        
        // Shift + 1-5 for difficulty filter
        if (e.shiftKey) {
          const difficultyMap: Record<string, DifficultyFilter> = {
            "!": "all", // Shift+1
            "@": "easy", // Shift+2
            "#": "medium", // Shift+3
            "$": "hard", // Shift+4
            "%": "expert", // Shift+5
          };
          if (difficultyMap[e.key]) {
            e.preventDefault();
            setDifficultyFilter(difficultyMap[e.key]);
          }
        }
      }
      
      // Escape to clear filters (if filters active) or close
      if (e.key === "Escape" && hasActiveFilters) {
        e.preventDefault();
        e.stopPropagation();
        clearFilters();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, showFilters, hasActiveFilters]);

  const handleSelect = useCallback((type: string, id: string, label: string, icon: string) => {
    // Save to recent searches
    setRecentSearches(saveRecentSearch({ id, type: type as RecentSearch["type"], label, icon }));
    
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
      case "action":
        // Actions handle their own navigation
        break;
      default:
        break;
    }
  }, [navigate]);

  const handleRecentSelect = useCallback((recent: RecentSearch) => {
    // Update timestamp
    setRecentSearches(saveRecentSearch({ id: recent.id, type: recent.type, label: recent.label, icon: recent.icon }));
    
    setOpen(false);
    switch (recent.type) {
      case "trail":
        navigate(`/trails/${recent.id}`);
        break;
      case "quest":
        navigate("/manager");
        break;
      case "user":
        navigate(`/profile`);
        break;
      case "action":
        // Map action IDs to routes
        const actionRoutes: Record<string, string> = {
          dashboard: "/",
          trails: "/trails",
          quiz: "/quiz",
          shop: "/shop",
          achievements: "/achievements",
          profile: "/profile",
        };
        if (actionRoutes[recent.id]) {
          navigate(actionRoutes[recent.id]);
        }
        break;
    }
  }, [navigate]);

  const handleRemoveRecent = useCallback((e: React.MouseEvent, id: string, type: string) => {
    e.stopPropagation();
    setRecentSearches(removeRecentSearch(id, type));
  }, []);

  const handleClearAllRecent = useCallback(() => {
    setRecentSearches(clearRecentSearches());
  }, []);

  const toggleDepartment = (deptId: string) => {
    setSelectedDepartments(prev => 
      prev.includes(deptId) 
        ? prev.filter(id => id !== deptId)
        : [...prev, deptId]
    );
  };


  // Pre-filter data by department/difficulty before fuzzy search
  const preFilteredTrails = useMemo(() => {
    if (!trails) return [];
    let result = trails;
    
    if (selectedDepartments.length > 0) {
      result = result.filter(t => t.department_id && selectedDepartments.includes(t.department_id));
    }
    
    return result;
  }, [trails, selectedDepartments]);

  const preFilteredQuests = useMemo(() => {
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

  // Fuzzy search with Fuse.js
  const trailSearchResults = useFuseSearch(
    preFilteredTrails,
    ['title', 'description'],
    debouncedSearchQuery,
    { ...SEARCH_PRESETS.content, limit: 8 }
  );

  const questSearchResults = useFuseSearch(
    preFilteredQuests,
    ['title', 'description'],
    debouncedSearchQuery,
    { ...SEARCH_PRESETS.content, limit: 8 }
  );

  const userSearchResults = useFuseSearch(
    profiles || [],
    ['display_name', 'email'],
    debouncedSearchQuery,
    { ...SEARCH_PRESETS.loose, limit: 8 }
  );

  const quickActions = [
    { id: "dashboard", label: "Dashboard", icon: "🏠", route: "/" },
    { id: "trails", label: "Trilhas de Aprendizado", icon: "📚", route: "/trails" },
    { id: "quiz", label: "Quiz Diário", icon: "🎯", route: "/quiz" },
    { id: "shop", label: "Loja de Recompensas", icon: "🛍️", route: "/shop" },
    { id: "achievements", label: "Conquistas", icon: "🏆", route: "/achievements" },
    { id: "profile", label: "Perfil", icon: "👤", route: "/profile" },
  ];

  const handleQuickAction = (action: typeof quickActions[0]) => {
    setRecentSearches(saveRecentSearch({ id: action.id, type: "action", label: action.label, icon: action.icon }));
    setOpen(false);
    navigate(action.route);
  };

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

  const getTypeIcon = (type: RecentSearch["type"]) => {
    switch (type) {
      case "trail": return <BookOpen className="w-3 h-3" />;
      case "quest": return <Target className="w-3 h-3" />;
      case "user": return <User className="w-3 h-3" />;
      case "action": return <Zap className="w-3 h-3" />;
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
          <CommandInput 
            placeholder="Buscar trilhas, quests, usuários..." 
            className="flex-1" 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
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
            <kbd className="hidden sm:inline-flex h-4 select-none items-center rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground ml-1">
              F
            </kbd>
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
                    {(["all", "trails", "quests", "users"] as CategoryFilter[]).map((cat, index) => (
                      <DropdownMenuCheckboxItem
                        key={cat}
                        checked={categoryFilter === cat}
                        onCheckedChange={() => setCategoryFilter(cat)}
                        className="flex items-center justify-between"
                      >
                        <span>{getCategoryLabel(cat)}</span>
                        <kbd className="ml-2 h-4 select-none items-center rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground">
                          {index + 1}
                        </kbd>
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

          {/* Recent Searches */}
          {recentSearches.length > 0 && categoryFilter === "all" && (
            <>
              <CommandGroup heading={
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <History className="w-3 h-3" />
                    Buscas Recentes
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllRecent}
                    className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Limpar tudo
                  </Button>
                </div>
              }>
                {recentSearches.map((recent) => (
                  <CommandItem
                    key={`${recent.type}-${recent.id}`}
                    onSelect={() => handleRecentSelect(recent)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                      <span className="text-sm">{recent.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{recent.label}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {getTypeIcon(recent.type)}
                        <span className="capitalize">{recent.type === "action" ? "Ação rápida" : recent.type}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleRemoveRecent(e, recent.id, recent.type)}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Quick Actions - only show when no category filter or 'all' */}
          {categoryFilter === "all" && (
            <>
              <CommandGroup heading="Ações Rápidas">
                {quickActions.map((action) => (
                  <CommandItem
                    key={action.label}
                    onSelect={() => handleQuickAction(action)}
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
          {(categoryFilter === "all" || categoryFilter === "trails") && trailSearchResults.length > 0 && (
            <>
              <CommandGroup heading="Trilhas de Aprendizado">
                {trailSearchResults.map((result) => {
                  const trail = result.item;
                  const titleMatch = result.matches?.find(m => m.key === 'title');
                  return (
                    <CommandItem
                      key={trail.id}
                      onSelect={() => handleSelect("trail", trail.id, trail.title, trail.icon || "📚")}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-sm">{trail.icon || "📚"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          <HighlightText text={trail.title} indices={titleMatch?.indices} />
                        </p>
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
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Quests */}
          {(categoryFilter === "all" || categoryFilter === "quests") && questSearchResults.length > 0 && (
            <>
              <CommandGroup heading="Quests">
                {questSearchResults.map((result) => {
                  const quest = result.item;
                  const titleMatch = result.matches?.find(m => m.key === 'title');
                  return (
                    <CommandItem
                      key={quest.id}
                      onSelect={() => handleSelect("quest", quest.id, quest.title, quest.icon || "🎯")}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <span className="text-sm">{quest.icon || "🎯"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          <HighlightText text={quest.title} indices={titleMatch?.indices} />
                        </p>
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
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Users */}
          {(categoryFilter === "all" || categoryFilter === "users") && userSearchResults.length > 0 && (
            <CommandGroup heading="Usuários">
              {userSearchResults.map((result) => {
                const profile = result.item;
                const nameMatch = result.matches?.find(m => m.key === 'display_name' || m.key === 'email');
                return (
                  <CommandItem
                    key={profile.id}
                    onSelect={() => handleSelect("user", profile.id, profile.display_name || profile.email || "Usuário", "👤")}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {(profile.display_name || profile.email || "U")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        <HighlightText 
                          text={profile.display_name || profile.email || "Usuário"} 
                          indices={nameMatch?.indices} 
                        />
                      </p>
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
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
