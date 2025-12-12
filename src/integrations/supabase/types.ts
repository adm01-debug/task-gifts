export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_data: Json | null
          old_data: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      custom_quests: {
        Row: {
          coin_reward: number
          created_at: string
          created_by: string
          deadline_days: number | null
          department_id: string | null
          description: string
          difficulty: Database["public"]["Enums"]["quest_difficulty"]
          icon: string
          id: string
          max_participants: number | null
          requirements: string[] | null
          status: Database["public"]["Enums"]["quest_status"]
          tags: string[] | null
          title: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          coin_reward?: number
          created_at?: string
          created_by: string
          deadline_days?: number | null
          department_id?: string | null
          description: string
          difficulty?: Database["public"]["Enums"]["quest_difficulty"]
          icon?: string
          id?: string
          max_participants?: number | null
          requirements?: string[] | null
          status?: Database["public"]["Enums"]["quest_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          coin_reward?: number
          created_at?: string
          created_by?: string
          deadline_days?: number | null
          department_id?: string | null
          description?: string
          difficulty?: Database["public"]["Enums"]["quest_difficulty"]
          icon?: string
          id?: string
          max_participants?: number | null
          requirements?: string[] | null
          status?: Database["public"]["Enums"]["quest_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "custom_quests_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      kudos: {
        Row: {
          badge_id: string | null
          created_at: string
          from_user_id: string
          id: string
          is_public: boolean
          message: string
          to_user_id: string
        }
        Insert: {
          badge_id?: string | null
          created_at?: string
          from_user_id: string
          id?: string
          is_public?: boolean
          message: string
          to_user_id: string
        }
        Update: {
          badge_id?: string | null
          created_at?: string
          from_user_id?: string
          id?: string
          is_public?: boolean
          message?: string
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kudos_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "kudos_badges"
            referencedColumns: ["id"]
          },
        ]
      }
      kudos_badges: {
        Row: {
          category: string
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          xp_value: number
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name: string
          xp_value?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          xp_value?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          best_streak: number
          coins: number
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          level: number
          quests_completed: number
          streak: number
          updated_at: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          best_streak?: number
          coins?: number
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          level?: number
          quests_completed?: number
          streak?: number
          updated_at?: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          best_streak?: number
          coins?: number
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          level?: number
          quests_completed?: number
          streak?: number
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      quest_assignments: {
        Row: {
          completed_at: string | null
          current_step: number
          id: string
          quest_id: string
          started_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          current_step?: number
          id?: string
          quest_id: string
          started_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          current_step?: number
          id?: string
          quest_id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quest_assignments_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "custom_quests"
            referencedColumns: ["id"]
          },
        ]
      }
      quest_steps: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_index: number
          quest_id: string
          title: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          quest_id: string
          title: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          quest_id?: string
          title?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "quest_steps_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "custom_quests"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          department_id: string
          id: string
          is_manager: boolean
          joined_at: string
          user_id: string
        }
        Insert: {
          department_id: string
          id?: string
          is_manager?: boolean
          joined_at?: string
          user_id: string
        }
        Update: {
          department_id?: string
          id?: string
          is_manager?: boolean
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_department_manager: {
        Args: { _department_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "employee"
      audit_action:
        | "user_signup"
        | "user_login"
        | "profile_update"
        | "xp_gained"
        | "level_up"
        | "coins_earned"
        | "coins_spent"
        | "quest_created"
        | "quest_updated"
        | "quest_deleted"
        | "quest_assigned"
        | "quest_completed"
        | "kudos_given"
        | "kudos_received"
        | "achievement_unlocked"
        | "streak_updated"
        | "department_created"
        | "department_updated"
        | "team_member_added"
        | "team_member_removed"
        | "role_assigned"
        | "role_removed"
      quest_difficulty: "easy" | "medium" | "hard" | "expert"
      quest_status: "draft" | "active" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager", "employee"],
      audit_action: [
        "user_signup",
        "user_login",
        "profile_update",
        "xp_gained",
        "level_up",
        "coins_earned",
        "coins_spent",
        "quest_created",
        "quest_updated",
        "quest_deleted",
        "quest_assigned",
        "quest_completed",
        "kudos_given",
        "kudos_received",
        "achievement_unlocked",
        "streak_updated",
        "department_created",
        "department_updated",
        "team_member_added",
        "team_member_removed",
        "role_assigned",
        "role_removed",
      ],
      quest_difficulty: ["easy", "medium", "hard", "expert"],
      quest_status: ["draft", "active", "archived"],
    },
  },
} as const
