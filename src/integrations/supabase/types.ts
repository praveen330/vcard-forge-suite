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
      bulk_imports: {
        Row: {
          created_at: string | null
          error_count: number | null
          errors: Json | null
          id: string
          imported_by: string | null
          organization_id: string
          success_count: number | null
          total_rows: number | null
        }
        Insert: {
          created_at?: string | null
          error_count?: number | null
          errors?: Json | null
          id?: string
          imported_by?: string | null
          organization_id: string
          success_count?: number | null
          total_rows?: number | null
        }
        Update: {
          created_at?: string | null
          error_count?: number | null
          errors?: Json | null
          id?: string
          imported_by?: string | null
          organization_id?: string
          success_count?: number | null
          total_rows?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bulk_imports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      card_links: {
        Row: {
          active: boolean | null
          card_id: string
          created_at: string | null
          icon: string | null
          id: string
          sort_order: number | null
          title: string
          url: string
        }
        Insert: {
          active?: boolean | null
          card_id: string
          created_at?: string | null
          icon?: string | null
          id?: string
          sort_order?: number | null
          title: string
          url: string
        }
        Update: {
          active?: boolean | null
          card_id?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          sort_order?: number | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_links_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          active: boolean | null
          avatar_url: string | null
          bio: string | null
          company: string | null
          company_logo_url: string | null
          created_at: string | null
          email: string | null
          full_name: string
          gallery_images: Json | null
          id: string
          instagram: string | null
          job_title: string | null
          linkedin: string | null
          organization_id: string | null
          phone: string | null
          role: string | null
          slug: string
          theme_color: string | null
          twitter: string | null
          user_id: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          active?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          company_logo_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          gallery_images?: Json | null
          id?: string
          instagram?: string | null
          job_title?: string | null
          linkedin?: string | null
          organization_id?: string | null
          phone?: string | null
          role?: string | null
          slug: string
          theme_color?: string | null
          twitter?: string | null
          user_id: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          active?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          company_logo_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          gallery_images?: Json | null
          id?: string
          instagram?: string | null
          job_title?: string | null
          linkedin?: string | null
          organization_id?: string | null
          phone?: string | null
          role?: string | null
          slug?: string
          theme_color?: string | null
          twitter?: string | null
          user_id?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          active: boolean | null
          created_at: string | null
          domain: string | null
          id: string
          max_cards: number | null
          name: string
          owner_email: string
          slug: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          domain?: string | null
          id?: string
          max_cards?: number | null
          name: string
          owner_email: string
          slug: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          domain?: string | null
          id?: string
          max_cards?: number | null
          name?: string
          owner_email?: string
          slug?: string
        }
        Relationships: []
      }
      promos: {
        Row: {
          active: boolean | null
          card_id: string
          created_at: string | null
          cta_text: string | null
          cta_url: string | null
          description: string | null
          expires_at: string | null
          id: string
          image_url: string | null
          title: string
        }
        Insert: {
          active?: boolean | null
          card_id: string
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          title: string
        }
        Update: {
          active?: boolean | null
          card_id?: string
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "promos_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      scans: {
        Row: {
          card_id: string
          created_at: string | null
          device: string | null
          id: string
          source: string | null
        }
        Insert: {
          card_id: string
          created_at?: string | null
          device?: string | null
          id?: string
          source?: string | null
        }
        Update: {
          card_id?: string
          created_at?: string | null
          device?: string | null
          id?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scans_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
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
