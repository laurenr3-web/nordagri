
import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { settingsService } from '@/services/settingsService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotificationSettingsType {
  email_enabled: boolean;
  sms_enabled: boolean;
  phone_number: string;
}

export function useSettings() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    full_name: string;
    email: string;
  }>({ full_name: '', email: '' });
  const [farmId, setFarmId] = useState<string | null>(null);
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsType>({
    email_enabled: true,
    sms_enabled: false,
    phone_number: ''
  });

  // Chargement initial des données
  useEffect(() => {
    if (!user?.id) return;
    
    const loadSettings = async () => {
      setLoading(true);
      try {
        // Récupérer le profil
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name, farm_id')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setProfile({
            full_name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
            email: user.email || ''
          });
          
          setFarmId(profileData.farm_id);
          
          // Charger les modules si on a un farm_id
          if (profileData.farm_id) {
            const modules = await settingsService.getFarmModules(profileData.farm_id);
            setEnabledModules(modules);
          }
        }
        
        // Récupérer les paramètres de notification
        const notificationData = await settingsService.getNotificationSettings(user.id);
        if (notificationData) {
          setNotificationSettings({
            email_enabled: notificationData.email_enabled,
            sms_enabled: notificationData.sms_enabled,
            phone_number: notificationData.phone_number || ''
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [user]);

  // Mettre à jour le profil
  const updateProfile = useCallback(async (fullName: string, email: string) => {
    if (!user?.id) return false;
    
    const result = await settingsService.updateProfile(user.id, {
      full_name: fullName,
      email: email !== user.email ? email : undefined // Mettre à jour l'email seulement si modifié
    });
    
    if (result) {
      setProfile({ full_name: fullName, email });
      toast.success('Profil mis à jour avec succès');
    }
    
    return result;
  }, [user]);

  // Mettre à jour le mot de passe
  const updatePassword = useCallback(async (password: string) => {
    const result = await settingsService.updatePassword(password);
    
    if (result) {
      toast.success('Mot de passe mis à jour avec succès');
    }
    
    return result;
  }, []);

  // Mettre à jour les modules activés
  const updateModules = useCallback(async (modules: string[]) => {
    if (!farmId) return false;
    
    const result = await settingsService.updateFarmModules(farmId, modules);
    
    if (result) {
      setEnabledModules(modules);
      toast.success('Modules mis à jour avec succès');
    }
    
    return result;
  }, [farmId]);

  // Basculer un module (activer/désactiver)
  const toggleModule = useCallback(async (module: string, enabled: boolean) => {
    let newModules: string[];
    
    if (enabled) {
      newModules = [...enabledModules, module];
    } else {
      newModules = enabledModules.filter(m => m !== module);
    }
    
    return await updateModules(newModules);
  }, [enabledModules, updateModules]);

  // Mettre à jour les paramètres de notification
  const updateNotifications = useCallback(async (settings: {
    email_enabled?: boolean;
    sms_enabled?: boolean;
    phone_number?: string;
  }) => {
    if (!user?.id) return false;
    
    const newSettings = {
      ...notificationSettings,
      ...settings
    };
    
    const result = await settingsService.updateNotificationSettings(user.id, newSettings);
    
    if (result) {
      setNotificationSettings(newSettings as NotificationSettingsType);
      toast.success('Paramètres de notification mis à jour avec succès');
    }
    
    return result;
  }, [user, notificationSettings]);

  // Créer une session Stripe pour gérer l'abonnement
  const manageSubscription = useCallback(async () => {
    const url = await settingsService.createStripePortalSession();
    
    if (url) {
      window.location.href = url;
      return true;
    }
    
    return false;
  }, []);

  return {
    loading,
    profile,
    enabledModules,
    notificationSettings,
    updateProfile,
    updatePassword,
    updateModules,
    toggleModule,
    updateNotifications,
    manageSubscription
  };
}
