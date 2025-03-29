
import React from 'react';
import { Button } from '@/components/ui/button';
import { SettingsSection } from './SettingsSection';
import { GlobalNotificationSettings } from './notifications/GlobalNotificationSettings';
import { MaintenanceRemindersCard } from './notifications/MaintenanceRemindersCard';
import { EquipmentStatusCard } from './notifications/EquipmentStatusCard';
import { InventoryAlertsCard } from './notifications/InventoryAlertsCard';
import { InterventionUpdatesCard } from './notifications/InterventionUpdatesCard';
import { SystemAnnouncementsCard } from './notifications/SystemAnnouncementsCard';
import { useAuthContext } from '@/providers/AuthProvider';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { toast } from 'sonner';

export const SettingsNotifications = () => {
  const { user } = useAuthContext();
  const userId = user?.id || '';
  
  const {
    settings,
    loading,
    saveSettings
  } = useNotificationSettings(userId);

  if (!user) {
    return (
      <div className="p-8 text-center">
        You must be logged in to view notification settings
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-8 text-center">
        {loading ? 'Loading notification settings...' : 'Failed to load notification settings'}
      </div>
    );
  }

  const handleChannelToggle = (category: string, channel: string) => {
    if (!settings) return;
    
    const updatedSettings = { ...settings };
    const preferences = updatedSettings.notification_preferences[category];
    
    if (preferences.channels.includes(channel)) {
      preferences.channels = preferences.channels.filter(c => c !== channel);
    } else {
      preferences.channels.push(channel);
    }
    
    saveSettings(updatedSettings);
  };

  return (
    <div className="space-y-6">
      <GlobalNotificationSettings 
        emailEnabled={settings.email_notifications}
        pushEnabled={settings.push_notifications}
        smsEnabled={settings.sms_notifications}
        onEmailToggle={(checked) => saveSettings({...settings, email_notifications: checked})}
        onPushToggle={(checked) => saveSettings({...settings, push_notifications: checked})}
        onSmsToggle={(checked) => saveSettings({...settings, sms_notifications: checked})}
        loading={loading}
      />

      <SettingsSection
        title="Notification Categories"
        description="Configure specific notification types and their delivery methods"
      >
        <div className="space-y-4">
          <MaintenanceRemindersCard 
            settings={settings.notification_preferences.maintenance_reminders}
            onToggle={(enabled) => {
              const updatedSettings = { ...settings };
              updatedSettings.notification_preferences.maintenance_reminders.enabled = enabled;
              saveSettings(updatedSettings);
            }}
            onFrequencyChange={(frequency) => {
              const updatedSettings = { ...settings };
              updatedSettings.notification_preferences.maintenance_reminders.frequency = frequency;
              saveSettings(updatedSettings);
            }}
            onChannelToggle={handleChannelToggle}
            emailEnabled={settings.email_notifications}
            pushEnabled={settings.push_notifications}
            smsEnabled={settings.sms_notifications}
            loading={loading}
          />
          
          <EquipmentStatusCard 
            settings={settings.notification_preferences.equipment_status}
            onToggle={(enabled) => {
              const updatedSettings = { ...settings };
              updatedSettings.notification_preferences.equipment_status.enabled = enabled;
              saveSettings(updatedSettings);
            }}
            onChannelToggle={handleChannelToggle}
            emailEnabled={settings.email_notifications}
            pushEnabled={settings.push_notifications}
            smsEnabled={settings.sms_notifications}
            loading={loading}
          />
          
          <InventoryAlertsCard 
            settings={settings.notification_preferences.inventory_alerts}
            onToggle={(enabled) => {
              const updatedSettings = { ...settings };
              updatedSettings.notification_preferences.inventory_alerts.enabled = enabled;
              saveSettings(updatedSettings);
            }}
            onThresholdChange={(threshold) => {
              const updatedSettings = { ...settings };
              updatedSettings.notification_preferences.inventory_alerts.threshold = threshold;
              saveSettings(updatedSettings);
            }}
            onChannelToggle={handleChannelToggle}
            emailEnabled={settings.email_notifications}
            pushEnabled={settings.push_notifications}
            smsEnabled={settings.sms_notifications}
            loading={loading}
          />
          
          <InterventionUpdatesCard 
            settings={settings.notification_preferences.intervention_updates}
            onToggle={(enabled) => {
              const updatedSettings = { ...settings };
              updatedSettings.notification_preferences.intervention_updates.enabled = enabled;
              saveSettings(updatedSettings);
            }}
            onChannelToggle={handleChannelToggle}
            emailEnabled={settings.email_notifications}
            pushEnabled={settings.push_notifications}
            smsEnabled={settings.sms_notifications}
            loading={loading}
          />
          
          <SystemAnnouncementsCard 
            settings={settings.notification_preferences.system_announcements}
            onToggle={(enabled) => {
              const updatedSettings = { ...settings };
              updatedSettings.notification_preferences.system_announcements.enabled = enabled;
              saveSettings(updatedSettings);
            }}
            onChannelToggle={handleChannelToggle}
            emailEnabled={settings.email_notifications}
            pushEnabled={settings.push_notifications}
            smsEnabled={settings.sms_notifications}
            loading={loading}
          />
        </div>
      </SettingsSection>
    </div>
  );
};
