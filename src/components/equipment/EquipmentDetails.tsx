
import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import EditEquipmentDialog from './dialogs/EditEquipmentDialog';
import { EquipmentItem } from '@/hooks/equipment/useEquipmentFilters';
import EquipmentHeader from './details/EquipmentHeader';
import EquipmentTabs from './details/EquipmentTabs';
import { toast } from 'sonner';

interface EquipmentDetailsProps {
  equipment: EquipmentItem;
  onUpdate?: (updatedEquipment: any) => void;
}

const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({ equipment, onUpdate }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDialogClosing, setIsDialogClosing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [localEquipment, setLocalEquipment] = useState(equipment);

  const handleEquipmentUpdate = (updatedEquipment: any) => {
    console.log('EquipmentDetails received updated equipment:', updatedEquipment);
    
    // Update local state first for immediate UI feedback
    setLocalEquipment(updatedEquipment);
    
    // Call parent update handler if provided
    if (onUpdate) {
      try {
        onUpdate(updatedEquipment);
      } catch (error) {
        console.error('Error during equipment update:', error);
        toast.error('Failed to update equipment on the server');
      }
    }
    
    // Close dialog safely with animation
    handleDialogOpenChange(false);
  };
  
  // Safe dialog state handler
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      // First mark as closing to trigger animation
      setIsDialogClosing(true);
      
      // Then set actual state after animation completes
      setTimeout(() => {
        setIsEditDialogOpen(false);
        setIsDialogClosing(false);
      }, 200);
    } else {
      setIsEditDialogOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <EquipmentHeader 
        equipment={localEquipment} 
        onEditClick={() => handleDialogOpenChange(true)} 
      />

      <Separator />
      
      <EquipmentTabs
        equipment={localEquipment}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {/* Edit Equipment Dialog - Only render when needed */}
      {(isEditDialogOpen || isDialogClosing) && (
        <EditEquipmentDialog
          isOpen={isEditDialogOpen && !isDialogClosing}
          onOpenChange={handleDialogOpenChange}
          equipment={localEquipment}
          onSubmit={handleEquipmentUpdate}
        />
      )}
    </div>
  );
};

export default EquipmentDetails;
