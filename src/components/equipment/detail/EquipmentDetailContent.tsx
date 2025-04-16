
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

interface EquipmentDetailContentProps {
  equipment: EquipmentItem;
  onUpdate: (data: EquipmentItem) => Promise<void>;
}

const EquipmentDetailContent = ({ equipment, onUpdate }: EquipmentDetailContentProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleEditEquipment = () => {
    setIsEditDialogOpen(true);
  };

  const handleEquipmentUpdate = async (updatedData: EquipmentItem) => {
    await onUpdate(updatedData);
    setIsEditDialogOpen(false);
  };
  
  const handleEquipmentDelete = async () => {
    try {
      // Convert ID to number if it's a string
      const equipmentId = typeof equipment.id === 'string' 
        ? parseInt(equipment.id, 10) 
        : equipment.id;
      
      console.log(`Deleting equipment with ID: ${equipmentId}`);
      
      // Call the delete service
      await equipmentService.deleteEquipment(equipmentId);
      
      toast.success(`L'équipement ${equipment.name} a été supprimé avec succès`);
      
      // Navigate back to equipment list
      navigate('/equipment');
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast.error('Impossible de supprimer cet équipement');
    }
  };

  return (
    <div className="space-y-8">
      <EquipmentHeader 
        equipment={equipment} 
        onEdit={handleEditEquipment}
        onDelete={handleEquipmentDelete}
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
