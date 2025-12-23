// Common reusable types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  department_id: string | null;
  position_id: string | null;
  level: number;
  xp_total: number;
  coins: number;
  streak_days: number;
  birth_date: string | null;
  hire_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: string;
  name: string;
  description: string | null;
  department_id: string | null;
  level: number;
  xp_per_task: number;
  coins_per_task: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Utility types
export type LoadingState = "idle" | "loading" | "success" | "error";

export interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export interface MutationState {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
}
