
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Location {
  id: number;
  name: string;
}

interface LocationFieldProps {
  location_id?: number;
  locations: Location[];
  disabled: boolean;
  onChange: (field: string, value: any) => void;
}

export function LocationField({ location_id, locations, disabled, onChange }: LocationFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="location">Emplacement</Label>
      <Select
        value={location_id?.toString()}
        onValueChange={(value) => onChange('location_id', parseInt(value))}
        disabled={disabled || locations.length === 0}
      >
        <SelectTrigger id="location" className="w-full">
          <SelectValue placeholder="Sélectionner un emplacement" />
        </SelectTrigger>
        <SelectContent>
          {locations.map((location) => (
            <SelectItem key={location.id} value={location.id.toString()}>
              {location.name}
            </SelectItem>
          ))}
          {locations.length === 0 && (
            <div className="p-2 text-sm text-gray-500">
              Aucun emplacement disponible
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
