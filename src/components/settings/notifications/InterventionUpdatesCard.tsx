
import React from 'react';
import { Truck } from 'lucide-react';
import { NotificationCategoryCard } from './NotificationCategoryCard';
import { NotificationChannels } from './NotificationChannels';

interface InterventionUpdatesSettings {
  enabled: boolean;
  channels: string[];
}

interface InterventionUpdatesCardProps {
  settings: InterventionUpdatesSettings;
  onToggle: (enabled: boolean) => void;
  onChannelToggle: (category: string, channel: string) => void;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  loading?: boolean;
}

export const InterventionUpdatesCard = ({
  settings,
  onToggle,
  onChannelToggle,
  emailEnabled,
  pushEnabled,
  smsEnabled,
  loading = false
}: InterventionUpdatesCardProps) => {
  return (
    <NotificationCategoryCard
      icon={Truck}
      title="Intervention Updates"
      description="Notifications about field interventions"
      enabled={settings.enabled}
      onToggle={onToggle}
      loading={loading}
    >
      <NotificationChannels 
        channels={settings.channels}
        category="intervention_updates"
        onChannelToggle={onChannelToggle}
        emailEnabled={emailEnabled}
        pushEnabled={pushEnabled}
        smsEnabled={smsEnabled}
        loading={loading}
      />
    </NotificationCategoryCard>
  );
};
