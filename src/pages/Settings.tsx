
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import { SettingsEssentials } from '@/components/settings/SettingsEssentials';
import { SettingsInterface } from '@/components/settings/SettingsInterface';
import { SettingsNotifications } from '@/components/settings/SettingsNotifications';
import { SettingsIntegrations } from '@/components/settings/SettingsIntegrations';
import { SettingsEquipment } from '@/components/settings/SettingsEquipment';

const Settings = () => {
  return (
    <div className="min-h-screen bg-background flex">
      <Navbar />
      <div className="flex-1 p-8 pl-72">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>
          
          <Tabs defaultValue="essentials" className="w-full">
            <TabsList className="mb-8 w-full justify-start">
              <TabsTrigger value="essentials">Essential Features</TabsTrigger>
              <TabsTrigger value="interface">Interface Customization</TabsTrigger>
              <TabsTrigger value="notifications">Notifications & Alerts</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="equipment">Equipment Preferences</TabsTrigger>
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
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
