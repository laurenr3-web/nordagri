
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsEssentials } from '@/components/settings/SettingsEssentials';
import { SettingsInterface } from '@/components/settings/SettingsInterface';
import { SettingsNotifications } from '@/components/settings/SettingsNotifications';
import { SettingsIntegrations } from '@/components/settings/SettingsIntegrations';
import { SettingsEquipment } from '@/components/settings/SettingsEquipment';
import { SettingsSecurity } from '@/components/settings/SettingsSecurity';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from "@/components/layout/Navbar";

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  // Default to 'essentials' tab if none is specified
  const defaultTab = tabParam || 'essentials';
  
  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    searchParams.set('tab', value);
    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace: true
    });
  };
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-full mx-auto h-full">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            
            <Tabs defaultValue={defaultTab} onValueChange={handleTabChange} className="w-full h-full">
              <TabsList className="mb-8 w-full justify-start overflow-x-auto">
                <TabsTrigger value="essentials">Essential Features</TabsTrigger>
                <TabsTrigger value="interface">Interface Customization</TabsTrigger>
                <TabsTrigger value="notifications">Notifications & Alerts</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
                <TabsTrigger value="equipment">Equipment Preferences</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="essentials" className="h-full">
                <SettingsEssentials />
              </TabsContent>
              
              <TabsContent value="interface" className="h-full">
                <SettingsInterface />
              </TabsContent>
              
              <TabsContent value="notifications" className="h-full">
                <SettingsNotifications />
              </TabsContent>
              
              <TabsContent value="integrations" className="h-full">
                <SettingsIntegrations />
              </TabsContent>
              
              <TabsContent value="equipment" className="h-full">
                <SettingsEquipment />
              </TabsContent>
              
              <TabsContent value="security" className="h-full">
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
