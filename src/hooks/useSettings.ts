
import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { 
  profileService, 
  farmModulesService, 
  notificationService, 
  subscriptionService 
} from '@/services/settings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface NotificationSettingsType {
  email_enabled: boolean;
  sms_enabled: boolean;
  phone_number: string;
  maintenance_reminder_enabled?: boolean;
  stock_low_enabled?: boolean;
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
    phone_number: '',
    maintenance_reminder_enabled: true,
    stock_low_enabled: true
  });

  // Initial data loading
  useEffect(() => {
    if (!user?.id) return;
    
    let isMounted = true;
    
    const loadSettings = async () => {
      setLoading(true);
      try {
        // Get profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name, farm_id')
          .eq('id', user.id)
          .single();
        
        if (profileData && isMounted) {
          setProfile({
            full_name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
            email: user.email || ''
          });
          
          setFarmId(profileData.farm_id);
          
          // Load modules if we have a farm_id
          if (profileData.farm_id) {
            const modules = await farmModulesService.getFarmModules(profileData.farm_id);
            if (isMounted) {
              setEnabledModules(modules);
            }
          }
        }
        
        // Get notification settings
        const notificationData = await notificationService.getNotificationSettings(user.id);
        if (notificationData && isMounted) {
          setNotificationSettings({
            email_enabled: notificationData.email_enabled,
            sms_enabled: notificationData.sms_enabled,
            phone_number: notificationData.phone_number || '',
            maintenance_reminder_enabled: notificationData.maintenance_reminder_enabled,
            stock_low_enabled: notificationData.stock_low_enabled
          });
        }
      } catch (error) {
        logger.error('Error loading settings:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadSettings();
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Update profile
  const updateProfile = useCallback(async (fullName: string, email: string) => {
    if (!user?.id) return false;
    
    const result = await profileService.updateProfile(user.id, {
      full_name: fullName,
      email: email !== user.email ? email : undefined // Only update email if changed
    });
    
    if (result) {
      setProfile({ full_name: fullName, email });
      toast.success('Profil mis à jour avec succès');
    }
    
    return result;
  }, [user]);

  // Update password
  const updatePassword = useCallback(async (password: string) => {
    const result = await profileService.updatePassword(password);
    
    if (result) {
      toast.success('Mot de passe mis à jour avec succès');
    }
    
    return result;
  }, []);

  // Update enabled modules
  const updateModules = useCallback(async (modules: string[]) => {
    if (!farmId) return false;
    
    const result = await farmModulesService.updateFarmModules(farmId, modules);
    
    if (result) {
      setEnabledModules(modules);
      toast.success('Modules mis à jour avec succès');
    }
    
    return result;
  }, [farmId]);

  // Toggle a module (enable/disable)
  const toggleModule = useCallback(async (module: string, enabled: boolean) => {
    let newModules: string[];
    
    if (enabled) {
      newModules = [...enabledModules, module];
    } else {
      newModules = enabledModules.filter(m => m !== module);
    }
    
    return await updateModules(newModules);
  }, [enabledModules, updateModules]);

  // Update notification settings
  const updateNotifications = useCallback(async (settings: {
    email_enabled?: boolean;
    sms_enabled?: boolean;
    phone_number?: string;
    maintenance_reminder_enabled?: boolean;
    stock_low_enabled?: boolean;
  }) => {
    if (!user?.id) return false;
    
    const newSettings = {
      ...notificationSettings,
      ...settings
    };
    
    const result = await notificationService.updateNotificationSettings(user.id, newSettings);
    
    if (result) {
      setNotificationSettings(newSettings as NotificationSettingsType);
      toast.success('Paramètres de notification mis à jour avec succès');
    }
    
    return result;
  }, [user, notificationSettings]);

  // Create a Stripe session to manage subscription
  const manageSubscription = useCallback(async () => {
    const url = await subscriptionService.createStripePortalSession();
    
    if (url) {
      window.open(url, '_blank');
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
