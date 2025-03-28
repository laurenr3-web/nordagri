
import React, { useState } from 'react';
import { Intervention } from '@/types/Intervention';
import EquipmentHistoryHeader from './history/EquipmentHistoryHeader';
import EquipmentHistoryList from './history/EquipmentHistoryList';

interface EquipmentHistoryViewProps {
  interventions: Intervention[];
  onViewDetails: (intervention: Intervention) => void;
}

const EquipmentHistoryView: React.FC<EquipmentHistoryViewProps> = ({ 
  interventions, 
  onViewDetails 
}) => {
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  
  // Get unique equipment names
  const equipments = [
    ...new Set(interventions.map(intervention => intervention.equipment))
  ];
  
  // Filter interventions by selected equipment
  const filteredInterventions = selectedEquipment === 'all' 
    ? interventions 
    : interventions.filter(intervention => intervention.equipment === selectedEquipment);

  return (
    <div className="space-y-6">
      <EquipmentHistoryHeader 
        selectedEquipment={selectedEquipment}
        setSelectedEquipment={setSelectedEquipment}
        equipments={equipments}
      />
      
      <EquipmentHistoryList 
        interventions={filteredInterventions}
        selectedEquipment={selectedEquipment}
        onViewDetails={onViewDetails}
      />
    </div>
  );
};

export default EquipmentHistoryView;
