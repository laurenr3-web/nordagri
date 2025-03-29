
import React from 'react';
import { Button } from '@/components/ui/button';
import { MaintenanceCalendar } from '@/components/dashboard/MaintenanceCalendar';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { MaintenanceEvent } from '@/hooks/dashboard/useDashboardData';

interface MaintenanceSectionProps {
  events: MaintenanceEvent[];
  month: Date;
  onCalendarClick: () => void;
}

const MaintenanceSection: React.FC<MaintenanceSectionProps> = ({ 
  events, 
  month, 
  onCalendarClick 
}) => {
  return (
    <DashboardSection 
      title="Maintenance Schedule" 
      subtitle="Plan ahead for equipment servicing" 
      action={
        <Button variant="outline" size="sm" onClick={onCalendarClick}>
          Full Calendar
        </Button>
      }
    >
      <MaintenanceCalendar 
        events={events} 
        month={month} 
        className="animate-scale-in" 
      />
    </DashboardSection>
  );
};

export default MaintenanceSection;
