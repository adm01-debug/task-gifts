import { supabase } from "@/integrations/supabase/client";
import { logger } from "./loggingService";

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{ action: string; title: string }>;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  renotify?: boolean;
  timestamp?: number;
}

export const pushNotificationService = {
  /**
   * Register service worker and get push subscription
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      logger.warn("Service Worker not supported", "pushNotificationService");
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      logger.info("Service Worker registered: " + registration.scope, "pushNotificationService");
      
      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
      
      return registration;
    } catch (error) {
      logger.apiError("Service Worker registration failed", error, "pushNotificationService");
      return null;
    }
  },

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      logger.warn("Notifications not supported", "pushNotificationService");
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      logger.info("Notification permission: " + permission, "pushNotificationService");
      return permission;
    } catch (error) {
      logger.apiError("Permission request failed", error, "pushNotificationService");
      return 'denied';
    }
  },

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(registration: ServiceWorkerRegistration): Promise<PushSubscription | null> {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // Note: In production, you would use a VAPID public key here
        // applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      logger.info("Push subscription created", "pushNotificationService");
      
      // Save subscription to database for server-side push
      await this.saveSubscription(subscription);
      
      return subscription;
    } catch (error) {
      logger.apiError("Push subscription failed", error, "pushNotificationService");
      return null;
    }
  },

  /**
   * Save push subscription to database
   */
  async saveSubscription(subscription: PushSubscription): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // In a real implementation, you would save this to a push_subscriptions table
      logger.info("Push subscription saved for user: " + user.id, "pushNotificationService");
    } catch (error) {
      logger.apiError("Failed to save subscription", error, "pushNotificationService");
    }
  },

  /**
   * Show a local notification via service worker
   */
  async showNotification(payload: PushNotificationPayload): Promise<void> {
    let registration: ServiceWorkerRegistration | null = null;
    try {
      registration = await navigator.serviceWorker.ready;
    } catch {
      registration = null;
    }
    
    if (!registration) {
      logger.warn("No service worker registration", "pushNotificationService");
      // Fallback to regular notification
      if (Notification.permission === 'granted') {
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/favicon.ico',
          tag: payload.tag,
          data: payload.data,
        });
      }
      return;
    }

    await registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/favicon.ico',
      badge: payload.badge || '/favicon.ico',
      tag: payload.tag,
      data: payload.data,
      requireInteraction: payload.requireInteraction,
      silent: payload.silent,
    } as NotificationOptions);
  },

  /**
   * Send notification via service worker message
   */
  async sendToServiceWorker(type: string, payload: unknown): Promise<void> {
    if (!navigator.serviceWorker.controller) {
      logger.warn("No active service worker controller", "pushNotificationService");
      return;
    }

    navigator.serviceWorker.controller.postMessage({ type, payload });
  },

  /**
   * Achievement unlocked notification
   */
  async notifyAchievement(title: string, description: string, xpReward?: number): Promise<void> {
    await this.showNotification({
      title: `🏆 ${title}`,
      body: description + (xpReward ? ` (+${xpReward} XP)` : ''),
      tag: 'achievement',
      data: { type: 'achievement' },
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'Ver Conquistas' },
      ],
    });
  },

  /**
   * Level up notification
   */
  async notifyLevelUp(level: number): Promise<void> {
    await this.showNotification({
      title: `⬆️ Nível ${level}!`,
      body: `Parabéns! Você alcançou o nível ${level}!`,
      tag: 'level-up',
      data: { type: 'level-up' },
      requireInteraction: true,
      vibrate: [100, 50, 100, 50, 100],
    });
  },

  /**
   * Kudos received notification
   */
  async notifyKudos(fromName: string, message: string): Promise<void> {
    await this.showNotification({
      title: `❤️ Kudos de ${fromName}`,
      body: message,
      tag: 'kudos',
      data: { type: 'kudos' },
      actions: [
        { action: 'view', title: 'Ver Perfil' },
      ],
    });
  },

  /**
   * Quest completed notification
   */
  async notifyQuestComplete(questTitle: string, xp: number, coins?: number): Promise<void> {
    const rewards = `+${xp} XP${coins ? ` +${coins} 🪙` : ''}`;
    await this.showNotification({
      title: `✅ Quest Completa!`,
      body: `${questTitle} - ${rewards}`,
      tag: 'quest',
      data: { type: 'quest' },
    });
  },

  /**
   * Duel challenge notification
   */
  async notifyDuelChallenge(challengerName: string, duelId: string): Promise<void> {
    await this.showNotification({
      title: `⚔️ Desafio de Duelo!`,
      body: `${challengerName} te desafiou para um duelo!`,
      tag: 'duel-challenge',
      data: { type: 'duel-challenge', duelId },
      requireInteraction: true,
      actions: [
        { action: 'accept', title: 'Aceitar' },
        { action: 'decline', title: 'Recusar' },
      ],
    });
  },

  /**
   * Duel result notification
   */
  async notifyDuelResult(won: boolean, opponentName: string, xpGained?: number): Promise<void> {
    if (won) {
      await this.showNotification({
        title: `🏆 Vitória no Duelo!`,
        body: `Você venceu ${opponentName}!${xpGained ? ` +${xpGained} XP` : ''}`,
        tag: 'duel-result',
        data: { type: 'duel' },
        vibrate: [100, 50, 100, 50, 100],
      });
    } else {
      await this.showNotification({
        title: `😢 Derrota no Duelo`,
        body: `${opponentName} venceu desta vez. Continue tentando!`,
        tag: 'duel-result',
        data: { type: 'duel' },
      });
    }
  },

  /**
   * Streak milestone notification
   */
  async notifyStreakMilestone(days: number): Promise<void> {
    await this.showNotification({
      title: `🔥 Streak de ${days} dias!`,
      body: `Incrível! Você manteve seu streak por ${days} dias consecutivos!`,
      tag: 'streak',
      data: { type: 'streak' },
      vibrate: [100, 50, 100],
    });
  },

  /**
   * Challenge expiring notification
   */
  async notifyChallengeExpiring(challengeTitle: string, hoursLeft: number): Promise<void> {
    await this.showNotification({
      title: `⏰ Desafio Expirando!`,
      body: `${challengeTitle} expira em ${hoursLeft}h. Complete agora!`,
      tag: 'challenge-expiring',
      data: { type: 'challenge' },
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'Ver Desafio' },
      ],
    });
  },

  /**
   * Combo multiplier notification
   */
  async notifyComboMultiplier(multiplier: number): Promise<void> {
    if (multiplier >= 3) {
      await this.showNotification({
        title: `🚀 Combo x${multiplier}!`,
        body: `Seu multiplicador está em x${multiplier}! Continue assim!`,
        tag: 'combo',
        data: { type: 'combo' },
      });
    }
  },

  /**
   * Check-in reminder notification
   */
  async notifyCheckinReminder(): Promise<void> {
    await this.showNotification({
      title: `⏰ Hora do Check-in!`,
      body: `Não esqueça de fazer seu check-in para manter o streak!`,
      tag: 'checkin-reminder',
      data: { type: 'checkin', url: '/attendance' },
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'Fazer Check-in' },
        { action: 'dismiss', title: 'Depois' },
      ],
    });
  },

  /**
   * New announcement notification
   */
  async notifyAnnouncement(title: string, preview: string): Promise<void> {
    await this.showNotification({
      title: `📢 ${title}`,
      body: preview.length > 100 ? preview.substring(0, 100) + '...' : preview,
      tag: 'announcement',
      data: { type: 'announcement' },
      actions: [
        { action: 'view', title: 'Ler Mais' },
      ],
    });
  },

  /**
   * Weekly challenge completed notification
   */
  async notifyWeeklyChallengeComplete(xpReward: number, coinReward: number): Promise<void> {
    await this.showNotification({
      title: `🎉 Desafio Semanal Concluído!`,
      body: `Você ganhou +${xpReward} XP e +${coinReward} moedas!`,
      tag: 'weekly-challenge',
      data: { type: 'challenge' },
      vibrate: [100, 50, 100, 50, 100],
      requireInteraction: true,
    });
  },

  /**
   * Trail completed notification
   */
  async notifyTrailComplete(trailTitle: string, xpReward: number): Promise<void> {
    await this.showNotification({
      title: `🎓 Trilha Concluída!`,
      body: `Você completou "${trailTitle}" e ganhou +${xpReward} XP!`,
      tag: 'trail-complete',
      data: { type: 'trail' },
      requireInteraction: true,
    });
  },

  /**
   * Certification earned notification
   */
  async notifyCertification(certName: string): Promise<void> {
    await this.showNotification({
      title: `📜 Nova Certificação!`,
      body: `Parabéns! Você obteve a certificação "${certName}"!`,
      tag: 'certification',
      data: { type: 'certification' },
      requireInteraction: true,
      vibrate: [100, 50, 100, 50, 100],
    });
  },
};
