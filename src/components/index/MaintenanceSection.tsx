
import React from 'react';
import { Button } from '@/components/ui/button';
import { MaintenanceCalendar } from '@/components/dashboard/MaintenanceCalendar';
import { DashboardSection } from '@/components/dashboard/DashboardSection';

interface MaintenanceEvent {
  id: string; // Updated to string to match our interface
  title: string;
  date: Date;
  duration: number;
  priority: 'low' | 'medium' | 'high';
  equipment: string;
}

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
