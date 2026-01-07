import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, Users, Star, MessageSquare, Calendar, 
  Trophy, Target, Clock, ChevronRight, Heart
} from "lucide-react";

interface Mentor {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  expertise: string[];
  rating: number;
  mentees: number;
  availability: "available" | "busy" | "full";
}

interface MentorshipSession {
  id: string;
  mentorName: string;
  mentorAvatar: string;
  topic: string;
  date: string;
  duration: string;
  status: "scheduled" | "completed" | "cancelled";
}

const mockMentors: Mentor[] = [
  {
    id: "1",
    name: "Carlos Silva",
    avatar: "",
    role: "Tech Lead",
    department: "Engenharia",
    expertise: ["React", "Arquitetura", "Liderança"],
    rating: 4.9,
    mentees: 5,
    availability: "available"
  },
  {
    id: "2",
    name: "Ana Costa",
    avatar: "",
    role: "Product Manager",
    department: "Produto",
    expertise: ["Product Strategy", "Agile", "UX"],
    rating: 4.8,
    mentees: 8,
    availability: "busy"
  },
  {
    id: "3",
    name: "Roberto Santos",
    avatar: "",
    role: "Senior Designer",
    department: "Design",
    expertise: ["UI/UX", "Design Systems", "Figma"],
    rating: 5.0,
    mentees: 10,
    availability: "full"
  }
];

const mockSessions: MentorshipSession[] = [
  {
    id: "1",
    mentorName: "Carlos Silva",
    mentorAvatar: "",
    topic: "Code Review Best Practices",
    date: "2024-01-15 14:00",
    duration: "1h",
    status: "scheduled"
  },
  {
    id: "2",
    mentorName: "Ana Costa",
    mentorAvatar: "",
    topic: "Career Development Planning",
    date: "2024-01-10 10:00",
    duration: "45min",
    status: "completed"
  }
];

export function MentorshipSystem() {
  const [selectedTab, setSelectedTab] = useState("find");

  const availabilityConfig = {
    available: { label: "Disponível", color: "bg-green-500" },
    busy: { label: "Ocupado", color: "bg-amber-500" },
    full: { label: "Lotado", color: "bg-red-500" }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <GraduationCap className="h-5 w-5 text-primary" />
          Programa de Mentoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="find">Encontrar</TabsTrigger>
            <TabsTrigger value="sessions">Sessões</TabsTrigger>
            <TabsTrigger value="progress">Progresso</TabsTrigger>
          </TabsList>

          <TabsContent value="find" className="space-y-3">
            {mockMentors.map((mentor, index) => (
              <motion.div
                key={mentor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={mentor.avatar} />
                    <AvatarFallback>{mentor.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold truncate">{mentor.name}</h4>
                      <div className={`w-2 h-2 rounded-full ${availabilityConfig[mentor.availability].color}`} />
                    </div>
                    <p className="text-sm text-muted-foreground">{mentor.role} • {mentor.department}</p>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {mentor.expertise.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        {mentor.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {mentor.mentees} mentees
                      </span>
                    </div>
                  </div>

                  <Button 
                    size="sm" 
                    disabled={mentor.availability === "full"}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Conectar
                  </Button>
                </div>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="sessions" className="space-y-3">
            {mockSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={session.mentorAvatar} />
                    <AvatarFallback>{session.mentorName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h4 className="font-medium">{session.topic}</h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(session.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.duration}
                      </span>
                    </div>
                  </div>

                  <Badge variant={session.status === "completed" ? "default" : session.status === "scheduled" ? "secondary" : "destructive"}>
                    {session.status === "completed" ? "Concluída" : session.status === "scheduled" ? "Agendada" : "Cancelada"}
                  </Badge>
                </div>
              </motion.div>
            ))}

            <Button variant="outline" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Agendar Nova Sessão
            </Button>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            {/* Mentorship Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Trophy className="h-6 w-6 mx-auto text-amber-500 mb-1" />
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Sessões</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Target className="h-6 w-6 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">5</p>
                <p className="text-xs text-muted-foreground">Metas</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Heart className="h-6 w-6 mx-auto text-red-500 mb-1" />
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">Mentores</p>
              </div>
            </div>

            {/* Goals Progress */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Metas de Desenvolvimento
              </h4>

              {[
                { goal: "Dominar React Advanced Patterns", progress: 75 },
                { goal: "Melhorar comunicação em apresentações", progress: 50 },
                { goal: "Aprender sobre liderança técnica", progress: 30 }
              ].map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.goal}</span>
                    <span className="text-muted-foreground">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                </div>
              ))}
            </div>

            <Button className="w-full">
              <ChevronRight className="h-4 w-4 mr-2" />
              Ver Plano Completo
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
