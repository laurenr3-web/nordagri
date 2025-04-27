
import React, { useMemo } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { MultiSelect } from '@/components/ui/multi-select';
import { PartFormValues } from '../partFormTypes';
import { useEquipments, useValidateCompatibility } from '@/hooks/equipment/useEquipments';
import { AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface CompatibilityMultiSelectFieldProps {
  form: UseFormReturn<PartFormValues>;
  isEditMode?: boolean;
}

const CompatibilityMultiSelectField: React.FC<CompatibilityMultiSelectFieldProps> = ({ 
  form, 
  isEditMode = false 
}) => {
  const { data: equipmentOptions = [], isLoading, error } = useEquipments();
  const { data: validEquipmentIds } = useValidateCompatibility();
  const { toast } = useToast();
  
  // Conversion de number[] à string[] pour le MultiSelect
  const selectedEquipmentIds = useMemo(() => {
    const compatibilityValue = form.getValues('compatibility') || [];
    return Array.isArray(compatibilityValue) 
      ? compatibilityValue.map(id => id.toString())
      : [];
  }, [form]);

  // Vérifier si des IDs sont invalides (équipements supprimés)
  const invalidIds = useMemo(() => {
    if (!validEquipmentIds || !selectedEquipmentIds.length) return [];
    
    return selectedEquipmentIds.filter(id => {
      const numId = Number(id);
      return !Number.isNaN(numId) && !validEquipmentIds.has(numId);
    });
  }, [selectedEquipmentIds, validEquipmentIds]);

  // Si des IDs invalides sont détectés, afficher une notification
  React.useEffect(() => {
    if (isEditMode && invalidIds.length > 0) {
      toast({
        variant: "destructive",
        title: "Attention: Équipements non disponibles",
        description: `${invalidIds.length} équipement(s) précédemment sélectionné(s) n'existe(nt) plus.`,
      });
    }
  }, [invalidIds, isEditMode, toast]);

  // Gérer le changement de sélection
  const handleSelectionChange = (selected: string[]) => {
    // Convertir les string[] en number[]
    const numericValues = selected.map(id => Number(id)).filter(id => !Number.isNaN(id));
    form.setValue('compatibility', numericValues);
  };

  return (
    <FormField
      control={form.control}
      name="compatibility"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel>Équipements compatibles</FormLabel>
            {invalidIds.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{invalidIds.length} équipement(s) sélectionné(s) n'existe(nt) plus.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <FormControl>
            <MultiSelect
              options={equipmentOptions || []}
              selected={selectedEquipmentIds}
              onChange={handleSelectionChange}
              placeholder="Sélectionner les équipements compatibles..."
              emptyMessage={isLoading ? "Chargement des équipements..." : "Aucun équipement trouvé."}
              disabled={isLoading}
            />
          </FormControl>
          <FormDescription>
            {selectedEquipmentIds.length > 0 
              ? `${selectedEquipmentIds.length} équipement(s) compatible(s) sélectionné(s)`
              : "Aucun équipement compatible sélectionné"
            }
          </FormDescription>
          {error && (
            <div className="text-destructive text-sm mt-1">
              Erreur de chargement des équipements. Les données en cache seront utilisées si disponibles.
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CompatibilityMultiSelectField;
