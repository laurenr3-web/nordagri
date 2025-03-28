
import React from 'react';
import { Intervention } from '@/types/Intervention';
import InterventionHistoryCard from './InterventionHistoryCard';
import EmptyHistoryPlaceholder from './EmptyHistoryPlaceholder';

interface EquipmentHistoryListProps {
  interventions: Intervention[];
  selectedEquipment: string;
  onViewDetails: (intervention: Intervention) => void;
}

const EquipmentHistoryList: React.FC<EquipmentHistoryListProps> = ({ 
  interventions, 
  selectedEquipment, 
  onViewDetails 
}) => {
  if (interventions.length === 0) {
    return <EmptyHistoryPlaceholder selectedEquipment={selectedEquipment} />;
  }

  return (
    <div className="space-y-4">
      {interventions.map(intervention => (
        <InterventionHistoryCard 
          key={intervention.id}
          intervention={intervention} 
          onViewDetails={onViewDetails} 
        />
      ))}
    </div>
  );
};

export default EquipmentHistoryList;
