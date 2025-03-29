
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

// Define the interface with an index signature to be compatible with Json
export interface NotificationPreferences {
  maintenance_reminders: {
    enabled: boolean;
    channels: string[];
    frequency: string;
  };
  equipment_status: {
    enabled: boolean;
    channels: string[];
  };
  inventory_alerts: {
    enabled: boolean;
    channels: string[];
    threshold: number;
  };
  intervention_updates: {
    enabled: boolean;
    channels: string[];
  };
  system_announcements: {
    enabled: boolean;
    channels: string[];
  };
  [key: string]: any; // Add an index signature to be compatible with Json
}

export interface NotificationSettings {
  id?: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notification_preferences: NotificationPreferences;
  created_at?: string;
  updated_at?: string;
}

export const useNotificationSettings = (userId: string) => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Default settings
  const defaultSettings: NotificationSettings = {
    user_id: userId,
    email_notifications: true,
    push_notifications: false,
    sms_notifications: false,
    notification_preferences: {
      maintenance_reminders: {
        enabled: true,
        channels: ['email'],
        frequency: 'daily'
      },
      equipment_status: {
        enabled: true,
        channels: ['email']
      },
      inventory_alerts: {
        enabled: true,
        channels: ['email'],
        threshold: 5
      },
      intervention_updates: {
        enabled: true,
        channels: ['email']
      },
      system_announcements: {
        enabled: true,
        channels: ['email']
      }
    }
  };

  // Fetch notification settings
  const fetchSettings = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If no settings exist, create default settings
        if (error.code === 'PGRST116') {
          setSettings(defaultSettings);
        } else {
          throw error;
        }
      } else {
        // Parse the notification preferences object with explicit conversion
        const parsedSettings: NotificationSettings = {
          ...data,
          notification_preferences: data.notification_preferences as unknown as NotificationPreferences
        };
        setSettings(parsedSettings);
      }
    } catch (err) {
      console.error('Error fetching notification settings:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setSettings(defaultSettings); // Use defaults in case of error
    } finally {
      setLoading(false);
    }
  };

  // Save notification settings
  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      setLoading(true);
      setError(null);

      // Check if settings already exist
      const { data: existingSettings } = await supabase
        .from('notification_settings')
        .select('id')
        .eq('user_id', userId)
        .single();

      let error;

      // Prepare data to send to Supabase
      const dataToSave = {
        email_notifications: newSettings.email_notifications,
        push_notifications: newSettings.push_notifications,
        sms_notifications: newSettings.sms_notifications,
        notification_preferences: newSettings.notification_preferences as unknown as Json
      };

      if (existingSettings) {
        // Update existing settings
        const { error: updateError } = await supabase
          .from('notification_settings')
          .update(dataToSave)
          .eq('user_id', userId);

        error = updateError;
      } else {
        // Insert new settings
        const { error: insertError } = await supabase
          .from('notification_settings')
          .insert({
            user_id: userId,
            ...dataToSave
          });

        error = insertError;
      }

      if (error) throw error;

      setSettings(newSettings);
      toast.success('Settings saved successfully');
      return true;
    } catch (err) {
      console.error('Error saving notification settings:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error('Failed to save settings');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reset to default settings
  const resetSettings = async () => {
    return await saveSettings(defaultSettings);
  };

  // Initialize settings
  useEffect(() => {
    if (userId) {
      fetchSettings();
    }
  }, [userId]);

  return {
    settings,
    loading,
    error,
    saveSettings,
    resetSettings,
    fetchSettings
  };
};
