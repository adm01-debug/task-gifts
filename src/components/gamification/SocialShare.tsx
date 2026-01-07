import React, { memo, useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Share2, Heart, MessageCircle, Copy, Twitter, Linkedin,
  Facebook, Download, Trophy, Star, Sparkles, Award,
  Clock, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareableAchievement {
  id: string;
  type: 'achievement' | 'level' | 'badge' | 'milestone' | 'streak';
  title: string;
  description: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  timestamp: string;
  stats?: { label: string; value: string }[];
}

interface SocialShareProps {
  achievement: ShareableAchievement;
  userName: string;
  userAvatar?: string;
}

const mockAchievement: ShareableAchievement = {
  id: '1',
  type: 'achievement',
  title: 'Mestre do Conhecimento',
  description: 'Completou todos os treinamentos obrigatórios com 100% de aprovação',
  rarity: 'legendary',
  icon: '🏆',
  timestamp: '2024-01-15T10:30:00',
  stats: [
    { label: 'Treinamentos', value: '25' },
    { label: 'Aprovação', value: '100%' },
    { label: 'Tempo Total', value: '48h' }
  ]
};

const rarityConfig = {
  common: { gradient: 'from-gray-400 to-gray-600', border: 'border-gray-500/30' },
  rare: { gradient: 'from-blue-400 to-blue-600', border: 'border-blue-500/30' },
  epic: { gradient: 'from-purple-400 to-purple-600', border: 'border-purple-500/30' },
  legendary: { gradient: 'from-yellow-400 via-orange-500 to-red-500', border: 'border-yellow-500/30' }
};

const ShareCard = memo(({ achievement, userName, userAvatar }: SocialShareProps) => {
  const rarity = achievement.rarity ? rarityConfig[achievement.rarity] : rarityConfig.common;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        p-6 rounded-2xl border-2 ${rarity.border}
        bg-gradient-to-br from-card via-card to-muted
        shadow-xl relative overflow-hidden
      `}
    >
      {/* Background Decoration */}
      {achievement.rarity === 'legendary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-orange-500/5 to-red-500/5" />
      )}
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarImage src={userAvatar} />
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-foreground">{userName}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(achievement.timestamp).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>

        {/* Achievement Display */}
        <div className="text-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className={`
              w-20 h-20 mx-auto mb-3 rounded-2xl
              bg-gradient-to-br ${rarity.gradient}
              flex items-center justify-center text-4xl
              shadow-lg
            `}
          >
            {achievement.icon}
          </motion.div>
          
          {achievement.rarity && (
            <Badge className={`mb-2 bg-gradient-to-r ${rarity.gradient} text-white`}>
              {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
            </Badge>
          )}
          
          <h3 className="text-xl font-bold text-foreground mb-1">{achievement.title}</h3>
          <p className="text-sm text-muted-foreground">{achievement.description}</p>
        </div>

        {/* Stats */}
        {achievement.stats && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {achievement.stats.map((stat, index) => (
              <div key={index} className="text-center p-2 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Branding */}
        <div className="flex items-center justify-center gap-2 pt-4 border-t border-border/50">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">Conquistado no EndomarketingPro</span>
        </div>
      </div>
    </motion.div>
  );
});

ShareCard.displayName = 'ShareCard';

export const SocialShare = memo(() => {
  const [achievement] = useState<ShareableAchievement>(mockAchievement);
  const [copied, setCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const userName = 'Ana Silva';
  const userAvatar = undefined;

  const shareUrl = 'https://app.endomarketingpro.com/share/achievement/123';
  const shareText = `🏆 Acabei de conquistar "${achievement.title}" no EndomarketingPro! ${achievement.description}`;

  const socialPlatforms = [
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'bg-[#1DA1F2]' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-[#0A66C2]' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-[#1877F2]' }
  ];

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareText, shareUrl]);

  const handleShare = useCallback((platform: string) => {
    setSelectedPlatform(platform);
    
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
    setTimeout(() => setSelectedPlatform(null), 1000);
  }, [shareText, shareUrl]);

  const stats = useMemo(() => ({
    likes: 42,
    comments: 12,
    shares: 8
  }), []);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Compartilhar Conquista
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview Card */}
        <ShareCard
          achievement={achievement}
          userName={userName}
          userAvatar={userAvatar}
        />

        {/* Engagement Stats */}
        <div className="flex items-center justify-center gap-6">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors">
            <Heart className="h-5 w-5" />
            <span className="text-sm">{stats.likes}</span>
          </button>
          <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">{stats.comments}</span>
          </button>
          <button className="flex items-center gap-2 text-muted-foreground hover:text-green-500 transition-colors">
            <Share2 className="h-5 w-5" />
            <span className="text-sm">{stats.shares}</span>
          </button>
        </div>

        {/* Share Options */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <Button
                  key={platform.id}
                  variant="outline"
                  className={`flex-1 ${selectedPlatform === platform.id ? platform.color + ' text-white border-transparent' : ''}`}
                  onClick={() => handleShare(platform.id)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {platform.name}
                </Button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Link
                </>
              )}
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Salvar Imagem
            </Button>
          </div>
        </div>

        {/* Recent Shares */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Suas Últimas Conquistas Compartilhadas</span>
          </div>
          <div className="space-y-2">
            {[
              { title: 'Streak de 7 dias', platform: 'LinkedIn', likes: 28 },
              { title: 'Nível 20', platform: 'Twitter', likes: 15 },
              { title: 'Badge Colaborador', platform: 'LinkedIn', likes: 42 }
            ].map((share, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 bg-background/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-foreground">{share.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{share.platform}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {share.likes}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

SocialShare.displayName = 'SocialShare';
