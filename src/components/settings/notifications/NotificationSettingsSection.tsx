
import React, { useState, useEffect } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Bell, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/providers/AuthProvider';

/**
 * Composant pour gérer les préférences de notification de l'utilisateur
 */
export function NotificationSettingsSection() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
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
      securityAlerts: true
    }
  });
  
  // Charger les préférences utilisateur
  useEffect(() => {
    const loadNotificationPreferences = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Erreur lors du chargement des préférences de notification:', error);
          return;
        }
        
        if (data) {
          // Adapter les données du modèle existant à notre structure d'état
          setNotificationPreferences({
            email: {
              maintenanceReminders: data.maintenance_reminder_enabled ?? true,
              inventoryAlerts: data.stock_low_enabled ?? true,
              securityAlerts: data.email_notifications ?? true
            },
            sms: {
              maintenanceReminders: data.sms_notifications ?? false,
              inventoryAlerts: data.sms_notifications ?? false,
              securityAlerts: data.sms_notifications ?? false
            }
          });
          
          // Essayer d'extraire le numéro de téléphone des préférences de notifications
          const preferences = data.notification_preferences;
          if (preferences && typeof preferences === 'object' && !Array.isArray(preferences)) {
            // Safe check to make sure preferences is an object and not an array
            const phoneNumberValue = (preferences as Record<string, any>)['phone_number'];
            setPhoneNumber(phoneNumberValue || '');
          }
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadNotificationPreferences();
  }, [user]);
  
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
    
    setLoading(true);
    try {
      const notificationPrefs = {
        ...notificationPreferences,
        phone_number: phoneNumber,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          maintenance_reminder_enabled: notificationPreferences.email.maintenanceReminders,
          stock_low_enabled: notificationPreferences.email.inventoryAlerts,
          email_notifications: notificationPreferences.email.securityAlerts,
          sms_notifications: notificationPreferences.sms.securityAlerts,
          push_notifications: false,
          notification_preferences: notificationPrefs,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (error) throw error;
      
      toast.success('Préférences de notification mises à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      toast.error('Erreur lors de la mise à jour des préférences');
    } finally {
      setLoading(false);
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
