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
      achievements: {
        Row: {
          category: string
          coin_reward: number
          created_at: string
          description: string | null
          icon: string
          id: string
          key: string
          name: string
          rarity: string
          xp_reward: number
        }
        Insert: {
          category?: string
          coin_reward?: number
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          key: string
          name: string
          rarity?: string
          xp_reward?: number
        }
        Update: {
          category?: string
          coin_reward?: number
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          key?: string
          name?: string
          rarity?: string
          xp_reward?: number
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          check_in: string
          check_out: string | null
          created_at: string
          id: string
          is_punctual: boolean
          late_minutes: number | null
          notes: string | null
          user_id: string
        }
        Insert: {
          check_in?: string
          check_out?: string | null
          created_at?: string
          id?: string
          is_punctual?: boolean
          late_minutes?: number | null
          notes?: string | null
          user_id: string
        }
        Update: {
          check_in?: string
          check_out?: string | null
          created_at?: string
          id?: string
          is_punctual?: boolean
          late_minutes?: number | null
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      attendance_settings: {
        Row: {
          created_at: string
          department_id: string | null
          id: string
          streak_milestone: number
          tolerance_minutes: number
          updated_at: string
          work_end_time: string
          work_start_time: string
          xp_punctual_checkin: number
          xp_streak_bonus: number
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          id?: string
          streak_milestone?: number
          tolerance_minutes?: number
          updated_at?: string
          work_end_time?: string
          work_start_time?: string
          xp_punctual_checkin?: number
          xp_streak_bonus?: number
        }
        Update: {
          created_at?: string
          department_id?: string | null
          id?: string
          streak_milestone?: number
          tolerance_minutes?: number
          updated_at?: string
          work_end_time?: string
          work_start_time?: string
          xp_punctual_checkin?: number
          xp_streak_bonus?: number
        }
        Relationships: [
          {
            foreignKeyName: "attendance_settings_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_streaks: {
        Row: {
          best_streak: number
          current_streak: number
          id: string
          last_punctual_date: string | null
          total_punctual_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          best_streak?: number
          current_streak?: number
          id?: string
          last_punctual_date?: string | null
          total_punctual_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          best_streak?: number
          current_streak?: number
          id?: string
          last_punctual_date?: string | null
          total_punctual_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      department_missions: {
        Row: {
          coin_reward: number | null
          created_at: string | null
          department_id: string | null
          description: string | null
          frequency: Database["public"]["Enums"]["mission_frequency"] | null
          icon: string | null
          id: string
          is_active: boolean | null
          metric_key: string
          order_index: number | null
          target_value: number | null
          title: string
          updated_at: string | null
          xp_reward: number | null
        }
        Insert: {
          coin_reward?: number | null
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          frequency?: Database["public"]["Enums"]["mission_frequency"] | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          metric_key: string
          order_index?: number | null
          target_value?: number | null
          title: string
          updated_at?: string | null
          xp_reward?: number | null
        }
        Update: {
          coin_reward?: number | null
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          frequency?: Database["public"]["Enums"]["mission_frequency"] | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          metric_key?: string
          order_index?: number | null
          target_value?: number | null
          title?: string
          updated_at?: string | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "department_missions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      department_rankings: {
        Row: {
          created_at: string | null
          department_id: string
          id: string
          metrics: Json | null
          period_end: string
          period_start: string
          period_type: string
          rank_position: number | null
          total_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department_id: string
          id?: string
          metrics?: Json | null
          period_end: string
          period_start: string
          period_type?: string
          rank_position?: number | null
          total_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department_id?: string
          id?: string
          metrics?: Json | null
          period_end?: string
          period_start?: string
          period_type?: string
          rank_position?: number | null
          total_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_rankings_department_id_fkey"
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
      learning_trails: {
        Row: {
          badge_icon: string | null
          badge_name: string | null
          coin_reward: number | null
          created_at: string | null
          created_by: string
          department_id: string | null
          description: string | null
          estimated_hours: number | null
          icon: string | null
          id: string
          order_index: number | null
          status: Database["public"]["Enums"]["trail_status"] | null
          title: string
          updated_at: string | null
          xp_reward: number | null
        }
        Insert: {
          badge_icon?: string | null
          badge_name?: string | null
          coin_reward?: number | null
          created_at?: string | null
          created_by: string
          department_id?: string | null
          description?: string | null
          estimated_hours?: number | null
          icon?: string | null
          id?: string
          order_index?: number | null
          status?: Database["public"]["Enums"]["trail_status"] | null
          title: string
          updated_at?: string | null
          xp_reward?: number | null
        }
        Update: {
          badge_icon?: string | null
          badge_name?: string | null
          coin_reward?: number | null
          created_at?: string | null
          created_by?: string
          department_id?: string | null
          description?: string | null
          estimated_hours?: number | null
          icon?: string | null
          id?: string
          order_index?: number | null
          status?: Database["public"]["Enums"]["trail_status"] | null
          title?: string
          updated_at?: string | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_trails_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      module_progress: {
        Row: {
          attempts: number | null
          completed_at: string | null
          id: string
          module_id: string
          score: number | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          id?: string
          module_id: string
          score?: number | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          id?: string
          module_id?: string
          score?: number | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "trail_modules"
            referencedColumns: ["id"]
          },
        ]
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
      onboarding_progress: {
        Row: {
          completed_at: string | null
          completed_steps: string[] | null
          created_at: string | null
          current_step: number
          id: string
          rewards_claimed: string[] | null
          started_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: string[] | null
          created_at?: string | null
          current_step?: number
          id?: string
          rewards_claimed?: string[] | null
          started_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_steps?: string[] | null
          created_at?: string | null
          current_step?: number
          id?: string
          rewards_claimed?: string[] | null
          started_at?: string | null
          updated_at?: string | null
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
      shop_promotions: {
        Row: {
          created_at: string
          current_claims: number
          description: string | null
          discount_coins: number | null
          discount_percent: number | null
          ends_at: string
          id: string
          is_active: boolean
          max_claims: number | null
          reward_id: string
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_claims?: number
          description?: string | null
          discount_coins?: number | null
          discount_percent?: number | null
          ends_at: string
          id?: string
          is_active?: boolean
          max_claims?: number | null
          reward_id: string
          starts_at?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_claims?: number
          description?: string | null
          discount_coins?: number | null
          discount_percent?: number | null
          ends_at?: string
          id?: string
          is_active?: boolean
          max_claims?: number | null
          reward_id?: string
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_promotions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "shop_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_purchases: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          quantity: number
          reward_id: string
          status: Database["public"]["Enums"]["purchase_status"]
          total_coins: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          quantity?: number
          reward_id: string
          status?: Database["public"]["Enums"]["purchase_status"]
          total_coins: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          quantity?: number
          reward_id?: string
          status?: Database["public"]["Enums"]["purchase_status"]
          total_coins?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_purchases_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "shop_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_rewards: {
        Row: {
          category: Database["public"]["Enums"]["reward_category"]
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price_coins: number
          rarity: Database["public"]["Enums"]["reward_rarity"]
          stock: number | null
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["reward_category"]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price_coins?: number
          rarity?: Database["public"]["Enums"]["reward_rarity"]
          stock?: number | null
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["reward_category"]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price_coins?: number
          rarity?: Database["public"]["Enums"]["reward_rarity"]
          stock?: number | null
          updated_at?: string
        }
        Relationships: []
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
      trail_enrollments: {
        Row: {
          completed_at: string | null
          id: string
          progress_percent: number | null
          started_at: string | null
          trail_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          progress_percent?: number | null
          started_at?: string | null
          trail_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          progress_percent?: number | null
          started_at?: string | null
          trail_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trail_enrollments_trail_id_fkey"
            columns: ["trail_id"]
            isOneToOne: false
            referencedRelation: "learning_trails"
            referencedColumns: ["id"]
          },
        ]
      }
      trail_modules: {
        Row: {
          content: Json | null
          content_type:
            | Database["public"]["Enums"]["module_content_type"]
            | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          order_index: number | null
          title: string
          trail_id: string
          updated_at: string | null
          video_url: string | null
          xp_reward: number | null
        }
        Insert: {
          content?: Json | null
          content_type?:
            | Database["public"]["Enums"]["module_content_type"]
            | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          order_index?: number | null
          title: string
          trail_id: string
          updated_at?: string | null
          video_url?: string | null
          xp_reward?: number | null
        }
        Update: {
          content?: Json | null
          content_type?:
            | Database["public"]["Enums"]["module_content_type"]
            | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          order_index?: number | null
          title?: string
          trail_id?: string
          updated_at?: string | null
          video_url?: string | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trail_modules_trail_id_fkey"
            columns: ["trail_id"]
            isOneToOne: false
            referencedRelation: "learning_trails"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_combos: {
        Row: {
          actions_count: number
          combo_date: string
          created_at: string | null
          current_multiplier: number
          id: string
          last_action_at: string | null
          max_multiplier_reached: number
          total_bonus_xp: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actions_count?: number
          combo_date?: string
          created_at?: string | null
          current_multiplier?: number
          id?: string
          last_action_at?: string | null
          max_multiplier_reached?: number
          total_bonus_xp?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actions_count?: number
          combo_date?: string
          created_at?: string | null
          current_multiplier?: number
          id?: string
          last_action_at?: string | null
          max_multiplier_reached?: number
          total_bonus_xp?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_mission_progress: {
        Row: {
          claimed: boolean | null
          completed_at: string | null
          created_at: string | null
          current_value: number | null
          id: string
          mission_id: string
          period_end: string
          period_start: string
          user_id: string
        }
        Insert: {
          claimed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          mission_id: string
          period_end: string
          period_start: string
          user_id: string
        }
        Update: {
          claimed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          mission_id?: string
          period_end?: string
          period_start?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_mission_progress_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "department_missions"
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
      weekly_challenges: {
        Row: {
          challenger_id: string
          challenger_xp_gained: number
          challenger_xp_start: number
          coin_reward: number
          created_at: string
          id: string
          opponent_id: string
          opponent_xp_gained: number
          opponent_xp_start: number
          status: string
          updated_at: string
          week_end: string
          week_start: string
          winner_id: string | null
          xp_reward: number
        }
        Insert: {
          challenger_id: string
          challenger_xp_gained?: number
          challenger_xp_start?: number
          coin_reward?: number
          created_at?: string
          id?: string
          opponent_id: string
          opponent_xp_gained?: number
          opponent_xp_start?: number
          status?: string
          updated_at?: string
          week_end?: string
          week_start?: string
          winner_id?: string | null
          xp_reward?: number
        }
        Update: {
          challenger_id?: string
          challenger_xp_gained?: number
          challenger_xp_start?: number
          coin_reward?: number
          created_at?: string
          id?: string
          opponent_id?: string
          opponent_xp_gained?: number
          opponent_xp_start?: number
          status?: string
          updated_at?: string
          week_end?: string
          week_start?: string
          winner_id?: string | null
          xp_reward?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_department_metrics: { Args: never; Returns: Json }
      get_executive_metrics: { Args: never; Returns: Json }
      get_monthly_trends: { Args: never; Returns: Json }
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
      mission_frequency: "daily" | "weekly" | "monthly"
      module_content_type:
        | "video"
        | "text"
        | "quiz"
        | "flashcard"
        | "infographic"
        | "simulation"
        | "checklist"
      purchase_status: "pending" | "approved" | "delivered" | "cancelled"
      quest_difficulty: "easy" | "medium" | "hard" | "expert"
      quest_status: "draft" | "active" | "archived"
      reward_category: "product" | "benefit" | "experience"
      reward_rarity: "common" | "rare" | "epic" | "legendary"
      trail_status: "draft" | "published" | "archived"
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
      mission_frequency: ["daily", "weekly", "monthly"],
      module_content_type: [
        "video",
        "text",
        "quiz",
        "flashcard",
        "infographic",
        "simulation",
        "checklist",
      ],
      purchase_status: ["pending", "approved", "delivered", "cancelled"],
      quest_difficulty: ["easy", "medium", "hard", "expert"],
      quest_status: ["draft", "active", "archived"],
      reward_category: ["product", "benefit", "experience"],
      reward_rarity: ["common", "rare", "epic", "legendary"],
      trail_status: ["draft", "published", "archived"],
    },
  },
} as const
