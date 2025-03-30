
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EquipmentFormValues } from '../equipmentFormTypes';

interface CategoryFieldProps {
  form: UseFormReturn<EquipmentFormValues>;
  customCategories: string[];
  onAddCategoryClick: () => void;
  label?: string;
  placeholder?: string;
  addButtonText?: string;
}

const CategoryField: React.FC<CategoryFieldProps> = ({ 
  form, 
  customCategories, 
  onAddCategoryClick,
  label = "Catégorie",
  placeholder = "Sélectionner un type",
  addButtonText = "Ajouter une catégorie"
}) => {
  return (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="flex items-center gap-2">
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="tractor">Tracteur</SelectItem>
                <SelectItem value="harvester">Moissonneuse</SelectItem>
                <SelectItem value="seeder">Semoir</SelectItem>
                <SelectItem value="sprayer">Pulvérisateur</SelectItem>
                <SelectItem value="tool">Outil</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
                {customCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              onClick={onAddCategoryClick}
              aria-label={addButtonText}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CategoryField;
