
import React from 'react';
import { SettingsSection } from './SettingsSection';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Bell, Clock, Mail } from 'lucide-react';

export const SettingsNotifications = () => {
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
    </div>
  );
};
