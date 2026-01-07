import { memo } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Heart, Reply, MoreHorizontal, Send, Smile, Image, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  author: { name: string; avatar?: string; level: number };
  content: string;
  time: string;
  likes: number;
  comments: number;
  liked: boolean;
  type: "achievement" | "milestone" | "kudos" | "general";
}

const mockPosts: Post[] = [
  { id: "1", author: { name: "Maria Santos", avatar: "/avatars/maria.jpg", level: 24 }, content: "🎉 Acabei de completar 100 tarefas! Obrigada a todos pela motivação!", time: "2h", likes: 15, comments: 4, liked: true, type: "milestone" },
  { id: "2", author: { name: "João Silva", level: 18 }, content: "Conquistei o badge 'Mestre do Streak'! 30 dias seguidos 🔥", time: "5h", likes: 23, comments: 7, liked: false, type: "achievement" },
  { id: "3", author: { name: "Ana Costa", avatar: "/avatars/ana.jpg", level: 21 }, content: "Parabéns Pedro pelo projeto entregue! Trabalho incrível 👏", time: "1d", likes: 8, comments: 2, liked: false, type: "kudos" },
];

const typeColors = { achievement: "border-l-purple-500", milestone: "border-l-green-500", kudos: "border-l-blue-500", general: "border-l-gray-500" };

export const SocialFeed = memo(function SocialFeed() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center"><MessageSquare className="h-5 w-5 text-white" /></div>
            <span>Feed Social</span>
          </div>
          <Badge variant="secondary">{mockPosts.length} posts</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New Post Input */}
        <div className="flex gap-2 p-3 rounded-xl bg-muted/50">
          <Avatar className="w-8 h-8"><AvatarFallback>EU</AvatarFallback></Avatar>
          <div className="flex-1">
            <Input placeholder="Compartilhe algo com a equipe..." className="border-0 bg-transparent h-8 text-sm" />
            <div className="flex justify-between mt-2">
              <div className="flex gap-1"><Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Smile className="h-4 w-4" /></Button><Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Image className="h-4 w-4" /></Button></div>
              <Button size="sm" className="h-7"><Send className="h-3 w-3 mr-1" />Postar</Button>
            </div>
          </div>
        </div>
        {/* Posts */}
        {mockPosts.map((post, index) => (
          <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className={cn("p-4 rounded-xl border border-l-4", typeColors[post.type])}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Avatar className="w-9 h-9"><AvatarImage src={post.author.avatar} /><AvatarFallback>{post.author.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                <div><p className="text-sm font-medium">{post.author.name}</p><div className="flex items-center gap-2 text-[10px] text-muted-foreground"><Badge variant="outline" className="h-4 px-1"><Zap className="h-2 w-2 mr-0.5" />Nv.{post.author.level}</Badge><span>{post.time}</span></div></div>
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
            </div>
            <p className="text-sm mb-3">{post.content}</p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className={cn("h-7 text-xs gap-1", post.liked && "text-red-500")}><Heart className={cn("h-3.5 w-3.5", post.liked && "fill-current")} />{post.likes}</Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"><Reply className="h-3.5 w-3.5" />{post.comments}</Button>
            </div>
          </motion.div>
        ))}
        <Button variant="outline" className="w-full">Carregar mais</Button>
      </CardContent>
    </Card>
  );
});
