
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { TimeEntryTaskType } from '@/hooks/time-tracking/types';

interface TaskTypeFieldProps {
  taskType: TimeEntryTaskType;
  customTaskType: string;
  onChange: (field: string, value: any) => void;
}

export function TaskTypeField({ taskType, customTaskType, onChange }: TaskTypeFieldProps) {
  return (
    <>
      <div className="grid gap-2">
        <Label>Type de tâche <span className="text-red-500">*</span></Label>
        <RadioGroup
          value={taskType}
          onValueChange={(value) => onChange('task_type', value as TimeEntryTaskType)}
          className="grid grid-cols-2 gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="maintenance" id="maintenance" />
            <Label htmlFor="maintenance">Maintenance</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="repair" id="repair" />
            <Label htmlFor="repair">Réparation</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="inspection" id="inspection" />
            <Label htmlFor="inspection">Inspection</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="installation" id="installation" />
            <Label htmlFor="installation">Installation</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="other" id="other" />
            <Label htmlFor="other">Autre</Label>
          </div>
        </RadioGroup>
      </div>

      {taskType === 'other' && (
        <div className="grid gap-2">
          <Label htmlFor="custom_task_type">Nom de la tâche <span className="text-red-500">*</span></Label>
          <Input
            id="custom_task_type"
            value={customTaskType}
            onChange={(e) => onChange('custom_task_type', e.target.value)}
            placeholder="Saisissez le nom de la tâche"
            required
          />
        </div>
      )}
    </>
  );
}
