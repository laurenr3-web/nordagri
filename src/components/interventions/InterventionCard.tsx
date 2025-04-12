
import React, { memo, useCallback } from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { MapPin, User, Wrench, Clock, CalendarCheck } from 'lucide-react';
import { Intervention, InterventionStatus } from '@/types/Intervention';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { formatDate } from './utils/interventionUtils';

interface InterventionCardProps {
  intervention: Intervention;
  onViewDetails: (intervention: Intervention) => void;
  onStartWork: (intervention: Intervention) => void;
}

const InterventionCard = memo(({ 
  intervention, 
  onViewDetails, 
  onStartWork 
}: InterventionCardProps) => {
  // Déterminer la couleur de fond basée sur la priorité
  const getPriorityClass = useCallback(() => {
    switch(intervention.priority) {
      case 'high':
        return 'border-l-4 border-l-red-500';
      case 'medium':
        return 'border-l-4 border-l-harvest-500';
      default:
        return 'border-l-4 border-l-agri-500';
    }
  }, [intervention.priority]);

  const handleViewDetails = useCallback(() => {
    onViewDetails(intervention);
  }, [onViewDetails, intervention]);

  const handleStartWork = useCallback(() => {
    onStartWork(intervention);
  }, [onStartWork, intervention]);

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md animate-fade-in ${getPriorityClass()}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-semibold text-lg leading-tight truncate">{intervention.title}</h3>
          <div className="flex flex-shrink-0 gap-2 ml-2">
            <StatusBadge status={intervention.status} />
            <PriorityBadge priority={intervention.priority} />
          </div>
        </div>
        
        <div className="flex flex-col gap-3 text-sm">
          <div className="p-2 bg-background rounded-md">
            <div className="flex items-center gap-2">
              <Wrench size={16} className="text-agri-600" />
              <span className="font-medium truncate">{intervention.equipment}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={14} className="flex-shrink-0" />
              <span className="truncate">{intervention.location}</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <User size={14} className="flex-shrink-0" />
              <span className="font-medium truncate">{intervention.technician}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarCheck size={14} className="flex-shrink-0" />
              <span>{formatDate(intervention.date)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={14} className="flex-shrink-0" />
              <span>
                {intervention.status === 'completed' && intervention.duration
                  ? `${intervention.duration} hrs`
                  : `${intervention.scheduledDuration} hrs`}
              </span>
            </div>
          </div>
        </div>
        
        {intervention.description && (
          <div className="mt-4 text-sm">
            <p className="line-clamp-2 text-muted-foreground bg-muted/30 p-2 rounded-md italic">{intervention.description}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-5 py-3 bg-background border-t flex justify-end gap-2">
        {intervention.status === 'scheduled' && (
          <Button 
            variant="outline" 
            size="sm"
            className="gap-1"
            onClick={handleStartWork}
          >
            <Wrench size={16} />
            <span>Démarrer</span>
          </Button>
        )}
        <Button 
          size="sm"
          onClick={handleViewDetails}
        >
          Détails
        </Button>
      </CardFooter>
    </Card>
  );
});

InterventionCard.displayName = 'InterventionCard';

export default InterventionCard;
