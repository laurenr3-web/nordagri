
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { MultiSelect } from '@/components/ui/multi-select';
import { UseFormReturn } from 'react-hook-form';
import { PartFormValues } from '../partFormTypes';
import { useEquipments } from '@/hooks/equipment/useEquipments';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEquipmentSelection } from '@/hooks/useEquipmentSelection';
import { Skeleton } from '@/components/ui/skeleton';

interface CompatibilityMultiSelectFieldProps {
  form: UseFormReturn<PartFormValues>;
}

const CompatibilityMultiSelectField: React.FC<CompatibilityMultiSelectFieldProps> = ({ form }) => {
  const { data: equipmentOptions = [], isLoading } = useEquipments();
  const { selectedIds, handleSelectionChange, clearSelection } = useEquipmentSelection(form);

  if (isLoading) {
    return <Skeleton className="h-20 w-full" />;
  }

  return (
    <FormField
      control={form.control}
      name="compatibility"
      render={() => (
        <FormItem className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <FormLabel>Équipements compatibles</FormLabel>
            {selectedIds.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="h-8 px-2 text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Effacer la sélection
              </Button>
            )}
          </div>
          <FormControl>
            <MultiSelect
              options={equipmentOptions}
              selected={selectedIds.map(id => id.toString())}
              onChange={handleSelectionChange}
              placeholder="Sélectionner les équipements compatibles..."
              emptyMessage={isLoading ? "Chargement des équipements..." : "Aucun équipement trouvé."}
            />
          </FormControl>
          <FormDescription>
            {selectedIds.length > 0
              ? `${selectedIds.length} équipement${selectedIds.length > 1 ? 's' : ''} compatible${selectedIds.length > 1 ? 's' : ''} sélectionné${selectedIds.length > 1 ? 's' : ''}`
              : "Aucun équipement compatible sélectionné"
            }
          </FormDescription>
        </FormItem>
      )}
    />
  );
};

export default CompatibilityMultiSelectField;
