
import React from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import { useTranslation } from "react-i18next";
import TimeTrackingStatisticsPage from '@/components/time-tracking/statistics/TimeTrackingStatisticsPage';

const TimeTrackingStatistics = () => {
  const { t } = useTranslation();
  return (
    <MainLayout>
      <div className="w-full max-w-screen-xl mx-auto px-6 lg:px-12" style={{ overflowX: "hidden" }}>
        <TimeTrackingStatisticsPage />
      </div>
    </MainLayout>
  );
};

export default TimeTrackingStatistics;
