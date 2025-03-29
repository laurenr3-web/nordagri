export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      equipment: {
        Row: {
          category: string | null
          created_at: string | null
          id: number
          image: string | null
          location: string | null
          manufacturer: string | null
          model: string | null
          name: string
          notes: string | null
          owner_id: string | null
          purchase_date: string | null
          serial_number: string | null
          status: string | null
          type: string | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: number
          image?: string | null
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          notes?: string | null
          owner_id?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: number
          image?: string | null
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          owner_id?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: []
      }
      equipment_documents: {
        Row: {
          content_type: string | null
          equipment_id: string | null
          file_name: string
          file_path: string
          id: string
          metadata: Json | null
          size_bytes: number | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          content_type?: string | null
          equipment_id?: string | null
          file_name: string
          file_path: string
          id?: string
          metadata?: Json | null
          size_bytes?: number | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          content_type?: string | null
          equipment_id?: string | null
          file_name?: string
          file_path?: string
          id?: string
          metadata?: Json | null
          size_bytes?: number | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_documents_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
        ]
      }
      equipments: {
        Row: {
          acquisition_date: string | null
          created_at: string | null
          current_hours: number | null
          id: string
          metadata: Json | null
          name: string
          owner_id: string | null
          serial_number: string | null
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          acquisition_date?: string | null
          created_at?: string | null
          current_hours?: number | null
          id?: string
          metadata?: Json | null
          name: string
          owner_id?: string | null
          serial_number?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          acquisition_date?: string | null
          created_at?: string | null
          current_hours?: number | null
          id?: string
          metadata?: Json | null
          name?: string
          owner_id?: string | null
          serial_number?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      farms: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string
          default_currency: string | null
          description: string | null
          email: string | null
          id: string
          location: string | null
          name: string
          owner_id: string
          phone: string | null
          registration_number: string | null
          size: number | null
          size_unit: string | null
          updated_at: string
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          default_currency?: string | null
          description?: string | null
          email?: string | null
          id?: string
          location?: string | null
          name: string
          owner_id: string
          phone?: string | null
          registration_number?: string | null
          size?: number | null
          size_unit?: string | null
          updated_at?: string
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          default_currency?: string | null
          description?: string | null
          email?: string | null
          id?: string
          location?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          registration_number?: string | null
          size?: number | null
          size_unit?: string | null
          updated_at?: string
          vat_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      interventions: {
        Row: {
          coordinates: Json | null
          created_at: string | null
          date: string
          description: string | null
          duration: number | null
          equipment: string
          equipment_id: number
          id: number
          location: string
          notes: string | null
          owner_id: string | null
          parts_used: Json | null
          priority: string
          scheduled_duration: number | null
          status: string
          technician: string
          title: string
          updated_at: string | null
        }
        Insert: {
          coordinates?: Json | null
          created_at?: string | null
          date: string
          description?: string | null
          duration?: number | null
          equipment: string
          equipment_id: number
          id?: never
          location: string
          notes?: string | null
          owner_id?: string | null
          parts_used?: Json | null
          priority: string
          scheduled_duration?: number | null
          status: string
          technician: string
          title: string
          updated_at?: string | null
        }
        Update: {
          coordinates?: Json | null
          created_at?: string | null
          date?: string
          description?: string | null
          duration?: number | null
          equipment?: string
          equipment_id?: number
          id?: never
          location?: string
          notes?: string | null
          owner_id?: string | null
          parts_used?: Json | null
          priority?: string
          scheduled_duration?: number | null
          status?: string
          technician?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      maintenance_records: {
        Row: {
          completed: boolean | null
          cost: number | null
          created_at: string | null
          description: string | null
          hours_at_maintenance: number | null
          id: string
          maintenance_type: string
          performed_at: string | null
          technician_id: string | null
          title: string | null
        }
        Insert: {
          completed?: boolean | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          hours_at_maintenance?: number | null
          id?: string
          maintenance_type: string
          performed_at?: string | null
          technician_id?: string | null
          title?: string | null
        }
        Update: {
          completed?: boolean | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          hours_at_maintenance?: number | null
          id?: string
          maintenance_type?: string
          performed_at?: string | null
          technician_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_title_fkey"
            columns: ["title"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_tasks: {
        Row: {
          actual_duration: number | null
          assigned_to: string | null
          completed_date: string | null
          created_at: string | null
          due_date: string | null
          equipment: string
          equipment_id: number
          estimated_duration: number | null
          id: number
          notes: string | null
          owner_id: string | null
          priority: string
          status: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          actual_duration?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string | null
          due_date?: string | null
          equipment: string
          equipment_id: number
          estimated_duration?: number | null
          id?: number
          notes?: string | null
          owner_id?: string | null
          priority: string
          status: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          actual_duration?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string | null
          due_date?: string | null
          equipment?: string
          equipment_id?: number
          estimated_duration?: number | null
          id?: number
          notes?: string | null
          owner_id?: string | null
          priority?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      parts_inventory: {
        Row: {
          category: string | null
          compatible_with: string[] | null
          created_at: string | null
          id: number
          image_url: string | null
          last_ordered: string | null
          location: string | null
          name: string
          owner_id: string | null
          part_number: string | null
          quantity: number
          reorder_threshold: number | null
          supplier: string | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          compatible_with?: string[] | null
          created_at?: string | null
          id?: number
          image_url?: string | null
          last_ordered?: string | null
          location?: string | null
          name: string
          owner_id?: string | null
          part_number?: string | null
          quantity: number
          reorder_threshold?: number | null
          supplier?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          compatible_with?: string[] | null
          created_at?: string | null
          id?: number
          image_url?: string | null
          last_ordered?: string | null
          location?: string | null
          name?: string
          owner_id?: string | null
          part_number?: string | null
          quantity?: number
          reorder_threshold?: number | null
          supplier?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          email: string | null
          farm_id: string
          id: string
          name: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          farm_id: string
          id?: string
          name: string
          phone?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          farm_id?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          animations_enabled: boolean
          created_at: string
          date_format: string
          default_layout: string
          high_contrast: boolean
          id: string
          language: string
          notification_email: boolean
          notification_push: boolean
          notification_sms: boolean
          theme: string
          units_system: string
          updated_at: string
          user_id: string
          widget_preferences: Json
        }
        Insert: {
          animations_enabled?: boolean
          created_at?: string
          date_format?: string
          default_layout?: string
          high_contrast?: boolean
          id?: string
          language?: string
          notification_email?: boolean
          notification_push?: boolean
          notification_sms?: boolean
          theme?: string
          units_system?: string
          updated_at?: string
          user_id: string
          widget_preferences?: Json
        }
        Update: {
          animations_enabled?: boolean
          created_at?: string
          date_format?: string
          default_layout?: string
          high_contrast?: boolean
          id?: string
          language?: string
          notification_email?: boolean
          notification_push?: boolean
          notification_sms?: boolean
          theme?: string
          units_system?: string
          updated_at?: string
          user_id?: string
          widget_preferences?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_db_documentation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_equipment_statistics: {
        Args: {
          p_equipment_id: string
        }
        Returns: {
          total_maintenance_cost: number
          maintenance_count: number
          average_days_between_maintenance: number
        }[]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
