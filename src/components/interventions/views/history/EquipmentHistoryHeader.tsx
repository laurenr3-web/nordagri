
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h3 className="font-medium">Historique des interventions par équipement</h3>
      
      <Select 
        value={selectedEquipment} 
        onValueChange={setSelectedEquipment}
      >
        <SelectTrigger className="w-full sm:w-[220px]">
          <SelectValue placeholder="Sélectionner un équipement" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les équipements</SelectItem>
          {equipments.map(equipment => (
            <SelectItem key={equipment} value={equipment}>
              {equipment}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default EquipmentHistoryHeader;
