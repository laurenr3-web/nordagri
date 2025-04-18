
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EquipmentFormValues } from '../equipmentFormTypes';
import { useEquipmentTypes } from '@/hooks/equipment/useEquipmentTypes';
import { AddEquipmentTypeDialog } from '../AddEquipmentTypeDialog';
import { Loader2 } from 'lucide-react';

interface TypeFieldProps {
  form: UseFormReturn<EquipmentFormValues>;
  label?: string;
  placeholder?: string;
}

const TypeField: React.FC<TypeFieldProps> = ({ 
  form,
  label = "Type",
  placeholder = "Sélectionner un type"
}) => {
  const [isAddTypeDialogOpen, setIsAddTypeDialogOpen] = useState(false);
  const { types, isLoading } = useEquipmentTypes();

  const handleSuccess = (name: string) => {
    form.setValue('type', name);
  };

  return (
    <>
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <Select 
              onValueChange={(value) => {
                if (value === "__add_new__") {
                  setIsAddTypeDialogOpen(true);
                } else {
                  field.onChange(value);
                }
              }} 
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {isLoading ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Chargement...</span>
                  </div>
                ) : (
                  <>
                    {types.map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="__add_new__" className="text-primary font-medium">
                      ➕ Ajouter un type...
                    </SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <AddEquipmentTypeDialog 
        open={isAddTypeDialogOpen} 
        onOpenChange={setIsAddTypeDialogOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default TypeField;
