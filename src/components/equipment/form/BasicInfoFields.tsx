
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EquipmentFormValues } from './equipmentFormTypes';
import { 
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface BasicInfoFieldsProps {
  form: UseFormReturn<EquipmentFormValues>;
  customCategories: string[];
  onAddCategoryClick: () => void;
  language?: string;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({
  form,
  customCategories,
  onAddCategoryClick,
  language = 'fr'
}) => {
  const labels = {
    fr: {
      name: 'Nom',
      type: 'Type',
      manufacturer: 'Fabricant',
      model: 'Modèle',
      year: 'Année',
      addCategoryBtn: 'Ajouter une catégorie',
      selectType: 'Sélectionner un type',
      namePlaceholder: 'Nom de l\'équipement',
      manufacturerPlaceholder: 'Fabricant',
      modelPlaceholder: 'Modèle',
      yearPlaceholder: 'Année'
    },
    en: {
      name: 'Name',
      type: 'Type',
      manufacturer: 'Manufacturer',
      model: 'Model',
      year: 'Year',
      addCategoryBtn: 'Add category',
      selectType: 'Select a type',
      namePlaceholder: 'Equipment name',
      manufacturerPlaceholder: 'Manufacturer',
      modelPlaceholder: 'Model',
      yearPlaceholder: 'Year'
    }
  };
  
  const t = labels[language as keyof typeof labels] || labels.fr;

  return (
    <div className="space-y-4">
      {/* Nom */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t.name}</FormLabel>
            <FormControl>
              <Input placeholder={t.namePlaceholder} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Type */}
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t.type}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectType} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="tractor">Tracteur</SelectItem>
                <SelectItem value="harvester">Moissonneuse</SelectItem>
                <SelectItem value="seeder">Semoir</SelectItem>
                <SelectItem value="sprayer">Pulvérisateur</SelectItem>
                <SelectItem value="tool">Outil</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Fabricant */}
      <FormField
        control={form.control}
        name="manufacturer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t.manufacturer}</FormLabel>
            <FormControl>
              <Input placeholder={t.manufacturerPlaceholder} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Modèle */}
      <FormField
        control={form.control}
        name="model"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t.model}</FormLabel>
            <FormControl>
              <Input placeholder={t.modelPlaceholder} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Année */}
      <FormField
        control={form.control}
        name="year"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t.year}</FormLabel>
            <FormControl>
              <Input 
                placeholder={t.yearPlaceholder} 
                type="number" 
                min="1900" 
                max={new Date().getFullYear()} 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicInfoFields;
