
import React, { useState } from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext } from '@/providers/AuthProvider';
import { Loader2, User, Building, CreditCard, Shield, Bell } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useSettingsState } from '@/hooks/settings/useSettingsState';
import { ProfileSection } from '@/components/settings/profile/ProfileSection';
import { PasswordSection } from '@/components/settings/security/PasswordSection';
import { SimpleNotificationSection } from '@/components/settings/notifications/SimpleNotificationSection';
import { FarmSettingsSection } from '@/components/settings/farm/FarmSettingsSection';
import { ModulesSection } from '@/components/settings/farm/ModulesSection';
import { SubscriptionSection } from '@/components/settings/subscription/SubscriptionSection';
import { NotificationSettingsSection } from '@/components/settings/notifications/NotificationSettingsSection';
import { UserAccessSection } from '@/components/settings/security/UserAccessSection';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

// Configuration des onglets avec icônes et descriptions
const TABS_CONFIG = [
  {
    value: 'profile',
    label: 'Profil',
    icon: User,
    description: 'Gérez vos informations personnelles et préférences'
  },
  {
    value: 'farm',
    label: 'Ferme',
    icon: Building,
    description: 'Configuration de votre exploitation agricole'
  },
  {
    value: 'security',
    label: 'Sécurité',
    icon: Shield,
    description: 'Paramètres de sécurité et confidentialité'
  },
  {
    value: 'notifications',
    label: 'Notifications',
    icon: Bell,
    description: 'Gérez vos préférences de notification'
  },
  {
    value: 'subscription',
    label: 'Abonnement',
    icon: CreditCard,
    description: 'Gérez votre abonnement et facturation'
  }
];

const Settings = () => {
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const [activeTab, setActiveTab] = useState('profile');
  const { hasAnyUnsavedChanges, markAsChanged } = useSettingsState();
  
  const {
    loading,
    profile,
    enabledModules,
    notificationSettings,
    updateProfile,
    updatePassword,
    toggleModule,
    updateNotifications,
    manageSubscription
  } = useSettings();

  // Loading state
  if (authLoading) {
    return (
      <MainLayout>
        <LayoutWrapper>
          <div className="flex items-center justify-center h-[80vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">Chargement des paramètres...</p>
            </div>
          </div>
        </LayoutWrapper>
      </MainLayout>
    );
  }

  // Auth check
  if (!isAuthenticated) {
    return (
      <MainLayout>
        <LayoutWrapper>
          <div className="max-w-md mx-auto mt-16">
            <Alert>
              <AlertDescription>
                <h2 className="text-xl font-semibold mb-4">Connexion requise</h2>
                <p className="mb-4">Veuillez vous connecter pour accéder aux paramètres.</p>
                <a 
                  href="/auth" 
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
                >
                  Se connecter
                </a>
              </AlertDescription>
            </Alert>
          </div>
        </LayoutWrapper>
      </MainLayout>
    );
  }

  const currentTab = TABS_CONFIG.find(tab => tab.value === activeTab);

  return (
    <MainLayout>
      <LayoutWrapper>
        <PageHeader 
          title="Paramètres" 
          description={currentTab?.description}
        />
        
        {hasAnyUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <Alert className="bg-amber-50 border-amber-200">
              <AlertDescription className="text-amber-800">
                Vous avez des modifications non enregistrées
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="space-y-6"
        >
          {/* Onglets avec responsive design amélioré */}
          <div className="bg-card border rounded-lg p-2">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2 bg-transparent h-auto">
              {TABS_CONFIG.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex flex-col sm:flex-row items-center gap-2 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted transition-all"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs sm:text-sm font-medium">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
          
          {/* Contenu des onglets avec animations */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="profile" className="space-y-6 mt-0">
                <ProfileSection 
                  firstName={profile.full_name.split(' ')[0] || ''}
                  lastName={profile.full_name.split(' ').slice(1).join(' ') || ''}
                  email={profile.email}
                  loading={loading}
                  onUpdateProfile={(firstName, lastName) => {
                    const fullName = `${firstName} ${lastName}`.trim();
                    return updateProfile(fullName, profile.email);
                  }}
                  onFieldChange={() => markAsChanged('profile')}
                />
                <SimpleNotificationSection
                  emailEnabled={notificationSettings.email_enabled}
                  smsEnabled={notificationSettings.sms_enabled}
                  phoneNumber={notificationSettings.phone_number}
                  onUpdateNotifications={updateNotifications}
                  loading={loading}
                />
              </TabsContent>
              
              <TabsContent value="farm" className="space-y-6 mt-0">
                <FarmSettingsSection />
                <ModulesSection
                  modules={enabledModules}
                  onToggleModule={toggleModule}
                  loading={loading}
                />
              </TabsContent>
              
              <TabsContent value="security" className="space-y-6 mt-0">
                <PasswordSection onUpdatePassword={updatePassword} />
                <UserAccessSection />
              </TabsContent>
              
              <TabsContent value="notifications" className="space-y-6 mt-0">
                <SimpleNotificationSection
                  emailEnabled={notificationSettings.email_enabled}
                  smsEnabled={notificationSettings.sms_enabled}
                  phoneNumber={notificationSettings.phone_number}
                  onUpdateNotifications={updateNotifications}
                  loading={loading}
                />
                <NotificationSettingsSection />
              </TabsContent>
              
              <TabsContent value="subscription" className="space-y-6 mt-0">
                <SubscriptionSection onManageSubscription={manageSubscription} />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </LayoutWrapper>
    </MainLayout>
  );
};

export default Settings;
