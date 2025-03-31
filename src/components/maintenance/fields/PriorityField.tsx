
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MaintenancePriority } from '@/hooks/maintenance/maintenanceSlice';
import FormFieldGroup from './FormFieldGroup';

interface PriorityFieldProps {
  priority: MaintenancePriority;
  setPriority: (priority: MaintenancePriority) => void;
}

const PriorityField: React.FC<PriorityFieldProps> = ({ priority, setPriority }) => {
  return (
    <FormFieldGroup>
      <Label htmlFor="priority">Priorité</Label>
      <Select 
        value={priority} 
        onValueChange={(value: MaintenancePriority) => setPriority(value)}
      >
        <SelectTrigger id="priority">
          <SelectValue placeholder="Sélectionner une priorité" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="critical">Critique</SelectItem>
          <SelectItem value="high">Haute</SelectItem>
          <SelectItem value="medium">Moyenne</SelectItem>
          <SelectItem value="low">Basse</SelectItem>
        </SelectContent>
      </Select>
    </FormFieldGroup>
  );
};

export default PriorityField;
