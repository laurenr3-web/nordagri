
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
    setLocalEquipment(updatedEquipment);
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
    try {
      const equipmentId = typeof localEquipment.id === 'string'
        ? parseInt(localEquipment.id, 10)
        : localEquipment.id;

      await equipmentService.deleteEquipment(equipmentId);
      toast.success(`L'équipement ${localEquipment.name} a été supprimé avec succès`);
      navigate('/equipment');
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast.error('Impossible de supprimer cet équipement');
    }
  };

  return (
    <div className="space-y-4 pb-8 px-2 md:px-4">
      <EquipmentHeader
        equipment={localEquipment}
        onEditClick={() => setIsEditDialogOpen(true)}
        onDeleteClick={handleEquipmentDelete}
      />
      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <EquipmentImageGallery equipment={localEquipment} />
        </div>
        <div>
          <EquipmentWearDisplay equipment={localEquipment} />
        </div>
      </div>

      <div className="mt-4">
        <Card className="shadow-none border-none bg-transparent">
          <CardContent className="p-0">
            <EquipmentTabs equipment={localEquipment} forceDesktopTabs={!isMobile} />
          </CardContent>
        </Card>
      </div>

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
