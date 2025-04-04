
import React from 'react';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { MaintenanceCalendar } from '@/components/dashboard/MaintenanceCalendar';
import { MaintenanceEvent } from '@/hooks/dashboard/types/dashboardTypes';

interface CalendarViewProps {
  events: MaintenanceEvent[];
  month: Date;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, month }) => {
  return (
    <DashboardSection title="Maintenance Calendar" subtitle="Detailed view of all scheduled maintenance" className="h-full flex-1">
      <div className="p-4 h-full">
        <MaintenanceCalendar 
          events={events} 
          month={month} 
          className="animate-scale-in w-full h-full" 
        />
      </div>
    </DashboardSection>
  );
};

export default CalendarView;
