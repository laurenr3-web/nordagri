
import React from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import { useTranslation } from "react-i18next";
import TimeTrackingPage from '@/components/time-tracking/dashboard/TimeTrackingPage';

const TimeTracking = () => {
  const { t } = useTranslation();
  return (
    <MainLayout>
      <div className="w-full max-w-screen-2xl mx-auto px-8 lg:px-8" style={{ overflowX: "hidden" }}>
        <TimeTrackingPage />
      </div>
    </MainLayout>
  );
};
export default TimeTracking;
