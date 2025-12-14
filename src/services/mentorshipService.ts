import { supabase } from "@/integrations/supabase/client";

export interface MentorshipPair {
  id: string;
  mentor_id: string;
  apprentice_id: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  started_at: string | null;
  completed_at: string | null;
  total_xp_earned: number;
  total_missions_completed: number;
  created_at: string;
  updated_at: string;
  mentor?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    level: number;
    xp: number;
  };
  apprentice?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    level: number;
    xp: number;
  };
}

export interface MentorshipMission {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  xp_reward: number;
  coin_reward: number;
  mission_type: 'mentor_only' | 'apprentice_only' | 'collaborative';
  difficulty: 'easy' | 'medium' | 'hard';
  order_index: number;
  is_active: boolean;
}

export interface MentorshipMissionProgress {
  id: string;
  pair_id: string;
  mission_id: string;
  completed_by_mentor: boolean;
  completed_by_apprentice: boolean;
  mentor_completed_at: string | null;
  apprentice_completed_at: string | null;
  rewards_claimed: boolean;
  mission?: MentorshipMission;
}

export interface MentorshipRequest {
  id: string;
  requester_id: string;
  target_id: string | null;
  request_type: 'find_mentor' | 'find_apprentice' | 'specific';
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  message: string | null;
  created_at: string;
  responded_at: string | null;
  requester?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    level: number;
  };
}

export const mentorshipService = {
  // Get user's active mentorship pair
  async getActivePair(userId: string): Promise<MentorshipPair | null> {
    const { data, error } = await supabase
      .from('mentorship_pairs')
      .select('*')
      .or(`mentor_id.eq.${userId},apprentice_id.eq.${userId}`)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    // Fetch profiles for mentor and apprentice
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, level, xp')
      .in('id', [data.mentor_id, data.apprentice_id]);

    const mentor = profiles?.find(p => p.id === data.mentor_id);
    const apprentice = profiles?.find(p => p.id === data.apprentice_id);

    return {
      ...data,
      status: data.status as MentorshipPair['status'],
      mentor,
      apprentice,
    };
  },

  // Get all missions
  async getMissions(): Promise<MentorshipMission[]> {
    const { data, error } = await supabase
      .from('mentorship_missions')
      .select('*')
      .eq('is_active', true)
      .order('order_index');

    if (error) throw error;
    return (data || []).map(m => ({
      ...m,
      mission_type: m.mission_type as MentorshipMission['mission_type'],
      difficulty: m.difficulty as MentorshipMission['difficulty'],
    }));
  },

  // Get mission progress for a pair
  async getMissionProgress(pairId: string): Promise<MentorshipMissionProgress[]> {
    const { data, error } = await supabase
      .from('mentorship_mission_progress')
      .select('*, mission:mentorship_missions(*)')
      .eq('pair_id', pairId);

    if (error) throw error;
    return (data || []).map(p => ({
      ...p,
      mission: p.mission ? {
        ...p.mission,
        mission_type: p.mission.mission_type as MentorshipMission['mission_type'],
        difficulty: p.mission.difficulty as MentorshipMission['difficulty'],
      } : undefined,
    }));
  },

  // Complete a mission step
  async completeMissionStep(
    pairId: string,
    missionId: string,
    isMentor: boolean
  ): Promise<void> {
    // Check if progress exists
    const { data: existing } = await supabase
      .from('mentorship_mission_progress')
      .select('*')
      .eq('pair_id', pairId)
      .eq('mission_id', missionId)
      .maybeSingle();

    const now = new Date().toISOString();
    const updateField = isMentor ? 'completed_by_mentor' : 'completed_by_apprentice';
    const timestampField = isMentor ? 'mentor_completed_at' : 'apprentice_completed_at';

    if (existing) {
      const { error } = await supabase
        .from('mentorship_mission_progress')
        .update({
          [updateField]: true,
          [timestampField]: now,
        })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('mentorship_mission_progress')
        .insert({
          pair_id: pairId,
          mission_id: missionId,
          [updateField]: true,
          [timestampField]: now,
        });

      if (error) throw error;
    }
  },

  // Claim mission rewards
  async claimMissionReward(
    progressId: string,
    userId: string,
    xpReward: number,
    coinReward: number
  ): Promise<boolean> {
    // Update progress as claimed
    const { error: progressError } = await supabase
      .from('mentorship_mission_progress')
      .update({ rewards_claimed: true })
      .eq('id', progressId);

    if (progressError) throw progressError;

    // Add XP and coins to user
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp, coins')
      .eq('id', userId)
      .maybeSingle();

    if (profile) {
      await supabase
        .from('profiles')
        .update({
          xp: profile.xp + xpReward,
          coins: profile.coins + coinReward,
        })
        .eq('id', userId);
    }

    // Update pair stats
    const { data: progress } = await supabase
      .from('mentorship_mission_progress')
      .select('pair_id')
      .eq('id', progressId)
      .maybeSingle();

    if (progress) {
      const { data: pair } = await supabase
        .from('mentorship_pairs')
        .select('total_xp_earned, total_missions_completed')
        .eq('id', progress.pair_id)
        .maybeSingle();

      if (pair) {
        await supabase
          .from('mentorship_pairs')
          .update({
            total_xp_earned: pair.total_xp_earned + xpReward,
            total_missions_completed: pair.total_missions_completed + 1,
          })
          .eq('id', progress.pair_id);
      }
    }

    return true;
  },

  // Get pending requests for user
  async getPendingRequests(userId: string): Promise<MentorshipRequest[]> {
    const { data, error } = await supabase
      .from('mentorship_requests')
      .select('*')
      .eq('target_id', userId)
      .eq('status', 'pending');

    if (error) throw error;

    // Fetch requester profiles
    const requesterIds = (data || []).map(r => r.requester_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, level')
      .in('id', requesterIds);

    return (data || []).map(r => ({
      ...r,
      request_type: r.request_type as MentorshipRequest['request_type'],
      status: r.status as MentorshipRequest['status'],
      requester: profiles?.find(p => p.id === r.requester_id),
    }));
  },

  // Create mentorship request
  async createRequest(
    requesterId: string,
    targetId: string | null,
    requestType: 'find_mentor' | 'find_apprentice' | 'specific',
    message?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('mentorship_requests')
      .insert({
        requester_id: requesterId,
        target_id: targetId,
        request_type: requestType,
        message,
      });

    if (error) throw error;
  },

  // Accept mentorship request
  async acceptRequest(requestId: string, accepterId: string): Promise<void> {
    // Get request details
    const { data: request } = await supabase
      .from('mentorship_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();

    if (!request) throw new Error('Request not found');

    // Determine mentor and apprentice based on request type
    let mentorId: string;
    let apprenticeId: string;

    if (request.request_type === 'find_mentor') {
      mentorId = accepterId;
      apprenticeId = request.requester_id;
    } else {
      mentorId = request.requester_id;
      apprenticeId = accepterId;
    }

    // Create mentorship pair
    const { error: pairError } = await supabase
      .from('mentorship_pairs')
      .insert({
        mentor_id: mentorId,
        apprentice_id: apprenticeId,
        status: 'active',
      });

    if (pairError) throw pairError;

    // Update request status
    const { error: updateError } = await supabase
      .from('mentorship_requests')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) throw updateError;
  },

  // Get potential mentors (higher level users)
  async getPotentialMentors(userId: string): Promise<any[]> {
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('level')
      .eq('id', userId)
      .maybeSingle();

    const minLevel = (userProfile?.level || 1) + 2;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, level, xp')
      .gte('level', minLevel)
      .neq('id', userId)
      .order('level', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  },
};
