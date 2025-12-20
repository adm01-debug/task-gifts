import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { leaguesService } from "@/services/leaguesService";
import { supabase } from "@/integrations/supabase/client";

export function useLeagues() {
  const queryClient = useQueryClient();

  const leaguesQuery = useQuery({
    queryKey: ["leagues"],
    queryFn: () => leaguesService.getAllLeagues(),
  });

  const myLeagueQuery = useQuery({
    queryKey: ["leagues", "mine"],
    queryFn: () => leaguesService.getMyLeague(),
  });

  const leaderboardQuery = useQuery({
    queryKey: ["leagues", "leaderboard"],
    queryFn: async () => {
      const myLeague = await leaguesService.getMyLeague();
      if (!myLeague) return [];
      return leaguesService.getLeagueLeaderboard(myLeague.league_id);
    },
    enabled: !!myLeagueQuery.data,
  });

  const historyQuery = useQuery({
    queryKey: ["leagues", "history"],
    queryFn: () => leaguesService.getMyLeagueHistory(),
  });

  // Realtime subscription para league_members
  useEffect(() => {
    const channel = supabase
      .channel('league-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'league_members',
        },
        () => {
          // Invalidar queries quando houver mudanças
          queryClient.invalidateQueries({ queryKey: ["leagues", "mine"] });
          queryClient.invalidateQueries({ queryKey: ["leagues", "leaderboard"] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'league_history',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["leagues", "history"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    leagues: leaguesQuery.data ?? [],
    myLeague: myLeagueQuery.data,
    leaderboard: leaderboardQuery.data ?? [],
    history: historyQuery.data ?? [],
    isLoading: leaguesQuery.isLoading || myLeagueQuery.isLoading,
  };
}
