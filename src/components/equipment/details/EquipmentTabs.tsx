
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Activity } from 'lucide-react';
import EquipmentHistory from '../tabs/EquipmentHistory';
import EquipmentPerformance from '../tabs/EquipmentPerformance';
import EquipmentOverview from './EquipmentOverview';
import { EquipmentItem } from '../hooks/useEquipmentFilters';

interface EquipmentTabsProps {
  equipment: EquipmentItem;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const EquipmentTabs: React.FC<EquipmentTabsProps> = ({ 
  equipment, 
  activeTab, 
  onTabChange 
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-full justify-start mb-4">
        <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-1">
          <History size={16} />
          Historique
        </TabsTrigger>
        <TabsTrigger value="performance" className="flex items-center gap-1">
          <Activity size={16} />
          Performance
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-6">
        <EquipmentOverview equipment={equipment} />
      </TabsContent>
      
      <TabsContent value="history">
        <EquipmentHistory equipment={equipment} />
      </TabsContent>
      
      <TabsContent value="performance">
        <EquipmentPerformance equipment={equipment} />
      </TabsContent>
    </Tabs>
  );
};

export default EquipmentTabs;
