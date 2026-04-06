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
      equipment: {
        Row: {
          category: string | null
          created_at: string
          farm_id: string | null
          id: number
          image: string | null
          last_wear_update: string | null
          location: string | null
          manufacturer: string | null
          model: string | null
          name: string
          notes: string | null
          owner_id: string
          purchase_date: string | null
          serial_number: string | null
          status: string | null
          type: string | null
          unite_d_usure: string | null
          updated_at: string
          valeur_actuelle: number | null
          year: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          farm_id?: string | null
          id?: number
          image?: string | null
          last_wear_update?: string | null
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          notes?: string | null
          owner_id: string
          purchase_date?: string | null
          serial_number?: string | null
          status?: string | null
          type?: string | null
          unite_d_usure?: string | null
          updated_at?: string
          valeur_actuelle?: number | null
          year?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          farm_id?: string | null
          id?: number
          image?: string | null
          last_wear_update?: string | null
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          owner_id?: string
          purchase_date?: string | null
          serial_number?: string | null
          status?: string | null
          type?: string | null
          unite_d_usure?: string | null
          updated_at?: string
          valeur_actuelle?: number | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      equipment_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          equipment_id: number
          id: number
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          equipment_id: number
          id?: number
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          equipment_id?: number
          id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_logs_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_maintenance_schedule: {
        Row: {
          completed_date: string | null
          created_at: string
          description: string | null
          due_date: string | null
          equipment_id: number
          id: number
          priority: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          equipment_id: number
          id?: number
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          equipment_id?: number
          id?: number
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_maintenance_schedule_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_photos: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number | null
          equipment_id: number
          id: string
          is_primary: boolean | null
          photo_url: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number | null
          equipment_id: number
          id?: string
          is_primary?: boolean | null
          photo_url: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number | null
          equipment_id?: number
          id?: string
          is_primary?: boolean | null
          photo_url?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_photos_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_qrcodes: {
        Row: {
          active: boolean | null
          created_at: string
          equipment_id: number
          id: string
          last_scanned: string | null
          qr_code_hash: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          equipment_id: number
          id?: string
          last_scanned?: string | null
          qr_code_hash: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          equipment_id?: number
          id?: string
          last_scanned?: string | null
          qr_code_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_qrcodes_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_types: {
        Row: {
          created_at: string
          farm_id: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          farm_id?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          farm_id?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_types_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_members: {
        Row: {
          created_at: string
          farm_id: string
          id: string
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          farm_id: string
          id?: string
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          farm_id?: string
          id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_members_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_settings: {
        Row: {
          created_at: string
          farm_id: string
          id: string
          show_fuel_log: boolean | null
          show_maintenance: boolean | null
          show_parts: boolean | null
          show_time_tracking: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          farm_id: string
          id?: string
          show_fuel_log?: boolean | null
          show_maintenance?: boolean | null
          show_parts?: boolean | null
          show_time_tracking?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          farm_id?: string
          id?: string
          show_fuel_log?: boolean | null
          show_maintenance?: boolean | null
          show_parts?: boolean | null
          show_time_tracking?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_settings_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: true
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location: string | null
          name: string
          owner_id: string
          size: number | null
          size_unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name: string
          owner_id: string
          size?: number | null
          size_unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          owner_id?: string
          size?: number | null
          size_unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fuel_logs: {
        Row: {
          created_at: string
          created_by: string | null
          date: string
          equipment_id: number
          farm_id: string | null
          fuel_quantity_liters: number
          hours_at_fillup: number | null
          id: string
          notes: string | null
          price_per_liter: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date: string
          equipment_id: number
          farm_id?: string | null
          fuel_quantity_liters: number
          hours_at_fillup?: number | null
          id?: string
          notes?: string | null
          price_per_liter?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date?: string
          equipment_id?: number
          farm_id?: string | null
          fuel_quantity_liters?: number
          hours_at_fillup?: number | null
          id?: string
          notes?: string | null
          price_per_liter?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fuel_logs_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_logs_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      interventions: {
        Row: {
          coordinates: Json | null
          created_at: string
          date: string | null
          description: string | null
          duration: number | null
          equipment: string | null
          equipment_id: number | null
          id: number
          location: string | null
          notes: string | null
          owner_id: string | null
          priority: string | null
          scheduledDuration: number | null
          status: string | null
          technician: string | null
          title: string
          updated_at: string
        }
        Insert: {
          coordinates?: Json | null
          created_at?: string
          date?: string | null
          description?: string | null
          duration?: number | null
          equipment?: string | null
          equipment_id?: number | null
          id?: number
          location?: string | null
          notes?: string | null
          owner_id?: string | null
          priority?: string | null
          scheduledDuration?: number | null
          status?: string | null
          technician?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          coordinates?: Json | null
          created_at?: string
          date?: string | null
          description?: string | null
          duration?: number | null
          equipment?: string | null
          equipment_id?: number | null
          id?: number
          location?: string | null
          notes?: string | null
          owner_id?: string | null
          priority?: string | null
          scheduledDuration?: number | null
          status?: string | null
          technician?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interventions_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string | null
          farm_id: string
          id: string
          invited_by: string | null
          role: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string | null
          farm_id: string
          id?: string
          invited_by?: string | null
          role?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string | null
          farm_id?: string
          id?: string
          invited_by?: string | null
          role?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          coordinates: Json | null
          created_at: string
          description: string | null
          farm_id: string | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          coordinates?: Json | null
          created_at?: string
          description?: string | null
          farm_id?: string | null
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          coordinates?: Json | null
          created_at?: string
          description?: string | null
          farm_id?: string | null
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_plans: {
        Row: {
          active: boolean | null
          assigned_to: string | null
          created_at: string
          description: string | null
          engine_hours: number | null
          equipment_id: number | null
          equipment_name: string | null
          frequency: string | null
          id: number
          interval: number | null
          last_performed_date: string | null
          next_due_date: string
          owner_id: string | null
          priority: string | null
          title: string
          trigger_hours: number | null
          trigger_kilometers: number | null
          trigger_unit: string | null
          type: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          engine_hours?: number | null
          equipment_id?: number | null
          equipment_name?: string | null
          frequency?: string | null
          id?: number
          interval?: number | null
          last_performed_date?: string | null
          next_due_date: string
          owner_id?: string | null
          priority?: string | null
          title: string
          trigger_hours?: number | null
          trigger_kilometers?: number | null
          trigger_unit?: string | null
          type?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          engine_hours?: number | null
          equipment_id?: number | null
          equipment_name?: string | null
          frequency?: string | null
          id?: number
          interval?: number | null
          last_performed_date?: string | null
          next_due_date?: string
          owner_id?: string | null
          priority?: string | null
          title?: string
          trigger_hours?: number | null
          trigger_kilometers?: number | null
          trigger_unit?: string | null
          type?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_plans_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_tasks: {
        Row: {
          actual_duration: number | null
          assigned_to: string | null
          completed_at_hours: number | null
          completed_at_km: number | null
          completed_date: string | null
          created_at: string
          due_date: string
          equipment: string | null
          equipment_id: number | null
          estimated_duration: number | null
          id: number
          is_recurrent: boolean | null
          notes: string | null
          owner_id: string
          priority: string | null
          recurrence_interval: number | null
          recurrence_unit: string | null
          status: string | null
          technician: string | null
          title: string
          trigger_hours: number | null
          trigger_kilometers: number | null
          trigger_unit: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          actual_duration?: number | null
          assigned_to?: string | null
          completed_at_hours?: number | null
          completed_at_km?: number | null
          completed_date?: string | null
          created_at?: string
          due_date: string
          equipment?: string | null
          equipment_id?: number | null
          estimated_duration?: number | null
          id?: number
          is_recurrent?: boolean | null
          notes?: string | null
          owner_id: string
          priority?: string | null
          recurrence_interval?: number | null
          recurrence_unit?: string | null
          status?: string | null
          technician?: string | null
          title: string
          trigger_hours?: number | null
          trigger_kilometers?: number | null
          trigger_unit?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          actual_duration?: number | null
          assigned_to?: string | null
          completed_at_hours?: number | null
          completed_at_km?: number | null
          completed_date?: string | null
          created_at?: string
          due_date?: string
          equipment?: string | null
          equipment_id?: number | null
          estimated_duration?: number | null
          id?: number
          is_recurrent?: boolean | null
          notes?: string | null
          owner_id?: string
          priority?: string | null
          recurrence_interval?: number | null
          recurrence_unit?: string | null
          status?: string | null
          technician?: string | null
          title?: string
          trigger_hours?: number | null
          trigger_kilometers?: number | null
          trigger_unit?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_tasks_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturers: {
        Row: {
          created_at: string
          farm_id: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          farm_id?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          farm_id?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "manufacturers_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string
          email_notifications: boolean | null
          id: string
          maintenance_reminder_enabled: boolean | null
          notification_preferences: Json | null
          push_notifications: boolean | null
          sms_notifications: boolean | null
          stock_low_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          maintenance_reminder_enabled?: boolean | null
          notification_preferences?: Json | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          stock_low_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          maintenance_reminder_enabled?: boolean | null
          notification_preferences?: Json | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          stock_low_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string | null
          read: boolean | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string | null
          read?: boolean | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string | null
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      parts_inventory: {
        Row: {
          category: string | null
          compatible_with: string[] | null
          created_at: string
          farm_id: string | null
          id: number
          image_url: string | null
          location: string | null
          name: string
          owner_id: string
          part_number: string | null
          quantity: number | null
          reorder_threshold: number | null
          supplier: string | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          compatible_with?: string[] | null
          created_at?: string
          farm_id?: string | null
          id?: number
          image_url?: string | null
          location?: string | null
          name: string
          owner_id: string
          part_number?: string | null
          quantity?: number | null
          reorder_threshold?: number | null
          supplier?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          compatible_with?: string[] | null
          created_at?: string
          farm_id?: string | null
          id?: number
          image_url?: string | null
          location?: string | null
          name?: string
          owner_id?: string
          part_number?: string | null
          quantity?: number | null
          reorder_threshold?: number | null
          supplier?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parts_inventory_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      parts_withdrawals: {
        Row: {
          comment: string | null
          created_at: string
          custom_reason: string | null
          id: string
          intervention_id: number | null
          part_id: number
          quantity: number
          reason: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          custom_reason?: string | null
          id?: string
          intervention_id?: number | null
          part_id: number
          quantity: number
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          custom_reason?: string | null
          id?: string
          intervention_id?: number | null
          part_id?: number
          quantity?: number
          reason?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parts_withdrawals_intervention_id_fkey"
            columns: ["intervention_id"]
            isOneToOne: false
            referencedRelation: "interventions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_withdrawals_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      planning_category_importance: {
        Row: {
          category: string
          created_at: string
          farm_id: string
          id: string
          importance: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          farm_id: string
          id?: string
          importance?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          farm_id?: string
          id?: string
          importance?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planning_category_importance_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      planning_tasks: {
        Row: {
          animal_group: string | null
          assigned_to: string | null
          building_name: string | null
          category: string
          computed_priority: string
          created_at: string
          created_by: string
          due_date: string
          equipment_id: number | null
          farm_id: string
          field_name: string | null
          id: string
          manual_priority: string | null
          notes: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          animal_group?: string | null
          assigned_to?: string | null
          building_name?: string | null
          category?: string
          computed_priority?: string
          created_at?: string
          created_by: string
          due_date?: string
          equipment_id?: number | null
          farm_id: string
          field_name?: string | null
          id?: string
          manual_priority?: string | null
          notes?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          animal_group?: string | null
          assigned_to?: string | null
          building_name?: string | null
          category?: string
          computed_priority?: string
          created_at?: string
          created_by?: string
          due_date?: string
          equipment_id?: number | null
          farm_id?: string
          field_name?: string | null
          id?: string
          manual_priority?: string | null
          notes?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planning_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planning_tasks_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planning_tasks_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          farm_id: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          farm_id?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          farm_id?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_locations: {
        Row: {
          created_at: string
          description: string | null
          farm_id: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          farm_id?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          farm_id?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "storage_locations_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
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
      task_types: {
        Row: {
          affecte_compteur: boolean | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          affecte_compteur?: boolean | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          affecte_compteur?: boolean | null
          created_at?: string
          id?: string
          name?: string
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
          role: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          farm_id: string
          id?: string
          name: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          farm_id?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string | null
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
      time_sessions: {
        Row: {
          coordinates: Json | null
          created_at: string
          custom_task_type: string | null
          description: string | null
          duration: number | null
          end_time: string | null
          equipment_id: number | null
          id: string
          intervention_id: number | null
          journee_id: string | null
          location: string | null
          notes: string | null
          poste_travail: string | null
          start_time: string
          status: string | null
          task_type_id: string | null
          technician: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          coordinates?: Json | null
          created_at?: string
          custom_task_type?: string | null
          description?: string | null
          duration?: number | null
          end_time?: string | null
          equipment_id?: number | null
          id?: string
          intervention_id?: number | null
          journee_id?: string | null
          location?: string | null
          notes?: string | null
          poste_travail?: string | null
          start_time?: string
          status?: string | null
          task_type_id?: string | null
          technician?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          coordinates?: Json | null
          created_at?: string
          custom_task_type?: string | null
          description?: string | null
          duration?: number | null
          end_time?: string | null
          equipment_id?: number | null
          id?: string
          intervention_id?: number | null
          journee_id?: string | null
          location?: string | null
          notes?: string | null
          poste_travail?: string | null
          start_time?: string
          status?: string | null
          task_type_id?: string | null
          technician?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_sessions_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_sessions_intervention_id_fkey"
            columns: ["intervention_id"]
            isOneToOne: false
            referencedRelation: "interventions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_sessions_task_type_id_fkey"
            columns: ["task_type_id"]
            isOneToOne: false
            referencedRelation: "task_types"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_part_stock: {
        Args: { p_part_id: number; p_quantity: number }
        Returns: undefined
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      ensure_default_category_importance: {
        Args: { _farm_id: string }
        Returns: undefined
      }
      is_farm_member: { Args: { _farm_id: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      owns_equipment: { Args: { _equipment_id: number }; Returns: boolean }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
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
