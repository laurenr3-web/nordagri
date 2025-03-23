
import React from 'react';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { MaintenanceCalendar } from '@/components/dashboard/MaintenanceCalendar';
import { maintenanceEvents } from '@/data/dashboardData';

interface CalendarDashboardViewProps {
  currentMonth: Date;
}

const CalendarDashboardView: React.FC<CalendarDashboardViewProps> = ({ currentMonth }) => {
  return (
    <div className="space-y-8">
      <DashboardSection title="Maintenance Calendar" subtitle="Detailed view of all scheduled maintenance">
        <div className="p-4">
          <MaintenanceCalendar 
            events={maintenanceEvents} 
            month={currentMonth} 
            className="animate-scale-in w-full" 
          />
        </div>
      </DashboardSection>
    </div>
  );
};

export default CalendarDashboardView;
