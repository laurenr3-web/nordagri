
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { History } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface EquipmentHistoryHeaderProps {
  selectedEquipment: string;
  setSelectedEquipment: (equipment: string) => void;
  equipments: string[];
}

const EquipmentHistoryHeader: React.FC<EquipmentHistoryHeaderProps> = ({ 
  selectedEquipment, 
  setSelectedEquipment, 
  equipments 
}) => {
  return (
    <Card className="p-4 mb-6 border-blue-100 bg-gradient-to-r from-blue-50 to-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-full">
            <History className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="font-medium text-lg">Historique des interventions par équipement</h3>
        </div>
        
        <Select 
          value={selectedEquipment} 
          onValueChange={setSelectedEquipment}
        >
          <SelectTrigger className="w-full sm:w-[240px] bg-white border-blue-200">
            <SelectValue placeholder="Sélectionner un équipement" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">Tous les équipements</SelectItem>
            {equipments.map(equipment => (
              <SelectItem key={equipment} value={equipment}>
                {equipment}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
};

export default EquipmentHistoryHeader;
