import { useQuery } from "@tanstack/react-query";
import { leaguesService } from "@/services/leaguesService";

export function useLeagues() {
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

  return {
    leagues: leaguesQuery.data ?? [],
    myLeague: myLeagueQuery.data,
    leaderboard: leaderboardQuery.data ?? [],
    history: historyQuery.data ?? [],
    isLoading: leaguesQuery.isLoading || myLeagueQuery.isLoading,
  };
}
