import React from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import { useTranslation } from "react-i18next";
import TimeTrackingPage from '@/components/time-tracking/dashboard/TimeTrackingPage';

const TimeTracking = () => {
  const { t } = useTranslation();
  return (
    <MainLayout>
      <div className="w-full max-w-screen-xl mx-auto px-6 lg:px-12" style={{ overflowX: "hidden" }}>
        <TimeTrackingPage />
      </div>
    </MainLayout>
  );
};
export default TimeTracking;
