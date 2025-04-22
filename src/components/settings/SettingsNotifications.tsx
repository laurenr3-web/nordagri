
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import InventoryAlertSection from './notifications/InventoryAlertSection';
import MaintenanceReminderSection from './notifications/MaintenanceReminderSection';
import NotificationMethodsSection from './notifications/NotificationMethodsSection';
import ApiIntegrationSection from './notifications/ApiIntegrationSection';

const NOTIF_INIT = {
  stock_low_enabled: true,
  maintenance_reminder_enabled: true,
};

export const SettingsNotifications = () => {
  const [notifPrefs, setNotifPrefs] = useState(NOTIF_INIT);
  const [loadingNotif, setLoadingNotif] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoadingNotif(true);
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      if (!userId) {
        setLoadingNotif(false);
        return;
      }
      const { data, error } = await supabase
        .from('notification_settings')
        .select('stock_low_enabled, maintenance_reminder_enabled')
        .eq('user_id', userId)
        .maybeSingle();
      if (!error && data) setNotifPrefs(data);
      setLoadingNotif(false);
    };
    fetchSettings();
  }, []);

  const handleNotifChange = (key: keyof typeof NOTIF_INIT, value: boolean) => {
    setNotifPrefs((old) => ({ ...old, [key]: value }));

    supabase.auth.getSession().then(async ({ data: session }) => {
      const userId = session?.session?.user?.id;
      if (!userId) return;
      const { error } = await supabase
        .from('notification_settings')
        .upsert(
          { user_id: userId, [key]: value },
          { onConflict: 'user_id' }
        );
      if (error) {
        toast.error('Erreur lors de la sauvegarde des notifications');
      } else {
        toast.success('Préférences notifications sauvegardées');
      }
    });
  };

  return (
    <div className="space-y-6">
      <InventoryAlertSection 
        notifPrefs={notifPrefs}
        loadingNotif={loadingNotif}
        handleNotifChange={handleNotifChange}
      />
      <MaintenanceReminderSection 
        notifPrefs={notifPrefs}
        loadingNotif={loadingNotif}
        handleNotifChange={handleNotifChange}
      />
      <NotificationMethodsSection />
      <ApiIntegrationSection />
    </div>
  );
};
