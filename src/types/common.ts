/**
 * @fileoverview Common reusable types for the Gamification Platform
 * @module types/common
 */

/**
 * Standard paginated response wrapper for API endpoints
 * @template T - The type of items in the data array
 */
export interface PaginatedResponse<T> {
  /** Array of items for the current page */
  data: T[];
  /** Total number of items across all pages */
  total: number;
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Whether there are more pages available */
  hasMore: boolean;
}

/**
 * Standard API error response structure
 */
export interface ApiError {
  /** Human-readable error message */
  message: string;
  /** Machine-readable error code for programmatic handling */
  code?: string;
  /** Additional error details for debugging */
  details?: Record<string, unknown>;
}

/**
 * Base entity with common fields for all database entities
 */
export interface BaseEntity {
  /** Unique identifier (UUID) */
  id: string;
  /** ISO timestamp of when the entity was created */
  created_at: string;
  /** ISO timestamp of last update (if applicable) */
  updated_at?: string;
}

/**
 * User profile information including gamification stats
 */
export interface UserProfile {
  /** Unique profile ID */
  id: string;
  /** Reference to auth.users table */
  user_id: string;
  /** User's display name shown in UI */
  display_name: string | null;
  /** URL to user's avatar image */
  avatar_url: string | null;
  /** Department the user belongs to */
  department_id: string | null;
  /** User's job position */
  position_id: string | null;
  /** Current gamification level (1-100+) */
  level: number;
  /** Total experience points earned */
  xp_total: number;
  /** Virtual currency balance */
  coins: number;
  /** Current daily activity streak */
  streak_days: number;
  /** User's birth date for celebrations */
  birth_date: string | null;
  /** Date user joined the company */
  hire_date: string | null;
  /** Whether the user account is active */
  is_active: boolean;
  /** ISO timestamp of profile creation */
  created_at: string;
  /** ISO timestamp of last profile update */
  updated_at: string;
}

/**
 * Department/Team information
 */
export interface Department {
  /** Unique department ID */
  id: string;
  /** Department name */
  name: string;
  /** Optional description */
  description: string | null;
  /** Theme color for UI (hex or CSS color) */
  color: string | null;
  /** ISO timestamp of creation */
  created_at: string;
  /** ISO timestamp of last update */
  updated_at: string;
}

/**
 * Job position within a department
 */
export interface Position {
  /** Unique position ID */
  id: string;
  /** Position title */
  name: string;
  /** Position description */
  description: string | null;
  /** Parent department (nullable for company-wide positions) */
  department_id: string | null;
  /** Seniority level for sorting */
  level: number;
  /** Base XP earned per completed task */
  xp_per_task: number;
  /** Base coins earned per completed task */
  coins_per_task: number;
  /** Whether position is currently available */
  is_active: boolean;
  /** ISO timestamp of creation */
  created_at: string;
  /** ISO timestamp of last update */
  updated_at: string;
}

/**
 * Possible states for async operations
 */
export type LoadingState = "idle" | "loading" | "success" | "error";

/**
 * Generic query state for data fetching operations
 * @template T - The type of data being fetched
 */
export interface QueryState<T> {
  /** The fetched data (null if not loaded or error) */
  data: T | null;
  /** Whether the query is currently loading */
  isLoading: boolean;
  /** Error object if the query failed */
  error: Error | null;
}

/**
 * State for mutation operations (create, update, delete)
 */
export interface MutationState {
  /** Whether the mutation is in progress */
  isPending: boolean;
  /** Whether the mutation completed successfully */
  isSuccess: boolean;
  /** Whether the mutation failed */
  isError: boolean;
  /** Error object if the mutation failed */
  error: Error | null;
}
