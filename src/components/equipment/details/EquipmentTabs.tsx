
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EquipmentOverview } from './EquipmentOverview';
import EquipmentMaintenanceStatus from './EquipmentMaintenanceStatus';
import EquipmentParts from '@/components/equipment/tabs/EquipmentParts';
import EquipmentTimeTracking from '@/components/equipment/tabs/EquipmentTimeTracking';
import EquipmentPerformance from '@/components/equipment/tabs/EquipmentPerformance';
import EquipmentMaintenanceHistory from '@/components/equipment/tabs/EquipmentMaintenanceHistory';
import EquipmentQRCode from '@/components/equipment/tabs/EquipmentQRCode';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

interface EquipmentTabsProps {
  equipment: any;
}

const EquipmentTabs: React.FC<EquipmentTabsProps> = ({ equipment }) => {
  const isMobile = useIsMobile();
  
  return (
    <Tabs defaultValue="overview" className="w-full">
      <ScrollArea className="w-full pb-2">
        <TabsList className={`w-full flex justify-start mb-2 overflow-x-auto ${isMobile ? 'gap-1 px-1' : 'gap-2'}`}>
          <TabsTrigger value="overview" className={isMobile ? "py-1 px-2 text-xs" : ""}>
            Aperçu
          </TabsTrigger>
          <TabsTrigger value="maintenance" className={isMobile ? "py-1 px-2 text-xs" : ""}>
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="history" className={isMobile ? "py-1 px-2 text-xs" : ""}>
            Historique
          </TabsTrigger>
          <TabsTrigger value="parts" className={isMobile ? "py-1 px-2 text-xs" : ""}>
            Pièces
          </TabsTrigger>
          <TabsTrigger value="performance" className={isMobile ? "py-1 px-2 text-xs" : ""}>
            Performance
          </TabsTrigger>
          <TabsTrigger value="timeTracking" className={isMobile ? "py-1 px-2 text-xs" : ""}>
            Temps
          </TabsTrigger>
          <TabsTrigger value="qrcode" className={isMobile ? "py-1 px-2 text-xs" : ""}>
            QR Code
          </TabsTrigger>
        </TabsList>
      </ScrollArea>
      
      <div className="mt-2">
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
      </div>
    </Tabs>
  );
};

export default EquipmentTabs;
