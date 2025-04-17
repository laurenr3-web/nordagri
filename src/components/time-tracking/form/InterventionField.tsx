
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Intervention {
  id: number;
  title: string;
}

interface InterventionFieldProps {
  intervention_id?: number;
  interventions: Intervention[];
  disabled: boolean;
  onChange: (field: string, value: any) => void;
}

export function InterventionField({ intervention_id, interventions, disabled, onChange }: InterventionFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="intervention">Intervention associée</Label>
      <Select
        value={intervention_id?.toString()}
        onValueChange={(value) => onChange('intervention_id', parseInt(value))}
        disabled={disabled || interventions.length === 0}
      >
        <SelectTrigger id="intervention" className="w-full">
          <SelectValue placeholder="Sélectionner une intervention" />
        </SelectTrigger>
        <SelectContent>
          {interventions.map((intervention) => (
            <SelectItem key={intervention.id} value={intervention.id.toString()}>
              {intervention.title}
            </SelectItem>
          ))}
          {interventions.length === 0 && (
            <div className="p-2 text-sm text-gray-500">
              Aucune intervention pour cet équipement
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
