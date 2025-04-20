
import React from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import TimeTrackingPage from '@/components/time-tracking/dashboard/TimeTrackingPage';

const TimeTracking = () => {
  return (
    <MainLayout>
      <TimeTrackingPage />
    </MainLayout>
  );
};

export default TimeTracking;
