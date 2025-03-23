
import React from 'react';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { MaintenanceCalendar } from '@/components/dashboard/MaintenanceCalendar';
import { BlurContainer } from '@/components/ui/blur-container';
import { maintenanceEvents } from '@/data/dashboardData';

interface CalendarDashboardViewProps {
  currentMonth: Date;
}

const CalendarDashboardView: React.FC<CalendarDashboardViewProps> = ({ currentMonth }) => {
  return (
    <div className="space-y-8">
      <DashboardSection title="Maintenance Calendar" subtitle="Detailed view of all scheduled maintenance">
        <BlurContainer className="p-6 rounded-xl border border-border/50">
          <MaintenanceCalendar 
            events={maintenanceEvents} 
            month={currentMonth} 
            className="animate-scale-in w-full" 
          />
        </BlurContainer>
      </DashboardSection>
    </div>
  );
};

export default CalendarDashboardView;
