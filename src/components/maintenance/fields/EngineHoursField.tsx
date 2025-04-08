
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import FormFieldGroup from './FormFieldGroup';

interface EngineHoursFieldProps {
  engineHours: string;
  setEngineHours: (hours: string) => void;
  error?: string;
}

const EngineHoursField: React.FC<EngineHoursFieldProps> = ({ 
  engineHours, 
  setEngineHours,
  error
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseFloat(value);
    
    // Valider uniquement les nombres positifs
    if (value === '' || (numValue >= 0 && !isNaN(numValue))) {
      setEngineHours(value);
    }
  };

  return (
    <FormFieldGroup>
      <Label htmlFor="engineHours" className={error ? "text-destructive" : ""}>
        Heures moteur
      </Label>
      <Input
        id="engineHours"
        type="number"
        min="0"
        step="0.5"
        value={engineHours}
        onChange={handleChange}
        className={error ? "border-destructive focus-visible:ring-destructive" : ""}
        required
      />
      {error && (
        <div className="text-sm font-medium text-destructive mt-1">
          {error}
        </div>
      )}
    </FormFieldGroup>
  );
};

export default EngineHoursField;
