
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { MapPin, User, Wrench } from 'lucide-react';
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
    <BlurContainer 
      key={intervention.id}
      className="mb-6 animate-fade-in overflow-hidden"
    >
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="font-medium text-lg leading-tight mb-1">{intervention.title}</h3>
            <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
              <span>{intervention.equipment}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{intervention.location}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={intervention.status} />
            <PriorityBadge priority={intervention.priority} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Date</p>
            <p className="font-medium">{formatDate(intervention.date)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Duration</p>
            <p className="font-medium">
              {intervention.status === 'completed' && intervention.duration ? 
                `${intervention.duration} hrs (Actual)` : 
                `${intervention.scheduledDuration} hrs (Scheduled)`
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Technician</p>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                <User size={14} className="text-primary" />
              </div>
              <p className="font-medium">{intervention.technician}</p>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-1">Description</p>
          <p className="text-sm">{intervention.description}</p>
        </div>
        
        {intervention.partsUsed && intervention.partsUsed.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Parts Used</p>
            <div className="bg-secondary/50 p-3 rounded-md">
              {intervention.partsUsed.map((part, index) => (
                <div key={part.id} className={`flex justify-between text-sm ${index > 0 ? 'mt-2' : ''}`}>
                  <span>{part.name}</span>
                  <span className="font-medium">Qty: {part.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {intervention.notes && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Notes</p>
            <p className="text-sm italic">{intervention.notes}</p>
          </div>
        )}
        
        <div className="flex justify-end gap-2">
          {intervention.status === 'scheduled' && (
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={() => onStartWork(intervention)}
            >
              <Wrench size={16} />
              <span>Start Work</span>
            </Button>
          )}
          <Button 
            className="gap-1"
            onClick={() => onViewDetails(intervention)}
          >
            <span>Details</span>
          </Button>
        </div>
      </div>
    </BlurContainer>
  );
};

export default InterventionCard;
