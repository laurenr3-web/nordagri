import React from 'react';
import { Button } from '@/components/ui/button';
import { Intervention } from '@/types/Intervention';
import { formatDate } from '../../utils/interventionUtils';
import PriorityBadge from '../../PriorityBadge';
import StatusBadge from '../../StatusBadge';

interface InterventionHistoryCardProps {
  intervention: Intervention;
  onViewDetails: (intervention: Intervention) => void;
}

const InterventionHistoryCard: React.FC<InterventionHistoryCardProps> = ({ 
  intervention, 
  onViewDetails 
}) => {
  return (
    <div 
      key={intervention.id}
      className="p-4 border rounded-md hover:bg-accent/10 transition-colors cursor-pointer"
      onClick={() => onViewDetails(intervention)}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
        <div className="flex flex-col">
          <h4 className="font-medium">{intervention.title}</h4>
          <span className="text-sm text-muted-foreground">{intervention.equipment}</span>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={intervention.priority} />
          <StatusBadge status={intervention.status as "scheduled" | "in-progress" | "completed" | "cancelled"} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 mt-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Date:</span>
          <span>{formatDate(intervention.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Technicien:</span>
          <span>{intervention.technician}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Lieu:</span>
          <span>{intervention.location}</span>
        </div>
      </div>
      
      <Button 
        variant="link" 
        className="mt-2 h-auto p-0 text-sm" 
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails(intervention);
        }}
      >
        Voir les détails
      </Button>
    </div>
  );
};

export default InterventionHistoryCard;
