
import { useState, useCallback } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';

export const useNotificationSettings = () => {
  const { notificationSettings, updateNotifications, loading } = useSettings();
  const [phoneNumber, setPhoneNumber] = useState(notificationSettings.phone_number || '');

  const handleToggleEmail = useCallback((type: string, enabled: boolean) => {
    switch (type) {
      case 'maintenance':
        updateNotifications({ maintenance_reminder_enabled: enabled })
          .then(() => toast.success(`✅ Notifications de maintenance ${enabled ? 'activées' : 'désactivées'}`));
        break;
      case 'inventory':
        updateNotifications({ stock_low_enabled: enabled })
          .then(() => toast.success(`✅ Notifications d'inventaire ${enabled ? 'activées' : 'désactivées'}`));
        break;
      case 'security':
        updateNotifications({ email_enabled: enabled })
          .then(() => toast.success(`✅ Notifications par email ${enabled ? 'activées' : 'désactivées'}`));
        break;
    }
  }, [updateNotifications]);

  const handleToggleSms = useCallback((type: string, enabled: boolean) => {
    switch (type) {
      case 'maintenance':
        updateNotifications({ maintenance_reminder_enabled: enabled, sms_enabled: enabled })
          .then(() => toast.success(`✅ SMS de maintenance ${enabled ? 'activés' : 'désactivés'}`));
        break;
      case 'inventory':
        updateNotifications({ stock_low_enabled: enabled, sms_enabled: enabled })
          .then(() => toast.success(`✅ SMS d'inventaire ${enabled ? 'activés' : 'désactivés'}`));
        break;
      case 'security':
        updateNotifications({ sms_enabled: enabled })
          .then(() => toast.success(`✅ Notifications par SMS ${enabled ? 'activées' : 'désactivées'}`));
        break;
    }
  }, [updateNotifications]);

  const handlePhoneNumberChange = useCallback((number: string) => {
    setPhoneNumber(number);
    updateNotifications({ phone_number: number })
      .then(() => toast.success('✅ Numéro de téléphone mis à jour'));
  }, [updateNotifications]);

  const triggerManualNotificationCheck = useCallback(async () => {
    try {
      const { notificationService } = await import('@/services/settings/notificationService');
      await notificationService.triggerManualAlertCheck();
    } catch (error) {
      console.error("Erreur lors du déclenchement manuel des notifications:", error);
    }
  }, []);

  return {
    loading,
    notificationSettings,
    phoneNumber,
    handleToggleEmail,
    handleToggleSms,
    handlePhoneNumberChange,
    triggerManualNotificationCheck
  };
};
