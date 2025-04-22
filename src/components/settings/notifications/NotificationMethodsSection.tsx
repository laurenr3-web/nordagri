
import React from 'react';
import { SettingsSection } from '../SettingsSection';
import { Mail } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const NotificationMethodsSection = () => (
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
);

export default NotificationMethodsSection;
