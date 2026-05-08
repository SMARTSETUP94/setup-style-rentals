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
          customer_name: string
          delivery_fee: number
          delivery_time: string | null
          email: string
          event_date: string | null
          event_location: string | null
          id: string
          items: Json
          logistics_notes: string | null
          message: string | null
          phone: string | null
          pickup_fee: number
          pickup_time: string | null
          setup_fee: number
          status: string
          subtotal_ht: number
          total_deposit: number
          total_ht: number
          total_ttc: number
          updated_at: string
          vat: number
        }
        Insert: {
          company?: string | null
          created_at?: string
          customer_name: string
          delivery_fee?: number
          delivery_time?: string | null
          email: string
          event_date?: string | null
          event_location?: string | null
          id?: string
          items?: Json
          logistics_notes?: string | null
          message?: string | null
          phone?: string | null
          pickup_fee?: number
          pickup_time?: string | null
          setup_fee?: number
          status?: string
          subtotal_ht?: number
          total_deposit?: number
          total_ht?: number
          total_ttc?: number
          updated_at?: string
          vat?: number
        }
        Update: {
          company?: string | null
          created_at?: string
          customer_name?: string
          delivery_fee?: number
          delivery_time?: string | null
          email?: string
          event_date?: string | null
          event_location?: string | null
          id?: string
          items?: Json
          logistics_notes?: string | null
          message?: string | null
          phone?: string | null
          pickup_fee?: number
          pickup_time?: string | null
          setup_fee?: number
          status?: string
          subtotal_ht?: number
          total_deposit?: number
          total_ht?: number
          total_ttc?: number
          updated_at?: string
          vat?: number
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
      app_role: ["admin", "user"],
    },
  },
} as const
