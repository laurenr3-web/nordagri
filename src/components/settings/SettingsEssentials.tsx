
import React from 'react';
import { SettingsSection } from './SettingsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputWithSuffix } from '@/components/ui/input-with-suffix';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { User, Building, Users } from 'lucide-react';

export const SettingsEssentials = () => {
  return (
    <div className="space-y-6">
      <SettingsSection 
        title="Profile & Account" 
        description="Manage your personal information and account settings"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium">John Doe</h3>
            <p className="text-sm text-muted-foreground">john.doe@example.com</p>
            <Button variant="outline" size="sm" className="mt-2">
              Edit Profile
            </Button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Farm Information"
        description="Details about your agricultural operation"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
              <Building className="h-8 w-8 text-secondary-foreground" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farm-name">Farm Name</Label>
                  <Input id="farm-name" defaultValue="Green Valley Farm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farm-size">Farm Size</Label>
                  <InputWithSuffix id="farm-size" defaultValue="250" suffix="acres" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="farm-type">Farm Type</Label>
                  <Select defaultValue="mixed">
                    <SelectTrigger id="farm-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crops">Crop Farming</SelectItem>
                      <SelectItem value="livestock">Livestock</SelectItem>
                      <SelectItem value="mixed">Mixed Farming</SelectItem>
                      <SelectItem value="organic">Organic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farm-location">Location</Label>
                  <Input id="farm-location" defaultValue="Bordeaux, France" />
                </div>
              </div>
            </div>
          </div>
          <Button>Save Farm Information</Button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="User Management & Permissions"
        description="Manage team members and their access levels"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
            <Users className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Team Members</h3>
              <Button size="sm">Add User</Button>
            </div>
            <div className="rounded-md border divide-y">
              <div className="p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-muted-foreground">Administrator</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              <div className="p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">Jane Smith</p>
                  <p className="text-sm text-muted-foreground">Field Manager</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              <div className="p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">Robert Johnson</p>
                  <p className="text-sm text-muted-foreground">Mechanic</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Regional Preferences"
        description="Configure units of measurement, currency, and date formats"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="units">Measurement Units</Label>
            <Select defaultValue="metric">
              <SelectTrigger id="units">
                <SelectValue placeholder="Select units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric (km, kg, ha)</SelectItem>
                <SelectItem value="imperial">Imperial (mi, lb, acres)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select defaultValue="eur">
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eur">Euro (€)</SelectItem>
                <SelectItem value="usd">US Dollar ($)</SelectItem>
                <SelectItem value="gbp">British Pound (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date-format">Date Format</Label>
            <Select defaultValue="dd/mm/yyyy">
              <SelectTrigger id="date-format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button className="mt-4">Save Regional Preferences</Button>
      </SettingsSection>
    </div>
  );
};
