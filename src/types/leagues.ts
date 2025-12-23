export interface League {
  id: string;
  name: string;
  min_level: number;
  max_level: number | null;
  color: string;
  icon: string;
  xp_multiplier: number;
  order_index: number;
  created_at: string;
}

export interface LeagueHistory {
  id: string;
  user_id: string;
  from_league_id: string | null;
  to_league_id: string;
  change_type: "promotion" | "demotion" | "maintain";
  changed_at: string;
  week_start: string;
  week_end: string;
  final_position: number;
  xp_earned: number;
}

export interface LeagueWeeklyRanking {
  id: string;
  user_id: string;
  league_id: string;
  week_start: string;
  week_end: string;
  xp_earned: number;
  position: number;
  is_final: boolean;
  created_at: string;
  updated_at: string;
}
