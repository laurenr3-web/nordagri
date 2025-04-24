
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotificationSettings {
  email_enabled: boolean;
  sms_enabled: boolean;
  phone_number?: string;
}

export const notificationService = {
  async getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        const phoneNumber = data.notification_preferences && 
          typeof data.notification_preferences === 'object' ? 
          (data.notification_preferences as any).phone_number || '' : '';
          
        return {
          email_enabled: data.email_notifications,
          sms_enabled: data.sms_notifications,
          phone_number: phoneNumber
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres de notification:', error);
      return null;
    }
  },

  async updateNotificationSettings(userId: string, settings: NotificationSettings): Promise<boolean> {
    try {
      const notificationPrefs = {
        phone_number: settings.phone_number || '',
        updated_at: new Date().toISOString()
      };
      
      // D'abord vérifier si une entrée existe déjà pour cet utilisateur
      const { data: existingSettings } = await supabase
        .from('notification_settings')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (existingSettings) {
        const { error } = await supabase
          .from('notification_settings')
          .update({
            email_notifications: settings.email_enabled,
            sms_notifications: settings.sms_enabled,
            push_notifications: false,
            notification_preferences: notificationPrefs,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notification_settings')
          .insert({
            user_id: userId,
            email_notifications: settings.email_enabled,
            sms_notifications: settings.sms_enabled,
            push_notifications: false,
            notification_preferences: notificationPrefs,
            updated_at: new Date().toISOString(),
            stock_low_enabled: true,
            maintenance_reminder_enabled: true
          });
        
        if (error) throw error;
      }
      
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour des paramètres de notification:', error);
      toast.error(`Erreur: ${error.message || 'Impossible de mettre à jour les paramètres'}`);
      return false;
    }
  }
};
