
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EquipmentParts from '../tabs/EquipmentParts';
import { Equipment } from '@/services/supabase/equipmentService';
import { EquipmentItem } from '@/components/equipment/hooks/useEquipmentFilters';
import EquipmentCompatibleParts from '../tabs/EquipmentCompatibleParts';

interface EquipmentTabsProps {
  equipment: Equipment | EquipmentItem;
  forceDesktopTabs?: boolean;
}

export default function EquipmentTabs({ equipment, forceDesktopTabs }: EquipmentTabsProps) {
  const defaultTab = 'parts';

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto">
        <TabsTrigger value="parts">Pièces</TabsTrigger>
      </TabsList>

      <TabsContent value="parts" className="space-y-4">
        <EquipmentCompatibleParts equipment={equipment} />
      </TabsContent>
    </Tabs>
  );
}
