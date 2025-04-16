import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, Play, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TimeEntry } from '@/hooks/time-tracking/types';

interface TimeEntryCardProps {
  entry: TimeEntry;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TimeEntryCard({ entry, onResume, onDelete }: TimeEntryCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium">
              {entry.task_type === 'other' ? entry.custom_task_type : entry.task_type}
            </h3>
            <p className="text-sm text-muted-foreground">
              {entry.equipment_name ? `Équipement: ${entry.equipment_name}` : 
               entry.poste_travail ? `Poste: ${entry.poste_travail}` : 'Aucun équipement'}
            </p>
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <Clock className="mr-1 h-4 w-4" />
              {format(new Date(entry.start_time), 'HH:mm', { locale: fr })}
              {' - '}
              {entry.end_time ? format(new Date(entry.end_time), 'HH:mm', { locale: fr }) : 'En cours'}
            </div>
            <div className="flex items-center mt-1 text-xs text-muted-foreground">
              <CalendarDays className="mr-1 h-4 w-4" />
              {format(new Date(entry.start_time), 'dd MMMM yyyy', { locale: fr })}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            {entry.status === 'paused' && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onResume(entry.id)}
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDelete(entry.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
