import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, MessageCircle, Share2, Bookmark, 
  MoreHorizontal, Image, Send, Smile, 
  ThumbsUp, Award, Zap, Users
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  author: {
    name: string;
    avatar?: string;
    role: string;
    level: number;
  };
  content: string;
  image?: string;
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  type: "text" | "achievement" | "kudos" | "milestone";
  metadata?: Record<string, unknown>;
}

const mockPosts: Post[] = [
  {
    id: "1",
    author: { name: "Ana Costa", role: "Product Manager", level: 15 },
    content: "Acabei de completar a trilha de Liderança! 🎉 Muito orgulhosa dessa conquista.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    likes: 24,
    comments: 5,
    shares: 2,
    isLiked: true,
    isSaved: false,
    type: "achievement"
  },
  {
    id: "2",
    author: { name: "Carlos Silva", role: "Developer", level: 22 },
    content: "Quero agradecer ao time de design pela colaboração incrível no último sprint! Vocês são demais! 💪",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    likes: 18,
    comments: 3,
    shares: 0,
    isLiked: false,
    isSaved: true,
    type: "kudos"
  },
  {
    id: "3",
    author: { name: "Maria Santos", role: "HR Manager", level: 18 },
    content: "Atingimos 95% de participação na pesquisa de clima! Obrigada a todos pelo engajamento. 📊",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    likes: 45,
    comments: 12,
    shares: 8,
    isLiked: false,
    isSaved: false,
    type: "milestone"
  }
];

const typeConfig = {
  text: { color: "text-foreground", bg: "bg-muted" },
  achievement: { color: "text-yellow-500", bg: "bg-yellow-500/10", icon: Award },
  kudos: { color: "text-pink-500", bg: "bg-pink-500/10", icon: Heart },
  milestone: { color: "text-green-500", bg: "bg-green-500/10", icon: Zap }
};

const PostCard = memo(function PostCard({ 
  post, 
  onLike, 
  onSave 
}: { 
  post: Post;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const config = typeConfig[post.type];
  const TypeIcon = 'icon' in config ? config.icon : null;

  const timeAgo = () => {
    const diff = Date.now() - post.timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl border bg-card"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-primary/20">
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback>{post.author.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">{post.author.name}</h4>
              <Badge variant="outline" className="text-[10px] h-4">
                Lv.{post.author.level}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {post.author.role} • {timeAgo()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {TypeIcon && (
            <Badge variant="secondary" className={cn("text-xs", config.bg, config.color)}>
              <TypeIcon className="w-3 h-3 mr-1" />
              {post.type === "achievement" && "Conquista"}
              {post.type === "kudos" && "Kudos"}
              {post.type === "milestone" && "Marco"}
            </Badge>
          )}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm mb-3">{post.content}</p>

      {/* Image */}
      {post.image && (
        <div className="rounded-lg overflow-hidden mb-3">
          <img src={post.image} alt="" className="w-full h-48 object-cover" />
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span>{post.likes} curtidas</span>
        <span>{post.comments} comentários • {post.shares} compartilhamentos</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8", post.isLiked && "text-pink-500")}
            onClick={() => onLike(post.id)}
          >
            <Heart className={cn("w-4 h-4 mr-1", post.isLiked && "fill-current")} />
            Curtir
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Comentar
          </Button>
          <Button variant="ghost" size="sm" className="h-8">
            <Share2 className="w-4 h-4 mr-1" />
            Compartilhar
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0", post.isSaved && "text-yellow-500")}
          onClick={() => onSave(post.id)}
        >
          <Bookmark className={cn("w-4 h-4", post.isSaved && "fill-current")} />
        </Button>
      </div>

      {/* Comment Input */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-3 mt-3 border-t"
          >
            <div className="flex gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback>EU</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input 
                  placeholder="Escreva um comentário..." 
                  className="h-8 text-sm"
                />
                <Button size="sm" className="h-8 w-8 p-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export const SocialFeedAdvanced = memo(function SocialFeedAdvanced({ 
  className 
}: { 
  className?: string;
}) {
  const [posts, setPosts] = useState(mockPosts);
  const [newPostContent, setNewPostContent] = useState("");

  const handleLike = useCallback((id: string) => {
    setPosts(prev => prev.map(p => 
      p.id === id 
        ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
        : p
    ));
  }, []);

  const handleSave = useCallback((id: string) => {
    setPosts(prev => prev.map(p => 
      p.id === id ? { ...p, isSaved: !p.isSaved } : p
    ));
  }, []);

  const handlePost = useCallback(() => {
    if (!newPostContent.trim()) return;
    
    const newPost: Post = {
      id: Date.now().toString(),
      author: { name: "Você", role: "Colaborador", level: 10 },
      content: newPostContent,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isSaved: false,
      type: "text"
    };
    
    setPosts(prev => [newPost, ...prev]);
    setNewPostContent("");
  }, [newPostContent]);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <CardTitle className="text-lg">Feed Social</CardTitle>
            <p className="text-xs text-muted-foreground">Atualizações do time</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* New Post */}
        <div className="p-3 rounded-lg border bg-muted/50">
          <Textarea
            placeholder="Compartilhe algo com o time..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="min-h-[80px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
          />
          <div className="flex items-center justify-between mt-2 pt-2 border-t">
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Image className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Smile className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              size="sm" 
              onClick={handlePost}
              disabled={!newPostContent.trim()}
            >
              <Send className="w-4 h-4 mr-1" />
              Publicar
            </Button>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          <AnimatePresence>
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onSave={handleSave}
              />
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
});

export default SocialFeedAdvanced;
