
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsEssentials } from '@/components/settings/SettingsEssentials';
import { SettingsSecurity } from '@/components/settings/SettingsSecurity';
import { useFarmId } from '@/hooks/useFarmId';
import { useFarmSettings } from '@/hooks/farm/useFarmSettings';
import { ModulesSettingsSection } from './ModulesSettingsSection';

export default function SettingsTabs() {
  const [activeTab, setActiveTab] = useState('essentials');
  const { farmId } = useFarmId();
  const { isAdmin } = useFarmSettings(farmId);

  return (
    <Tabs
      defaultValue="essentials"
      className="w-full"
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8 overflow-x-auto max-w-full">
        <TabsTrigger value="essentials" className="min-w-[100px]">Essentials</TabsTrigger>
        <TabsTrigger value="security" className="min-w-[100px]">Sécurité</TabsTrigger>
        <TabsTrigger value="notifications" className="min-w-[100px]">Notifications</TabsTrigger>
        <TabsTrigger value="interface" className="min-w-[100px]">Interface</TabsTrigger>
        {isAdmin && <TabsTrigger value="modules" className="min-w-[100px]">Modules</TabsTrigger>}
      </TabsList>
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
      {isAdmin && (
        <TabsContent value="modules">
          {farmId && <ModulesSettingsSection farmId={farmId} />}
        </TabsContent>
      )}
    </Tabs>
  );
}
