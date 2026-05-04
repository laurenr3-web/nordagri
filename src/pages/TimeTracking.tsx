
import React from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import { useTranslation } from "react-i18next";
import TimeTrackingPage from '@/components/time-tracking/dashboard/TimeTrackingPage';

const TimeTracking = () => {
  const { t } = useTranslation();
  return (
    <MainLayout>
      <main className="px-4 sm:px-6 lg:px-8 max-w-[1500px] mx-auto pb-24 lg:pb-6">
        <div className="w-full overflow-hidden">
          <TimeTrackingPage />
        </div>
      </main>
    </MainLayout>
  );
};

export default TimeTracking;
