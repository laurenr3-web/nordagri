
import React from 'react';
import { DashboardSection } from '@/components/dashboard/sections/DashboardSection';
import { WeeklyCalendar } from '@/components/dashboard/WeeklyCalendar';
import { CalendarEvent } from '@/hooks/dashboard/types/dashboardTypes';

interface DashboardCalendarProps {
  events: CalendarEvent[];
  isEditing: boolean;
  onViewEvent: (id: string | number, type: string) => void;
}

export const DashboardCalendar: React.FC<DashboardCalendarProps> = ({
  events,
  isEditing,
  onViewEvent
}) => {
  return (
    <DashboardSection
      id="weekly-calendar"
      title="Calendrier de la semaine"
      subtitle="Vos rendez-vous à venir"
      isEditing={isEditing}
    >
      <WeeklyCalendar
        events={events}
        onViewEvent={onViewEvent}
      />
    </DashboardSection>
  );
};
