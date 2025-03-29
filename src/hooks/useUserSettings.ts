
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserSettings {
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  high_contrast: boolean;
  animations_enabled: boolean;
  default_layout: 'grid' | 'list' | 'compact';
  notification_email: boolean;
  notification_push: boolean;
  notification_sms: boolean;
  widget_preferences: Record<string, { enabled: boolean; priority: 'high' | 'medium' | 'low' }>;
  language: string;
  date_format: string;
  time_format: string;
  units_system: 'metric' | 'imperial';
}

export const useUserSettings = (userId: string) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Default settings
  const defaultSettings: UserSettings = {
    user_id: userId,
    theme: 'system',
    high_contrast: false,
    animations_enabled: true,
    default_layout: 'grid',
    notification_email: true,
    notification_push: false,
    notification_sms: false,
    widget_preferences: {
      'equipment-status': { enabled: true, priority: 'high' },
      'maintenance-tasks': { enabled: true, priority: 'high' },
      'parts-inventory': { enabled: true, priority: 'medium' },
      'weather': { enabled: false, priority: 'low' },
      'analytics': { enabled: false, priority: 'medium' }
    },
    language: 'fr',
    date_format: 'DD/MM/YYYY',
    time_format: '24h',
    units_system: 'metric'
  };

  // Fetch user settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If no settings exist, create default settings
        if (error.code === 'PGRST116') {
          const newSettings = defaultSettings;
          await saveSettings(newSettings);
          setSettings(newSettings);
        } else {
          throw error;
        }
      } else {
        setSettings(data);
      }
    } catch (err) {
      console.error('Error fetching user settings:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setSettings(defaultSettings); // Use defaults in case of error
    } finally {
      setLoading(false);
    }
  };

  // Save user settings
  const saveSettings = async (newSettings: UserSettings) => {
    try {
      setLoading(true);
      setError(null);

      // Check if settings already exist
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', userId)
        .single();

      let error;

      if (existingSettings) {
        // Update existing settings
        const { error: updateError } = await supabase
          .from('user_settings')
          .update(newSettings)
          .eq('user_id', userId);

        error = updateError;
      } else {
        // Insert new settings
        const { error: insertError } = await supabase
          .from('user_settings')
          .insert(newSettings);

        error = insertError;
      }

      if (error) throw error;

      setSettings(newSettings);
      toast.success('Settings saved successfully');
      return true;
    } catch (err) {
      console.error('Error saving user settings:', err);
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
