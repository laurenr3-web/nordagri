
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EquipmentOverview } from './EquipmentOverview';
import EquipmentMaintenanceStatus from './EquipmentMaintenanceStatus';
import EquipmentParts from './EquipmentParts';
import EquipmentTimeTracking from '@/components/equipment/tabs/EquipmentTimeTracking';

interface EquipmentTabsProps {
  equipment: any;
}

const EquipmentTabs: React.FC<EquipmentTabsProps> = ({ equipment }) => {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Aperçu</TabsTrigger>
        <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        <TabsTrigger value="parts">Pièces</TabsTrigger>
        <TabsTrigger value="timeTracking">Suivi du temps</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <EquipmentOverview equipment={equipment} />
      </TabsContent>
      <TabsContent value="maintenance">
        <EquipmentMaintenanceStatus equipment={equipment} />
      </TabsContent>
      <TabsContent value="parts">
        <EquipmentParts equipment={equipment} />
      </TabsContent>
      <TabsContent value="timeTracking">
        <EquipmentTimeTracking equipment={equipment} />
      </TabsContent>
    </Tabs>
  );
};

export default EquipmentTabs;
