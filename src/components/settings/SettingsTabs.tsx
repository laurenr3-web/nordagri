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
      <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
        <TabsTrigger value="essentials">Essentials</TabsTrigger>
        <TabsTrigger value="security">Sécurité</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="interface">Interface</TabsTrigger>
        {isAdmin && <TabsTrigger value="modules">Modules</TabsTrigger>}
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
