
import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import EditEquipmentDialog from '../dialogs/EditEquipmentDialog';
import { EquipmentItem } from '@/components/equipment/hooks/useEquipmentFilters';
import EquipmentHeader from '@/components/equipment/details/EquipmentHeader';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { equipmentService } from '@/services/supabase/equipmentService';
import EquipmentImageGallery from '@/components/equipment/details/EquipmentImageGallery';
import { Card, CardContent } from '@/components/ui/card';
import { EquipmentWearDisplay } from '@/components/equipment/wear/EquipmentWearDisplay';
import EquipmentTabs from '@/components/equipment/details/EquipmentTabs';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface EquipmentDetailsProps {
  equipment: EquipmentItem;
  onUpdate?: (updatedEquipment: any) => void;
}

const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({ equipment, onUpdate }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [localEquipment, setLocalEquipment] = useState(equipment);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');

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
      // Convert ID to number if it's a string
      const equipmentId = typeof localEquipment.id === 'string'
        ? parseInt(localEquipment.id, 10)
        : localEquipment.id;

      // Call the deleteEquipment service
      await equipmentService.deleteEquipment(equipmentId);

      toast.success(`L'équipement ${localEquipment.name} a été supprimé avec succès`);

      // Navigate away from the deleted equipment page
      navigate('/equipment');
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast.error('Impossible de supprimer cet équipement');
    }
  };

  return (
    <div className="space-y-4 pb-16">
      <EquipmentHeader
        equipment={localEquipment}
        onEditClick={() => setIsEditDialogOpen(true)}
        onDeleteClick={handleEquipmentDelete}
      />

      <Separator />

      <div className={`grid grid-cols-1 gap-4 ${!isMobile ? 'md:grid-cols-3' : ''}`}>
        <EquipmentImageGallery equipment={localEquipment} />
        <EquipmentWearDisplay equipment={localEquipment} />
        <div className="md:col-span-1">
          <EquipmentTabs equipment={localEquipment} />
        </div>
      </div>

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
