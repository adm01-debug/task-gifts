import { memo, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, Check, Star, Zap, Brain, Target,
  Users, MessageSquare, BookOpen, Shield,
  ChevronRight, Info, Sparkles
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  level: number;
  maxLevel: number;
  unlocked: boolean;
  xpCost: number;
  prerequisites: string[];
  category: "core" | "social" | "learning" | "leadership";
  bonuses: string[];
  position: { x: number; y: number };
}

const skillTreeData: Skill[] = [
  // Core Skills (Center)
  {
    id: "focus",
    name: "Foco",
    description: "Aumenta XP ganho em sessões focadas",
    icon: Target,
    level: 3,
    maxLevel: 5,
    unlocked: true,
    xpCost: 500,
    prerequisites: [],
    category: "core",
    bonuses: ["+5% XP por nível"],
    position: { x: 50, y: 50 },
  },
  {
    id: "persistence",
    name: "Persistência",
    description: "Bônus por manter sequências",
    icon: Zap,
    level: 2,
    maxLevel: 5,
    unlocked: true,
    xpCost: 750,
    prerequisites: ["focus"],
    category: "core",
    bonuses: ["+10% bônus de streak"],
    position: { x: 50, y: 30 },
  },
  
  // Social Skills (Left)
  {
    id: "teamwork",
    name: "Trabalho em Equipe",
    description: "Melhora recompensas de desafios em grupo",
    icon: Users,
    level: 1,
    maxLevel: 5,
    unlocked: true,
    xpCost: 600,
    prerequisites: ["focus"],
    category: "social",
    bonuses: ["+15% XP em desafios de equipe"],
    position: { x: 25, y: 40 },
  },
  {
    id: "communication",
    name: "Comunicação",
    description: "Desbloqueia recompensas sociais extras",
    icon: MessageSquare,
    level: 0,
    maxLevel: 5,
    unlocked: false,
    xpCost: 800,
    prerequisites: ["teamwork"],
    category: "social",
    bonuses: ["+2 coins por kudos recebido"],
    position: { x: 15, y: 25 },
  },
  
  // Learning Skills (Right)
  {
    id: "knowledge",
    name: "Conhecimento",
    description: "Bônus em trilhas de aprendizado",
    icon: BookOpen,
    level: 2,
    maxLevel: 5,
    unlocked: true,
    xpCost: 650,
    prerequisites: ["focus"],
    category: "learning",
    bonuses: ["+20% XP em cursos"],
    position: { x: 75, y: 40 },
  },
  {
    id: "wisdom",
    name: "Sabedoria",
    description: "Reduz tempo para completar quizzes",
    icon: Brain,
    level: 0,
    maxLevel: 5,
    unlocked: false,
    xpCost: 900,
    prerequisites: ["knowledge"],
    category: "learning",
    bonuses: ["-10% tempo de quiz"],
    position: { x: 85, y: 25 },
  },
  
  // Leadership (Top)
  {
    id: "leadership",
    name: "Liderança",
    description: "Desbloqueia habilidades de mentor",
    icon: Shield,
    level: 0,
    maxLevel: 5,
    unlocked: false,
    xpCost: 1200,
    prerequisites: ["persistence", "teamwork", "knowledge"],
    category: "leadership",
    bonuses: ["+XP ao ajudar colegas", "Título especial"],
    position: { x: 50, y: 10 },
  },
];

const categoryColors = {
  core: "from-blue-500 to-cyan-500",
  social: "from-purple-500 to-pink-500",
  learning: "from-emerald-500 to-teal-500",
  leadership: "from-amber-500 to-orange-500",
};

interface SkillTreeProps {
  className?: string;
}

export const SkillTree = memo(function SkillTree({ className }: SkillTreeProps) {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [availableXP] = useState(2500);

  const connections = useMemo(() => {
    const lines: { from: Skill; to: Skill }[] = [];
    skillTreeData.forEach((skill) => {
      skill.prerequisites.forEach((prereqId) => {
        const prereq = skillTreeData.find((s) => s.id === prereqId);
        if (prereq) {
          lines.push({ from: prereq, to: skill });
        }
      });
    });
    return lines;
  }, []);

  const canUpgrade = useCallback((skill: Skill) => {
    if (!skill.unlocked) return false;
    if (skill.level >= skill.maxLevel) return false;
    if (availableXP < skill.xpCost) return false;
    return true;
  }, [availableXP]);

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Árvore de Habilidades</h3>
              <p className="text-sm text-muted-foreground">
                Desbloqueie poderes únicos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-amber-600">{availableXP.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      {/* Skill Tree Visualization */}
      <div className="relative h-80 p-4">
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connections.map(({ from, to }, index) => (
            <motion.line
              key={index}
              x1={`${from.position.x}%`}
              y1={`${from.position.y}%`}
              x2={`${to.position.x}%`}
              y2={`${to.position.y}%`}
              stroke={to.unlocked ? "hsl(var(--primary))" : "hsl(var(--muted))"}
              strokeWidth={2}
              strokeDasharray={to.unlocked ? "0" : "5,5"}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: index * 0.1 }}
            />
          ))}
        </svg>

        {/* Skill Nodes */}
        {skillTreeData.map((skill) => {
          const Icon = skill.icon;
          const isMaxed = skill.level >= skill.maxLevel;
          
          return (
            <motion.button
              key={skill.id}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2",
                "w-16 h-16 rounded-full flex items-center justify-center",
                "border-3 transition-all duration-300",
                skill.unlocked
                  ? cn(
                      "bg-gradient-to-br shadow-lg",
                      categoryColors[skill.category],
                      "border-white/30"
                    )
                  : "bg-muted border-muted-foreground/30",
                selectedSkill?.id === skill.id && "ring-4 ring-primary/50 scale-110"
              )}
              style={{
                left: `${skill.position.x}%`,
                top: `${skill.position.y}%`,
              }}
              onClick={() => setSelectedSkill(skill)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {skill.unlocked ? (
                <Icon className="w-7 h-7 text-white" />
              ) : (
                <Lock className="w-6 h-6 text-muted-foreground" />
              )}

              {/* Level indicator */}
              {skill.unlocked && (
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-6 h-6 rounded-full",
                  "flex items-center justify-center text-xs font-bold",
                  isMaxed 
                    ? "bg-amber-500 text-white" 
                    : "bg-background border-2 border-primary text-primary"
                )}>
                  {isMaxed ? <Star className="w-3 h-3" /> : skill.level}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected Skill Details */}
      <AnimatePresence mode="wait">
        {selectedSkill && (
          <motion.div
            key={selectedSkill.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 border-t border-border bg-muted/30"
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-xl bg-gradient-to-br",
                selectedSkill.unlocked 
                  ? categoryColors[selectedSkill.category]
                  : "from-muted to-muted"
              )}>
                <selectedSkill.icon className={cn(
                  "w-6 h-6",
                  selectedSkill.unlocked ? "text-white" : "text-muted-foreground"
                )} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold">{selectedSkill.name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                    {selectedSkill.level}/{selectedSkill.maxLevel}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedSkill.description}
                </p>
                
                <div className="flex flex-wrap gap-1.5">
                  {selectedSkill.bonuses.map((bonus, i) => (
                    <span 
                      key={i}
                      className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                    >
                      {bonus}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-right">
                {canUpgrade(selectedSkill) ? (
                  <Button size="sm" className="gap-1.5">
                    <Zap className="w-3 h-3" />
                    {selectedSkill.xpCost} XP
                  </Button>
                ) : selectedSkill.level >= selectedSkill.maxLevel ? (
                  <span className="text-sm text-amber-500 font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Máximo
                  </span>
                ) : !selectedSkill.unlocked ? (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Bloqueado
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    XP insuficiente
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
});

export { skillTreeData };
export type { Skill };
