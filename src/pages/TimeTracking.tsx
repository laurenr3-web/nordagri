
import React from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import { useTranslation } from "react-i18next";
import TimeTrackingPage from '@/components/time-tracking/dashboard/TimeTrackingPage';
import { useFarmId } from '@/hooks/useFarmId';
import { useFarmSettings } from '@/hooks/farm/useFarmSettings';

const TimeTracking = () => {
  const { t } = useTranslation();
  const { farmId } = useFarmId();
  const { settings, loading } = useFarmSettings(farmId);

  // Si désactivé côté ferme, masqué :
  if (!loading && settings && settings.show_time_tracking === false) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-16 text-center text-muted-foreground">
          <h2 className="text-2xl font-semibold mb-4">Module désactivé</h2>
          <p>Le suivi du temps est désactivé pour votre exploitation.<br/>
            Contactez votre administrateur pour le réactiver dans les paramètres.</p>
        </div>
      </MainLayout>
    );
  }
  return (
    <MainLayout>
      <TimeTrackingPage />
    </MainLayout>
  );
};
export default TimeTracking;
