
import React, { useState, useEffect } from 'react';
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
  
  // Load saved view preference on component mount
  useEffect(() => {
    const savedView = localStorage.getItem('equipmentViewPreference');
    if (savedView && (savedView === 'grid' || savedView === 'list')) {
      setCurrentView(savedView);
    }
  }, []);
  
  // Save view preference when it changes
  useEffect(() => {
    localStorage.setItem('equipmentViewPreference', currentView);
  }, [currentView]);
  
  const handleEquipmentClick = (equipment: EquipmentItem) => {
    // Dispatch the custom event with the equipment details
    const event = new CustomEvent('equipment-selected', { detail: equipment });
    window.dispatchEvent(event);

    // Navigate is now only used for deep linking (optionally)
    // navigate(`/equipment/${equipment.id}`);
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
