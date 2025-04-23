
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
      <div className="overflow-x-auto w-full mb-8">
        <TabsList className="flex min-w-[600px] sm:min-w-0 grid grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="essentials" className="min-w-[120px]">Essentials</TabsTrigger>
          <TabsTrigger value="security" className="min-w-[120px]">Sécurité</TabsTrigger>
          <TabsTrigger value="notifications" className="min-w-[120px]">Notifications</TabsTrigger>
          <TabsTrigger value="interface" className="min-w-[120px]">Interface</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="essentials">
        <SettingsEssentials />
      </TabsContent>
      
      <TabsContent value="security">
        <SettingsSecurity />
      </TabsContent>
      
      <TabsContent value="notifications">
        <div className="text-center py-8">
          <h3 className="text-xl font-medium mb-2">Paramètres de notifications</h3>
          <p className="text-muted-foreground">
            Configurez comment et quand vous recevez des notifications.
          </p>
        </div>
      </TabsContent>
      
      <TabsContent value="interface">
        <div className="text-center py-8">
          <h3 className="text-xl font-medium mb-2">Paramètres d'interface</h3>
          <p className="text-muted-foreground">
            Personnalisez l'apparence et le comportement de l'application.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
