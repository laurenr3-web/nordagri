
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Part } from '@/types/Part';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PartBasicInfo from './details/PartBasicInfo';
import PartInventoryInfo from './details/PartInventoryInfo';
import PartCompatibility from './details/PartCompatibility';
import PartImage from './details/PartImage';
import PartReorderInfo from './details/PartReorderInfo';
import PartActions from './details/PartActions';
import TechnicalInfoTab from './technical-info/TechnicalInfoTab';
import PriceComparisonTab from './PriceComparisonTab';

interface PartDetailsExtendedProps {
  part: Part;
  onClose?: () => void;
  onEdit?: (part: Part) => void;
  onOrder?: (part: Part) => void;
}

const PartDetailsExtended = ({ part, onClose, onEdit, onOrder }: PartDetailsExtendedProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="space-y-6">
      <div className="flex items-start">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{part.name}</h2>
          <p className="text-muted-foreground">{part.partNumber} • {part.manufacturer}</p>
        </div>
        <PartActions 
          part={part} 
          onClose={onClose} 
          onEdit={onEdit} 
          onOrder={onOrder}
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="technical">Informations techniques</TabsTrigger>
          <TabsTrigger value="prices-openai">Prix (OpenAI)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PartImage part={part} />
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <PartBasicInfo part={part} />
                <PartInventoryInfo part={part} />
                <PartReorderInfo part={part} />
                <PartCompatibility part={part} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="technical" className="space-y-4 pt-4">
          <TechnicalInfoTab 
            partNumber={part.partNumber} 
            partName={part.name}
          />
        </TabsContent>

        <TabsContent value="prices-openai" className="space-y-4 pt-4">
          <PriceComparisonTab
            partNumber={part.partNumber}
            partName={part.name}
            manufacturer={part.manufacturer}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PartDetailsExtended;
