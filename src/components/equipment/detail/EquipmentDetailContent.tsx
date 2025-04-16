
import React, { useState } from 'react';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import EquipmentHeader from './EquipmentHeader';
import { EquipmentOverview } from '../details/EquipmentOverview';
import EquipmentParts from '../details/EquipmentParts';
import EquipmentPerformance from '../tabs/EquipmentPerformance';
import EditEquipmentDialog from '../dialogs/EditEquipmentDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import EquipmentMaintenance from '../tabs/EquipmentMaintenance';
import EquipmentMaintenanceHistory from '../tabs/EquipmentMaintenanceHistory';
import EquipmentQRCode from '../tabs/EquipmentQRCode';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { equipmentService } from '@/services/supabase/equipmentService';
import { useQueryClient } from '@tanstack/react-query';

interface EquipmentDetailContentProps {
  equipment: EquipmentItem;
  onUpdate: (data: EquipmentItem) => Promise<void>;
}

const EquipmentDetailContent = ({ equipment, onUpdate }: EquipmentDetailContentProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleEditEquipment = () => {
    setIsEditDialogOpen(true);
  };

  const handleEquipmentUpdate = async (updatedData: EquipmentItem) => {
    await onUpdate(updatedData);
    setIsEditDialogOpen(false);
  };
  
  const handleEquipmentDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Convert ID to number if it's a string
      const equipmentId = typeof equipment.id === 'string' 
        ? parseInt(equipment.id, 10) 
        : equipment.id;
      
      console.log(`Attempting to delete equipment with ID: ${equipmentId}`);
      
      // Invalidate queries before deletion to prepare cache
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      
      // Call the delete service
      await equipmentService.deleteEquipment(equipmentId);
      
      // Show success toast
      toast.success(`L'équipement ${equipment.name} a été supprimé avec succès`);
      
      // Navigate back to equipment list after successful deletion
      navigate('/equipment');
    } catch (error: any) {
      console.error('Error deleting equipment:', error);
      toast.error(`Impossible de supprimer cet équipement: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <EquipmentHeader 
        equipment={equipment} 
        onEdit={handleEditEquipment}
        onDelete={handleEquipmentDelete}
        isDeleting={isDeleting}
      />
      
      <Tabs defaultValue="overview">
        <TabsList className="mb-8 flex flex-wrap">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="parts">Pièces</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="qrcode">QR Code</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <EquipmentOverview equipment={equipment} />
        </TabsContent>
        
        <TabsContent value="maintenance">
          <EquipmentMaintenance equipment={equipment} />
        </TabsContent>
        
        <TabsContent value="history">
          <EquipmentMaintenanceHistory equipment={equipment} />
        </TabsContent>
        
        <TabsContent value="parts">
          <EquipmentParts equipment={equipment} />
        </TabsContent>
        
        <TabsContent value="performance">
          <EquipmentPerformance equipment={equipment} />
        </TabsContent>
        
        <TabsContent value="qrcode">
          <EquipmentQRCode equipment={equipment} />
        </TabsContent>
      </Tabs>
      
      {/* Dialogs */}
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

export default EquipmentDetailContent;
