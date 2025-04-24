
import React, { useState } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Bell } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SimpleNotificationSectionProps {
  emailEnabled: boolean;
  smsEnabled: boolean;
  phoneNumber: string;
  onUpdateNotifications: (settings: {
    email_enabled?: boolean;
    sms_enabled?: boolean;
    phone_number?: string;
  }) => Promise<boolean>;
  loading?: boolean;
}

export function SimpleNotificationSection({
  emailEnabled,
  smsEnabled,
  phoneNumber,
  onUpdateNotifications,
  loading = false
}: SimpleNotificationSectionProps) {
  const [localPhoneNumber, setLocalPhoneNumber] = useState(phoneNumber);

  const handleToggleEmail = async (checked: boolean) => {
    await onUpdateNotifications({ email_enabled: checked });
  };

  const handleToggleSms = async (checked: boolean) => {
    await onUpdateNotifications({ sms_enabled: checked });
  };

  const handlePhoneNumberBlur = async () => {
    if (localPhoneNumber !== phoneNumber) {
      await onUpdateNotifications({ phone_number: localPhoneNumber });
    }
  };

  return (
    <SettingsSection 
      title="Préférences de notification" 
      description="Configurez comment et quand vous souhaitez recevoir des notifications"
      icon={<Bell className="h-5 w-5" />}
    >
      <div className="space-y-6">
        {/* Notifications par email */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notifications par email</h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications" className="flex-grow">
              Activer les notifications par email
              <p className="text-sm text-muted-foreground">
                Recevez des notifications par email pour les événements importants
              </p>
            </Label>
            <Switch 
              id="email-notifications" 
              checked={emailEnabled}
              onCheckedChange={handleToggleEmail}
              disabled={loading}
            />
          </div>
        </div>
        
        <Separator />
        
        {/* Notifications par SMS */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notifications par SMS</h3>
          
          <div className="space-y-2">
            <Label htmlFor="phone-number">Numéro de téléphone</Label>
            <Input 
              id="phone-number" 
              value={localPhoneNumber} 
              onChange={(e) => setLocalPhoneNumber(e.target.value)}
              onBlur={handlePhoneNumberBlur}
              placeholder="+33612345678"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Format international (ex: +33612345678)</p>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <Label htmlFor="sms-notifications" className="flex-grow">
              Activer les notifications par SMS
              <p className="text-sm text-muted-foreground">
                Recevez des notifications par SMS pour les événements urgents
              </p>
            </Label>
            <Switch 
              id="sms-notifications" 
              checked={smsEnabled}
              onCheckedChange={handleToggleSms}
              disabled={loading || !localPhoneNumber}
            />
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
