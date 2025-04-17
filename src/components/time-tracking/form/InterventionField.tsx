
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InterventionFieldProps {
  intervention_id?: number;
  interventions: { id: number; title: string }[];
  disabled: boolean;
  onChange: (field: string, value: any) => void;
}

export function InterventionField({ intervention_id, interventions, disabled, onChange }: InterventionFieldProps) {
  const safeInterventions = Array.isArray(interventions) ? interventions : [];
  
  return (
    <div className="grid gap-2">
      <Label htmlFor="intervention_id">🔗 Intervention associée (optionnel)</Label>
      <Select
        value={intervention_id?.toString()}
        onValueChange={(value) => onChange('intervention_id', value ? parseInt(value, 10) : undefined)}
        disabled={disabled}
      >
        <SelectTrigger id="intervention_id">
          <SelectValue placeholder={disabled ? "Sélectionnez d'abord un équipement" : "Sélectionner une intervention"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Aucune intervention</SelectItem>
          {safeInterventions.map((intervention) => (
            <SelectItem key={intervention.id} value={intervention.id.toString()}>
              {intervention.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {disabled && (
        <p className="text-xs text-muted-foreground">
          Pour associer une intervention, veuillez d'abord sélectionner un équipement
        </p>
      )}
    </div>
  );
}
