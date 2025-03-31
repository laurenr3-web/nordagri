
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { InterventionFormValues } from './interventionFormSchema';
import { Loader2 } from 'lucide-react';

interface BasicInfoFieldsProps {
  form: UseFormReturn<InterventionFormValues>;
  equipments: { id: number; name: string }[];
  isLoadingEquipment: boolean;
  handleEquipmentChange: (value: string) => string;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ 
  form, 
  equipments,
  isLoadingEquipment,
  handleEquipmentChange
}) => {
  return (
    <>
      {/* Titre */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Titre</FormLabel>
            <FormControl>
              <Input placeholder="Titre de l'intervention" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Équipement */}
      <FormField
        control={form.control}
        name="equipment"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Équipement</FormLabel>
            <Select 
              onValueChange={(value) => field.onChange(handleEquipmentChange(value))}
              value={field.value}
              disabled={isLoadingEquipment}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un équipement" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {isLoadingEquipment ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Chargement...</span>
                  </div>
                ) : (
                  equipments.map((eq) => (
                    <SelectItem key={eq.id} value={eq.name}>
                      {eq.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Localisation */}
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Localisation</FormLabel>
            <FormControl>
              <Input placeholder="Lieu de l'intervention" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BasicInfoFields;
