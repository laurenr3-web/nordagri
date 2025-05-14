
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Intervention } from '@/hooks/parts/withdrawal/types';

interface InterventionSelectorProps {
  interventionId: string;
  setInterventionId: (value: string) => void;
  interventions: Intervention[];
}

export const InterventionSelector: React.FC<InterventionSelectorProps> = ({
  interventionId,
  setInterventionId,
  interventions
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="intervention">Associer à une intervention (optionnel)</Label>
      <Select value={interventionId} onValueChange={setInterventionId}>
        <SelectTrigger id="intervention">
          <SelectValue placeholder="Sélectionner une intervention" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Aucune intervention</SelectItem>
          {interventions.map((intervention) => (
            <SelectItem key={intervention.id} value={intervention.id.toString()}>
              {intervention.title || `Intervention #${intervention.id}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
