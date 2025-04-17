
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface EquipmentFieldProps {
  equipment_id?: number;
  equipments: { id: number; name: string }[];
  loading: boolean;
  onChange: (field: string, value: any) => void;
}

export function EquipmentField({ equipment_id, equipments, loading, onChange }: EquipmentFieldProps) {
  const safeEquipments = Array.isArray(equipments) ? equipments : [];
  
  return (
    <div className="grid gap-2">
      <Label htmlFor="equipment_id">🚜 Équipement utilisé</Label>
      {loading ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <Select
          value={equipment_id?.toString()}
          onValueChange={(value) => onChange('equipment_id', value ? parseInt(value, 10) : undefined)}
        >
          <SelectTrigger id="equipment_id">
            <SelectValue placeholder="Sélectionner un équipement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Aucun</SelectItem>
            {safeEquipments.map((equipment) => (
              <SelectItem key={equipment.id} value={equipment.id.toString()}>
                {equipment.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {equipment_id === undefined && (
        <p className="text-xs text-muted-foreground">
          Si aucun équipement n'est utilisé, veuillez spécifier un poste de travail ci-dessous
        </p>
      )}
    </div>
  );
}
