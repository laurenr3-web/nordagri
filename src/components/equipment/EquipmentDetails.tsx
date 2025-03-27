
import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import EditEquipmentDialog from './dialogs/EditEquipmentDialog';
import { EquipmentItem } from './hooks/useEquipmentFilters';
import EquipmentHeader from './details/EquipmentHeader';
import EquipmentTabs from './details/EquipmentTabs';

interface EquipmentDetailsProps {
  equipment: EquipmentItem;
  onUpdate?: (updatedEquipment: any) => void;
}

const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({ equipment, onUpdate }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleEquipmentUpdate = (updatedEquipment: any) => {
    if (onUpdate) {
      onUpdate(updatedEquipment);
    }
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <EquipmentHeader 
        equipment={equipment} 
        onEditClick={() => setIsEditDialogOpen(true)} 
      />

      <Separator />
      
      <EquipmentTabs
        equipment={equipment}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {/* Edit Equipment Dialog */}
      {isEditDialogOpen && (
        <EditEquipmentDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          equipment={equipment}
          onSubmit={handleEquipmentUpdate}
        />
      )}
    </div>
  );
};

export default EquipmentDetails;
