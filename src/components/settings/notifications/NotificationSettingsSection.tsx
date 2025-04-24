
import React from 'react';
import { SettingsSection } from '../SettingsSection';
import { Separator } from '@/components/ui/separator';
import { EmailNotificationsSection } from './sections/EmailNotificationsSection';
import { SMSNotificationsSection } from './sections/SMSNotificationsSection';
import { useNotificationSettings } from './hooks/useNotificationSettings';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotificationSettingsSection() {
  const {
    loading,
    notificationSettings,
    phoneNumber,
    handleToggleEmail,
    handleToggleSms,
    handlePhoneNumberChange,
    triggerManualNotificationCheck
  } = useNotificationSettings();

  return (
    <SettingsSection 
      title="Préférences de notification" 
      description="Configurez comment et quand vous souhaitez recevoir des notifications"
      icon={<Bell className="h-5 w-5" />}
    >
      <div className="space-y-6">
        <EmailNotificationsSection 
          emailEnabled={notificationSettings.email_enabled}
          maintenanceReminders={notificationSettings.maintenance_reminder_enabled || false}
          inventoryAlerts={notificationSettings.stock_low_enabled || false}
          securityAlerts={notificationSettings.email_enabled}
          onToggleEmail={handleToggleEmail}
          loading={loading}
        />
        
        <Separator />
        
        <SMSNotificationsSection 
          smsEnabled={notificationSettings.sms_enabled}
          phoneNumber={phoneNumber}
          maintenanceReminders={notificationSettings.maintenance_reminder_enabled || false}
          inventoryAlerts={notificationSettings.stock_low_enabled || false}
          securityAlerts={notificationSettings.sms_enabled}
          onToggleSms={handleToggleSms}
          onPhoneNumberChange={handlePhoneNumberChange}
          loading={loading}
        />

        <div className="pt-4">
          <Button 
            variant="outline" 
            onClick={triggerManualNotificationCheck}
            disabled={loading}
          >
            Tester les notifications
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Cliquez pour déclencher manuellement une vérification des notifications.
            Vous recevrez des alertes seulement s'il y a des conditions qui les déclenchent.
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}
