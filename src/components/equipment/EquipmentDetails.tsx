
import React, { useState, memo, useCallback } from 'react';
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
  onUpdate?: (updatedEquipment: any) => void;
}

// Memoized EquipmentImageGallery component
const MemoizedEquipmentImageGallery = memo(EquipmentImageGallery);

// Memoized EquipmentWearDisplay component
const MemoizedEquipmentWearDisplay = memo(EquipmentWearDisplay);

// Memoized EquipmentTabs component
const MemoizedEquipmentTabs = memo(EquipmentTabs);

function EquipmentDetailsComponent({ equipment, onUpdate }: EquipmentDetailsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [localEquipment, setLocalEquipment] = useState(equipment);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleEquipmentUpdate = useCallback((updatedEquipment: any) => {
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
  }, [onUpdate]);

  const handleEquipmentDelete = useCallback(async () => {
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
  }, [localEquipment.id, localEquipment.name, navigate]);

  const handleEditClick = useCallback(() => {
    setIsEditDialogOpen(true);
  }, []);

  return (
    <div className="space-y-4 pb-16">
      <EquipmentHeader 
        equipment={localEquipment} 
        onEditClick={handleEditClick} 
        onDeleteClick={handleEquipmentDelete}
      />

      <Separator />
      
      <div className={`grid grid-cols-1 gap-4 ${!isMobile ? 'md:grid-cols-2' : ''}`}>
        <MemoizedEquipmentImageGallery equipment={localEquipment} />
        <MemoizedEquipmentWearDisplay equipment={localEquipment} />
      </div>
      
      <Card>
        <CardContent className="p-2 sm:p-4">
          <MemoizedEquipmentTabs equipment={localEquipment} />
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
}

// Export a memoized version
const EquipmentDetails = memo(EquipmentDetailsComponent);
export default EquipmentDetails;
