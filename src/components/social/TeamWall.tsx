import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Send,
  Image as ImageIcon,
  Smile,
  Trophy,
  Star,
  Zap,
  MoreHorizontal,
  ThumbsUp,
  PartyPopper,
  Flame,
  Lightbulb
} from "lucide-react";

interface Post {
  id: string;
  author: {
    name: string;
    avatar?: string;
    title: string;
    level: number;
  };
  content: string;
  type: "text" | "achievement" | "kudos" | "milestone";
  timestamp: Date;
  reactions: {
    type: string;
    count: number;
    userReacted: boolean;
  }[];
  comments: number;
  shares: number;
  metadata?: {
    achievementName?: string;
    kudosRecipient?: string;
    milestoneType?: string;
    xpGained?: number;
  };
}

const reactionTypes = [
  { type: "like", icon: ThumbsUp, color: "text-blue-500" },
  { type: "love", icon: Heart, color: "text-red-500" },
  { type: "celebrate", icon: PartyPopper, color: "text-amber-500" },
  { type: "fire", icon: Flame, color: "text-orange-500" },
  { type: "insight", icon: Lightbulb, color: "text-yellow-500" }
];

const mockPosts: Post[] = [
  {
    id: "1",
    author: {
      name: "Maria Silva",
      avatar: "",
      title: "Product Manager",
      level: 15
    },
    content: "🎉 Acabei de completar o treinamento de Liderança Avançada! Muito grata pela oportunidade de crescimento.",
    type: "achievement",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    reactions: [
      { type: "like", count: 12, userReacted: true },
      { type: "celebrate", count: 8, userReacted: false },
      { type: "love", count: 5, userReacted: false }
    ],
    comments: 4,
    shares: 2,
    metadata: {
      achievementName: "Liderança Avançada",
      xpGained: 500
    }
  },
  {
    id: "2",
    author: {
      name: "João Santos",
      avatar: "",
      title: "Tech Lead",
      level: 22
    },
    content: "Quero reconhecer o trabalho incrível do @Pedro Oliveira na entrega do projeto! Sua dedicação fez toda a diferença. 🌟",
    type: "kudos",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    reactions: [
      { type: "love", count: 18, userReacted: false },
      { type: "fire", count: 6, userReacted: true }
    ],
    comments: 7,
    shares: 1,
    metadata: {
      kudosRecipient: "Pedro Oliveira"
    }
  },
  {
    id: "3",
    author: {
      name: "Ana Costa",
      avatar: "",
      title: "UX Designer",
      level: 18
    },
    content: "1 ano de empresa hoje! Muito feliz em fazer parte dessa equipe incrível. 💜",
    type: "milestone",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    reactions: [
      { type: "celebrate", count: 32, userReacted: true },
      { type: "love", count: 15, userReacted: false },
      { type: "like", count: 10, userReacted: false }
    ],
    comments: 12,
    shares: 3,
    metadata: {
      milestoneType: "anniversary"
    }
  }
];

export function TeamWall() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [newPost, setNewPost] = useState("");
  const [showReactions, setShowReactions] = useState<string | null>(null);

  const handleReaction = (postId: string, reactionType: string) => {
    setPosts(posts.map(post => {
      if (post.id !== postId) return post;
      
      const existingReaction = post.reactions.find(r => r.type === reactionType);
      if (existingReaction) {
        return {
          ...post,
          reactions: post.reactions.map(r => 
            r.type === reactionType 
              ? { ...r, count: r.userReacted ? r.count - 1 : r.count + 1, userReacted: !r.userReacted }
              : r
          )
        };
      } else {
        return {
          ...post,
          reactions: [...post.reactions, { type: reactionType, count: 1, userReacted: true }]
        };
      }
    }));
    setShowReactions(null);
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "agora";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "achievement": return <Trophy className="h-4 w-4 text-amber-500" />;
      case "kudos": return <Star className="h-4 w-4 text-primary" />;
      case "milestone": return <Zap className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Mural da Equipe</CardTitle>
              <p className="text-sm text-muted-foreground">
                Celebre conquistas e conecte-se
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* New Post Input */}
        <div className="p-4 rounded-lg border bg-muted/30">
          <Textarea
            placeholder="Compartilhe algo com a equipe..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="min-h-[80px] resize-none border-0 bg-transparent focus-visible:ring-0 p-0"
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            <Button size="sm" disabled={!newPost.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Publicar
            </Button>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          <AnimatePresence>
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border bg-card"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{post.author.name}</span>
                        <Badge variant="outline" className="text-xs">
                          Lv. {post.author.level}
                        </Badge>
                        {getPostTypeIcon(post.type)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{post.author.title}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(post.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* Post Content */}
                <p className="text-sm mb-3">{post.content}</p>

                {/* Achievement/Milestone Badge */}
                {post.metadata && (post.type === "achievement" || post.type === "milestone") && (
                  <div className="mb-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {post.type === "achievement" && <Trophy className="h-5 w-5 text-amber-500" />}
                        {post.type === "milestone" && <Star className="h-5 w-5 text-green-500" />}
                        <span className="font-medium text-sm">
                          {post.metadata.achievementName || "Aniversário de Empresa"}
                        </span>
                      </div>
                      {post.metadata.xpGained && (
                        <Badge variant="secondary">
                          <Zap className="h-3 w-3 mr-1" />
                          +{post.metadata.xpGained} XP
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Reactions Summary */}
                {post.reactions.length > 0 && (
                  <div className="flex items-center gap-1 mb-3 text-sm text-muted-foreground">
                    <div className="flex -space-x-1">
                      {post.reactions.slice(0, 3).map((reaction, i) => {
                        const reactionConfig = reactionTypes.find(r => r.type === reaction.type);
                        const Icon = reactionConfig?.icon || ThumbsUp;
                        return (
                          <div 
                            key={i} 
                            className={`w-5 h-5 rounded-full bg-background border flex items-center justify-center ${reactionConfig?.color}`}
                          >
                            <Icon className="h-3 w-3" />
                          </div>
                        );
                      })}
                    </div>
                    <span>
                      {post.reactions.reduce((sum, r) => sum + r.count, 0)} reações
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onMouseEnter={() => setShowReactions(post.id)}
                      onMouseLeave={() => setShowReactions(null)}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Reagir
                    </Button>

                    {/* Reaction Picker */}
                    <AnimatePresence>
                      {showReactions === post.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: 10 }}
                          className="absolute bottom-full left-0 mb-2 p-2 rounded-full bg-card border shadow-lg flex gap-1"
                          onMouseEnter={() => setShowReactions(post.id)}
                          onMouseLeave={() => setShowReactions(null)}
                        >
                          {reactionTypes.map((reaction) => {
                            const Icon = reaction.icon;
                            const userReacted = post.reactions.find(r => r.type === reaction.type)?.userReacted;
                            return (
                              <motion.button
                                key={reaction.type}
                                whileHover={{ scale: 1.3 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleReaction(post.id, reaction.type)}
                                className={`p-2 rounded-full hover:bg-muted ${userReacted ? "bg-muted" : ""}`}
                              >
                                <Icon className={`h-5 w-5 ${reaction.color}`} />
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Button variant="ghost" size="sm" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    {post.comments > 0 && post.comments}
                  </Button>

                  <Button variant="ghost" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    {post.shares > 0 && post.shares}
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
