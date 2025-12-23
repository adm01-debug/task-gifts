/**
 * @fileoverview League and ranking system type definitions
 * @module types/leagues
 * 
 * The league system provides competitive rankings with weekly resets.
 * Users compete within their league tier, with top performers being
 * promoted and bottom performers being demoted.
 */

/**
 * League - Competitive tier in the ranking system
 * Leagues are ordered by level requirements and provide XP multipliers
 */
export interface League {
  /** Unique league ID */
  id: string;
  /** League name (e.g., "Bronze", "Silver", "Gold") */
  name: string;
  /** Minimum user level required to enter this league */
  min_level: number;
  /** Maximum user level (null for top league) */
  max_level: number | null;
  /** Theme color for UI display */
  color: string;
  /** Emoji or icon identifier */
  icon: string;
  /** XP multiplier bonus for league members (e.g., 1.1 = 10% bonus) */
  xp_multiplier: number;
  /** Display order (lower = higher tier) */
  order_index: number;
  /** ISO timestamp of creation */
  created_at: string;
}

/**
 * League History - Record of league tier changes
 * Tracks promotions, demotions, and maintains for historical analysis
 */
export interface LeagueHistory {
  /** Unique history entry ID */
  id: string;
  /** User whose league changed */
  user_id: string;
  /** Previous league (null if first league placement) */
  from_league_id: string | null;
  /** New league after the change */
  to_league_id: string;
  /** Type of league change */
  change_type: "promotion" | "demotion" | "maintain";
  /** ISO timestamp when the change occurred */
  changed_at: string;
  /** ISO date of week start for the ranking period */
  week_start: string;
  /** ISO date of week end for the ranking period */
  week_end: string;
  /** User's final position in the previous week */
  final_position: number;
  /** Total XP earned during the week */
  xp_earned: number;
}

/**
 * League Weekly Ranking - User's position in current week's competition
 * Rankings are calculated in real-time and finalized at week's end
 */
export interface LeagueWeeklyRanking {
  /** Unique ranking entry ID */
  id: string;
  /** User being ranked */
  user_id: string;
  /** League the user is competing in */
  league_id: string;
  /** ISO date of week start */
  week_start: string;
  /** ISO date of week end */
  week_end: string;
  /** XP earned during this week */
  xp_earned: number;
  /** Current position in the league (1 = top) */
  position: number;
  /** Whether this is the finalized end-of-week ranking */
  is_final: boolean;
  /** ISO timestamp of creation */
  created_at: string;
  /** ISO timestamp of last position update */
  updated_at: string;
}
