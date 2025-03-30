
import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import EditEquipmentDialog from './dialogs/EditEquipmentDialog';
import { EquipmentItem } from './hooks/useEquipmentFilters';
import EquipmentHeader from './details/EquipmentHeader';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { equipmentService } from '@/services/supabase/equipmentService';
import EquipmentImageGallery from './details/EquipmentImageGallery';

interface EquipmentDetailsProps {
  equipment: EquipmentItem;
  onUpdate?: (updatedEquipment: any) => void;
}

const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({ equipment, onUpdate }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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
    <div className="space-y-6">
      <EquipmentHeader 
        equipment={localEquipment} 
        onEditClick={() => setIsEditDialogOpen(true)} 
        onDeleteClick={handleEquipmentDelete}
      />

      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <EquipmentImageGallery equipment={localEquipment} />
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-medium mb-2">Informations de base</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Nom</dt>
                  <dd>{localEquipment.name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Type</dt>
                  <dd>{localEquipment.type}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Fabricant</dt>
                  <dd>{localEquipment.manufacturer}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Modèle</dt>
                  <dd>{localEquipment.model || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Année</dt>
                  <dd>{localEquipment.year || "-"}</dd>
                </div>
              </dl>
            </div>
            
            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-medium mb-2">Détails techniques</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Numéro de série</dt>
                  <dd>{localEquipment.serialNumber || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Statut</dt>
                  <dd className="capitalize">{localEquipment.status}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Emplacement</dt>
                  <dd>{localEquipment.location || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Date d'achat</dt>
                  <dd>{localEquipment.purchaseDate 
                    ? new Date(localEquipment.purchaseDate).toLocaleDateString() 
                    : "-"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          {localEquipment.notes && (
            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-medium mb-2">Notes</h3>
              <p className="text-sm whitespace-pre-wrap">{localEquipment.notes}</p>
            </div>
          )}
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
