import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/loggingService";

export interface NotificationTemplate {
  id: string;
  key: string;
  name: string;
  description?: string;
  category: string;
  channels: string[];
  subject_template?: string;
  body_template: string;
  body_template_html?: string;
  variables: string[];
  is_active: boolean;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  notification_type: string;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  channel_email?: boolean;
  channel_push?: boolean;
  channel_in_app?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  frequency?: string;
}

export interface NotificationPayload {
  templateKey: string;
  userId: string;
  variables: Record<string, string>;
  channels?: string[];
}

export const notificationTemplatesService = {
  async getTemplates(): Promise<NotificationTemplate[]> {
    const { data, error } = await supabase.from('notification_templates').select('*').order('category, name');
    if (error) { logger.error('Failed to fetch templates', 'Notifications', error); throw error; }
    return (data || []) as unknown as NotificationTemplate[];
  },

  async getTemplateByKey(key: string): Promise<NotificationTemplate | null> {
    const { data, error } = await supabase.from('notification_templates').select('*').eq('key', key).maybeSingle();
    if (error) { logger.error('Failed to fetch template', 'Notifications', error); return null; }
    return data as unknown as NotificationTemplate;
  },

  async getTemplatesByCategory(category: string): Promise<NotificationTemplate[]> {
    const { data, error } = await supabase.from('notification_templates').select('*').eq('category', category).eq('is_active', true);
    if (error) { logger.error('Failed to fetch templates', 'Notifications', error); throw error; }
    return (data || []) as unknown as NotificationTemplate[];
  },

  async getUserPreferences(userId: string): Promise<NotificationPreference[]> {
    const { data, error } = await supabase.from('notification_preferences').select('*').eq('user_id', userId);
    if (error) { logger.error('Failed to fetch preferences', 'Notifications', error); throw error; }
    return (data || []) as unknown as NotificationPreference[];
  },

  async updatePreference(userId: string, notificationType: string, updates: Partial<NotificationPreference>): Promise<void> {
    const { error } = await supabase.from('notification_preferences').upsert({
      user_id: userId,
      notification_type: notificationType,
      ...updates,
    }, { onConflict: 'user_id,notification_type' });
    if (error) { logger.error('Failed to update preference', 'Notifications', error); throw error; }
  },

  async setQuietHours(userId: string, start: string, end: string): Promise<void> {
    const { error } = await supabase.from('notification_preferences').update({ quiet_hours_start: start, quiet_hours_end: end }).eq('user_id', userId);
    if (error) { logger.error('Failed to set quiet hours', 'Notifications', error); throw error; }
  },

  renderTemplate(template: NotificationTemplate, variables: Record<string, string>): { subject: string; body: string } {
    let subject = template.subject_template || '';
    let body = template.body_template;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      body = body.replace(regex, value);
    }

    return { subject, body };
  },

  async sendNotification(payload: NotificationPayload): Promise<void> {
    const template = await this.getTemplateByKey(payload.templateKey);
    if (!template) {
      logger.warn(`Template not found: ${payload.templateKey}`, 'Notifications');
      return;
    }

    const preferences = await this.getUserPreferences(payload.userId);
    const pref = preferences.find(p => p.notification_type === payload.templateKey);
    
    const channels = payload.channels || template.channels;
    const { subject, body } = this.renderTemplate(template, payload.variables);

    // In-app notification
    if (channels.includes('in_app') && (!pref || pref.in_app_enabled !== false)) {
      await supabase.from('notifications').insert({
        user_id: payload.userId,
        title: subject || template.name,
        message: body,
        type: template.category,
      });
    }

    logger.info(`Notification sent: ${payload.templateKey} to ${payload.userId}`, 'Notifications');
  },
};
