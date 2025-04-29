
import React from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import { useTranslation } from "react-i18next";
import TimeTrackingStatisticsPage from '@/components/time-tracking/statistics/TimeTrackingStatisticsPage';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { PageHeader } from '@/components/layout/PageHeader';

const TimeTrackingStatistics = () => {
  const { t } = useTranslation();
  return (
    <MainLayout>
      <LayoutWrapper>
        <PageHeader 
          title="Statistiques du temps" 
          description="Analysez le temps passé par équipement et par utilisateur"
        />
        <TimeTrackingStatisticsPage />
      </LayoutWrapper>
    </MainLayout>
  );
};

export default TimeTrackingStatistics;
