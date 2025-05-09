
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Part } from '@/types/Part';
import PartBasicInfo from './PartBasicInfo';
import PartInventoryInfo from './PartInventoryInfo';
import PartCompatibility from './PartCompatibility';
import PartReorderInfo from './PartReorderInfo';
import WithdrawalHistory from './WithdrawalHistory';

interface DetailsTabsProps {
  part: Part;
  activeTab: string;
  onTabChange: (value: string) => void;
}

const DetailsTabs: React.FC<DetailsTabsProps> = ({ 
  part, 
  activeTab, 
  onTabChange 
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-full grid grid-cols-2">
        <TabsTrigger value="details">Détails</TabsTrigger>
        <TabsTrigger value="history">Historique des retraits</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="space-y-6 mt-6">
        <Separator />
        
        <div className="grid grid-cols-2 gap-6">
          <PartBasicInfo part={part} />
          <PartInventoryInfo part={part} />
        </div>

        <PartCompatibility compatibility={part.compatibility} />

        <PartReorderInfo part={part} />
      </TabsContent>
      
      <TabsContent value="history" className="mt-6">
        {activeTab === 'history' && <WithdrawalHistory part={part} />}
      </TabsContent>
    </Tabs>
  );
};

export default DetailsTabs;
