
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Edit, Trash2, Clock } from 'lucide-react';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TimeEntryCardProps {
  entry: TimeEntry;
  onResume?: (entryId: string) => void;
  onEdit?: (entry: TimeEntry) => void;
  onDelete?: (entryId: string) => void;
}

export function TimeEntryCard({ entry, onResume, onEdit, onDelete }: TimeEntryCardProps) {
  // Calculer la durée de la session
  const calculateDuration = () => {
    const start = new Date(entry.start_time);
    const end = entry.end_time ? new Date(entry.end_time) : new Date();
    const diffMs = end.getTime() - start.getTime();
    
    // Convertir en heures et minutes
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };
  
  // Obtenir la classe de couleur pour le badge de statut
  const getStatusColor = () => {
    switch (entry.status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'paused':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'disputed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };
  
  // Obtenir la classe de couleur pour le badge de type de tâche
  const getTaskTypeColor = () => {
    switch (entry.task_type) {
      case 'maintenance':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'repair':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'inspection':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'installation':
        return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'other':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };
  
  // Formatter la date et l'heure
  const formatDateTime = (date: Date | string) => {
    const dateObj = new Date(date);
    return format(dateObj, 'dd MMM yyyy, HH:mm', { locale: fr });
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4">
          {/* En-tête avec statut et type de tâche */}
          <div className="flex items-center justify-between mb-3">
            <Badge
              variant="outline"
              className={cn("font-normal", getStatusColor())}
            >
              {entry.status === 'active' && "En cours"}
              {entry.status === 'paused' && "En pause"}
              {entry.status === 'completed' && "Terminé"}
              {entry.status === 'disputed' && "Contesté"}
            </Badge>
            <Badge
              variant="outline"
              className={cn("font-normal", getTaskTypeColor())}
            >
              {entry.task_type === 'maintenance' && "Maintenance"}
              {entry.task_type === 'repair' && "Réparation"}
              {entry.task_type === 'inspection' && "Inspection"}
              {entry.task_type === 'installation' && "Installation"}
              {entry.task_type === 'other' && "Autre"}
            </Badge>
          </div>
          
          {/* Détails */}
          <div>
            {entry.equipment_name && (
              <h3 className="font-semibold mb-1">
                {entry.equipment_name}
                {entry.intervention_title && ` - ${entry.intervention_title}`}
              </h3>
            )}
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
              <Clock className="h-3 w-3" />
              <span>
                {formatDateTime(entry.start_time)}
                {entry.end_time && ` → ${formatDateTime(entry.end_time)}`}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(entry.start_time), { addSuffix: true, locale: fr })}
              </span>
              <span className="font-medium">{calculateDuration()}</span>
            </div>
            
            {entry.notes && (
              <div className="mt-3 text-sm border-t pt-3 text-muted-foreground">
                {entry.notes}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      {/* Actions selon le statut */}
      {(entry.status === 'paused' || entry.status === 'completed') && (
        <CardFooter className="bg-gray-50 py-2 px-4 flex justify-between">
          {entry.status === 'paused' && onResume && (
            <Button variant="ghost" size="sm" onClick={() => onResume(entry.id)}>
              <Play className="h-4 w-4 mr-1" />
              Reprendre
            </Button>
          )}
          
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(entry)}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Modifier</span>
              </Button>
            )}
            
            {onDelete && (
              <Button variant="ghost" size="sm" className="text-red-500" onClick={() => onDelete(entry.id)}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Supprimer</span>
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
