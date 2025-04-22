import React from "react";
import EquipmentContentSection from './EquipmentContentSection';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import ViewEquipmentDialog from '../dialogs/ViewEquipmentDialog';
import { useEquipmentPage } from './useEquipmentPage';

/**
 * UI principal de la page équipements, stateless + purement présentational
 */
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
  return <div className="flex-1 p-6 px-[43px]">
      <EquipmentContentSection equipment={equipment} isLoading={isLoading} filterState={filterState} viewState={{
      currentView,
      setCurrentView: (view: string) => setCurrentView(view as "grid" | "list")
    }} handleEquipmentClick={handleEquipmentClick} />
      {selectedEquipment && <ViewEquipmentDialog equipment={selectedEquipment} onClose={handleDialogClose} />}
    </div>;
};
export default EquipmentPageContent;