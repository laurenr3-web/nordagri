
import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MaintenanceCalendar } from '@/components/dashboard/MaintenanceCalendar';
import { motion } from 'framer-motion';
import { format, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarWidgetProps {
  data: any[];
  loading: boolean;
  size: 'small' | 'medium' | 'large' | 'full';
  view?: 'week' | 'month';
}

export const CalendarWidget = ({ data, loading, size, view = 'month' }: CalendarWidgetProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const eventsForCalendar = data || [];

  if (eventsForCalendar.length === 0 && size === 'small') {
    return (
      <div className="text-center py-4">
        <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">Aucun événement</p>
      </div>
    );
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleAddEvent = (date?: Date) => {
    // TODO: Implement add event functionality
    console.log('Add event for date:', date);
  };

  const handleViewEvent = (eventId: string | number) => {
    // TODO: Implement view event functionality
    console.log('View event:', eventId);
  };

  // For small widgets, show a compact view
  if (size === 'small') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Calendrier</h3>
          <Button variant="ghost" size="sm" onClick={() => handleAddEvent()}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-sm font-medium">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </p>
          <p className="text-xs text-muted-foreground">
            {eventsForCalendar.length} événement{eventsForCalendar.length !== 1 ? 's' : ''}
          </p>
        </div>

        {eventsForCalendar.slice(0, 3).map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 p-2 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
            onClick={() => handleViewEvent(event.id)}
          >
            <div className={`w-2 h-2 rounded-full ${
              event.priority === 'high' ? 'bg-red-500' :
              event.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{event.title}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(event.date), 'dd/MM', { locale: fr })}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // For medium, large, and full widgets, show the full calendar
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Calendrier de maintenance</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </span>
            <Button variant="ghost" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleAddEvent()}>
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        </div>
      </div>
      
      <MaintenanceCalendar
        events={eventsForCalendar}
        month={currentMonth}
        onAddTask={handleAddEvent}
        onViewTask={handleViewEvent}
        className="w-full"
      />
    </div>
  );
};
