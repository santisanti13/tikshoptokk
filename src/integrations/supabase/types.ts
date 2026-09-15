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
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      market_snapshots: {
        Row: {
          captured_on: string
          country: string
          created_at: string
          id: string
          notes: string | null
          ranking_type: string
          rows: Json
          source: string
          updated_at: string
        }
        Insert: {
          captured_on?: string
          country?: string
          created_at?: string
          id?: string
          notes?: string | null
          ranking_type: string
          rows?: Json
          source?: string
          updated_at?: string
        }
        Update: {
          captured_on?: string
          country?: string
          created_at?: string
          id?: string
          notes?: string | null
          ranking_type?: string
          rows?: Json
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          event_key: string
          processed_at: string
        }
        Insert: {
          event_key: string
          processed_at?: string
        }
        Update: {
          event_key?: string
          processed_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      ugc_carousels: {
        Row: {
          caption: Json | null
          created_at: string
          error_message: string | null
          headline: string | null
          id: string
          product_id: string | null
          slides: Json
          status: string
          style_id: string
          tokens_charged: number
          updated_at: string
          user_id: string
        }
        Insert: {
          caption?: Json | null
          created_at?: string
          error_message?: string | null
          headline?: string | null
          id?: string
          product_id?: string | null
          slides?: Json
          status?: string
          style_id: string
          tokens_charged?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: Json | null
          created_at?: string
          error_message?: string | null
          headline?: string | null
          id?: string
          product_id?: string | null
          slides?: Json
          status?: string
          style_id?: string
          tokens_charged?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ugc_carousels_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "ugc_products"
            referencedColumns: ["id"]
          },
        ]
      }
      ugc_characters: {
        Row: {
          created_at: string
          id: string
          image_path: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_path: string
          name?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_path?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      ugc_products: {
        Row: {
          blind_spots: string | null
          created_at: string
          description: string | null
          id: string
          image_path: string | null
          model_path: string | null
          name: string
          render_paths: string[]
          source_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blind_spots?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          model_path?: string | null
          name: string
          render_paths?: string[]
          source_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blind_spots?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          model_path?: string | null
          name?: string
          render_paths?: string[]
          source_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ugc_projects: {
        Row: {
          brand_notes: string | null
          character_brief: string | null
          created_at: string
          id: string
          name: string
          reference_image_path: string | null
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_notes?: string | null
          character_brief?: string | null
          created_at?: string
          id?: string
          name: string
          reference_image_path?: string | null
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_notes?: string | null
          character_brief?: string | null
          created_at?: string
          id?: string
          name?: string
          reference_image_path?: string | null
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ugc_token_accounts: {
        Row: {
          balance_tokens: number
          created_at: string
          monthly_tokens: number
          plan: string
          renews_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_tokens?: number
          created_at?: string
          monthly_tokens?: number
          plan?: string
          renews_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_tokens?: number
          created_at?: string
          monthly_tokens?: number
          plan?: string
          renews_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ugc_token_ledger: {
        Row: {
          created_at: string
          delta_tokens: number
          id: string
          metadata: Json | null
          reason: string
          user_id: string
          video_id: string | null
        }
        Insert: {
          created_at?: string
          delta_tokens: number
          id?: string
          metadata?: Json | null
          reason: string
          user_id: string
          video_id?: string | null
        }
        Update: {
          created_at?: string
          delta_tokens?: number
          id?: string
          metadata?: Json | null
          reason?: string
          user_id?: string
          video_id?: string | null
        }
        Relationships: []
      }
      ugc_videos: {
        Row: {
          added_seconds: number | null
          aspect_ratio: string | null
          caption: Json | null
          created_at: string
          duration_seconds: number
          error_message: string | null
          has_start_image: boolean
          id: string
          job_id: string | null
          product_id: string | null
          project_id: string | null
          prompt: string
          resolution: string
          source_url: string | null
          source_video_id: string | null
          status: string
          tokens_charged: number
          tokens_refunded: boolean
          updated_at: string
          user_id: string
          video_path: string | null
        }
        Insert: {
          added_seconds?: number | null
          aspect_ratio?: string | null
          caption?: Json | null
          created_at?: string
          duration_seconds?: number
          error_message?: string | null
          has_start_image?: boolean
          id?: string
          job_id?: string | null
          product_id?: string | null
          project_id?: string | null
          prompt: string
          resolution?: string
          source_url?: string | null
          source_video_id?: string | null
          status?: string
          tokens_charged?: number
          tokens_refunded?: boolean
          updated_at?: string
          user_id: string
          video_path?: string | null
        }
        Update: {
          added_seconds?: number | null
          aspect_ratio?: string | null
          caption?: Json | null
          created_at?: string
          duration_seconds?: number
          error_message?: string | null
          has_start_image?: boolean
          id?: string
          job_id?: string | null
          product_id?: string | null
          project_id?: string | null
          prompt?: string
          resolution?: string
          source_url?: string | null
          source_video_id?: string | null
          status?: string
          tokens_charged?: number
          tokens_refunded?: boolean
          updated_at?: string
          user_id?: string
          video_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ugc_videos_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "ugc_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ugc_videos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ugc_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ugc_videos_source_video_id_fkey"
            columns: ["source_video_id"]
            isOneToOne: false
            referencedRelation: "ugc_videos"
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
          role: Database["public"]["Enums"]["app_role"]
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
      admin_find_users: {
        Args: { _search: string }
        Returns: {
          balance_tokens: number
          email: string
          plan: string
          renews_at: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      ugc_admin_adjust_tokens: {
        Args: { _delta: number; _reason: string; _user_id: string }
        Returns: number
      }
      ugc_charge_tokens: {
        Args: {
          _reason: string
          _tokens: number
          _user_id: string
          _video_id?: string
        }
        Returns: number
      }
      ugc_ensure_account: {
        Args: never
        Returns: {
          balance_tokens: number
          plan: string
        }[]
      }
      ugc_grant_tokens: {
        Args: {
          _reason: string
          _tokens: number
          _user_id: string
          _video_id?: string
        }
        Returns: number
      }
      ugc_set_plan: {
        Args: {
          _monthly_tokens: number
          _plan: string
          _renews_at: string
          _user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
