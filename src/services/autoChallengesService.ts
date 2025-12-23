import { supabase } from "@/integrations/supabase/client";

export interface AutoChallenge {
  id: string;
  type: "feedback" | "learning" | "checkin" | "kudos" | "goal" | "streak" | "pdi";
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  xp_reward: number;
  coin_reward: number;
  expires_at: string;
  difficulty: "easy" | "medium" | "hard";
  is_active: boolean;
}

// Challenge templates that rotate weekly
const CHALLENGE_TEMPLATES: Omit<AutoChallenge, "id" | "current" | "expires_at" | "is_active">[] = [
  // Feedback challenges
  {
    type: "feedback",
    title: "Semana do Feedback",
    description: "Envie 3 feedbacks construtivos para colegas",
    icon: "💬",
    target: 3,
    xp_reward: 50,
    coin_reward: 25,
    difficulty: "easy",
  },
  {
    type: "feedback",
    title: "Mestre do Feedback",
    description: "Envie 5 feedbacks para diferentes pessoas",
    icon: "🎯",
    target: 5,
    xp_reward: 100,
    coin_reward: 50,
    difficulty: "medium",
  },
  
  // Learning challenges
  {
    type: "learning",
    title: "Aprendiz Dedicado",
    description: "Complete 2 módulos de trilhas de aprendizado",
    icon: "📚",
    target: 2,
    xp_reward: 75,
    coin_reward: 30,
    difficulty: "easy",
  },
  {
    type: "learning",
    title: "Maratona do Conhecimento",
    description: "Complete 5 módulos de trilhas",
    icon: "🧠",
    target: 5,
    xp_reward: 150,
    coin_reward: 75,
    difficulty: "hard",
  },
  
  // Check-in challenges
  {
    type: "checkin",
    title: "Presente & Pontual",
    description: "Faça check-in pontual 5 dias seguidos",
    icon: "⏰",
    target: 5,
    xp_reward: 80,
    coin_reward: 40,
    difficulty: "medium",
  },
  
  // Kudos challenges
  {
    type: "kudos",
    title: "Reconhecedor",
    description: "Dê 3 kudos para colegas",
    icon: "⭐",
    target: 3,
    xp_reward: 45,
    coin_reward: 20,
    difficulty: "easy",
  },
  {
    type: "kudos",
    title: "Embaixador da Gratidão",
    description: "Dê 7 kudos durante a semana",
    icon: "🌟",
    target: 7,
    xp_reward: 120,
    coin_reward: 60,
    difficulty: "hard",
  },
  
  // Goal challenges
  {
    type: "goal",
    title: "Foco nos Resultados",
    description: "Atualize o progresso de 2 OKRs",
    icon: "🎯",
    target: 2,
    xp_reward: 60,
    coin_reward: 30,
    difficulty: "easy",
  },
  
  // Streak challenges
  {
    type: "streak",
    title: "Fogo Ardente",
    description: "Mantenha um streak de 7 dias",
    icon: "🔥",
    target: 7,
    xp_reward: 100,
    coin_reward: 50,
    difficulty: "medium",
  },
  
  // PDI challenges
  {
    type: "pdi",
    title: "Desenvolvedor Pessoal",
    description: "Complete 1 ação do seu PDI",
    icon: "📈",
    target: 1,
    xp_reward: 70,
    coin_reward: 35,
    difficulty: "medium",
  },
];

// Service for auto-generated challenges
export const autoChallengesService = {
  // Generate weekly challenges for a user
  async generateWeeklyChallenges(userId: string): Promise<AutoChallenge[]> {
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay())); // End of week
    weekEnd.setHours(23, 59, 59, 999);

    // Select 3-4 random challenges based on user activity
    const selectedTemplates = this.selectChallengesForUser(CHALLENGE_TEMPLATES);

    return selectedTemplates.map((template, index) => ({
      ...template,
      id: `challenge-${userId}-${Date.now()}-${index}`,
      current: 0,
      expires_at: weekEnd.toISOString(),
      is_active: true,
    }));
  },

  // Select challenges based on user patterns (mix of difficulties)
  selectChallengesForUser(
    templates: typeof CHALLENGE_TEMPLATES
  ): typeof CHALLENGE_TEMPLATES {
    // Ensure variety - 1 easy, 1 medium, 1 hard (or medium if no hard available)
    const easy = templates.filter((t) => t.difficulty === "easy");
    const medium = templates.filter((t) => t.difficulty === "medium");
    const hard = templates.filter((t) => t.difficulty === "hard");

    const selected: typeof CHALLENGE_TEMPLATES = [];

    // Pick 1 easy
    if (easy.length > 0) {
      selected.push(easy[Math.floor(Math.random() * easy.length)]);
    }

    // Pick 1-2 medium
    if (medium.length > 0) {
      selected.push(medium[Math.floor(Math.random() * medium.length)]);
    }

    // Pick 1 hard
    if (hard.length > 0) {
      selected.push(hard[Math.floor(Math.random() * hard.length)]);
    }

    return selected;
  },

  // Get user's current challenges from localStorage (for demo) or DB
  async getCurrentChallenges(userId: string): Promise<AutoChallenge[]> {
    const storageKey = `auto_challenges_${userId}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      const parsed = JSON.parse(stored) as AutoChallenge[];
      const now = new Date();

      // Check if challenges are still valid
      if (parsed.length > 0 && new Date(parsed[0].expires_at) > now) {
        return parsed;
      }
    }

    // Generate new challenges
    const newChallenges = await this.generateWeeklyChallenges(userId);
    localStorage.setItem(storageKey, JSON.stringify(newChallenges));
    return newChallenges;
  },

  // Update challenge progress
  async updateChallengeProgress(
    userId: string,
    challengeType: AutoChallenge["type"],
    increment: number = 1
  ): Promise<{ challenge: AutoChallenge | null; completed: boolean }> {
    const storageKey = `auto_challenges_${userId}`;
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      return { challenge: null, completed: false };
    }

    const challenges = JSON.parse(stored) as AutoChallenge[];
    const challengeIndex = challenges.findIndex(
      (c) => c.type === challengeType && c.is_active && c.current < c.target
    );

    if (challengeIndex === -1) {
      return { challenge: null, completed: false };
    }

    const challenge = challenges[challengeIndex];
    challenge.current = Math.min(challenge.current + increment, challenge.target);

    const completed = challenge.current >= challenge.target;
    if (completed) {
      challenge.is_active = false;
    }

    localStorage.setItem(storageKey, JSON.stringify(challenges));

    return { challenge, completed };
  },

  // Get challenge progress stats
  getChallengeStats(challenges: AutoChallenge[]): {
    total: number;
    completed: number;
    inProgress: number;
    totalXpPossible: number;
    earnedXp: number;
  } {
    const completed = challenges.filter((c) => c.current >= c.target);
    const inProgress = challenges.filter(
      (c) => c.current < c.target && c.is_active
    );

    return {
      total: challenges.length,
      completed: completed.length,
      inProgress: inProgress.length,
      totalXpPossible: challenges.reduce((acc, c) => acc + c.xp_reward, 0),
      earnedXp: completed.reduce((acc, c) => acc + c.xp_reward, 0),
    };
  },

  // Reset challenges (for testing)
  resetChallenges(userId: string): void {
    localStorage.removeItem(`auto_challenges_${userId}`);
  },
};
