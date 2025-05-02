import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSection } from './profile/ProfileSection';
import { FarmSettingsSection } from './farm/FarmSettingsSection';
import { PasswordSection } from './security/PasswordSection';
import { SimpleNotificationSection } from './notifications/SimpleNotificationSection';
import { UserAccessSection } from './security/UserAccessSection';
import { NotificationSettingsSection } from './notifications/NotificationSettingsSection';
import { SubscriptionSection } from './subscription/SubscriptionSection';
import { useSettings } from '@/hooks/useSettings';
import { Loader2 } from 'lucide-react';
interface SettingsTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}
export default function SettingsTabs({
  activeTab,
  setActiveTab
}: SettingsTabsProps) {
  const {
    loading,
    profile,
    notificationSettings,
    updateProfile,
    updatePassword,
    updateNotifications,
    manageSubscription
  } = useSettings();

  // Extract first and last name from full_name
  const nameParts = profile.full_name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  if (loading) {
    return <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p>Chargement des paramètres...</p>
      </div>;
  }
  return <Tabs defaultValue="essentials" value={activeTab} onValueChange={setActiveTab} className="w-full px-[93px]">
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
          <ProfileSection firstName={firstName} lastName={lastName} email={profile.email} loading={loading} onUpdateProfile={(firstName, lastName) => {
          const fullName = `${firstName} ${lastName}`.trim();
          return updateProfile(fullName, profile.email);
        }} />
          <SimpleNotificationSection emailEnabled={notificationSettings.email_enabled} smsEnabled={notificationSettings.sms_enabled} phoneNumber={notificationSettings.phone_number} onUpdateNotifications={updateNotifications} loading={loading} />
        </div>
      </TabsContent>
      
      <TabsContent value="farm">
        <FarmSettingsSection />
      </TabsContent>
      
      <TabsContent value="subscription">
        <SubscriptionSection onManageSubscription={manageSubscription} />
      </TabsContent>
      
      <TabsContent value="security">
        <div className="space-y-8">
          <PasswordSection onUpdatePassword={updatePassword} />
          <NotificationSettingsSection />
          <UserAccessSection />
        </div>
      </TabsContent>
    </Tabs>;
}