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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attempt_purchases: {
        Row: {
          amount: number
          attempts_count: number
          created_at: string
          id: string
          payment_method: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          transaction_id: string
          user_id: string
        }
        Insert: {
          amount?: number
          attempts_count?: number
          created_at?: string
          id?: string
          payment_method: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          transaction_id: string
          user_id: string
        }
        Update: {
          amount?: number
          attempts_count?: number
          created_at?: string
          id?: string
          payment_method?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          transaction_id?: string
          user_id?: string
        }
        Relationships: []
      }
      attempts: {
        Row: {
          attempt_number: number
          contest_id: string
          created_at: string | null
          id: string
          score: number
          session_ended_at: string | null
          session_id: string | null
          session_started_at: string | null
          user_id: string
        }
        Insert: {
          attempt_number: number
          contest_id: string
          created_at?: string | null
          id?: string
          score?: number
          session_ended_at?: string | null
          session_id?: string | null
          session_started_at?: string | null
          user_id: string
        }
        Update: {
          attempt_number?: number
          contest_id?: string
          created_at?: string | null
          id?: string
          score?: number
          session_ended_at?: string | null
          session_id?: string | null
          session_started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempts_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "monthly_contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_claims: {
        Row: {
          claim_date: string
          created_at: string | null
          id: string
          reward_points: number
          user_id: string
        }
        Insert: {
          claim_date: string
          created_at?: string | null
          id?: string
          reward_points: number
          user_id: string
        }
        Update: {
          claim_date?: string
          created_at?: string | null
          id?: string
          reward_points?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_claims_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_claimed_date: string | null
          last_play_date: string | null
          total_streak_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_claimed_date?: string | null
          last_play_date?: string | null
          total_streak_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_claimed_date?: string | null
          last_play_date?: string | null
          total_streak_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          avg_interval_ms: number | null
          bot_risk_score: number | null
          client_score: number | null
          created_at: string
          ended_at: string | null
          flag_reasons: string[] | null
          flagged: boolean | null
          focus_losses: number | null
          id: string
          interval_variance: number | null
          ip_address: string | null
          is_practice: boolean
          max_interval_ms: number | null
          min_interval_ms: number | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          screen_height: number | null
          screen_width: number | null
          session_token: string
          started_at: string
          status: string
          tap_count: number | null
          timezone: string | null
          user_agent: string | null
          user_id: string
          verified_score: number | null
          visibility_changes: number | null
        }
        Insert: {
          avg_interval_ms?: number | null
          bot_risk_score?: number | null
          client_score?: number | null
          created_at?: string
          ended_at?: string | null
          flag_reasons?: string[] | null
          flagged?: boolean | null
          focus_losses?: number | null
          id?: string
          interval_variance?: number | null
          ip_address?: string | null
          is_practice?: boolean
          max_interval_ms?: number | null
          min_interval_ms?: number | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_token: string
          started_at?: string
          status?: string
          tap_count?: number | null
          timezone?: string | null
          user_agent?: string | null
          user_id: string
          verified_score?: number | null
          visibility_changes?: number | null
        }
        Update: {
          avg_interval_ms?: number | null
          bot_risk_score?: number | null
          client_score?: number | null
          created_at?: string
          ended_at?: string | null
          flag_reasons?: string[] | null
          flagged?: boolean | null
          focus_losses?: number | null
          id?: string
          interval_variance?: number | null
          ip_address?: string | null
          is_practice?: boolean
          max_interval_ms?: number | null
          min_interval_ms?: number | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_token?: string
          started_at?: string
          status?: string
          tap_count?: number | null
          timezone?: string | null
          user_agent?: string | null
          user_id?: string
          verified_score?: number | null
          visibility_changes?: number | null
        }
        Relationships: []
      }
      leaderboard: {
        Row: {
          attempt_total_score: number
          attempts_used: number
          contest_id: string
          daily_streak_points: number
          id: string
          rank_position: number | null
          referral_points: number
          total_score: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attempt_total_score?: number
          attempts_used?: number
          contest_id: string
          daily_streak_points?: number
          id?: string
          rank_position?: number | null
          referral_points?: number
          total_score?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attempt_total_score?: number
          attempts_used?: number
          contest_id?: string
          daily_streak_points?: number
          id?: string
          rank_position?: number | null
          referral_points?: number
          total_score?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "monthly_contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_contests: {
        Row: {
          created_at: string | null
          end_at: string
          id: string
          month: number
          prize_pool: number
          start_at: string
          status: string
          year: number
        }
        Insert: {
          created_at?: string | null
          end_at: string
          id?: string
          month: number
          prize_pool?: number
          start_at: string
          status?: string
          year: number
        }
        Update: {
          created_at?: string | null
          end_at?: string
          id?: string
          month?: number
          prize_pool?: number
          start_at?: string
          status?: string
          year?: number
        }
        Relationships: []
      }
      monthly_winners: {
        Row: {
          contest_id: string
          created_at: string | null
          final_rank: number
          id: string
          payout_status: string
          prize_amount: number
          user_id: string
        }
        Insert: {
          contest_id: string
          created_at?: string | null
          final_rank: number
          id?: string
          payout_status?: string
          prize_amount: number
          user_id: string
        }
        Update: {
          contest_id?: string
          created_at?: string | null
          final_rank?: number
          id?: string
          payout_status?: string
          prize_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_winners_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "monthly_contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_winners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_verifications: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          otp_code: string
          phone_number: string
          user_id: string | null
          verified: boolean
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          otp_code: string
          phone_number: string
          user_id?: string | null
          verified?: boolean
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          otp_code?: string
          phone_number?: string
          user_id?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      payout_requests: {
        Row: {
          account_number: string
          contest_id: string | null
          created_at: string | null
          id: string
          payment_method: string
          prize_amount: number
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          account_number: string
          contest_id?: string | null
          created_at?: string | null
          id?: string
          payment_method: string
          prize_amount: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          account_number?: string
          contest_id?: string | null
          created_at?: string | null
          id?: string
          payment_method?: string
          prize_amount?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_requests_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "monthly_contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bkash_number: string | null
          bonus_attempts: number
          country: string | null
          created_at: string
          daily_streak_points: number
          email: string | null
          extra_attempts: number
          full_name: string | null
          id: string
          is_banned: boolean
          lifetime_best_score: number
          nagad_number: string | null
          phone_number: string | null
          phone_verified: boolean
          preferred_language: string | null
          preferred_payout_method: string | null
          referral_code: string
          referral_points: number
          referred_by_user_id: string | null
          total_points: number
          total_practice_games: number
          total_ranked_games: number
          total_wins: number
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bkash_number?: string | null
          bonus_attempts?: number
          country?: string | null
          created_at?: string
          daily_streak_points?: number
          email?: string | null
          extra_attempts?: number
          full_name?: string | null
          id: string
          is_banned?: boolean
          lifetime_best_score?: number
          nagad_number?: string | null
          phone_number?: string | null
          phone_verified?: boolean
          preferred_language?: string | null
          preferred_payout_method?: string | null
          referral_code?: string
          referral_points?: number
          referred_by_user_id?: string | null
          total_points?: number
          total_practice_games?: number
          total_ranked_games?: number
          total_wins?: number
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bkash_number?: string | null
          bonus_attempts?: number
          country?: string | null
          created_at?: string
          daily_streak_points?: number
          email?: string | null
          extra_attempts?: number
          full_name?: string | null
          id?: string
          is_banned?: boolean
          lifetime_best_score?: number
          nagad_number?: string | null
          phone_number?: string | null
          phone_verified?: boolean
          preferred_language?: string | null
          preferred_payout_method?: string | null
          referral_code?: string
          referral_points?: number
          referred_by_user_id?: string | null
          total_points?: number
          total_practice_games?: number
          total_ranked_games?: number
          total_wins?: number
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_user_id_fkey"
            columns: ["referred_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action: string
          count: number
          created_at: string
          id: string
          identifier: string
          window_start: string
        }
        Insert: {
          action: string
          count?: number
          created_at?: string
          id?: string
          identifier: string
          window_start?: string
        }
        Update: {
          action?: string
          count?: number
          created_at?: string
          id?: string
          identifier?: string
          window_start?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          phone_verified: boolean
          points_awarded: number
          referred_user_id: string
          referrer_user_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          phone_verified?: boolean
          points_awarded?: number
          referred_user_id: string
          referrer_user_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          phone_verified?: boolean
          points_awarded?: number
          referred_user_id?: string
          referrer_user_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_user_id_fkey"
            columns: ["referrer_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: { Args: never; Returns: string }
      get_or_create_current_contest: { Args: never; Returns: string }
      get_user_attempt_count: {
        Args: { _contest_id: string; _user_id: string }
        Returns: number
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      update_leaderboard_scores: {
        Args: { _contest_id: string; _user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
