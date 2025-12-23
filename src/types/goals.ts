export interface KeyResult {
  id: string;
  goal_id: string;
  title: string;
  description?: string | null;
  current_value: number;
  target_value: number;
  metric_type: "percentage" | "number" | "currency" | "boolean";
  unit: string | null;
  weight: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  goal_type: "personal" | "team" | "company";
  status: "draft" | "active" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  progress_percent: number;
  start_date: string;
  due_date?: string | null;
  completed_at: string | null;
  xp_reward: number;
  coin_reward: number;
  department_id?: string | null;
  parent_goal_id?: string | null;
  created_at: string;
  updated_at: string;
  key_results?: KeyResult[];
}

export interface GoalUpdate {
  id: string;
  goal_id: string;
  user_id: string;
  key_result_id?: string | null;
  previous_value?: number | null;
  new_value: number;
  note?: string | null;
  created_at: string;
}
