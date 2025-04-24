
import { useState, useCallback } from 'react';
import { useSettings } from '@/hooks/useSettings';

export const useNotificationSettings = () => {
  const { notificationSettings, updateNotifications, loading } = useSettings();
  const [phoneNumber, setPhoneNumber] = useState(notificationSettings.phone_number || '');

  const handleToggleEmail = useCallback((type: string, enabled: boolean) => {
    switch (type) {
      case 'maintenance':
        updateNotifications({ maintenance_reminder_enabled: enabled });
        break;
      case 'inventory':
        updateNotifications({ stock_low_enabled: enabled });
        break;
      case 'security':
        updateNotifications({ email_enabled: enabled });
        break;
    }
  }, [updateNotifications]);

  const handleToggleSms = useCallback((type: string, enabled: boolean) => {
    switch (type) {
      case 'security':
        updateNotifications({ sms_enabled: enabled });
        break;
      // Add other SMS notification types as needed
    }
  }, [updateNotifications]);

  const handlePhoneNumberChange = useCallback((number: string) => {
    setPhoneNumber(number);
    updateNotifications({ phone_number: number });
  }, [updateNotifications]);

  return {
    loading,
    notificationSettings,
    phoneNumber,
    handleToggleEmail,
    handleToggleSms,
    handlePhoneNumberChange
  };
};
