
import React from "react";
import EquipmentContentSection from './EquipmentContentSection';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import ViewEquipmentDialog from '../dialogs/ViewEquipmentDialog';
import { useEquipmentPage } from './useEquipmentPage';
import { EmptyState } from '@/components/help/EmptyState';
import { emptyStates } from '@/content/help/emptyStates';

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

  const handleAddEquipment = () => {
    const event = new CustomEvent('open-add-equipment-dialog');
    window.dispatchEvent(event);
  };

  const showOnboardingEmpty = !isLoading && equipment.length === 0;

  return (
    <div className="flex-1">
      {showOnboardingEmpty ? (
        <EmptyState
          icon={emptyStates.equipmentList.icon}
          title={emptyStates.equipmentList.title}
          description={emptyStates.equipmentList.description}
          action={{
            label: emptyStates.equipmentList.actionLabel,
            onClick: handleAddEquipment,
          }}
          secondaryAction={
            emptyStates.equipmentList.articleId
              ? {
                  label: emptyStates.equipmentList.secondaryActionLabel!,
                  articleId: emptyStates.equipmentList.articleId,
                }
              : undefined
          }
        />
      ) : (
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
      )}
      
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
