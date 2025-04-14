
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Square, Trash, ExternalLink } from 'lucide-react';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface TimeEntryCardProps {
  entry: TimeEntry;
  onResume?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TimeEntryCard({ entry, onResume, onDelete }: TimeEntryCardProps) {
  const navigate = useNavigate();

  const formatDate = (date: string | Date) => {
    return format(new Date(date), "d MMM yyyy, HH:mm", { locale: fr });
  };

  const getDuration = () => {
    const start = new Date(entry.start_time);
    const end = entry.end_time ? new Date(entry.end_time) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}min`;
  };

  const getStatusBadge = () => {
    switch (entry.status) {
      case 'active':
        return <Badge variant="success">En cours</Badge>;
      case 'paused':
        return <Badge variant="warning">En pause</Badge>;
      case 'completed':
        return <Badge variant="info">Terminé</Badge>;
      default:
        return null;
    }
  };

  const handleNavigate = () => {
    console.log("Navigating to time entry details:", entry.id);
    navigate(`/time-tracking/${entry.id}`);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-medium">{entry.intervention_title || 'Session sans titre'}</h3>
            <p className="text-sm text-muted-foreground">{entry.equipment_name}</p>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-sm text-muted-foreground">
            Début: {formatDate(entry.start_time)}
          </p>
          <p className="text-sm font-medium">Durée: {getDuration()}</p>
        </div>

        <div className="flex justify-between items-center">
          <div className="space-x-2">
            {entry.status === 'paused' && onResume && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onResume(entry.id)}
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onDelete(entry.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={handleNavigate}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Détails
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
