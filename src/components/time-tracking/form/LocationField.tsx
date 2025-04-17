
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LocationFieldProps {
  location_id?: number;
  locations: { id: number; name: string }[];
  disabled: boolean;
  onChange: (field: string, value: any) => void;
}

export function LocationField({ location_id, locations, disabled, onChange }: LocationFieldProps) {
  const safeLocations = Array.isArray(locations) ? locations : [];
  
  return (
    <div className="grid gap-2">
      <Label htmlFor="location_id">🗺️ Emplacement (facultatif)</Label>
      <Select
        value={location_id?.toString()}
        onValueChange={(value) => onChange('location_id', value === "none" ? undefined : parseInt(value, 10))}
        disabled={disabled}
      >
        <SelectTrigger id="location_id">
          <SelectValue placeholder="Sélectionner un emplacement" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Non spécifié</SelectItem>
          {safeLocations.map((location) => (
            <SelectItem key={location.id} value={location.id.toString()}>
              {location.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
