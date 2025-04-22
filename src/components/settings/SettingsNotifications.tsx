import React from 'react';
import { SettingsSection } from './SettingsSection';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Bell, Clock, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// @feature: advanced-notifications
const NOTIF_INIT = {
  stock_low_enabled: true,
  maintenance_reminder_enabled: true,
};

export const SettingsNotifications = () => {
  const [notifPrefs, setNotifPrefs] = useState(NOTIF_INIT);
  const [loadingNotif, setLoadingNotif] = useState(true);

  useEffect(() => {
    // Charge depuis notification_settings pour l'utilisateur courant si existe
    const fetchSettings = async () => {
      setLoadingNotif(true);
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      if (!userId) {
        setLoadingNotif(false);
        return;
      }
      const { data, error } = await supabase
        .from('notification_settings')
        .select('stock_low_enabled, maintenance_reminder_enabled')
        .eq('user_id', userId)
        .maybeSingle();
      if (!error && data) setNotifPrefs(data);
      setLoadingNotif(false);
    };
    fetchSettings();
  }, []);

  // Enregistrement automatique lors du changement
  const handleNotifChange = (key: keyof typeof NOTIF_INIT, value: boolean) => {
    setNotifPrefs((old) => ({ ...old, [key]: value }));

    supabase.auth.getSession().then(async ({ data: session }) => {
      const userId = session?.session?.user?.id;
      if (!userId) return;
      // update ou insert notification_settings
      const { error } = await supabase
        .from('notification_settings')
        .upsert(
          { user_id: userId, [key]: value },
          { onConflict: 'user_id' }
        );
      if (error) {
        toast.error('Erreur lors de la sauvegarde des notifications');
      } else {
        toast.success('Préférences notifications sauvegardées');
      }
    });
  };

  return (
    <div className="space-y-6">
      <SettingsSection 
        title="Inventory Alert Thresholds" 
        description="Set up minimum stock level alerts for parts and supplies"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
            <Bell className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div className="space-y-4 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-parts">Minimum Parts Stock Level</Label>
                <div className="flex items-center gap-2">
                  <Input id="min-parts" type="number" defaultValue="5" />
                  <span className="text-sm text-muted-foreground">units</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Alert when stock falls below this threshold
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="critical-parts">Critical Parts Threshold</Label>
                <div className="flex items-center gap-2">
                  <Input id="critical-parts" type="number" defaultValue="2" />
                  <span className="text-sm text-muted-foreground">units</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Urgent alert for critical components
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reorder-lead-time">Reorder Lead Time</Label>
              <div className="flex items-center gap-2">
                <Input id="reorder-lead-time" type="number" defaultValue="7" />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Time to account for when suggesting reordering
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="auto-reorder">Automatic Reorder Suggestions</Label>
                <p className="text-sm text-muted-foreground">
                  Generate suggested orders based on thresholds
                </p>
              </div>
              <Switch id="auto-reorder" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="stock-low-alert-enabled">Activate Stock Low Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  <span>Enable/disable email & SMS if parts are below threshold</span>
                </p>
              </div>
              <Switch
                id="stock-low-alert-enabled"
                checked={!!notifPrefs.stock_low_enabled}
                disabled={loadingNotif}
                onCheckedChange={(v) => handleNotifChange('stock_low_enabled', v)}
              />
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Maintenance Reminders"
        description="Configure when and how you receive maintenance alerts"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div className="space-y-4 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="advance-notice">Advance Notice Period</Label>
                <div className="flex items-center gap-2">
                  <Input id="advance-notice" type="number" defaultValue="3" />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  How far in advance to send reminders
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reminder-frequency">Reminder Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger id="reminder-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="urgency-threshold">Urgency Threshold</Label>
              <Select defaultValue="medium">
                <SelectTrigger id="urgency-threshold">
                  <SelectValue placeholder="Select threshold" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (All maintenance)</SelectItem>
                  <SelectItem value="medium">Medium (Regular + Critical)</SelectItem>
                  <SelectItem value="high">High (Critical only)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Determines which maintenance tasks trigger notifications
              </p>
            </div>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Configure Maintenance Calendar</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Maintenance Calendar Settings</SheetTitle>
                  <SheetDescription>
                    Configure how maintenance tasks appear in your calendar
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-completed">Show Completed Tasks</Label>
                    <Switch id="show-completed" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-overdue">Highlight Overdue Tasks</Label>
                    <Switch id="show-overdue" defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calendar-view">Default Calendar View</Label>
                    <Select defaultValue="monthly">
                      <SelectTrigger id="calendar-view">
                        <SelectValue placeholder="Select view" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="mt-4">Save Calendar Settings</Button>
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="maintenance-reminder-enabled">Enable Maintenance Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  <span>Receive reminders for upcoming maintenance tasks</span>
                </p>
              </div>
              <Switch
                id="maintenance-reminder-enabled"
                checked={!!notifPrefs.maintenance_reminder_enabled}
                disabled={loadingNotif}
                onCheckedChange={(v) =>
                  handleNotifChange('maintenance_reminder_enabled', v)
                }
              />
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Notification Methods"
        description="Choose how you want to receive alerts and notifications"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-address">Email Address</Label>
              <Input id="email-address" type="email" defaultValue="john.doe@example.com" />
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive text messages for urgent alerts
                </p>
              </div>
              <Switch id="sms-notifications" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone-number">Phone Number</Label>
              <Input id="phone-number" type="tel" placeholder="+33 6 XX XX XX XX" />
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="in-app-notifications">In-App Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications within the application
                </p>
              </div>
              <Switch id="in-app-notifications" defaultChecked />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notification-priority">Notification Priority</Label>
              <Select defaultValue="all">
                <SelectTrigger id="notification-priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="important">Important Only</SelectItem>
                  <SelectItem value="critical">Critical Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Button>Save Notification Settings</Button>
      </SettingsSection>

      {/* New Section: API Integration Settings - @feature: api-integration */}
      <SettingsSection
        title="API Integration"
        description="Configure API access for third-party integrations"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-secondary-foreground"><path d="M18 20a2 2 0 0 0 2-2V8l-8-6-8 6v10a2 2 0 0 0 2 2Z"></path><path d="m12 10-2 2h4l-2 2"></path></svg>
          </div>
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable-api">Enable API Access</Label>
                <p className="text-sm text-muted-foreground">
                  Allow third-party applications to access your data via API
                </p>
              </div>
              <Switch id="enable-api" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="equipment-api">Equipment Endpoint</Label>
                <p className="text-sm text-muted-foreground">
                  Enable read access to equipment data
                </p>
              </div>
              <Switch id="equipment-api" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="time-entries-api">Time Entries Endpoint</Label>
                <p className="text-sm text-muted-foreground">
                  Allow creating time entries via API
                </p>
              </div>
              <Switch id="time-entries-api" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="fuel-logs-api">Fuel Logs Endpoint</Label>
                <p className="text-sm text-muted-foreground">
                  Allow reading and creating fuel logs via API
                </p>
              </div>
              <Switch id="fuel-logs-api" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="inventory-sync-api">Inventory Sync (ERP)</Label>
                <p className="text-sm text-muted-foreground">
                  Enable inventory synchronization with accounting software
                </p>
              </div>
              <Switch id="inventory-sync-api" />
            </div>
            
            <div className="space-y-2 pt-4">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex gap-2">
                <Input id="api-key" type="password" value="••••••••••••••••••••••••••••••" readOnly className="font-mono" />
                <Button variant="outline" size="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use this key to authenticate API requests. Keep it secret.
              </p>
            </div>
            
            <Button className="mt-2" variant="outline">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M21 12a9 9 0 0 0-9-9 9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9Z"></path><path d="M12 17v.01"></path><path d="M12 14a1.5 1.5 0 0 1 1-1.5 2.6 2.6 0 1 0-3-4"></path></svg>
              View API Documentation
            </Button>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
};
