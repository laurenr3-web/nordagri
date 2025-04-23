
import React from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import { useTranslation } from "react-i18next";
import TimeTrackingPage from '@/components/time-tracking/dashboard/TimeTrackingPage';

const TimeTracking = () => {
  const { t } = useTranslation();
  return (
    <MainLayout>
      <TimeTrackingPage />
    </MainLayout>
  );
};
export default TimeTracking;
