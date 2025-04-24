
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsEssentials } from '@/components/settings/SettingsEssentials';
import { SettingsSecurity } from '@/components/settings/SettingsSecurity';
import { FarmSettingsSection } from '@/components/settings/farm/FarmSettingsSection';
import { SubscriptionSection } from '@/components/settings/subscription/SubscriptionSection';
import { UserAccessSection } from '@/components/settings/security/UserAccessSection';
import { NotificationSettingsSection } from '@/components/settings/notifications/NotificationSettingsSection';

interface SettingsTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

/**
 * Composant d'onglets pour organiser les différentes sections des paramètres
 */
export default function SettingsTabs({ activeTab, setActiveTab }: SettingsTabsProps) {
  return (
    <Tabs 
      defaultValue="essentials" 
      className="w-full"
      value={activeTab} 
      onValueChange={setActiveTab}
    >
      <div className="overflow-x-auto w-full mb-6 sm:mb-8">
        <TabsList className="flex min-w-[380px] sm:min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-1">
          <TabsTrigger value="essentials" className="min-w-[100px]">Profil</TabsTrigger>
          <TabsTrigger value="farm" className="min-w-[100px]">Ferme</TabsTrigger>
          <TabsTrigger value="subscription" className="min-w-[100px]">Abonnement</TabsTrigger>
          <TabsTrigger value="security" className="min-w-[100px]">Sécurité</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="essentials">
        <SettingsEssentials />
      </TabsContent>
      
      <TabsContent value="farm">
        <FarmSettingsSection />
      </TabsContent>
      
      <TabsContent value="subscription">
        <SubscriptionSection />
      </TabsContent>
      
      <TabsContent value="security">
        <div className="space-y-8">
          <SettingsSecurity />
          <NotificationSettingsSection />
          <UserAccessSection />
        </div>
      </TabsContent>
    </Tabs>
  );
}
