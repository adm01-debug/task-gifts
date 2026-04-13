import { motion } from "framer-motion";
import { BookOpen, Play, CheckCircle2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TrailStatsCardsProps {
  totalTrails: number;
  inProgressCount: number;
  completedCount: number;
  totalXpEarned: number;
}

export function TrailStatsCards({ totalTrails, inProgressCount, completedCount, totalXpEarned }: TrailStatsCardsProps) {
  const stats = [
    { label: "Trilhas Disponíveis", value: totalTrails, icon: BookOpen, gradient: "from-primary/10 to-primary/5", border: "border-primary/20", iconBg: "bg-primary/20", iconColor: "text-primary" },
    { label: "Em Andamento", value: inProgressCount, icon: Play, gradient: "from-amber-500/10 to-amber-500/5", border: "border-amber-500/20", iconBg: "bg-amber-500/20", iconColor: "text-amber-500" },
    { label: "Concluídas", value: completedCount, icon: CheckCircle2, gradient: "from-emerald-500/10 to-emerald-500/5", border: "border-emerald-500/20", iconBg: "bg-emerald-500/20", iconColor: "text-emerald-500" },
    { label: "XP Ganho", value: totalXpEarned, icon: Sparkles, gradient: "from-purple-500/10 to-purple-500/5", border: "border-purple-500/20", iconBg: "bg-purple-500/20", iconColor: "text-purple-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
    >
      {stats.map((stat) => (
        <Card key={stat.label} className={`bg-gradient-to-br ${stat.gradient} ${stat.border}`}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.iconBg}`}>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
