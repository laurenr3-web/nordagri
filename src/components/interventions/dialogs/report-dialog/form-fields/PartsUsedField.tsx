
import React from 'react';
import { Control, UseFormGetValues, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InterventionReportFormValues } from '../../hooks/useInterventionReportForm';
import { PartsList } from './PartsList';

interface PartsUsedFieldProps {
  control: Control<InterventionReportFormValues>;
  availableParts: Array<{ id: number; name: string; quantity: number; }>;
  watch: UseFormWatch<InterventionReportFormValues>;
  getValues: UseFormGetValues<InterventionReportFormValues>;
  setValue: UseFormSetValue<InterventionReportFormValues>;
}

// Define a simplified part type that matches our usage in the form
export type FormPart = {
  id: number;
  name: string;
  quantity: number;
};

export const PartsUsedField: React.FC<PartsUsedFieldProps> = ({
  control,
  availableParts,
  watch,
  getValues,
  setValue
}) => {
  // Ajouter une pièce utilisée
  const addPart = (part: { id: number; name: string; }) => {
    const currentParts = getValues('partsUsed') || [];
    const existingPartIndex = currentParts.findIndex(p => p.id === part.id);
    
    if (existingPartIndex >= 0) {
      // Incrémenter la quantité si la pièce existe déjà
      const updatedParts = [...currentParts];
      updatedParts[existingPartIndex].quantity += 1;
      setValue('partsUsed', updatedParts);
    } else {
      // Ajouter une nouvelle pièce avec quantité 1
      setValue('partsUsed', [...currentParts, { id: part.id, name: part.name, quantity: 1 }]);
    }
  };

  // Retirer une pièce
  const removePart = (partId: number) => {
    const currentParts = getValues('partsUsed') || [];
    setValue(
      'partsUsed',
      currentParts.filter(p => p.id !== partId)
    );
  };

  // Mettre à jour la quantité d'une pièce
  const updatePartQuantity = (partId: number, quantity: number) => {
    const currentParts = getValues('partsUsed') || [];
    const updatedParts = currentParts.map(part => 
      part.id === partId ? { ...part, quantity } : part
    );
    setValue('partsUsed', updatedParts);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Pièces utilisées</h3>
      
      {availableParts.length > 0 && (
        <div className="mb-2">
          <h4 className="text-xs text-muted-foreground mb-1">Ajouter une pièce :</h4>
          <div className="flex flex-wrap gap-1">
            {availableParts.map(part => (
              <Button
                key={part.id}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => addPart(part)}
              >
                <Wrench className="h-3 w-3 mr-1" />
                {part.name}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <PartsList 
        parts={(watch('partsUsed') || []) as FormPart[]}
        onRemovePart={removePart}
        onUpdateQuantity={updatePartQuantity}
      />
    </div>
  );
};
