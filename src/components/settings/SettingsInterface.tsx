import React, { useEffect } from 'react';
import { SettingsSection } from './SettingsSection';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, SunMoon, LayoutDashboard, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useUserSettingsContext } from '@/providers/UserSettingsProvider';
import { useAuthContext } from '@/providers/AuthProvider';

export const SettingsInterface = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user } = useAuthContext();
  const { settings, loading, saveSettings } = useUserSettingsContext();
  
  // Initialize state based on user settings
  const [darkMode, setDarkMode] = React.useState(settings?.theme === 'dark');
  const [highContrast, setHighContrast] = React.useState(settings?.high_contrast || false);
  const [animations, setAnimations] = React.useState(settings?.animations_enabled !== false);

  // Update local state when settings are loaded
  useEffect(() => {
    if (settings) {
      setDarkMode(settings.theme === 'dark');
      setHighContrast(settings.high_contrast);
      setAnimations(settings.animations_enabled);
    }
  }, [settings]);

  // Handle dark mode toggle
  const handleDarkModeToggle = async (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    if (settings && user) {
      await saveSettings({
        ...settings,
        theme: checked ? 'dark' : 'light'
      });
    }
    
    toast.success(`${checked ? 'Dark' : 'Light'} mode activated`);
  };

  // Handle high contrast toggle
  const handleHighContrastToggle = async (checked: boolean) => {
    setHighContrast(checked);
    if (checked) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    if (settings && user) {
      await saveSettings({
        ...settings,
        high_contrast: checked
      });
    }
    
    toast.success(`High contrast ${checked ? 'enabled' : 'disabled'}`);
  };

  // Handle animations toggle
  const handleAnimationsToggle = async (checked: boolean) => {
    setAnimations(checked);
    if (checked) {
      document.documentElement.classList.remove('reduce-motion');
    } else {
      document.documentElement.classList.add('reduce-motion');
    }
    
    if (settings && user) {
      await saveSettings({
        ...settings,
        animations_enabled: checked
      });
    }
    
    toast.success(`Animations ${checked ? 'enabled' : 'disabled'}`);
  };

  // Handle save settings
  const handleSaveSettings = async () => {
    if (settings && user) {
      await saveSettings({
        ...settings,
        theme: darkMode ? 'dark' : 'light',
        high_contrast: highContrast,
        animations_enabled: animations
      });
    }
  };

  return (
    <div className="space-y-6">
      <SettingsSection 
        title="Theme Settings" 
        description="Configure the appearance of the application"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
            <SunMoon className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark theme
                </p>
              </div>
              <Switch 
                id="dark-mode" 
                checked={darkMode} 
                onCheckedChange={handleDarkModeToggle}
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="high-contrast">High Contrast</Label>
                <p className="text-sm text-muted-foreground">
                  Increase contrast for better readability
                </p>
              </div>
              <Switch 
                id="high-contrast" 
                checked={highContrast}
                onCheckedChange={handleHighContrastToggle}
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="animations">Interface Animations</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable UI animations
                </p>
              </div>
              <Switch 
                id="animations" 
                checked={animations}
                onCheckedChange={handleAnimationsToggle}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Dashboard Customization"
        description="Personalize your dashboard layout and widgets"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
            <LayoutDashboard className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Default Dashboard Layout</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred dashboard layout
                </p>
              </div>
              <Select defaultValue="grid">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="border rounded-md p-2"
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2">
                <span className="font-medium">Available Widgets</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-2 pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="widget-equipment">Equipment Status</Label>
                  <Switch id="widget-equipment" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="widget-maintenance">Maintenance Schedule</Label>
                  <Switch id="widget-maintenance" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="widget-parts">Parts Inventory</Label>
                  <Switch id="widget-parts" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="widget-weather">Weather Forecast</Label>
                  <Switch id="widget-weather" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="widget-analytics">Analytics</Label>
                  <Switch id="widget-analytics" />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
        <Button>Save Dashboard Settings</Button>
      </SettingsSection>

      <SettingsSection
        title="Priority Widgets"
        description="Configure which widgets should be displayed prominently"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-secondary h-16 w-16 rounded-full flex items-center justify-center">
            <Star className="h-8 w-8 text-secondary-foreground" />
          </div>
          <div className="space-y-4 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <LayoutDashboard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Maintenance Alerts</p>
                        <p className="text-sm text-muted-foreground">Priority: High</p>
                      </div>
                    </div>
                    <Select defaultValue="high">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <LayoutDashboard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Equipment Status</p>
                        <p className="text-sm text-muted-foreground">Priority: High</p>
                      </div>
                    </div>
                    <Select defaultValue="high">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <LayoutDashboard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Parts Inventory</p>
                        <p className="text-sm text-muted-foreground">Priority: Medium</p>
                      </div>
                    </div>
                    <Select defaultValue="medium">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <LayoutDashboard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Upcoming Tasks</p>
                        <p className="text-sm text-muted-foreground">Priority: Medium</p>
                      </div>
                    </div>
                    <Select defaultValue="medium">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <Button>Save Priority Settings</Button>
      </SettingsSection>
    </div>
  );
};
