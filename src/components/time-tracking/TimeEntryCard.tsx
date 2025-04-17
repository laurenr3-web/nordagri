
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Pause, Play, Trash2, Eye } from 'lucide-react';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TimeEntryCardProps {
  entry: TimeEntry;
  onResume?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

export const TimeEntryCard: React.FC<TimeEntryCardProps> = ({ entry, onResume, onDelete, onView }) => {
  const timeAgo = formatDistanceToNow(new Date(entry.start_time), {
    addSuffix: true,
    locale: fr
  });

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{entry.task_type || 'No Task Type'}</h3>
            <p className="text-sm text-gray-500">{timeAgo}</p>
          </div>
          {entry.status === 'active' && <Clock className="h-5 w-5 text-green-500" />}
          {entry.status === 'paused' && <Pause className="h-5 w-5 text-orange-500" />}
        </div>
        <p className="mt-2 text-gray-700">
          {entry.equipment_name ? `Équipement: ${entry.equipment_name}` : 'No equipment specified'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 py-3">
        {entry.status === 'paused' && onResume && (
          <Button variant="outline" size="sm" onClick={() => onResume(entry.id)}>
            <Play className="h-4 w-4 mr-2" />
            Resume
          </Button>
        )}
        {onView && (
          <Button variant="ghost" size="sm" onClick={() => onView(entry.id)}>
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
        )}
        {onDelete && (
          <Button variant="destructive" size="sm" onClick={() => onDelete(entry.id)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
