
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsEssentials } from '@/components/settings/SettingsEssentials';
import { SettingsSecurity } from '@/components/settings/SettingsSecurity';

export default function SettingsTabs() {
  const [activeTab, setActiveTab] = useState('essentials');

  return (
    <Tabs 
      defaultValue="essentials" 
      className="w-full"
      value={activeTab} 
      onValueChange={setActiveTab}
    >
      <div className="overflow-x-auto w-full mb-6 sm:mb-8">
        <TabsList className="flex min-w-[380px] sm:min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-1">
          <TabsTrigger value="essentials" className="min-w-[100px]">Essentials</TabsTrigger>
          <TabsTrigger value="security" className="min-w-[100px]">Sécurité</TabsTrigger>
          <TabsTrigger value="notifications" className="min-w-[100px]">Notifications</TabsTrigger>
          <TabsTrigger value="interface" className="min-w-[100px]">Interface</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="essentials">
        <SettingsEssentials />
      </TabsContent>
      <TabsContent value="security">
        <SettingsSecurity />
      </TabsContent>
      <TabsContent value="notifications">
        <div className="text-center py-6 sm:py-8 px-2">
          <h3 className="text-lg sm:text-xl font-medium mb-2">Paramètres de notifications</h3>
          <p className="text-muted-foreground text-sm">Configurez comment et quand vous recevez des notifications.</p>
        </div>
      </TabsContent>
      <TabsContent value="interface">
        <div className="text-center py-6 sm:py-8 px-2">
          <h3 className="text-lg sm:text-xl font-medium mb-2">Paramètres d'interface</h3>
          <p className="text-muted-foreground text-sm">Personnalisez l'apparence et le comportement de l'application.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
