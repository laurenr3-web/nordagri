
import React, { useState, useEffect } from 'react';
import EquipmentContentSection from './EquipmentContentSection';
import { useNavigate } from 'react-router-dom';
import { useEquipmentFilters, EquipmentItem } from '../hooks/useEquipmentFilters';
import ViewEquipmentDialog from '../dialogs/ViewEquipmentDialog';

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
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);
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
    console.log('Equipment item clicked:', equipment);
    
    // Naviguer vers la page de détails directement
    navigate(`/equipment/${equipment.id}`);
    
    // Optionnel: également déclencher l'événement pour la compatibilité avec le système existant
    // const event = new CustomEvent('equipment-selected', { detail: equipment });
    // window.dispatchEvent(event);
  };
  
  const handleDialogClose = () => {
    setSelectedEquipment(null);
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
      
      {/* Dialog pour la compatibilité avec l'ancien système */}
      {selectedEquipment && (
        <ViewEquipmentDialog 
          equipment={selectedEquipment} 
          onClose={handleDialogClose} 
        />
      )}
    </div>
  );
};

export default EquipmentPageContent;
