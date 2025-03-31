
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import FormFieldGroup from './FormFieldGroup';

interface EngineHoursFieldProps {
  engineHours: string;
  setEngineHours: (hours: string) => void;
}

const EngineHoursField: React.FC<EngineHoursFieldProps> = ({ engineHours, setEngineHours }) => {
  return (
    <FormFieldGroup>
      <Label htmlFor="engineHours">Heures moteur</Label>
      <Input
        id="engineHours"
        type="number"
        min="0"
        value={engineHours}
        onChange={(e) => setEngineHours(e.target.value)}
        required
      />
    </FormFieldGroup>
  );
};

export default EngineHoursField;
