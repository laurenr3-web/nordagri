
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

interface EquipmentDetailContentProps {
  equipment: EquipmentItem;
  onUpdate: (data: EquipmentItem) => Promise<void>;
}

const EquipmentDetailContent = ({ equipment, onUpdate }: EquipmentDetailContentProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditEquipment = () => {
    setIsEditDialogOpen(true);
  };

  const handleEquipmentUpdate = async (updatedData: EquipmentItem) => {
    await onUpdate(updatedData);
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      <EquipmentHeader equipment={equipment} onEdit={handleEditEquipment} />
      
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
