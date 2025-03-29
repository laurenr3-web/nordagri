
import React from 'react';
import { Wrench } from 'lucide-react';
import { NotificationCategoryCard } from './NotificationCategoryCard';
import { NotificationChannels } from './NotificationChannels';

interface EquipmentStatusSettings {
  enabled: boolean;
  channels: string[];
}

interface EquipmentStatusCardProps {
  settings: EquipmentStatusSettings;
  onToggle: (enabled: boolean) => void;
  onChannelToggle: (category: string, channel: string) => void;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  loading?: boolean;
}

export const EquipmentStatusCard = ({
  settings,
  onToggle,
  onChannelToggle,
  emailEnabled,
  pushEnabled,
  smsEnabled,
  loading = false
}: EquipmentStatusCardProps) => {
  return (
    <NotificationCategoryCard
      icon={Wrench}
      title="Equipment Status"
      description="Alerts about equipment status changes"
      enabled={settings.enabled}
      onToggle={onToggle}
      loading={loading}
    >
      <NotificationChannels 
        channels={settings.channels}
        category="equipment_status"
        onChannelToggle={onChannelToggle}
        emailEnabled={emailEnabled}
        pushEnabled={pushEnabled}
        smsEnabled={smsEnabled}
        loading={loading}
      />
    </NotificationCategoryCard>
  );
};
