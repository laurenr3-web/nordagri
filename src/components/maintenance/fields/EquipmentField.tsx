
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import FormFieldGroup from './FormFieldGroup';

interface EquipmentFieldProps {
  equipment: string;
  handleEquipmentChange: (value: string) => void;
  equipmentOptions: Array<{ id: number; name: string }>;
  isLoading?: boolean;
}

const EquipmentField: React.FC<EquipmentFieldProps> = ({ 
  equipment, 
  handleEquipmentChange, 
  equipmentOptions, 
  isLoading = false
}) => {
  return (
    <FormFieldGroup>
      <Label htmlFor="equipment">Équipement</Label>
      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <Select value={equipment} onValueChange={handleEquipmentChange} required>
          <SelectTrigger id="equipment">
            <SelectValue placeholder="Sélectionner un équipement" />
          </SelectTrigger>
          <SelectContent>
            {equipmentOptions.map((eq) => (
              <SelectItem key={eq.id} value={eq.name}>
                {eq.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FormFieldGroup>
  );
};

export default EquipmentField;
