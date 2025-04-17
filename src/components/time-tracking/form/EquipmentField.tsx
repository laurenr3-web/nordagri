
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface Equipment {
  id: number;
  name: string;
}

interface EquipmentFieldProps {
  equipment_id?: number;
  equipments: Equipment[];
  loading: boolean;
  onChange: (field: string, value: any) => void;
}

export function EquipmentField({ equipment_id, equipments, loading, onChange }: EquipmentFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="equipment">Equipment *</Label>
      <Select
        value={equipment_id?.toString()}
        onValueChange={(value) => onChange('equipment_id', parseInt(value))}
        disabled={loading}
      >
        <SelectTrigger id="equipment" className="w-full">
          <SelectValue placeholder="Select equipment" />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading...
            </div>
          ) : (
            equipments.map((equipment) => (
              <SelectItem key={equipment.id} value={equipment.id.toString()}>
                {equipment.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
