
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import TimeTrackingHeader from '@/components/timetracking/TimeTrackingHeader';
import TimeTrackingContent from '@/components/timetracking/TimeTrackingContent';
import { useTimeTracking } from '@/hooks/timetracking/useTimeTracking';

const TimeTracking = () => {
  const { 
    activities,
    activeTracking,
    equipments,
    isAddActivityDialogOpen,
    setIsAddActivityDialogOpen,
    startTracking,
    pauseTracking,
    stopTracking,
    addActivity,
    isMapViewActive,
    setIsMapViewActive
  } = useTimeTracking();

  return (
    <Layout>
      <div className="flex flex-col min-h-[calc(100vh-100px)]">
        <TimeTrackingHeader 
          isMapViewActive={isMapViewActive}
          setIsMapViewActive={setIsMapViewActive}
          onAddActivity={() => setIsAddActivityDialogOpen(true)}
          activeTracking={activeTracking}
        />
        <TimeTrackingContent 
          activities={activities}
          activeTracking={activeTracking}
          isMapViewActive={isMapViewActive}
          startTracking={startTracking}
          pauseTracking={pauseTracking}
          stopTracking={stopTracking}
          equipments={equipments}
          isAddActivityDialogOpen={isAddActivityDialogOpen}
          setIsAddActivityDialogOpen={setIsAddActivityDialogOpen}
          onAddActivity={addActivity}
        />
      </div>
    </Layout>
  );
};

export default TimeTracking;
