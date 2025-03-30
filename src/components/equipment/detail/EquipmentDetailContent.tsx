
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EquipmentDetails from '@/components/equipment/EquipmentDetails';
import EquipmentParts from '@/components/equipment/tabs/EquipmentParts';
import EquipmentMaintenance from '@/components/equipment/tabs/EquipmentMaintenance';
import EquipmentHistory from '@/components/equipment/tabs/EquipmentHistory';

interface EquipmentDetailContentProps {
  equipment: any;
  onUpdate: (updatedEquipment: any) => Promise<void>;
}

const EquipmentDetailContent: React.FC<EquipmentDetailContentProps> = ({ 
  equipment, 
  onUpdate 
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  
  return (
    <div className="max-w-7xl mx-auto">
      <Button 
        variant="outline" 
        size="sm" 
        className="mb-4"
        onClick={() => navigate('/equipment')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux équipements
      </Button>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="parts">Pièces</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <EquipmentDetails 
            equipment={equipment} 
            onUpdate={onUpdate} 
          />
        </TabsContent>
        
        <TabsContent value="parts">
          <EquipmentParts equipment={equipment} />
        </TabsContent>
        
        <TabsContent value="maintenance">
          <EquipmentMaintenance equipment={equipment} />
        </TabsContent>
        
        <TabsContent value="history">
          <EquipmentHistory equipment={equipment} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EquipmentDetailContent;
