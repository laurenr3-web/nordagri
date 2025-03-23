
import React from 'react'; // Suppression de useEffect car il n'est pas utilisé
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import { SettingsEssentials } from '@/components/settings/SettingsEssentials';
import { SettingsInterface } from '@/components/settings/SettingsInterface';
import { SettingsNotifications } from '@/components/settings/SettingsNotifications';
import { SettingsIntegrations } from '@/components/settings/SettingsIntegrations';
import { SettingsEquipment } from '@/components/settings/SettingsEquipment';
import { SettingsSecurity } from '@/components/settings/SettingsSecurity';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useLocation, useNavigate } from 'react-router-dom';

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  // Default to 'essentials' tab if none is specified
  const defaultTab = tabParam || 'essentials';
  
  // Update URL when tab changes
  const handleTabChange = (value) => { // Suppression de l'annotation ": string" si vous n'utilisez pas TypeScript
    searchParams.set('tab', value);
    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace: true
    });
  };
  
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex">
        <Navbar />
        {/* Correction des classes de padding contradictoires */}
        <div className="flex-1 pl-72 pr-8 pt-8 pb-8 mx-0 my-[72px]">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            
            <Tabs defaultValue={defaultTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="mb-8 w-full justify-start overflow-x-auto">
                <TabsTrigger value="essentials">Essential Features</TabsTrigger>
                <TabsTrigger value="interface">Interface Customization</TabsTrigger>
                <TabsTrigger value="notifications">Notifications & Alerts</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
                <TabsTrigger value="equipment">Equipment Preferences</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="essentials">
                <SettingsEssentials />
              </TabsContent>
              
              <TabsContent value="interface">
                <SettingsInterface />
              </TabsContent>
              
              <TabsContent value="notifications">
                <SettingsNotifications />
              </TabsContent>
              
              <TabsContent value="integrations">
                <SettingsIntegrations />
              </TabsContent>
              
              <TabsContent value="equipment">
                <SettingsEquipment />
              </TabsContent>
              
              <TabsContent value="security">
                <SettingsSecurity />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
