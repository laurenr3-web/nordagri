
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
      category: 'Catégorie',
      manufacturer: 'Fabricant',
      model: 'Modèle',
      year: 'Année',
      addCategoryBtn: 'Ajouter une catégorie',
      selectType: 'Sélectionner un type',
      selectCategory: 'Sélectionner une catégorie',
      namePlaceholder: 'Nom de l\'équipement',
      manufacturerPlaceholder: 'Fabricant',
      modelPlaceholder: 'Modèle',
      yearPlaceholder: 'Année'
    },
    en: {
      name: 'Name',
      type: 'Type',
      category: 'Category',
      manufacturer: 'Manufacturer',
      model: 'Model',
      year: 'Year',
      addCategoryBtn: 'Add category',
      selectType: 'Select a type',
      selectCategory: 'Select a category',
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
      
      {/* Catégorie */}
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t.category}</FormLabel>
            <div className="flex items-center gap-2">
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t.selectCategory} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="tracteurs">Tracteurs</SelectItem>
                  <SelectItem value="moissonneuses">Moissonneuses</SelectItem>
                  <SelectItem value="outils">Outils</SelectItem>
                  <SelectItem value="irrigation">Irrigation</SelectItem>
                  <SelectItem value="semoirs">Semoirs</SelectItem>
                  <SelectItem value="pulvérisateurs">Pulvérisateurs</SelectItem>
                  {customCategories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
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
                aria-label={t.addCategoryBtn}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
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
