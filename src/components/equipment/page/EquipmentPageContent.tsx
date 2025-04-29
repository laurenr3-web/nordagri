
import React from "react";
import EquipmentContentSection from './EquipmentContentSection';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import ViewEquipmentDialog from '../dialogs/ViewEquipmentDialog';
import { useEquipmentPage } from './useEquipmentPage';

interface EquipmentPageContentProps {
  equipment: EquipmentItem[];
  isLoading: boolean;
}

const EquipmentPageContent: React.FC<EquipmentPageContentProps> = ({
  equipment,
  isLoading
}) => {
  const {
    currentView,
    setCurrentView,
    selectedEquipment,
    setSelectedEquipment,
    filterState,
    handleEquipmentClick,
    handleDialogClose
  } = useEquipmentPage(equipment);
  
  return (
    <div className="flex-1">
      <EquipmentContentSection 
        equipment={equipment} 
        isLoading={isLoading} 
        filterState={filterState}
        viewState={{
          currentView,
          setCurrentView: (view: string) => setCurrentView(view as "grid" | "list")
        }} 
        handleEquipmentClick={handleEquipmentClick} 
      />
      
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
