
import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import EditEquipmentDialog from './dialogs/EditEquipmentDialog';
import { EquipmentItem } from './hooks/useEquipmentFilters';
import EquipmentHeader from './details/EquipmentHeader';
import EquipmentTabs from './details/EquipmentTabs';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { equipmentService } from '@/services/supabase/equipmentService';

interface EquipmentDetailsProps {
  equipment: EquipmentItem;
  onUpdate?: (updatedEquipment: any) => void;
}

const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({ equipment, onUpdate }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [localEquipment, setLocalEquipment] = useState(equipment);
  const navigate = useNavigate();

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
    
    setIsEditDialogOpen(false);
  };

  const handleEquipmentDelete = async () => {
    console.log('Deleting equipment with ID:', localEquipment.id);
    
    try {
      await equipmentService.deleteEquipment(localEquipment.id);
      toast.success(`L'équipement ${localEquipment.name} a été supprimé avec succès`);
      navigate('/equipment');
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast.error('Impossible de supprimer cet équipement');
    }
  };

  return (
    <div className="space-y-6">
      <EquipmentHeader 
        equipment={localEquipment} 
        onEditClick={() => setIsEditDialogOpen(true)} 
        onDeleteClick={handleEquipmentDelete}
      />

      <Separator />
      
      <EquipmentTabs
        equipment={localEquipment}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {/* Edit Equipment Dialog */}
      {isEditDialogOpen && (
        <EditEquipmentDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          equipment={localEquipment}
          onSubmit={handleEquipmentUpdate}
        />
      )}
    </div>
  );
};

export default EquipmentDetails;
