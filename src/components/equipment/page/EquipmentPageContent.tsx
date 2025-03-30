
import React, { useState } from 'react';
import EquipmentContentSection from './EquipmentContentSection';
import { useNavigate } from 'react-router-dom';
import { useEquipmentFilters, EquipmentItem } from '../hooks/useEquipmentFilters';

interface EquipmentPageContentProps {
  equipment: EquipmentItem[];
  isLoading: boolean;
}

const EquipmentPageContent: React.FC<EquipmentPageContentProps> = ({ 
  equipment, 
  isLoading 
}) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('grid');
  const filterState = useEquipmentFilters(equipment);
  
  const handleEquipmentClick = (equipment: EquipmentItem) => {
    navigate(`/equipment/${equipment.id}`);
  };
  
  return (
    <div className="flex-1 p-6">
      <EquipmentContentSection
        equipment={equipment}
        isLoading={isLoading}
        filterState={filterState}
        viewState={{ currentView, setCurrentView }}
        handleEquipmentClick={handleEquipmentClick}
      />
    </div>
  );
};

export default EquipmentPageContent;
