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
      categories: {
        Row: {
          color: string
          created_at: string
          description_long_en: string | null
          description_long_fr: string | null
          faq: Json
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name_en: string
          name_fr: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description_long_en?: string | null
          description_long_fr?: string | null
          faq?: Json
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name_en: string
          name_fr: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description_long_en?: string | null
          description_long_fr?: string | null
          faq?: Json
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name_en?: string
          name_fr?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          archived_at: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          notes: string | null
          phone: string | null
          tags: string[]
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          name?: string | null
          notes?: string | null
          phone?: string | null
          tags?: string[]
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          notes?: string | null
          phone?: string | null
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      custom_configs: {
        Row: {
          alerts: Json
          config: Json
          created_at: string | null
          estimate_at: string | null
          estimate_breakdown: Json | null
          estimate_by: string | null
          estimate_note: string | null
          estimate_options: Json | null
          estimate_total_ht: number | null
          estimate_unit_ht: number | null
          id: string
          line_id: string | null
          piece: string
          preview_path: string | null
          quantity: number
          quote_id: string | null
          recap: string | null
          ref: string
          weight_kg: number | null
        }
        Insert: {
          alerts?: Json
          config: Json
          created_at?: string | null
          estimate_at?: string | null
          estimate_breakdown?: Json | null
          estimate_by?: string | null
          estimate_note?: string | null
          estimate_options?: Json | null
          estimate_total_ht?: number | null
          estimate_unit_ht?: number | null
          id?: string
          line_id?: string | null
          piece: string
          preview_path?: string | null
          quantity: number
          quote_id?: string | null
          recap?: string | null
          ref: string
          weight_kg?: number | null
        }
        Update: {
          alerts?: Json
          config?: Json
          created_at?: string | null
          estimate_at?: string | null
          estimate_breakdown?: Json | null
          estimate_by?: string | null
          estimate_note?: string | null
          estimate_options?: Json | null
          estimate_total_ht?: number | null
          estimate_unit_ht?: number | null
          id?: string
          line_id?: string | null
          piece?: string
          preview_path?: string | null
          quantity?: number
          quote_id?: string | null
          recap?: string | null
          ref?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_configs_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_pricing: {
        Row: {
          enabled: boolean
          from_price_ht: number
          lead_time_days: number | null
          piece: string
          updated_at: string | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          enabled?: boolean
          from_price_ht?: number
          lead_time_days?: number | null
          piece: string
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          enabled?: boolean
          from_price_ht?: number
          lead_time_days?: number | null
          piece?: string
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: []
      }
      product_option_categories: {
        Row: {
          created_at: string
          id: string
          is_required: boolean
          name_en: string
          name_fr: string
          product_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean
          name_en: string
          name_fr: string
          product_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean
          name_en?: string
          name_fr?: string
          product_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_option_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          category_id: string
          created_at: string
          id: string
          is_active: boolean
          name_en: string
          name_fr: string
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name_en: string
          name_fr: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name_en?: string
          name_fr?: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_options_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_option_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_slug: string
          configurator_options: Json
          configurator_url: string | null
          created_at: string
          deposit: number
          description_en: string | null
          description_fr: string | null
          dimensions: string | null
          duration_discounts: Json
          id: string
          image_url: string | null
          is_active: boolean
          name_en: string
          name_fr: string
          options: Json
          price_day: number
          price_month: number | null
          price_week: number | null
          quantity_discounts: Json
          slug: string
          sort_order: number
          stock_total: number
          updated_at: string
        }
        Insert: {
          category_slug: string
          configurator_options?: Json
          configurator_url?: string | null
          created_at?: string
          deposit?: number
          description_en?: string | null
          description_fr?: string | null
          dimensions?: string | null
          duration_discounts?: Json
          id?: string
          image_url?: string | null
          is_active?: boolean
          name_en: string
          name_fr: string
          options?: Json
          price_day?: number
          price_month?: number | null
          price_week?: number | null
          quantity_discounts?: Json
          slug: string
          sort_order?: number
          stock_total?: number
          updated_at?: string
        }
        Update: {
          category_slug?: string
          configurator_options?: Json
          configurator_url?: string | null
          created_at?: string
          deposit?: number
          description_en?: string | null
          description_fr?: string | null
          dimensions?: string | null
          duration_discounts?: Json
          id?: string
          image_url?: string | null
          is_active?: boolean
          name_en?: string
          name_fr?: string
          options?: Json
          price_day?: number
          price_month?: number | null
          price_week?: number | null
          quantity_discounts?: Json
          slug?: string
          sort_order?: number
          stock_total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_slug_fkey"
            columns: ["category_slug"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["slug"]
          },
        ]
      }
      quote_requests: {
        Row: {
          company: string | null
          created_at: string
          custom_after_event: string | null
          custom_delivery_date: string | null
          customer_name: string
          delivery_fee: number
          delivery_time: string | null
          discount_total: number
          email: string
          email_admin_status: string | null
          email_client_status: string | null
          event_date: string | null
          event_location: string | null
          has_custom: boolean
          id: string
          items: Json
          logistics_notes: string | null
          message: string | null
          phone: string | null
          pickup_fee: number
          pickup_time: string | null
          request_no: number
          setup_fee: number
          source: string
          status: string
          subtotal_ht: number
          total_deposit: number
          total_ht: number
          total_ttc: number
          updated_at: string
          vat: number
          wants_samples: boolean
        }
        Insert: {
          company?: string | null
          created_at?: string
          custom_after_event?: string | null
          custom_delivery_date?: string | null
          customer_name: string
          delivery_fee?: number
          delivery_time?: string | null
          discount_total?: number
          email: string
          email_admin_status?: string | null
          email_client_status?: string | null
          event_date?: string | null
          event_location?: string | null
          has_custom?: boolean
          id?: string
          items?: Json
          logistics_notes?: string | null
          message?: string | null
          phone?: string | null
          pickup_fee?: number
          pickup_time?: string | null
          request_no?: number
          setup_fee?: number
          source?: string
          status?: string
          subtotal_ht?: number
          total_deposit?: number
          total_ht?: number
          total_ttc?: number
          updated_at?: string
          vat?: number
          wants_samples?: boolean
        }
        Update: {
          company?: string | null
          created_at?: string
          custom_after_event?: string | null
          custom_delivery_date?: string | null
          customer_name?: string
          delivery_fee?: number
          delivery_time?: string | null
          discount_total?: number
          email?: string
          email_admin_status?: string | null
          email_client_status?: string | null
          event_date?: string | null
          event_location?: string | null
          has_custom?: boolean
          id?: string
          items?: Json
          logistics_notes?: string | null
          message?: string | null
          phone?: string | null
          pickup_fee?: number
          pickup_time?: string | null
          request_no?: number
          setup_fee?: number
          source?: string
          status?: string
          subtotal_ht?: number
          total_deposit?: number
          total_ht?: number
          total_ttc?: number
          updated_at?: string
          vat?: number
          wants_samples?: boolean
        }
        Relationships: []
      }
      roadmap_items: {
        Row: {
          created_at: string
          date: string | null
          description: string
          id: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          description?: string
          id?: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string | null
          description?: string
          id?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_events: {
        Row: {
          created_at: string | null
          id: number
          name: string
          path: string | null
          ref: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          name: string
          path?: string | null
          ref?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          name?: string
          path?: string | null
          ref?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value_en: string | null
          value_fr: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value_en?: string | null
          value_fr?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value_en?: string | null
          value_fr?: string | null
        }
        Relationships: []
      }
      submit_attempts: {
        Row: {
          created_at: string
          id: number
          ip_hash: string
        }
        Insert: {
          created_at?: string
          id?: number
          ip_hash: string
        }
        Update: {
          created_at?: string
          id?: number
          ip_hash?: string
        }
        Relationships: []
      }
      tmp_transfer: {
        Row: {
          data: string
          part: number
        }
        Insert: {
          data: string
          part: number
        }
        Update: {
          data?: string
          part?: number
        }
        Relationships: []
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
      get_available_stock: {
        Args: { _end_date: string; _product_id: string; _start_date: string }
        Returns: number
      }
      get_available_stock_bulk: {
        Args: { _end_date: string; _product_ids: string[]; _start_date: string }
        Returns: {
          available: number
          product_id: string
        }[]
      }
      get_custom_public_pricing: {
        Args: never
        Returns: {
          from_price_ht: number
          lead_time_days: number
          piece: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
