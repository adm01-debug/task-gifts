import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { mentorshipService } from "@/services/mentorshipService";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";

export const mentorshipKeys = {
  pair: (userId: string) => ["mentorship", "pair", userId] as const,
  missions: () => ["mentorship", "missions"] as const,
  progress: (pairId: string) => ["mentorship", "progress", pairId] as const,
  requests: (userId: string) => ["mentorship", "requests", userId] as const,
  potentialMentors: (userId: string) => ["mentorship", "potential-mentors", userId] as const,
};

export function useActiveMentorship() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: mentorshipKeys.pair(user?.id || ""),
    queryFn: () => mentorshipService.getActivePair(user!.id),
    enabled: !!user?.id,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('mentorship-pairs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mentorship_pairs',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: mentorshipKeys.pair(user.id) });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return query;
}

export function useMentorshipMissions() {
  return useQuery({
    queryKey: mentorshipKeys.missions(),
    queryFn: () => mentorshipService.getMissions(),
  });
}

export function useMentorshipProgress(pairId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: mentorshipKeys.progress(pairId || ""),
    queryFn: () => mentorshipService.getMissionProgress(pairId!),
    enabled: !!pairId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!pairId) return;

    const channel = supabase
      .channel('mentorship-progress-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mentorship_mission_progress',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: mentorshipKeys.progress(pairId) });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pairId, queryClient]);

  return query;
}

export function useCompleteMissionStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pairId,
      missionId,
      isMentor,
    }: {
      pairId: string;
      missionId: string;
      isMentor: boolean;
    }) => mentorshipService.completeMissionStep(pairId, missionId, isMentor),
    onSuccess: (_, { pairId }) => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.progress(pairId) });
      toast.success("Etapa concluída!");
    },
    onError: () => {
      toast.error("Erro ao completar etapa");
    },
  });
}

export function useClaimMissionReward() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      progressId,
      xpReward,
      coinReward,
    }: {
      progressId: string;
      xpReward: number;
      coinReward: number;
      pairId: string;
    }) =>
      mentorshipService.claimMissionReward(
        progressId,
        user!.id,
        xpReward,
        coinReward
      ),
    onSuccess: (_, { pairId, xpReward, coinReward }) => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.progress(pairId) });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(`Recompensa resgatada! +${xpReward} XP, +${coinReward} moedas`);
    },
    onError: () => {
      toast.error("Erro ao resgatar recompensa");
    },
  });
}

export function usePendingRequests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: mentorshipKeys.requests(user?.id || ""),
    queryFn: () => mentorshipService.getPendingRequests(user!.id),
    enabled: !!user?.id,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('mentorship-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mentorship_requests',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: mentorshipKeys.requests(user.id) });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return query;
}

export function useCreateMentorshipRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      targetId,
      requestType,
      message,
    }: {
      targetId: string | null;
      requestType: 'find_mentor' | 'find_apprentice' | 'specific';
      message?: string;
    }) =>
      mentorshipService.createRequest(user!.id, targetId, requestType, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.requests(user!.id) });
      toast.success("Solicitação de mentoria enviada!");
    },
    onError: () => {
      toast.error("Erro ao enviar solicitação");
    },
  });
}

export function useAcceptMentorshipRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) =>
      mentorshipService.acceptRequest(requestId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.requests(user!.id) });
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.pair(user!.id) });
      toast.success("Mentoria aceita! Boa jornada juntos!");
    },
    onError: () => {
      toast.error("Erro ao aceitar mentoria");
    },
  });
}

export function usePotentialMentors() {
  const { user } = useAuth();

  return useQuery({
    queryKey: mentorshipKeys.potentialMentors(user?.id || ""),
    queryFn: () => mentorshipService.getPotentialMentors(user!.id),
    enabled: !!user?.id,
  });
}
