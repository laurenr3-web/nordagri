
import React from 'react';
import { Bell } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SettingsSection } from '../SettingsSection';

interface GlobalNotificationSettingsProps {
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  onEmailToggle: (checked: boolean) => void;
  onPushToggle: (checked: boolean) => void;
  onSmsToggle: (checked: boolean) => void;
  loading?: boolean;
}

export const GlobalNotificationSettings = ({
  emailEnabled,
  pushEnabled,
  smsEnabled,
  onEmailToggle,
  onPushToggle,
  onSmsToggle,
  loading = false
}: GlobalNotificationSettingsProps) => {
  return (
    <SettingsSection 
      title="Global Notification Settings" 
      description="Configure how and when you receive notifications"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
          <Bell className="h-8 w-8 text-secondary-foreground" />
        </div>
        <div className="space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch 
              id="email-notifications" 
              checked={emailEnabled} 
              onCheckedChange={onEmailToggle}
              disabled={loading}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications in browser and mobile
              </p>
            </div>
            <Switch 
              id="push-notifications" 
              checked={pushEnabled}
              onCheckedChange={onPushToggle}
              disabled={loading}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive critical notifications via SMS
              </p>
            </div>
            <Switch 
              id="sms-notifications" 
              checked={smsEnabled}
              onCheckedChange={onSmsToggle}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </SettingsSection>
  );
};
