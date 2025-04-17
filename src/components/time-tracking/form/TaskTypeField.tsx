
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TimeEntryTaskType } from '@/hooks/time-tracking/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaskTypeFieldProps {
  taskType: TimeEntryTaskType;
  customTaskType: string;
  onChange: (field: string, value: any) => void;
}

export function TaskTypeField({ taskType, customTaskType, onChange }: TaskTypeFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="task_type">🛠️ Type de tâche *</Label>
      <Select 
        value={taskType} 
        onValueChange={(value) => onChange('task_type', value as TimeEntryTaskType)}
      >
        <SelectTrigger id="task_type">
          <SelectValue placeholder="Sélectionner un type de tâche" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="maintenance">Entretien</SelectItem>
          <SelectItem value="repair">Réparation</SelectItem>
          <SelectItem value="inspection">Inspection</SelectItem>
          <SelectItem value="operation">Opération</SelectItem>
          <SelectItem value="other">Autre</SelectItem>
        </SelectContent>
      </Select>

      {taskType === 'other' && (
        <div className="mt-2">
          <Input
            id="custom_task_type"
            value={customTaskType}
            onChange={(e) => onChange('custom_task_type', e.target.value)}
            placeholder="Préciser le type de tâche..."
          />
        </div>
      )}
    </div>
  );
}
