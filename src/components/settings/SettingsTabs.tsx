
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSection } from './profile/ProfileSection';
import { FarmSettingsSection } from './farm/FarmSettingsSection';
import { PasswordSection } from './security/PasswordSection';
import { SimpleNotificationSection } from './notifications/SimpleNotificationSection';
import { UserAccessSection } from './security/UserAccessSection';
import { NotificationSettingsSection } from './notifications/NotificationSettingsSection';
import { SubscriptionSection } from './subscription/SubscriptionSection';

interface SettingsTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

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
        <div className="space-y-8">
          <ProfileSection />
          <SimpleNotificationSection />
        </div>
      </TabsContent>
      
      <TabsContent value="farm">
        <FarmSettingsSection />
      </TabsContent>
      
      <TabsContent value="subscription">
        <SubscriptionSection />
      </TabsContent>
      
      <TabsContent value="security">
        <div className="space-y-8">
          <PasswordSection />
          <NotificationSettingsSection />
          <UserAccessSection />
        </div>
      </TabsContent>
    </Tabs>
  );
}
