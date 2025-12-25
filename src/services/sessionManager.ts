/**
 * Session Management Service
 * Gerencia sessão do usuário, refresh de tokens e estado de autenticação
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/loggingService";
import { errorTracker } from "@/services/errorTrackingService";
import { analytics } from "@/services/analyticsService";

interface SessionState {
  isAuthenticated: boolean;
  userId: string | null;
  lastActivity: number;
  expiresAt: number | null;
}

type SessionEventType = 'login' | 'logout' | 'refresh' | 'expire' | 'activity';
type SessionEventCallback = (event: SessionEventType, state: SessionState) => void;

class SessionManager {
  private state: SessionState = {
    isAuthenticated: false,
    userId: null,
    lastActivity: Date.now(),
    expiresAt: null,
  };
  
  private listeners: Set<SessionEventCallback> = new Set();
  private activityInterval: NodeJS.Timeout | null = null;
  private refreshTimeout: NodeJS.Timeout | null = null;
  private readonly ACTIVITY_INTERVAL = 60000; // 1 minute
  private readonly REFRESH_BEFORE_EXPIRY = 300000; // 5 minutes before expiry
  private readonly INACTIVITY_TIMEOUT = 3600000; // 1 hour

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        this.handleLogin(session.user.id, session.expires_at ? session.expires_at * 1000 : null);
      } else if (event === 'SIGNED_OUT') {
        this.handleLogout();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        this.handleRefresh(session.expires_at ? session.expires_at * 1000 : null);
      }
    });

    // Check initial session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      this.handleLogin(session.user.id, session.expires_at ? session.expires_at * 1000 : null);
    }

    // Track activity
    this.startActivityTracking();
  }

  private handleLogin(userId: string, expiresAt: number | null): void {
    this.state = {
      isAuthenticated: true,
      userId,
      lastActivity: Date.now(),
      expiresAt,
    };

    // Set user in services
    errorTracker.setUser(userId);
    analytics.setUser(userId);

    // Schedule token refresh
    if (expiresAt) {
      this.scheduleRefresh(expiresAt);
    }

    this.emit('login');
    logger.info('User logged in', 'SessionManager');
  }

  private handleLogout(): void {
    this.state = {
      isAuthenticated: false,
      userId: null,
      lastActivity: Date.now(),
      expiresAt: null,
    };

    // Clear user in services
    errorTracker.setUser(undefined);
    analytics.setUser(undefined);

    // Clear refresh timeout
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }

    this.emit('logout');
    logger.info('User logged out', 'SessionManager');
  }

  private handleRefresh(expiresAt: number | null): void {
    this.state.expiresAt = expiresAt;
    this.state.lastActivity = Date.now();

    if (expiresAt) {
      this.scheduleRefresh(expiresAt);
    }

    this.emit('refresh');
    logger.debug('Session refreshed', 'SessionManager');
  }

  private scheduleRefresh(expiresAt: number): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    const refreshIn = Math.max(0, expiresAt - Date.now() - this.REFRESH_BEFORE_EXPIRY);
    
    this.refreshTimeout = setTimeout(async () => {
      try {
        await supabase.auth.refreshSession();
      } catch (error) {
        logger.error('Failed to refresh session', 'SessionManager', error);
        errorTracker.captureAuthError('Session refresh failed');
      }
    }, refreshIn);
  }

  private startActivityTracking(): void {
    // Track user activity
    const updateActivity = () => {
      if (this.state.isAuthenticated) {
        this.state.lastActivity = Date.now();
        this.emit('activity');
      }
    };

    // Listen for user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const throttledUpdate = this.throttle(updateActivity, 30000);
    
    events.forEach(event => {
      window.addEventListener(event, throttledUpdate, { passive: true });
    });

    // Check for inactivity
    this.activityInterval = setInterval(() => {
      if (this.state.isAuthenticated) {
        const inactiveTime = Date.now() - this.state.lastActivity;
        
        if (inactiveTime > this.INACTIVITY_TIMEOUT) {
          this.emit('expire');
          logger.info('Session expired due to inactivity', 'SessionManager');
        }
      }
    }, this.ACTIVITY_INTERVAL);
  }

  private throttle<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
    let lastCall = 0;
    return ((...args: unknown[]) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        fn(...args);
      }
    }) as T;
  }

  private emit(event: SessionEventType): void {
    for (const listener of this.listeners) {
      try {
        listener(event, this.state);
      } catch (error) {
        logger.error('Session event listener error', 'SessionManager', error);
      }
    }
  }

  /**
   * Subscribe to session events
   */
  subscribe(callback: SessionEventCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Get current session state
   */
  getState(): SessionState {
    return { ...this.state };
  }

  /**
   * Check if session is valid
   */
  isValid(): boolean {
    if (!this.state.isAuthenticated) return false;
    if (this.state.expiresAt && Date.now() > this.state.expiresAt) return false;
    return true;
  }

  /**
   * Force refresh session
   */
  async refresh(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.refreshSession();
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
    }
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
    this.listeners.clear();
  }
}

// Singleton
export const sessionManager = new SessionManager();

export default sessionManager;
