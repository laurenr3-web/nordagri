
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import EquipmentPageContent from '@/components/equipment/page/EquipmentPageContent';
import EquipmentDialogs from '@/components/equipment/page/EquipmentDialogs';
import { useEquipmentData } from '@/hooks/equipment/useEquipmentData';
import { useEquipmentRealtime } from '@/hooks/equipment/useEquipmentRealtime';

const EquipmentPage = () => {
  // Use the equipment data hook to fetch and manage equipment
  const {
    equipment,
    isLoading,
    addEquipment,
    isAdding
  } = useEquipmentData();
  
  // Set up realtime updates
  useEquipmentRealtime();
  
  return (
    <SidebarProvider>
      <EquipmentPageContent 
        equipment={equipment}
        isLoading={isLoading}
      />
      <EquipmentDialogs
        addEquipment={addEquipment}
        isAdding={isAdding}
      />
    </SidebarProvider>
  );
};

export default EquipmentPage;
