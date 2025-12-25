import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationTemplatesService, type NotificationTemplate, type NotificationPreference } from "@/services/notificationTemplatesService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useNotificationTemplates = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const templatesQuery = useQuery({
    queryKey: ['notification-templates'],
    queryFn: () => notificationTemplatesService.getTemplates(),
  });

  const preferencesQuery = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: () => notificationTemplatesService.getUserPreferences(user!.id),
    enabled: !!user?.id,
  });

  const updatePreferenceMutation = useMutation({
    mutationFn: ({ notificationType, updates }: { notificationType: string; updates: Partial<NotificationPreference> }) =>
      notificationTemplatesService.updatePreference(user!.id, notificationType, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Preferência atualizada!');
    },
  });

  const setQuietHoursMutation = useMutation({
    mutationFn: ({ start, end }: { start: string; end: string }) =>
      notificationTemplatesService.setQuietHours(user!.id, start, end),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Horários de silêncio configurados!');
    },
  });

  const sendNotificationMutation = useMutation({
    mutationFn: notificationTemplatesService.sendNotification,
    onSuccess: () => toast.success('Notificação enviada!'),
  });

  const getPreference = (notificationType: string): NotificationPreference | undefined => {
    return preferencesQuery.data?.find(p => p.notification_type === notificationType);
  };

  return {
    templates: templatesQuery.data || [],
    preferences: preferencesQuery.data || [],
    isLoading: templatesQuery.isLoading,
    updatePreference: updatePreferenceMutation.mutate,
    setQuietHours: setQuietHoursMutation.mutate,
    sendNotification: sendNotificationMutation.mutate,
    getPreference,
    getTemplateByKey: notificationTemplatesService.getTemplateByKey,
    renderTemplate: notificationTemplatesService.renderTemplate,
  };
};
