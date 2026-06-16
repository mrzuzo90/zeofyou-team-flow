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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          description: string
          icon: string
          id: string
          name: string
          rarity: string
          xp_reward: number
        }
        Insert: {
          description: string
          icon?: string
          id: string
          name: string
          rarity?: string
          xp_reward?: number
        }
        Update: {
          description?: string
          icon?: string
          id?: string
          name?: string
          rarity?: string
          xp_reward?: number
        }
        Relationships: []
      }
      daily_metrics: {
        Row: {
          avg_energy: number
          created_at: string
          date: string
          focus_minutes: number
          id: string
          missions_completed: number
          top_identity_id: string | null
          user_id: string
        }
        Insert: {
          avg_energy?: number
          created_at?: string
          date: string
          focus_minutes?: number
          id?: string
          missions_completed?: number
          top_identity_id?: string | null
          user_id: string
        }
        Update: {
          avg_energy?: number
          created_at?: string
          date?: string
          focus_minutes?: number
          id?: string
          missions_completed?: number
          top_identity_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_metrics_top_identity_id_fkey"
            columns: ["top_identity_id"]
            isOneToOne: false
            referencedRelation: "identities"
            referencedColumns: ["id"]
          },
        ]
      }
      focus_sessions: {
        Row: {
          completed_at: string
          created_at: string
          duration_minutes: number
          id: string
          identity_id: string | null
          mission_id: string | null
          notes: string | null
          pomodoros_completed: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          duration_minutes: number
          id?: string
          identity_id?: string | null
          mission_id?: string | null
          notes?: string | null
          pomodoros_completed?: number
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          identity_id?: string | null
          mission_id?: string | null
          notes?: string | null
          pomodoros_completed?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "focus_sessions_identity_id_fkey"
            columns: ["identity_id"]
            isOneToOne: false
            referencedRelation: "identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "focus_sessions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      identities: {
        Row: {
          avatar: string | null
          color: string
          created_at: string
          description: string | null
          energy: number
          id: string
          name: string
          role: string
          specialty: string | null
          status: Database["public"]["Enums"]["identity_status"]
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar?: string | null
          color?: string
          created_at?: string
          description?: string | null
          energy?: number
          id?: string
          name: string
          role: string
          specialty?: string | null
          status?: Database["public"]["Enums"]["identity_status"]
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: string | null
          color?: string
          created_at?: string
          description?: string | null
          energy?: number
          id?: string
          name?: string
          role?: string
          specialty?: string | null
          status?: Database["public"]["Enums"]["identity_status"]
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      missions: {
        Row: {
          assigned_identity_id: string | null
          category: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_primary: boolean
          priority: Database["public"]["Enums"]["mission_priority"]
          status: Database["public"]["Enums"]["mission_status"]
          title: string
          updated_at: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          assigned_identity_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_primary?: boolean
          priority?: Database["public"]["Enums"]["mission_priority"]
          status?: Database["public"]["Enums"]["mission_status"]
          title: string
          updated_at?: string
          user_id: string
          xp_reward?: number
        }
        Update: {
          assigned_identity_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_primary?: boolean
          priority?: Database["public"]["Enums"]["mission_priority"]
          status?: Database["public"]["Enums"]["mission_status"]
          title?: string
          updated_at?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "missions_assigned_identity_id_fkey"
            columns: ["assigned_identity_id"]
            isOneToOne: false
            referencedRelation: "identities"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_profiles: {
        Row: {
          ambitions: string[]
          concerns: string | null
          created_at: string
          current_projects: string | null
          life_context: string | null
          raw_answers: Json | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ambitions?: string[]
          concerns?: string | null
          created_at?: string
          current_projects?: string | null
          life_context?: string | null
          raw_answers?: Json | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ambitions?: string[]
          concerns?: string | null
          created_at?: string
          current_projects?: string | null
          life_context?: string | null
          raw_answers?: Json | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          last_active_at: string | null
          level: number
          onboarding_completed: boolean
          preferences: Json
          streak_days: number
          updated_at: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          last_active_at?: string | null
          level?: number
          onboarding_completed?: boolean
          preferences?: Json
          streak_days?: number
          updated_at?: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          last_active_at?: string | null
          level?: number
          onboarding_completed?: boolean
          preferences?: Json
          streak_days?: number
          updated_at?: string
          xp?: number
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      identity_status: "active" | "resting" | "paused"
      mission_priority: "low" | "medium" | "high"
      mission_status: "pending" | "in_progress" | "completed" | "archived"
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
      identity_status: ["active", "resting", "paused"],
      mission_priority: ["low", "medium", "high"],
      mission_status: ["pending", "in_progress", "completed", "archived"],
    },
  },
} as const
