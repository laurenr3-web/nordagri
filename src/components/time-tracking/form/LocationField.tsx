import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Location {
  id: number;
  name: string;
}

export interface LocationFieldProps {
  location_id?: number;
  location?: string;
  locations: Location[];
  disabled: boolean;
  onChange: (field: string, value: string | number) => void;
}

export function LocationField({ location_id, location, locations, disabled, onChange }: LocationFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="location">Location</Label>
      <Select
        value={location_id?.toString() || location}
        onValueChange={(value) => {
          // If value is a number, it's an ID from locations
          if (!isNaN(parseInt(value))) {
            onChange('location_id', parseInt(value));
          } else {
            // Otherwise it's a custom location
            onChange('location', value);
          }
        }}
        disabled={disabled || locations.length === 0}
      >
        <SelectTrigger id="location" className="w-full">
          <SelectValue placeholder="Select a location" />
        </SelectTrigger>
        <SelectContent>
          {locations.map((location) => (
            <SelectItem key={location.id} value={location.id.toString()}>
              {location.name}
            </SelectItem>
          ))}
          {locations.length === 0 && (
            <div className="p-2 text-sm text-gray-500">
              No locations available
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
