import React, { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, Zap, Trophy, Medal, Crown, Shield, Flame,
  Calendar, MapPin, Mail, Phone, Edit, Settings,
  TrendingUp, Award, Target, Users, BookOpen, Heart
} from "lucide-react";

interface UserStats {
  xp: number;
  xpToNext: number;
  level: number;
  coins: number;
  streak: number;
  achievements: number;
  quests: number;
  rank: number;
}

interface UserBadge {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  rarity: string;
}

interface UserProfile {
  id: string;
  name: string;
  title: string;
  avatar: string;
  department: string;
  location: string;
  email: string;
  phone: string;
  joinDate: string;
  bio: string;
  stats: UserStats;
  badges: UserBadge[];
  skills: { name: string; level: number }[];
}

const mockProfile: UserProfile = {
  id: "1",
  name: "Carlos Silva",
  title: "Desenvolvedor Senior",
  avatar: "",
  department: "Tecnologia",
  location: "São Paulo, SP",
  email: "carlos.silva@empresa.com",
  phone: "(11) 99999-9999",
  joinDate: "2022-03-15",
  bio: "Apaixonado por tecnologia e inovação. Sempre buscando aprender algo novo e compartilhar conhecimento com a equipe.",
  stats: {
    xp: 12450,
    xpToNext: 15000,
    level: 24,
    coins: 2340,
    streak: 15,
    achievements: 28,
    quests: 156,
    rank: 5
  },
  badges: [
    { id: "1", name: "Mestre do Código", icon: Shield, color: "text-purple-500", rarity: "Épico" },
    { id: "2", name: "Colaborador Estrela", icon: Star, color: "text-amber-500", rarity: "Lendário" },
    { id: "3", name: "Mentor", icon: Users, color: "text-blue-500", rarity: "Raro" },
    { id: "4", name: "Inovador", icon: Zap, color: "text-green-500", rarity: "Épico" },
    { id: "5", name: "Maratonista", icon: Flame, color: "text-orange-500", rarity: "Raro" }
  ],
  skills: [
    { name: "Liderança", level: 85 },
    { name: "Comunicação", level: 92 },
    { name: "Técnico", level: 95 },
    { name: "Trabalho em Equipe", level: 88 },
    { name: "Resolução de Problemas", level: 90 }
  ]
};

const rankConfig = [
  { min: 1, max: 3, title: "Elite", icon: Crown, color: "text-amber-500", bg: "bg-amber-500/20" },
  { min: 4, max: 10, title: "Diamante", icon: Trophy, color: "text-blue-400", bg: "bg-blue-400/20" },
  { min: 11, max: 25, title: "Platina", icon: Medal, color: "text-purple-400", bg: "bg-purple-400/20" },
  { min: 26, max: 50, title: "Ouro", icon: Award, color: "text-yellow-500", bg: "bg-yellow-500/20" }
];

const getRankInfo = (rank: number) => {
  return rankConfig.find(r => rank >= r.min && rank <= r.max) || rankConfig[rankConfig.length - 1];
};

const UserProfileCard = memo(({ className }: { className?: string }) => {
  const [profile] = useState(mockProfile);
  const [isEditing, setIsEditing] = useState(false);
  
  const rankInfo = getRankInfo(profile.stats.rank);
  const xpProgress = (profile.stats.xp / profile.stats.xpToNext) * 100;
  
  const RankIcon = rankInfo.icon;

  return (
    <Card className={className}>
      {/* Header Banner */}
      <div className="relative h-32 bg-gradient-to-br from-primary/30 via-primary/20 to-accent/30 rounded-t-lg overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-50" />
        
        {/* Rank Badge */}
        <div className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full ${rankInfo.bg}`}>
          <RankIcon className={`h-4 w-4 ${rankInfo.color}`} />
          <span className={`text-sm font-medium ${rankInfo.color}`}>
            #{profile.stats.rank} {rankInfo.title}
          </span>
        </div>
        
        {/* Edit Button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-4 left-4 bg-background/50 hover:bg-background/80"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
      
      <CardContent className="relative pt-0 -mt-12">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {profile.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            
            {/* Level Badge */}
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold border-2 border-background">
              {profile.stats.level}
            </div>
            
            {/* Streak Flame */}
            {profile.stats.streak >= 7 && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute -top-2 -right-2"
              >
                <Flame className="h-6 w-6 text-orange-500" />
              </motion.div>
            )}
          </div>
          
          <h2 className="text-xl font-bold mt-3">{profile.name}</h2>
          <p className="text-muted-foreground">{profile.title}</p>
          
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {profile.department}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              {profile.location}
            </Badge>
          </div>
        </div>
        
        {/* XP Progress */}
        <div className="mb-4 p-3 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">Nível {profile.stats.level}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {profile.stats.xp.toLocaleString()} / {profile.stats.xpToNext.toLocaleString()} XP
            </span>
          </div>
          <Progress value={xpProgress} className="h-2" />
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center p-2 rounded-lg bg-amber-500/10">
            <Star className="h-4 w-4 mx-auto mb-1 text-amber-500" />
            <div className="text-sm font-bold">{profile.stats.coins}</div>
            <div className="text-[10px] text-muted-foreground">Moedas</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-orange-500/10">
            <Flame className="h-4 w-4 mx-auto mb-1 text-orange-500" />
            <div className="text-sm font-bold">{profile.stats.streak}</div>
            <div className="text-[10px] text-muted-foreground">Streak</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-purple-500/10">
            <Trophy className="h-4 w-4 mx-auto mb-1 text-purple-500" />
            <div className="text-sm font-bold">{profile.stats.achievements}</div>
            <div className="text-[10px] text-muted-foreground">Conquistas</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-blue-500/10">
            <Target className="h-4 w-4 mx-auto mb-1 text-blue-500" />
            <div className="text-sm font-bold">{profile.stats.quests}</div>
            <div className="text-[10px] text-muted-foreground">Missões</div>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="badges" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="badges" className="mt-4">
            <div className="grid grid-cols-5 gap-2">
              {profile.badges.map((badge) => (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="relative group"
                >
                  <div className={`p-3 rounded-xl bg-muted/50 border border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors`}>
                    <badge.icon className={`h-6 w-6 ${badge.color}`} />
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-popover text-popover-foreground text-xs rounded-lg px-2 py-1 whitespace-nowrap shadow-lg border">
                      <div className="font-medium">{badge.name}</div>
                      <div className="text-muted-foreground">{badge.rarity}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center mt-3">
              <Button variant="ghost" size="sm" className="text-xs">
                Ver todas as {profile.stats.achievements} conquistas
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="skills" className="mt-4 space-y-3">
            {profile.skills.map((skill) => (
              <div key={skill.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{skill.name}</span>
                  <span className="text-xs text-muted-foreground">{skill.level}%</span>
                </div>
                <Progress value={skill.level} className="h-2" />
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="info" className="mt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{profile.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Desde {new Date(profile.joinDate).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</span>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground italic">"{profile.bio}"</p>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" className="flex-1" size="sm">
            <Heart className="h-4 w-4 mr-2" />
            Seguir
          </Button>
          <Button className="flex-1" size="sm">
            <Users className="h-4 w-4 mr-2" />
            Conectar
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

UserProfileCard.displayName = "UserProfileCard";

export { UserProfileCard };
