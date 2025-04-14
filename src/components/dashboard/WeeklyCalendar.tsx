
import React, { useState } from 'react';
import { format, isToday, isSameDay, addDays, startOfWeek, subWeeks, addWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { BlurContainer } from '@/components/ui/blur-container';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/hooks/dashboard/types/dashboardTypes';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

interface WeeklyCalendarProps {
  events: CalendarEvent[];
  onViewEvent?: (eventId: string | number, type: string) => void;
  className?: string;
}

export function WeeklyCalendar({ events, onViewEvent, className }: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday

  // Navigation functions
  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToCurrentWeek = () => setCurrentDate(new Date());

  // Create array of days for this week
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  // Filter events for the current week
  const weekEvents = events.filter(event => {
    return weekDays.some(day => isSameDay(day, event.start));
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">
          {format(weekStart, 'd MMM', { locale: fr })} - {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: fr })}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
            <CalendarDays className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, index) => (
          <div 
            key={index} 
            className={cn(
              "text-center text-sm py-1.5",
              isToday(day) && "bg-primary text-primary-foreground rounded-md font-medium"
            )}
          >
            <div>{format(day, 'EEE', { locale: fr })}</div>
            <div className="text-xs">{format(day, 'd')}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2.5">
        {weekEvents.length > 0 ? (
          weekEvents.map((event) => {
            const eventDay = weekDays.findIndex(day => isSameDay(day, event.start));
            if (eventDay === -1) return null;

            return (
              <BlurContainer
                key={`${event.id}-${event.type}`}
                className={cn(
                  "p-2 cursor-pointer hover:bg-secondary/10 transition-colors",
                  "grid grid-cols-7 items-center text-sm",
                  event.status === 'completed' && "opacity-60"
                )}
                onClick={() => onViewEvent && onViewEvent(event.id, event.type)}
              >
                {Array.from({ length: 7 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-full flex items-center",
                      i === eventDay ? "col-span-2" : "hidden",
                      i === eventDay && "pl-2"
                    )}
                  >
                    {i === eventDay && (
                      <div className="space-y-0.5 w-full">
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant="outline"
                            className={cn(
                              "text-xs px-1.5 py-0",
                              event.type === 'maintenance' ? "bg-blue-100 text-blue-800 border-blue-200" :
                              event.type === 'intervention' ? "bg-amber-100 text-amber-800 border-amber-200" :
                              "bg-purple-100 text-purple-800 border-purple-200"
                            )}
                          >
                            {event.type === 'maintenance' ? 'Entretien' :
                             event.type === 'intervention' ? 'Intervention' : 'Tâche'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(event.start, 'HH:mm')}
                          </span>
                        </div>
                        <div className="font-medium truncate" title={event.title}>
                          {event.title}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </BlurContainer>
            );
          })
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">Aucun événement cette semaine</p>
          </div>
        )}
      </div>
    </div>
  );
}
