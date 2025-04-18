
import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import EditEquipmentDialog from './dialogs/EditEquipmentDialog';
import { EquipmentItem } from './hooks/useEquipmentFilters';
import EquipmentHeader from './details/EquipmentHeader';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { equipmentService } from '@/services/supabase/equipmentService';
import EquipmentImageGallery from './details/EquipmentImageGallery';
import { Card, CardContent } from '@/components/ui/card';
import { EquipmentWearDisplay } from './wear/EquipmentWearDisplay';
import EquipmentTabs from './details/EquipmentTabs';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface EquipmentDetailsProps {
  equipment: EquipmentItem;
  onUpdate?: (updatedEquipment: any) => Promise<any>;
}

const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({ equipment, onUpdate }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [localEquipment, setLocalEquipment] = useState(equipment);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleEquipmentUpdate = async (updatedEquipment: any) => {
    try {
      console.log('EquipmentDetails received updated equipment:', updatedEquipment);
      setIsUpdating(true);
      
      // Update local state first for immediate UI feedback
      setLocalEquipment(updatedEquipment);
      
      // Call parent update handler if provided
      if (onUpdate) {
        await onUpdate(updatedEquipment);
      }
      
      return updatedEquipment;
    } catch (error) {
      console.error('Error during equipment update:', error);
      toast.error('Failed to update equipment on the server');
      throw error;
    } finally {
      setIsUpdating(false);
    }
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
      
      <div className={`grid grid-cols-1 gap-4 ${!isMobile ? 'md:grid-cols-2' : ''}`}>
        <EquipmentImageGallery equipment={localEquipment} />
        <EquipmentWearDisplay equipment={localEquipment} />
      </div>
      
      <Card>
        <CardContent className="p-2 sm:p-4">
          <EquipmentTabs equipment={localEquipment} />
        </CardContent>
      </Card>
      
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
