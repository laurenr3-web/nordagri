
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EquipmentOverview } from './EquipmentOverview';
import EquipmentMaintenanceStatus from './EquipmentMaintenanceStatus';
import EquipmentParts from '@/components/equipment/tabs/EquipmentParts';
import EquipmentTimeTracking from '@/components/equipment/tabs/EquipmentTimeTracking';
import EquipmentPerformance from '@/components/equipment/tabs/EquipmentPerformance';
import EquipmentMaintenanceHistory from '@/components/equipment/tabs/EquipmentMaintenanceHistory';
import EquipmentQRCode from '@/components/equipment/tabs/EquipmentQRCode';

interface EquipmentTabsProps {
  equipment: any;
}

const EquipmentTabs: React.FC<EquipmentTabsProps> = ({ equipment }) => {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="overview">Aperçu</TabsTrigger>
        <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        <TabsTrigger value="history">Historique</TabsTrigger>
        <TabsTrigger value="parts">Pièces</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
        <TabsTrigger value="timeTracking">Temps</TabsTrigger>
        <TabsTrigger value="qrcode">QR Code</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <EquipmentOverview equipment={equipment} />
      </TabsContent>
      <TabsContent value="maintenance">
        <EquipmentMaintenanceStatus equipment={equipment} />
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
      <TabsContent value="timeTracking">
        <EquipmentTimeTracking equipment={equipment} />
      </TabsContent>
      <TabsContent value="qrcode">
        <EquipmentQRCode equipment={equipment} />
      </TabsContent>
    </Tabs>
  );
};

export default EquipmentTabs;
