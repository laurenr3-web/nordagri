
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MaintenanceType } from '@/hooks/maintenance/maintenanceSlice';
import FormFieldGroup from './FormFieldGroup';
import { HelpTooltip } from '@/components/help/HelpTooltip';

interface TaskTypeFieldProps {
  type: MaintenanceType;
  setType: (type: MaintenanceType) => void;
}

const TaskTypeField: React.FC<TaskTypeFieldProps> = ({ type, setType }) => {
  return (
    <FormFieldGroup>
      <span className="inline-flex items-center gap-1">
        <Label htmlFor="taskType">Type de tâche</Label>
        <HelpTooltip contentKey="maintenance.type" />
      </span>
      <Select value={type} onValueChange={(value: MaintenanceType) => setType(value)}>
        <SelectTrigger id="taskType">
          <SelectValue placeholder="Sélectionner un type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="preventive">Préventive</SelectItem>
          <SelectItem value="corrective">Corrective</SelectItem>
          <SelectItem value="condition-based">Conditionnelle</SelectItem>
        </SelectContent>
      </Select>
    </FormFieldGroup>
  );
};

export default TaskTypeField;
