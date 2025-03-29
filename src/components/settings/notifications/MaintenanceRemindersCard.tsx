
import React from 'react';
import { Calendar } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NotificationCategoryCard } from './NotificationCategoryCard';
import { NotificationChannels } from './NotificationChannels';

interface MaintenanceReminderSettings {
  enabled: boolean;
  channels: string[];
  frequency: string;
}

interface MaintenanceRemindersCardProps {
  settings: MaintenanceReminderSettings;
  onToggle: (enabled: boolean) => void;
  onFrequencyChange: (frequency: string) => void;
  onChannelToggle: (category: string, channel: string) => void;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  loading?: boolean;
}

export const MaintenanceRemindersCard = ({
  settings,
  onToggle,
  onFrequencyChange,
  onChannelToggle,
  emailEnabled,
  pushEnabled,
  smsEnabled,
  loading = false
}: MaintenanceRemindersCardProps) => {
  return (
    <NotificationCategoryCard
      icon={Calendar}
      title="Maintenance Reminders"
      description="Notifications about scheduled maintenance tasks"
      enabled={settings.enabled}
      onToggle={onToggle}
      loading={loading}
    >
      <NotificationChannels 
        channels={settings.channels}
        category="maintenance_reminders"
        onChannelToggle={onChannelToggle}
        emailEnabled={emailEnabled}
        pushEnabled={pushEnabled}
        smsEnabled={smsEnabled}
        loading={loading}
      />
      
      <div className="flex items-center gap-2">
        <Label htmlFor="maintenance-frequency" className="w-24">Frequency:</Label>
        <Select 
          value={settings.frequency} 
          onValueChange={onFrequencyChange}
          disabled={loading}
        >
          <SelectTrigger id="maintenance-frequency" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="before-due">Before due</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </NotificationCategoryCard>
  );
};
