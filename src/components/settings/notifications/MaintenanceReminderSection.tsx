
import React from 'react';
import { SettingsSection } from '../SettingsSection';
import { Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface MaintenanceReminderSectionProps {
  notifPrefs: any;
  loadingNotif: boolean;
  handleNotifChange: (key: string, value: boolean) => void;
}

export const MaintenanceReminderSection = ({
  notifPrefs,
  loadingNotif,
  handleNotifChange,
}: MaintenanceReminderSectionProps) => (
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
);

export default MaintenanceReminderSection;
