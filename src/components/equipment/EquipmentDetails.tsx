import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import EditEquipmentDialog from './dialogs/EditEquipmentDialog';
import { EquipmentItem } from './hooks/useEquipmentFilters';
import EquipmentHeader from './details/EquipmentHeader';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { equipmentService } from '@/services/supabase/equipmentService';
import EquipmentImageGallery from './details/EquipmentImageGallery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EquipmentWearDisplay } from './wear/EquipmentWearDisplay';

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
        <div>
          <EquipmentImageGallery equipment={localEquipment} />
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Wear information card */}
          <EquipmentWearDisplay equipment={localEquipment} />

          {/* Basic information card */}
          <Card className="overflow-hidden border-2 border-primary/10">
            <div className="bg-primary/10 px-6 py-4">
              <h2 className="text-2xl font-bold text-primary">Informations de base</h2>
            </div>
            <CardContent className="p-0">
              <dl className="divide-y">
                <div className="grid grid-cols-3 px-6 py-4">
                  <dt className="text-sm font-medium text-muted-foreground">Nom</dt>
                  <dd className="col-span-2 text-lg font-semibold">{localEquipment.name}</dd>
                </div>
                <div className="grid grid-cols-3 px-6 py-4">
                  <dt className="text-sm font-medium text-muted-foreground">Type</dt>
                  <dd className="col-span-2">{localEquipment.type}</dd>
                </div>
                <div className="grid grid-cols-3 px-6 py-4">
                  <dt className="text-sm font-medium text-muted-foreground">Fabricant</dt>
                  <dd className="col-span-2">{localEquipment.manufacturer || "-"}</dd>
                </div>
                <div className="grid grid-cols-3 px-6 py-4">
                  <dt className="text-sm font-medium text-muted-foreground">Modèle</dt>
                  <dd className="col-span-2">{localEquipment.model || "-"}</dd>
                </div>
                <div className="grid grid-cols-3 px-6 py-4">
                  <dt className="text-sm font-medium text-muted-foreground">Année</dt>
                  <dd className="col-span-2">{localEquipment.year || "-"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-2 border-secondary/20">
            <div className="bg-secondary/20 px-6 py-4">
              <h2 className="text-2xl font-bold text-secondary-foreground">Détails techniques</h2>
            </div>
            <CardContent className="p-0">
              <dl className="divide-y">
                <div className="grid grid-cols-3 px-6 py-4">
                  <dt className="text-sm font-medium text-muted-foreground">Numéro de série</dt>
                  <dd className="col-span-2">{localEquipment.serialNumber || "-"}</dd>
                </div>
                <div className="grid grid-cols-3 px-6 py-4">
                  <dt className="text-sm font-medium text-muted-foreground">Statut</dt>
                  <dd className="col-span-2">
                    <Badge variant={
                      localEquipment.status === 'operational' ? 'success' :
                      localEquipment.status === 'maintenance' ? 'warning' :
                      localEquipment.status === 'broken' ? 'destructive' : 'secondary'
                    }>
                      {localEquipment.status}
                    </Badge>
                  </dd>
                </div>
                <div className="grid grid-cols-3 px-6 py-4">
                  <dt className="text-sm font-medium text-muted-foreground">Emplacement</dt>
                  <dd className="col-span-2">{localEquipment.location || "-"}</dd>
                </div>
                <div className="grid grid-cols-3 px-6 py-4">
                  <dt className="text-sm font-medium text-muted-foreground">Date d'achat</dt>
                  <dd className="col-span-2">{localEquipment.purchaseDate 
                    ? new Date(localEquipment.purchaseDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) 
                    : "-"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          
          {localEquipment.notes && (
            <Card className="overflow-hidden border-2 border-muted/20">
              <div className="bg-muted/20 px-6 py-4">
                <h2 className="text-2xl font-bold text-foreground">Notes</h2>
              </div>
              <CardContent className="p-6">
                <p className="whitespace-pre-wrap">{localEquipment.notes}</p>
              </CardContent>
            </Card>
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
