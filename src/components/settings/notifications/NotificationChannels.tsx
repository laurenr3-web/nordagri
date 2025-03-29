
import React from 'react';
import { Button } from '@/components/ui/button';

interface NotificationChannelsProps {
  channels: string[];
  category: string;
  onChannelToggle: (category: string, channel: string) => void;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  loading?: boolean;
}

export const NotificationChannels = ({
  channels,
  category,
  onChannelToggle,
  emailEnabled,
  pushEnabled,
  smsEnabled,
  loading = false
}: NotificationChannelsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant={channels.includes('email') ? 'default' : 'outline'} 
        size="sm"
        onClick={() => onChannelToggle(category, 'email')}
        disabled={!emailEnabled || loading}
      >
        Email
      </Button>
      <Button 
        variant={channels.includes('push') ? 'default' : 'outline'} 
        size="sm"
        onClick={() => onChannelToggle(category, 'push')}
        disabled={!pushEnabled || loading}
      >
        Push
      </Button>
      <Button 
        variant={channels.includes('sms') ? 'default' : 'outline'} 
        size="sm"
        onClick={() => onChannelToggle(category, 'sms')}
        disabled={!smsEnabled || loading}
      >
        SMS
      </Button>
    </div>
  );
};
