
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { MapPin, User, Wrench, Clock, CalendarCheck } from 'lucide-react';
import { Intervention } from '@/types/Intervention';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { formatDate } from './utils/interventionUtils';
import { useOfflineStatus } from '@/providers/OfflineProvider';

interface InterventionCardProps {
  intervention: Intervention;
  onViewDetails: (intervention: Intervention) => void;
  onStartWork: (intervention: Intervention) => void;
}

const InterventionCard: React.FC<InterventionCardProps> = ({ 
  intervention, 
  onViewDetails, 
  onStartWork 
}) => {
  const { isOnline } = useOfflineStatus();
  const isPendingSync = intervention.id < 0; // If ID is negative, it's a pending sync item

  // Determine background color based on priority
  const getPriorityClass = () => {
    switch(intervention.priority) {
      case 'high':
        return 'border-l-4 border-l-red-500';
      case 'medium':
        return 'border-l-4 border-l-harvest-500';
      default:
        return 'border-l-4 border-l-agri-500';
    }
  };

  return (
    <Card className={`w-full overflow-hidden transition-all hover:shadow-md animate-fade-in ${getPriorityClass()} ${isPendingSync ? 'bg-orange-50' : ''}`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-3">
          <h3 className="font-semibold text-base sm:text-lg leading-tight break-words">
            {intervention.title}
            {isPendingSync && (
              <span className="ml-2 text-orange-500 text-xs font-normal">
                🕓 En attente de synchronisation
              </span>
            )}
          </h3>
          <div className="flex flex-wrap gap-2 sm:ml-2 sm:flex-shrink-0">
            <StatusBadge status={intervention.status} />
            <PriorityBadge priority={intervention.priority} />
          </div>
        </div>
        
        <div className="flex flex-col gap-3 text-sm">
          <div className="p-2 bg-background rounded-md">
            <div className="flex items-center gap-2">
              <Wrench size={16} className="text-agri-600 flex-shrink-0" />
              <span className="font-medium break-words line-clamp-1">{intervention.equipment}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={14} className="flex-shrink-0" />
              <span className="break-words line-clamp-1">{intervention.location}</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <User size={14} className="flex-shrink-0" />
              <span className="font-medium break-words line-clamp-1">{intervention.technician}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarCheck size={14} className="flex-shrink-0" />
              <span className="whitespace-nowrap">{formatDate(intervention.date)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={14} className="flex-shrink-0" />
              <span className="whitespace-nowrap">
                {intervention.status === 'completed' && intervention.duration
                  ? `${intervention.duration} hrs`
                  : `${intervention.scheduledDuration} hrs`}
              </span>
            </div>
          </div>
        </div>
        
        {intervention.description && (
          <div className="mt-4 text-sm">
            <p className="text-muted-foreground bg-muted/30 p-2 rounded-md italic line-clamp-2">{intervention.description}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-4 py-3 sm:px-5 bg-background border-t flex flex-col sm:flex-row sm:justify-end gap-2">
        {intervention.status === 'scheduled' && (
          <Button 
            variant="outline" 
            size="sm"
            className="w-full sm:w-auto gap-1"
            onClick={() => onStartWork(intervention)}
            disabled={isPendingSync || !isOnline}
          >
            <Wrench size={16} />
            <span>Démarrer</span>
          </Button>
        )}
        <Button 
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => onViewDetails(intervention)}
        >
          Détails
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InterventionCard;
