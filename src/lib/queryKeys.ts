/**
 * Query Keys - Chaves centralizadas para React Query
 * Garante consistência e facilita invalidação de cache
 */

export const queryKeys = {
  // Auth & User
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },

  // Profiles
  profiles: {
    all: ['profiles'] as const,
    detail: (id: string) => [...queryKeys.profiles.all, id] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.profiles.all, 'list', filters] as const,
    current: () => [...queryKeys.profiles.all, 'current'] as const,
  },

  // Achievements
  achievements: {
    all: ['achievements'] as const,
    list: () => [...queryKeys.achievements.all, 'list'] as const,
    user: (userId: string) => [...queryKeys.achievements.all, 'user', userId] as const,
    unlocked: (userId: string) => [...queryKeys.achievements.all, 'unlocked', userId] as const,
  },

  // Quests
  quests: {
    all: ['quests'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.quests.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.quests.all, id] as const,
    user: (userId: string) => [...queryKeys.quests.all, 'user', userId] as const,
  },

  // Leaderboard
  leaderboard: {
    all: ['leaderboard'] as const,
    global: (period?: string) => [...queryKeys.leaderboard.all, 'global', period] as const,
    department: (deptId: string, period?: string) => [...queryKeys.leaderboard.all, 'department', deptId, period] as const,
  },

  // Goals
  goals: {
    all: ['goals'] as const,
    list: (userId?: string) => [...queryKeys.goals.all, 'list', userId] as const,
    detail: (id: string) => [...queryKeys.goals.all, id] as const,
    updates: (goalId: string) => [...queryKeys.goals.all, 'updates', goalId] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
    list: (limit?: number) => [...queryKeys.notifications.all, 'list', limit] as const,
  },

  // Departments
  departments: {
    all: ['departments'] as const,
    list: () => [...queryKeys.departments.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.departments.all, id] as const,
    rankings: (id: string) => [...queryKeys.departments.all, 'rankings', id] as const,
  },

  // Checkins
  checkins: {
    all: ['checkins'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.checkins.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.checkins.all, id] as const,
    upcoming: () => [...queryKeys.checkins.all, 'upcoming'] as const,
  },

  // Trails & Learning
  trails: {
    all: ['trails'] as const,
    list: () => [...queryKeys.trails.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.trails.all, id] as const,
    progress: (userId: string) => [...queryKeys.trails.all, 'progress', userId] as const,
    recommendations: (userId: string) => [...queryKeys.trails.all, 'recommendations', userId] as const,
  },

  // Feedback
  feedback: {
    all: ['feedback'] as const,
    cycles: () => [...queryKeys.feedback.all, 'cycles'] as const,
    requests: (userId?: string) => [...queryKeys.feedback.all, 'requests', userId] as const,
    responses: (requestId: string) => [...queryKeys.feedback.all, 'responses', requestId] as const,
  },

  // Surveys
  surveys: {
    all: ['surveys'] as const,
    enps: () => [...queryKeys.surveys.all, 'enps'] as const,
    pulse: () => [...queryKeys.surveys.all, 'pulse'] as const,
    active: () => [...queryKeys.surveys.all, 'active'] as const,
  },

  // Shop
  shop: {
    all: ['shop'] as const,
    items: () => [...queryKeys.shop.all, 'items'] as const,
    purchases: (userId: string) => [...queryKeys.shop.all, 'purchases', userId] as const,
    balance: (userId: string) => [...queryKeys.shop.all, 'balance', userId] as const,
  },

  // Kudos
  kudos: {
    all: ['kudos'] as const,
    received: (userId: string) => [...queryKeys.kudos.all, 'received', userId] as const,
    sent: (userId: string) => [...queryKeys.kudos.all, 'sent', userId] as const,
    ranking: (period?: string) => [...queryKeys.kudos.all, 'ranking', period] as const,
  },

  // Announcements
  announcements: {
    all: ['announcements'] as const,
    list: () => [...queryKeys.announcements.all, 'list'] as const,
    pinned: () => [...queryKeys.announcements.all, 'pinned'] as const,
    unread: () => [...queryKeys.announcements.all, 'unread'] as const,
  },

  // Social Feed
  socialFeed: {
    all: ['socialFeed'] as const,
    posts: (filters?: Record<string, unknown>) => [...queryKeys.socialFeed.all, 'posts', filters] as const,
    comments: (postId: string) => [...queryKeys.socialFeed.all, 'comments', postId] as const,
  },

  // Leagues
  leagues: {
    all: ['leagues'] as const,
    current: () => [...queryKeys.leagues.all, 'current'] as const,
    history: (userId: string) => [...queryKeys.leagues.all, 'history', userId] as const,
  },

  // Duels
  duels: {
    all: ['duels'] as const,
    active: (userId: string) => [...queryKeys.duels.all, 'active', userId] as const,
    history: (userId: string) => [...queryKeys.duels.all, 'history', userId] as const,
  },

  // Analytics
  analytics: {
    all: ['analytics'] as const,
    engagement: (period?: string) => [...queryKeys.analytics.all, 'engagement', period] as const,
    executive: () => [...queryKeys.analytics.all, 'executive'] as const,
  },
} as const;

// Type helpers
export type QueryKey = typeof queryKeys;
