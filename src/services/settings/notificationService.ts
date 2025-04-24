
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotificationSettings {
  email_enabled: boolean;
  sms_enabled: boolean;
  phone_number?: string;
  maintenance_reminder_enabled?: boolean;
  stock_low_enabled?: boolean;
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
          phone_number: phoneNumber,
          maintenance_reminder_enabled: data.maintenance_reminder_enabled,
          stock_low_enabled: data.stock_low_enabled
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
            maintenance_reminder_enabled: settings.maintenance_reminder_enabled,
            stock_low_enabled: settings.stock_low_enabled,
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
            maintenance_reminder_enabled: settings.maintenance_reminder_enabled ?? true,
            stock_low_enabled: settings.stock_low_enabled ?? true,
            updated_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }

      toast.success('✅ Notifications mises à jour avec succès');
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour des paramètres de notification:', error);
      toast.error(`Erreur: ${error.message || 'Impossible de mettre à jour les paramètres'}`);
      return false;
    }
  },

  async triggerManualAlertCheck(): Promise<boolean> {
    try {
      // Récupérer l'API key depuis un stockage sécurisé ou une variable d'environnement
      // Pour ce cas d'utilisation, on pourrait utiliser un système de jeton temporaire
      // généré par le backend

      const response = await supabase.functions.invoke('send-alerts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_NOTIFICATIONS_API_KEY || 'test-api-key'}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('✅ Vérification des alertes déclenchée');
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la vérification des alertes:', error);
      toast.error(`Erreur: ${error.message || 'Impossible de vérifier les alertes'}`);
      return false;
    }
  }
};
