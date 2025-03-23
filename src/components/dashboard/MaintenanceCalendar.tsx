
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { cn } from '@/lib/utils';

type MaintenanceEvent = {
  id: string;
  title: string;
  date: Date;
  duration: number; // in hours
  priority: 'low' | 'medium' | 'high';
  equipment: string;
};

interface MaintenanceCalendarProps {
  events: MaintenanceEvent[];
  month: Date;
  className?: string;
}

export function MaintenanceCalendar({
  events,
  month,
  className
}: MaintenanceCalendarProps) {
  // Helper function to get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get first day of month
  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  
  // Calculate days in current month
  const daysInMonth = getDaysInMonth(month.getFullYear(), month.getMonth());
  
  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  
  // Add actual days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }
  
  // Group events by date
  const eventsByDay: Record<number, MaintenanceEvent[]> = {};
  events.forEach(event => {
    const day = event.date.getDate();
    if (!eventsByDay[day]) {
      eventsByDay[day] = [];
    }
    eventsByDay[day].push(event);
  });

  // Helper to determine cell color based on events
  const getCellColor = (day: number | null) => {
    if (!day || !eventsByDay[day]) return "";
    
    const dayEvents = eventsByDay[day];
    const hasHighPriority = dayEvents.some(e => e.priority === 'high');
    const hasMediumPriority = dayEvents.some(e => e.priority === 'medium');
    
    if (hasHighPriority) return "bg-red-50 dark:bg-red-900/20";
    if (hasMediumPriority) return "bg-harvest-50 dark:bg-harvest-900/20";
    return "bg-agri-50 dark:bg-agri-900/20";
  };
  
  // Format month name
  const monthName = month.toLocaleString('default', { month: 'long' });
  const year = month.getFullYear();
  
  return (
    <BlurContainer 
      className={cn("p-4", className)}
      raised
    >
      <div className="mb-4">
        <h3 className="font-medium">{monthName} {year}</h3>
        <p className="text-sm text-muted-foreground">Maintenance Schedule</p>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={index} className="text-xs text-center font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <div 
            key={index} 
            className={cn(
              "aspect-square rounded-md flex flex-col relative",
              day ? "bg-secondary/50 hover:bg-secondary/80 transition-colors" : "",
              getCellColor(day)
            )}
          >
            {day && (
              <>
                <span className="text-xs p-1">{day}</span>
                {eventsByDay[day] && (
                  <div className="px-1 pb-1">
                    {eventsByDay[day].slice(0, 2).map((event, eventIndex) => (
                      <div 
                        key={eventIndex}
                        className={cn(
                          "text-xs mb-0.5 truncate px-1 py-0.5 rounded-sm",
                          event.priority === 'high' ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200" : "",
                          event.priority === 'medium' ? "bg-harvest-100 text-harvest-800 dark:bg-harvest-900/40 dark:text-harvest-200" : "",
                          event.priority === 'low' ? "bg-agri-100 text-agri-800 dark:bg-agri-900/40 dark:text-agri-200" : ""
                        )}
                      >
                        {event.title}
                      </div>
                    ))}
                    {eventsByDay[day].length > 2 && (
                      <div className="text-xs text-center text-muted-foreground">
                        +{eventsByDay[day].length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </BlurContainer>
  );
}
