
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const WORKSTATIONS = [
  'bureau',
  'étable',
  'salle de traite',
  'atelier',
  'entreposage',
  'mobilité'
] as const;

interface WorkstationFieldProps {
  workstation: string;
  onChange: (field: string, value: string) => void;
  required?: boolean;
}

export function WorkstationField({ workstation, onChange, required = false }: WorkstationFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="workstation">
        🧑‍🌾 Poste de travail {required && <span className="text-red-500">*</span>}
      </Label>
      <Select
        value={workstation}
        onValueChange={(value) => onChange('poste_travail', value)}
      >
        <SelectTrigger id="workstation">
          <SelectValue placeholder="Sélectionner un poste de travail" />
        </SelectTrigger>
        <SelectContent>
          {WORKSTATIONS.map((station) => (
            <SelectItem key={station} value={station}>
              {station.charAt(0).toUpperCase() + station.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
