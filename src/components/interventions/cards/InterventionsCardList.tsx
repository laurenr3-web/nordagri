
import React from 'react';
import { Intervention } from '@/types/Intervention';
import InterventionCard from './InterventionCard';

interface InterventionsCardListProps {
  interventions: Intervention[];
  emptyMessage: string;
  isMobile: boolean;
  onViewDetails: (intervention: Intervention) => void;
  onStartWork: (intervention: Intervention) => void;
}

const InterventionsCardList: React.FC<InterventionsCardListProps> = ({
  interventions,
  emptyMessage,
  isMobile,
  onViewDetails,
  onStartWork
}) => {
  if (interventions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'}`}>
      {interventions.map((intervention) => (
        <InterventionCard
          key={intervention.id}
          intervention={intervention}
          onViewDetails={onViewDetails}
          onStartWork={onStartWork}
        />
      ))}
    </div>
  );
};

export default InterventionsCardList;
