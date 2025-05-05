
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
      className="p-4 border rounded-md hover:bg-accent/10 transition-colors cursor-pointer w-full"
      onClick={() => onViewDetails(intervention)}
    >
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex flex-col">
          <h4 className="font-medium break-words line-clamp-2">{intervention.title}</h4>
          <span className="text-sm text-muted-foreground line-clamp-1">{intervention.equipment}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={intervention.priority} />
          <StatusBadge status={intervention.status} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 mt-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium min-w-[45px]">Date:</span>
          <span className="whitespace-nowrap">{formatDate(intervention.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium min-w-[45px]">Tech.:</span>
          <span className="break-words line-clamp-1">{intervention.technician}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium min-w-[45px]">Lieu:</span>
          <span className="break-words line-clamp-1">{intervention.location}</span>
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
