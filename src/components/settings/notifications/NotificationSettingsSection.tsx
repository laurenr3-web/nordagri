
import React, { useState, useEffect } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Bell, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthContext } from '@/providers/AuthProvider';
import { useSettings } from '@/hooks/useSettings';

/**
 * Composant pour gérer les préférences de notification de l'utilisateur
 */
export function NotificationSettingsSection() {
  const { user } = useAuthContext();
  const { 
    loading, 
    notificationSettings, 
    updateNotifications 
  } = useSettings();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // États des notifications
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: {
      maintenanceReminders: true,
      inventoryAlerts: true,
      securityAlerts: true
    },
    sms: {
      maintenanceReminders: false,
      inventoryAlerts: false,
      securityAlerts: false
    }
  });
  
  // Charger les préférences utilisateur
  useEffect(() => {
    if (!notificationSettings) return;
    
    // Adapter les données du modèle existant à notre structure d'état
    setNotificationPreferences({
      email: {
        maintenanceReminders: notificationSettings.maintenance_reminder_enabled ?? true,
        inventoryAlerts: notificationSettings.stock_low_enabled ?? true,
        securityAlerts: notificationSettings.email_enabled ?? true
      },
      sms: {
        maintenanceReminders: notificationSettings.sms_enabled ?? false,
        inventoryAlerts: notificationSettings.sms_enabled ?? false,
        securityAlerts: notificationSettings.sms_enabled ?? false
      }
    });
    
    setPhoneNumber(notificationSettings.phone_number || '');
  }, [notificationSettings]);
  
  const handleToggleChange = (channel: 'email' | 'sms', type: string) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: !prev[channel][type as keyof typeof prev.email]
      }
    }));
  };
  
  const handleSavePreferences = async () => {
    if (!user?.id) {
      toast.error('Vous devez être connecté pour enregistrer vos préférences');
      return;
    }
    
    try {
      // Utiliser la fonction updateNotifications du hook useSettings
      await updateNotifications({
        email_enabled: notificationPreferences.email.securityAlerts,
        sms_enabled: notificationPreferences.sms.securityAlerts,
        phone_number: phoneNumber,
        maintenance_reminder_enabled: notificationPreferences.email.maintenanceReminders,
        stock_low_enabled: notificationPreferences.email.inventoryAlerts
      });
      
      toast.success('Préférences de notification mises à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      toast.error('Erreur lors de la mise à jour des préférences');
    }
  };
  
  return (
    <SettingsSection 
      title="Préférences de notification" 
      description="Configurez comment et quand vous souhaitez recevoir des notifications"
    >
      <div className="space-y-6">
        {/* Notifications par email */}
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
                checked={notificationPreferences.email.maintenanceReminders}
                onCheckedChange={() => handleToggleChange('email', 'maintenanceReminders')}
                disabled={loading}
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
                checked={notificationPreferences.email.inventoryAlerts}
                onCheckedChange={() => handleToggleChange('email', 'inventoryAlerts')}
                disabled={loading}
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
                checked={notificationPreferences.email.securityAlerts}
                onCheckedChange={() => handleToggleChange('email', 'securityAlerts')}
                disabled={loading}
              />
            </div>
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
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+33612345678"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Format international (ex: +33612345678)</p>
          </div>
          
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-maintenance" className="flex-grow">
                Rappels de maintenance
                <p className="text-sm text-muted-foreground">
                  Recevez des SMS pour les tâches de maintenance à venir
                </p>
              </Label>
              <Switch 
                id="sms-maintenance" 
                checked={notificationPreferences.sms.maintenanceReminders}
                onCheckedChange={() => handleToggleChange('sms', 'maintenanceReminders')}
                disabled={loading || !phoneNumber}
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
                checked={notificationPreferences.sms.inventoryAlerts}
                onCheckedChange={() => handleToggleChange('sms', 'inventoryAlerts')}
                disabled={loading || !phoneNumber}
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
                checked={notificationPreferences.sms.securityAlerts}
                onCheckedChange={() => handleToggleChange('sms', 'securityAlerts')}
                disabled={loading || !phoneNumber}
              />
            </div>
          </div>
        </div>
        
        {/* Bouton d'enregistrement */}
        <div className="pt-4">
          <Button 
            onClick={handleSavePreferences} 
            disabled={loading} 
            type="button"
          >
            <Save className="h-4 w-4 mr-2" />
            Enregistrer les préférences
          </Button>
        </div>
      </div>
    </SettingsSection>
  );
}
