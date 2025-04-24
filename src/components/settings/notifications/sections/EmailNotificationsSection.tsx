
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface EmailNotificationsSectionProps {
  emailEnabled: boolean;
  maintenanceReminders: boolean;
  inventoryAlerts: boolean;
  securityAlerts: boolean;
  onToggleEmail: (type: string, enabled: boolean) => void;
  loading?: boolean;
}

export const EmailNotificationsSection = ({
  emailEnabled,
  maintenanceReminders,
  inventoryAlerts,
  securityAlerts,
  onToggleEmail,
  loading = false
}: EmailNotificationsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Notifications par email</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="email-maintenance" className="flex-grow">
            Rappels de maintenance
            <p className="text-sm text-muted-foreground">
              Recevez des rappels pour les tâches de maintenance à venir
            </p>
          </Label>
          <Switch 
            id="email-maintenance" 
            checked={maintenanceReminders}
            onCheckedChange={(checked) => onToggleEmail('maintenance', checked)}
            disabled={loading || !emailEnabled}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="email-inventory" className="flex-grow">
            Alertes d'inventaire
            <p className="text-sm text-muted-foreground">
              Soyez alerté lorsqu'un article est en rupture de stock
            </p>
          </Label>
          <Switch 
            id="email-inventory" 
            checked={inventoryAlerts}
            onCheckedChange={(checked) => onToggleEmail('inventory', checked)}
            disabled={loading || !emailEnabled}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="email-security" className="flex-grow">
            Alertes de sécurité
            <p className="text-sm text-muted-foreground">
              Recevez des notifications pour les activités suspectes
            </p>
          </Label>
          <Switch 
            id="email-security" 
            checked={securityAlerts}
            onCheckedChange={(checked) => onToggleEmail('security', checked)}
            disabled={loading || !emailEnabled}
          />
        </div>
      </div>
    </div>
  );
};
