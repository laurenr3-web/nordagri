
import React from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import { useTranslation } from "react-i18next";
import TimeTrackingPage from '@/components/time-tracking/dashboard/TimeTrackingPage';
import { PageHeader } from '@/components/layout/PageHeader';

const TimeTracking = () => {
  const { t } = useTranslation();
  return (
    <MainLayout>
      <main className="px-4 sm:px-6 lg:px-8 xl:px-10 max-w-[1600px] mx-auto pb-24 lg:pb-6">
        <PageHeader
          title="Suivi du temps"
          description="Enregistrez et suivez le temps passé sur vos tâches"
        />
        <div className="w-full overflow-hidden">
          <TimeTrackingPage />
        </div>
      </main>
    </MainLayout>
  );
};

export default TimeTracking;
