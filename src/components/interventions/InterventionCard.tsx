
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { MapPin, User, Wrench, Clock, CalendarCheck } from 'lucide-react';
import { Intervention } from '@/types/Intervention';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { formatDate } from './utils/interventionUtils';

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
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md animate-fade-in">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-medium text-lg leading-tight truncate">{intervention.title}</h3>
          <div className="flex flex-shrink-0 gap-2 ml-2">
            <StatusBadge status={intervention.status} />
            <PriorityBadge priority={intervention.priority} />
          </div>
        </div>
        
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wrench size={14} className="flex-shrink-0" />
            <span className="truncate">{intervention.equipment}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin size={14} className="flex-shrink-0" />
            <span className="truncate">{intervention.location}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-1">
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
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <User size={14} className="flex-shrink-0" />
            <span className="font-medium">{intervention.technician}</span>
          </div>
        </div>
        
        {intervention.description && (
          <div className="mt-3 text-sm">
            <p className="line-clamp-2 text-muted-foreground">{intervention.description}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-5 py-3 bg-muted/30 border-t flex justify-end gap-2">
        {intervention.status === 'scheduled' && (
          <Button 
            variant="outline" 
            size="sm"
            className="gap-1"
            onClick={() => onStartWork(intervention)}
          >
            <Wrench size={16} />
            <span>Démarrer</span>
          </Button>
        )}
        <Button 
          size="sm"
          onClick={() => onViewDetails(intervention)}
        >
          Détails
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InterventionCard;
