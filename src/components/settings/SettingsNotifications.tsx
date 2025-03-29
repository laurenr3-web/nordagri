
import React, { useState, useEffect } from 'react';
import { SettingsSection } from './SettingsSection';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Calendar, Wrench, ShoppingCart, Truck, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from '@/providers/AuthProvider';

interface NotificationSettings {
  id?: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notification_preferences: {
    maintenance_reminders: {
      enabled: boolean;
      channels: string[];
      frequency: string;
    };
    equipment_status: {
      enabled: boolean;
      channels: string[];
    };
    inventory_alerts: {
      enabled: boolean;
      channels: string[];
      threshold: number;
    };
    intervention_updates: {
      enabled: boolean;
      channels: string[];
    };
    system_announcements: {
      enabled: boolean;
      channels: string[];
    };
  };
}

export const SettingsNotifications = () => {
  const { user } = useAuthContext();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get notification settings
        const { data, error } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          setSettings(data);
        } else {
          // Initialize default settings
          const defaultSettings: NotificationSettings = {
            user_id: user.id,
            email_notifications: true,
            push_notifications: false,
            sms_notifications: false,
            notification_preferences: {
              maintenance_reminders: {
                enabled: true,
                channels: ['email'],
                frequency: 'daily'
              },
              equipment_status: {
                enabled: true,
                channels: ['email']
              },
              inventory_alerts: {
                enabled: true,
                channels: ['email'],
                threshold: 5
              },
              intervention_updates: {
                enabled: true,
                channels: ['email']
              },
              system_announcements: {
                enabled: true,
                channels: ['email']
              }
            }
          };
          
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Error fetching notification settings:', error);
        toast.error('Failed to load notification settings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotificationSettings();
  }, [user]);

  const handleChannelToggle = (category: string, channel: string) => {
    if (!settings) return;
    
    const updatedSettings = { ...settings };
    const preferences = updatedSettings.notification_preferences[category];
    
    if (preferences.channels.includes(channel)) {
      preferences.channels = preferences.channels.filter(c => c !== channel);
    } else {
      preferences.channels.push(channel);
    }
    
    setSettings(updatedSettings);
  };

  const handleSaveSettings = async () => {
    if (!settings || !user) return;
    
    try {
      setLoading(true);
      
      // Check if settings record exists
      const { data: existingData } = await supabase
        .from('notification_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      let error;
      
      if (existingData) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('notification_settings')
          .update({
            email_notifications: settings.email_notifications,
            push_notifications: settings.push_notifications,
            sms_notifications: settings.sms_notifications,
            notification_preferences: settings.notification_preferences
          })
          .eq('id', existingData.id);
          
        error = updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('notification_settings')
          .insert(settings);
          
        error = insertError;
      }
      
      if (error) throw error;
      
      toast.success('Notification settings saved successfully');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        You must be logged in to view notification settings
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-8 text-center">
        {loading ? 'Loading notification settings...' : 'Failed to load notification settings'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                checked={settings.email_notifications} 
                onCheckedChange={(checked) => setSettings({...settings, email_notifications: checked})}
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
                checked={settings.push_notifications}
                onCheckedChange={(checked) => setSettings({...settings, push_notifications: checked})}
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
                checked={settings.sms_notifications}
                onCheckedChange={(checked) => setSettings({...settings, sms_notifications: checked})}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Notification Categories"
        description="Configure specific notification types and their delivery methods"
      >
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Maintenance Reminders</h4>
                    <p className="text-sm text-muted-foreground">Notifications about scheduled maintenance tasks</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.notification_preferences.maintenance_reminders.enabled}
                  onCheckedChange={(checked) => {
                    const updatedSettings = { ...settings };
                    updatedSettings.notification_preferences.maintenance_reminders.enabled = checked;
                    setSettings(updatedSettings);
                  }}
                  disabled={loading}
                />
              </div>
              
              {settings.notification_preferences.maintenance_reminders.enabled && (
                <div className="ml-8 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={settings.notification_preferences.maintenance_reminders.channels.includes('email') ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleChannelToggle('maintenance_reminders', 'email')}
                      disabled={!settings.email_notifications || loading}
                    >
                      Email
                    </Button>
                    <Button 
                      variant={settings.notification_preferences.maintenance_reminders.channels.includes('push') ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleChannelToggle('maintenance_reminders', 'push')}
                      disabled={!settings.push_notifications || loading}
                    >
                      Push
                    </Button>
                    <Button 
                      variant={settings.notification_preferences.maintenance_reminders.channels.includes('sms') ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleChannelToggle('maintenance_reminders', 'sms')}
                      disabled={!settings.sms_notifications || loading}
                    >
                      SMS
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor="maintenance-frequency" className="w-24">Frequency:</Label>
                    <Select 
                      value={settings.notification_preferences.maintenance_reminders.frequency} 
                      onValueChange={(value) => {
                        const updatedSettings = { ...settings };
                        updatedSettings.notification_preferences.maintenance_reminders.frequency = value;
                        setSettings(updatedSettings);
                      }}
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
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Equipment Status</h4>
                    <p className="text-sm text-muted-foreground">Alerts about equipment status changes</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.notification_preferences.equipment_status.enabled}
                  onCheckedChange={(checked) => {
                    const updatedSettings = { ...settings };
                    updatedSettings.notification_preferences.equipment_status.enabled = checked;
                    setSettings(updatedSettings);
                  }}
                  disabled={loading}
                />
              </div>
              
              {settings.notification_preferences.equipment_status.enabled && (
                <div className="ml-8 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={settings.notification_preferences.equipment_status.channels.includes('email') ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleChannelToggle('equipment_status', 'email')}
                      disabled={!settings.email_notifications || loading}
                    >
                      Email
                    </Button>
                    <Button 
                      variant={settings.notification_preferences.equipment_status.channels.includes('push') ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleChannelToggle('equipment_status', 'push')}
                      disabled={!settings.push_notifications || loading}
                    >
                      Push
                    </Button>
                    <Button 
                      variant={settings.notification_preferences.equipment_status.channels.includes('sms') ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleChannelToggle('equipment_status', 'sms')}
                      disabled={!settings.sms_notifications || loading}
                    >
                      SMS
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Inventory Alerts</h4>
                    <p className="text-sm text-muted-foreground">Notifications when parts inventory is low</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.notification_preferences.inventory_alerts.enabled}
                  onCheckedChange={(checked) => {
                    const updatedSettings = { ...settings };
                    updatedSettings.notification_preferences.inventory_alerts.enabled = checked;
                    setSettings(updatedSettings);
                  }}
                  disabled={loading}
                />
              </div>
              
              {settings.notification_preferences.inventory_alerts.enabled && (
                <div className="ml-8 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={settings.notification_preferences.inventory_alerts.channels.includes('email') ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleChannelToggle('inventory_alerts', 'email')}
                      disabled={!settings.email_notifications || loading}
                    >
                      Email
                    </Button>
                    <Button 
                      variant={settings.notification_preferences.inventory_alerts.channels.includes('push') ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleChannelToggle('inventory_alerts', 'push')}
                      disabled={!settings.push_notifications || loading}
                    >
                      Push
                    </Button>
                    <Button 
                      variant={settings.notification_preferences.inventory_alerts.channels.includes('sms') ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleChannelToggle('inventory_alerts', 'sms')}
                      disabled={!settings.sms_notifications || loading}
                    >
                      SMS
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor="inventory-threshold" className="w-24">Threshold:</Label>
                    <Select 
                      value={settings.notification_preferences.inventory_alerts.threshold.toString()} 
                      onValueChange={(value) => {
                        const updatedSettings = { ...settings };
                        updatedSettings.notification_preferences.inventory_alerts.threshold = parseInt(value);
                        setSettings(updatedSettings);
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger id="inventory-threshold" className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 item</SelectItem>
                        <SelectItem value="3">3 items</SelectItem>
                        <SelectItem value="5">5 items</SelectItem>
                        <SelectItem value="10">10 items</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Intervention Updates</h4>
                    <p className="text-sm text-muted-foreground">Notifications about field interventions</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.notification_preferences.intervention_updates.enabled}
                  onCheckedChange={(checked) => {
                    const updatedSettings = { ...settings };
                    updatedSettings.notification_preferences.intervention_updates.enabled = checked;
                    setSettings(updatedSettings);
                  }}
                  disabled={loading}
                />
              </div>
              
              {settings.notification_preferences.intervention_updates.enabled && (
                <div className="ml-8 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={settings.notification_preferences.intervention_updates.channels.includes('email') ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleChannelToggle('intervention_updates', 'email')}
                      disabled={!settings.email_notifications || loading}
                    >
                      Email
                    </Button>
                    <Button 
                      variant={settings.notification_preferences.intervention_updates.channels.includes('push') ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleChannelToggle('intervention_updates', 'push')}
                      disabled={!settings.push_notifications || loading}
                    >
                      Push
                    </Button>
                    <Button 
                      variant={settings.notification_preferences.intervention_updates.channels.includes('sms') ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleChannelToggle('intervention_updates', 'sms')}
                      disabled={!settings.sms_notifications || loading}
                    >
                      SMS
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Megaphone className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">System Announcements</h4>
                    <p className="text-sm text-muted-foreground">Important system updates and announcements</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.notification_preferences.system_announcements.enabled}
                  onCheckedChange={(checked) => {
                    const updatedSettings = { ...settings };
                    updatedSettings.notification_preferences.system_announcements.enabled = checked;
                    setSettings(updatedSettings);
                  }}
                  disabled={loading}
                />
              </div>
              
              {settings.notification_preferences.system_announcements.enabled && (
                <div className="ml-8 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={settings.notification_preferences.system_announcements.channels.includes('email') ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleChannelToggle('system_announcements', 'email')}
                      disabled={!settings.email_notifications || loading}
                    >
                      Email
                    </Button>
                    <Button 
                      variant={settings.notification_preferences.system_announcements.channels.includes('push') ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleChannelToggle('system_announcements', 'push')}
                      disabled={!settings.push_notifications || loading}
                    >
                      Push
                    </Button>
                    <Button 
                      variant={settings.notification_preferences.system_announcements.channels.includes('sms') ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => handleChannelToggle('system_announcements', 'sms')}
                      disabled={!settings.sms_notifications || loading}
                    >
                      SMS
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Button onClick={handleSaveSettings} disabled={loading} className="mt-6">
            {loading ? 'Saving...' : 'Save Notification Settings'}
          </Button>
        </div>
      </SettingsSection>
    </div>
  );
};
