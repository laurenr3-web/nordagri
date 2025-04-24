
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

interface FarmModules {
  enabled_modules: string[];
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
      const { data, error } = await supabase
        .from('farms')
        .select('enabled_modules')
        .eq('id', farmId)
        .single();
      
      if (error) throw error;
      
      return data?.enabled_modules || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des modules:', error);
      return [];
    }
  },
  
  /**
   * Met à jour les modules activés pour une ferme
   * @param farmId ID de la ferme
   * @param modules Modules activés
   */
  async updateFarmModules(farmId: string, modules: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('farms')
        .update({ enabled_modules: modules })
        .eq('id', farmId);
      
      if (error) throw error;
      
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
        return {
          email_enabled: data.email_notifications,
          sms_enabled: data.sms_notifications,
          phone_number: data.notification_preferences?.phone_number || ''
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
