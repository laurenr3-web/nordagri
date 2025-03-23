import React from 'react';
import { SettingsSection } from './SettingsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Cloud, Link, Upload } from 'lucide-react';
import { AISettingsSection } from './ai/AISettingsSection';

export const SettingsIntegrations = () => {
  return (
    <div className="space-y-6">
      <SettingsSection 
        title="Intelligence Artificielle" 
        description="Configurez l'assistant IA Claude d'Anthropic pour votre exploitation"
      >
        <AISettingsSection />
      </SettingsSection>

      <SettingsSection 
        title="Weather Services" 
        description="Configure integration with weather forecast providers"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
            <Cloud className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label htmlFor="weather-provider">Weather Provider</Label>
              <Select defaultValue="meteofrance">
                <SelectTrigger id="weather-provider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meteofrance">Météo-France</SelectItem>
                  <SelectItem value="openweather">OpenWeatherMap</SelectItem>
                  <SelectItem value="weatherapi">WeatherAPI.com</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input id="api-key" type="password" placeholder="Enter your API key" />
              <p className="text-xs text-muted-foreground">
                Required for accessing weather data
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="update-frequency">Data Update Frequency</Label>
              <Select defaultValue="hourly">
                <SelectTrigger id="update-frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="realtime">Real-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="weather-alerts">Weather Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications for severe weather conditions
                </p>
              </div>
              <Switch id="weather-alerts" defaultChecked />
            </div>
          </div>
        </div>
        <Button>Save Weather Integration</Button>
      </SettingsSection>

      <SettingsSection
        title="Agricultural Software Integration"
        description="Connect with other agricultural software platforms"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
            <Link className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div className="space-y-4 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">John Deere Operations Center</p>
                      <p className="text-sm text-muted-foreground">Fleet management integration</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Climate FieldView</p>
                      <p className="text-sm text-muted-foreground">Field data and analytics</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Cropwise</p>
                      <p className="text-sm text-muted-foreground">Crop management platform</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Farm Management Software</p>
                      <p className="text-sm text-muted-foreground">Financial and administrative tools</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-2 pt-2">
              <Label htmlFor="custom-integration">Custom Integration URL</Label>
              <div className="flex gap-2">
                <Input 
                  id="custom-integration" 
                  placeholder="https://api.example.com/integration" 
                  className="flex-1"
                />
                <Button variant="outline">Connect</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Add a custom API endpoint for integration
              </p>
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Data Import/Export"
        description="Configure data formats and export settings"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label htmlFor="default-export-format">Default Export Format</Label>
              <Select defaultValue="csv">
                <SelectTrigger id="default-export-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Format used when exporting data
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supported-import">Supported Import Formats</Label>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="cursor-default">
                  CSV
                </Button>
                <Button variant="outline" className="cursor-default">
                  Excel
                </Button>
                <Button variant="outline" className="cursor-default">
                  JSON
                </Button>
                <Button variant="outline" className="cursor-default">
                  ISOXML
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Formats that can be imported into the system
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="auto-backup">Automatic Data Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Regularly back up all your data
                </p>
              </div>
              <Switch id="auto-backup" defaultChecked />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Backup Frequency</Label>
              <Select defaultValue="weekly">
                <SelectTrigger id="backup-frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="include-images">Include Images in Exports</Label>
                <p className="text-sm text-muted-foreground">
                  Include equipment images in exported data
                </p>
              </div>
              <Switch id="include-images" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button>Save Data Settings</Button>
          <Button variant="outline">Export All Data</Button>
          <Button variant="outline">Import Data</Button>
        </div>
      </SettingsSection>
    </div>
  );
};
