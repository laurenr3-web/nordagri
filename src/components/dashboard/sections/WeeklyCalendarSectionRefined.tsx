
import React from 'react';
import { DashboardSection } from './DashboardSection';
import { WeeklyCalendar } from '@/components/dashboard/WeeklyCalendar';

interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  type: string;
  priority: string;
  status: string;
}

interface WeeklyCalendarSectionRefinedProps {
  events: CalendarEvent[];
  isEditing: boolean;
  onViewEvent: (id: string | number, type: string) => void;
}

export const WeeklyCalendarSectionRefined: React.FC<WeeklyCalendarSectionRefinedProps> = ({
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
