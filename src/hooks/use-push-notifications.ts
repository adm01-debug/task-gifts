import { useState, useEffect, useCallback } from "react";

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission | "default";
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  isLoading: boolean;
  error: string | null;
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{ action: string; title: string; icon?: string }>;
  requireInteraction?: boolean;
}

const VAPID_PUBLIC_KEY = ""; // Would need to be configured

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: "default",
    isSubscribed: false,
    subscription: null,
    isLoading: true,
    error: null
  });

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      const isSupported = 
        "Notification" in window && 
        "serviceWorker" in navigator && 
        "PushManager" in window;

      if (!isSupported) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          isLoading: false,
          error: "Push notifications not supported"
        }));
        return;
      }

      const permission = Notification.permission;

      // Check existing subscription
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        setState(prev => ({
          ...prev,
          isSupported: true,
          permission,
          isSubscribed: !!subscription,
          subscription,
          isLoading: false
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isSupported: true,
          permission,
          isLoading: false,
          error: "Failed to check subscription"
        }));
      }
    };

    checkSupport();
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service workers not supported");
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw-push.js", {
        scope: "/"
      });
      // Service worker registered successfully
      return registration;
    } catch (error) {
      console.error("SW registration failed:", error);
      throw error;
    }
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!state.isSupported) {
      throw new Error("Push notifications not supported");
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const permission = await Notification.requestPermission();
      
      setState(prev => ({
        ...prev,
        permission,
        isLoading: false
      }));

      return permission;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Permission request failed";
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, [state.isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!state.isSupported) {
      throw new Error("Push notifications not supported");
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // First ensure permission
      if (Notification.permission === "default") {
        await requestPermission();
      }

      if (Notification.permission !== "granted") {
        throw new Error("Notification permission denied");
      }

      // Register service worker
      await registerServiceWorker();
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY || undefined
      });

      // Subscription created successfully

      // Save subscription to backend
      // await saveSubscriptionToBackend(subscription);

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        subscription,
        isLoading: false
      }));

      return subscription;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Subscription failed";
      console.error("Push subscription failed:", error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, [state.isSupported, requestPermission, registerServiceWorker]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!state.subscription) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await state.subscription.unsubscribe();

      // Remove subscription from backend
      // await removeSubscriptionFromBackend(state.subscription);

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        subscription: null,
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unsubscribe failed";
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, [state.subscription]);

  // Show local notification (for testing)
  const showLocalNotification = useCallback(async (payload: NotificationPayload) => {
    if (Notification.permission !== "granted") {
      const permission = await requestPermission();
      if (permission !== "granted") {
        throw new Error("Notification permission required");
      }
    }

    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || "/favicon.ico",
      badge: payload.badge || "/favicon.ico",
      tag: payload.tag || "local-notification",
      data: payload.data,
      requireInteraction: payload.requireInteraction
    });
  }, [requestPermission]);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    showLocalNotification
  };
}

// Notification types for the app
export type GameNotificationType = 
  | "achievement_unlocked"
  | "level_up"
  | "quest_completed"
  | "daily_bonus"
  | "challenge_received"
  | "streak_reminder"
  | "team_update"
  | "rank_change";

// Pre-built notification templates
export const notificationTemplates: Record<GameNotificationType, (data?: Record<string, unknown>) => NotificationPayload> = {
  achievement_unlocked: (data) => ({
    title: "🏆 Conquista Desbloqueada!",
    body: data?.name as string || "Você desbloqueou uma nova conquista!",
    tag: "achievement",
    data: { url: "/achievements", ...data }
  }),
  level_up: (data) => ({
    title: "⬆️ Level Up!",
    body: `Parabéns! Você chegou ao nível ${data?.level || "?"}!`,
    tag: "level-up",
    data: { url: "/profile", ...data }
  }),
  quest_completed: (data) => ({
    title: "✅ Missão Completa!",
    body: data?.questName as string || "Você completou uma missão!",
    tag: "quest",
    data: { url: "/quests", ...data }
  }),
  daily_bonus: () => ({
    title: "🎁 Bônus Diário Disponível!",
    body: "Entre e colete suas recompensas de hoje!",
    tag: "daily-bonus",
    data: { url: "/" }
  }),
  challenge_received: (data) => ({
    title: "⚔️ Novo Desafio!",
    body: `${data?.challengerName || "Alguém"} te desafiou para um duelo!`,
    tag: "challenge",
    data: { url: "/duels", ...data }
  }),
  streak_reminder: (data) => ({
    title: "🔥 Mantenha seu Streak!",
    body: `Você tem ${data?.streakDays || 0} dias de streak. Não perca!`,
    tag: "streak",
    data: { url: "/" }
  }),
  team_update: (data) => ({
    title: "👥 Atualização do Time",
    body: data?.message as string || "Há novidades no seu time!",
    tag: "team",
    data: { url: "/social", ...data }
  }),
  rank_change: (data) => ({
    title: data?.improved ? "📈 Subiu no Ranking!" : "📉 Mudança no Ranking",
    body: `Você está agora na posição #${data?.newRank || "?"}`,
    tag: "rank",
    data: { url: "/leagues", ...data }
  })
};
