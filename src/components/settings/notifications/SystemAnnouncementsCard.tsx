
import React from 'react';
import { Megaphone } from 'lucide-react';
import { NotificationCategoryCard } from './NotificationCategoryCard';
import { NotificationChannels } from './NotificationChannels';

interface SystemAnnouncementsSettings {
  enabled: boolean;
  channels: string[];
}

interface SystemAnnouncementsCardProps {
  settings: SystemAnnouncementsSettings;
  onToggle: (enabled: boolean) => void;
  onChannelToggle: (category: string, channel: string) => void;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  loading?: boolean;
}

export const SystemAnnouncementsCard = ({
  settings,
  onToggle,
  onChannelToggle,
  emailEnabled,
  pushEnabled,
  smsEnabled,
  loading = false
}: SystemAnnouncementsCardProps) => {
  return (
    <NotificationCategoryCard
      icon={Megaphone}
      title="System Announcements"
      description="Important system updates and announcements"
      enabled={settings.enabled}
      onToggle={onToggle}
      loading={loading}
    >
      <NotificationChannels 
        channels={settings.channels}
        category="system_announcements"
        onChannelToggle={onChannelToggle}
        emailEnabled={emailEnabled}
        pushEnabled={pushEnabled}
        smsEnabled={smsEnabled}
        loading={loading}
      />
    </NotificationCategoryCard>
  );
};
