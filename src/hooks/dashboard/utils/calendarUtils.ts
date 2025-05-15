import { CalendarEvent } from '../useDashboardData';

/**
 * Normalize priority to one of the allowed values
 */
export const normalizePriority = (priority: string | undefined | null): 'high' | 'medium' | 'low' => {
  // Handle undefined or null priority
  if (!priority) {
    return 'medium'; // Default priority if undefined or null
  }
  
  switch(priority.toLowerCase()) {
    case 'high':
    case 'critical':
      return 'high';
    case 'medium':
      return 'medium';
    case 'low':
    default:
      return 'low';
  }
};

/**
 * Get start and end dates for the current week
 */
export const getWeekDateRange = (): { startOfWeek: Date; endOfWeek: Date } => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Start from Monday
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Sunday
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
};

/**
 * Filter calendar events to show only this week's events
 */
export const filterWeeklyCalendarEvents = (calendarEvents: CalendarEvent[]): CalendarEvent[] => {
  const { startOfWeek, endOfWeek } = getWeekDateRange();
  
  return calendarEvents
    .filter(event => event.start >= startOfWeek && event.start <= endOfWeek)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
};
