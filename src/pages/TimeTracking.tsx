
import React from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import { useTranslation } from "react-i18next";
import TimeTrackingPage from '@/components/time-tracking/dashboard/TimeTrackingPage';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { PageHeader } from '@/components/layout/PageHeader';

const TimeTracking = () => {
  const { t } = useTranslation();
  return (
    <MainLayout>
      <LayoutWrapper>
        <PageHeader 
          title="Suivi du temps" 
          description="Enregistrez et suivez le temps passé sur vos tâches"
        />
        <div className="w-full overflow-hidden">
          <TimeTrackingPage />
        </div>
      </LayoutWrapper>
    </MainLayout>
  );
};

export default TimeTracking;
