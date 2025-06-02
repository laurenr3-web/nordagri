
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarWidgetProps {
  data: any[];
  loading: boolean;
  size: 'small' | 'medium' | 'large' | 'full';
  view?: 'week' | 'month';
}

export const CalendarWidget = ({ data, loading, size, view = 'week' }: CalendarWidgetProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  const eventsToShow = data?.slice(0, size === 'small' ? 3 : 7) || [];

  if (eventsToShow.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Aucun événement à venir</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Événements à venir</h3>
      
      <div className="space-y-2">
        {eventsToShow.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(event.start), 'PPP', { locale: fr })}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
