
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

interface SMSNotificationsSectionProps {
  smsEnabled: boolean;
  phoneNumber: string;
  maintenanceReminders: boolean;
  inventoryAlerts: boolean;
  securityAlerts: boolean;
  onToggleSms: (type: string, enabled: boolean) => void;
  onPhoneNumberChange: (number: string) => void;
  loading?: boolean;
}

export const SMSNotificationsSection = ({
  smsEnabled,
  phoneNumber,
  maintenanceReminders,
  inventoryAlerts,
  securityAlerts,
  onToggleSms,
  onPhoneNumberChange,
  loading = false
}: SMSNotificationsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Notifications par SMS</h3>
      
      <div className="space-y-2">
        <Label htmlFor="phone-number">Numéro de téléphone</Label>
        <Input 
          id="phone-number" 
          value={phoneNumber} 
          onChange={(e) => onPhoneNumberChange(e.target.value)}
          placeholder="+33612345678"
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">Format international (ex: +33612345678)</p>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="sms-maintenance" className="flex-grow">
            Rappels de maintenance
            <p className="text-sm text-muted-foreground">
              Recevez des SMS pour les tâches de maintenance à venir
            </p>
          </Label>
          <Switch 
            id="sms-maintenance" 
            checked={maintenanceReminders}
            onCheckedChange={(checked) => onToggleSms('maintenance', checked)}
            disabled={loading || !smsEnabled || !phoneNumber}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="sms-inventory" className="flex-grow">
            Alertes d'inventaire
            <p className="text-sm text-muted-foreground">
              Soyez alerté par SMS lorsqu'un article est en rupture de stock
            </p>
          </Label>
          <Switch 
            id="sms-inventory" 
            checked={inventoryAlerts}
            onCheckedChange={(checked) => onToggleSms('inventory', checked)}
            disabled={loading || !smsEnabled || !phoneNumber}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="sms-security" className="flex-grow">
            Alertes de sécurité
            <p className="text-sm text-muted-foreground">
              Recevez des SMS pour les activités suspectes
            </p>
          </Label>
          <Switch 
            id="sms-security" 
            checked={securityAlerts}
            onCheckedChange={(checked) => onToggleSms('security', checked)}
            disabled={loading || !smsEnabled || !phoneNumber}
          />
        </div>
      </div>
    </div>
  );
};
