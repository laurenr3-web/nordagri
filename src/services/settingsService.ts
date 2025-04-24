
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileUpdateData {
  full_name?: string;
  email?: string;
}

interface NotificationSettings {
  email_enabled: boolean;
  sms_enabled: boolean;
  phone_number?: string;
}

/**
 * Service pour gérer les opérations liées aux paramètres utilisateur
 */
export const settingsService = {
  /**
   * Met à jour le profil utilisateur
   * @param userId ID de l'utilisateur
   * @param data Données à mettre à jour
   */
  async updateProfile(userId: string, data: ProfileUpdateData): Promise<boolean> {
    try {
      // Mettre à jour l'email dans Auth si nécessaire
      if (data.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: data.email,
        });
        
        if (authError) throw authError;
      }
      
      // Mettre à jour le profil dans la table profiles
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.full_name?.split(' ')[0] || '',
          last_name: data.full_name?.split(' ').slice(1).join(' ') || ''
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error(`Erreur: ${error.message || 'Impossible de mettre à jour le profil'}`);
      return false;
    }
  },
  
  /**
   * Met à jour le mot de passe utilisateur
   * @param newPassword Nouveau mot de passe
   */
  async updatePassword(newPassword: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      toast.error(`Erreur: ${error.message || 'Impossible de mettre à jour le mot de passe'}`);
      return false;
    }
  },
  
  /**
   * Récupère les modules activés pour une ferme
   * @param farmId ID de la ferme
   */
  async getFarmModules(farmId: string): Promise<string[]> {
    try {
      // D'abord, vérifions si la ferme utilise la table farm_settings
      const { data: farmSettingsData, error: farmSettingsError } = await supabase
        .from('farm_settings')
        .select('*')
        .eq('farm_id', farmId)
        .single();
      
      if (!farmSettingsError && farmSettingsData) {
        // Créer un tableau basé sur les modules activés dans farm_settings
        const modules: string[] = [];
        if (farmSettingsData.show_maintenance) modules.push('maintenance');
        if (farmSettingsData.show_parts) modules.push('parts');
        if (farmSettingsData.show_time_tracking) modules.push('time-tracking');
        if (farmSettingsData.show_fuel_log) modules.push('fuel');
        
        return modules;
      }
      
      // Essayons un autre endpoint pour la ferme
      const { data: farmData, error: farmError } = await supabase
        .from('farms')
        .select('api_equipment_enabled, api_time_entries_enabled, api_fuel_logs_enabled, api_inventory_sync_enabled')
        .eq('id', farmId)
        .single();
      
      if (!farmError && farmData) {
        // Créer un tableau basé sur les API activées
        const modules: string[] = [];
        if (farmData.api_equipment_enabled) modules.push('maintenance');
        if (farmData.api_inventory_sync_enabled) modules.push('parts');
        if (farmData.api_time_entries_enabled) modules.push('time-tracking');
        if (farmData.api_fuel_logs_enabled) modules.push('fuel');
        
        return modules;
      }
      
      return ['maintenance', 'parts', 'time-tracking', 'fuel']; // valeurs par défaut si rien n'est trouvé
      
    } catch (error) {
      console.error('Erreur lors de la récupération des modules:', error);
      return ['maintenance', 'parts', 'time-tracking', 'fuel']; // valeurs par défaut en cas d'erreur
    }
  },
  
  /**
   * Met à jour les modules activés pour une ferme
   * @param farmId ID de la ferme
   * @param modules Modules activés
   */
  async updateFarmModules(farmId: string, modules: string[]): Promise<boolean> {
    try {
      // D'abord vérifier si nous avons farm_settings
      const { data: farmSettingsData } = await supabase
        .from('farm_settings')
        .select('*')
        .eq('farm_id', farmId)
        .single();
      
      if (farmSettingsData) {
        // Mettre à jour farm_settings
        const { error } = await supabase
          .from('farm_settings')
          .update({
            show_maintenance: modules.includes('maintenance'),
            show_parts: modules.includes('parts'),
            show_time_tracking: modules.includes('time-tracking'),
            show_fuel_log: modules.includes('fuel')
          })
          .eq('farm_id', farmId);
        
        if (error) throw error;
      } else {
        // Créer une nouvelle entrée farm_settings
        const { error } = await supabase
          .from('farm_settings')
          .insert({
            farm_id: farmId,
            show_maintenance: modules.includes('maintenance'),
            show_parts: modules.includes('parts'),
            show_time_tracking: modules.includes('time-tracking'),
            show_fuel_log: modules.includes('fuel')
          });
        
        if (error) throw error;
      }
      
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour des modules:', error);
      toast.error(`Erreur: ${error.message || 'Impossible de mettre à jour les modules'}`);
      return false;
    }
  },
  
  /**
   * Récupère les paramètres de notification pour un utilisateur
   * @param userId ID de l'utilisateur
   */
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
  
  /**
   * Met à jour les paramètres de notification pour un utilisateur
   * @param userId ID de l'utilisateur
   * @param settings Paramètres de notification
   */
  async updateNotificationSettings(userId: string, settings: NotificationSettings): Promise<boolean> {
    try {
      // Préparer les données de notification
      const notificationPrefs = {
        phone_number: settings.phone_number || '',
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: userId,
          email_notifications: settings.email_enabled,
          sms_notifications: settings.sms_enabled,
          push_notifications: false,
          notification_preferences: notificationPrefs,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour des paramètres de notification:', error);
      toast.error(`Erreur: ${error.message || 'Impossible de mettre à jour les paramètres'}`);
      return false;
    }
  },
  
  /**
   * Crée une session pour le portail client Stripe
   */
  async createStripePortalSession(): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: {}
      });
      
      if (error) throw error;
      
      return data?.url || null;
    } catch (error: any) {
      console.error('Erreur lors de la création de la session Stripe:', error);
      toast.error(`Erreur: ${error.message || 'Impossible de créer la session Stripe'}`);
      return null;
    }
  }
};
