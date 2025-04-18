import React, { useState } from 'react';
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
import { createEquipmentType } from '@/services/supabase/equipment/types';
import { toast } from 'sonner';
import { useAuthContext } from '@/providers/AuthProvider';

interface BasicInfoFieldsProps {
  form: UseFormReturn<EquipmentFormValues>;
  customCategories?: string[];
  onAddCategoryClick?: () => void;
  language?: string;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({
  form,
  customCategories = [],
  onAddCategoryClick,
  language = 'fr'
}) => {
  const [isCustomType, setIsCustomType] = useState(false);
  const [newCustomType, setNewCustomType] = useState('');
  const { profileData } = useAuthContext();

  const labels = {
    fr: {
      name: 'Nom',
      type: 'Type',
      manufacturer: 'Fabricant',
      model: 'Modèle',
      year: 'Année',
      addCategoryBtn: 'Ajouter une catégorie',
      selectType: 'Sélectionner un type',
      customTypeLabel: 'Nom du nouveau type',
      customTypeButton: 'Ajouter ce type',
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

  const handleAddCustomType = async () => {
    if (!newCustomType.trim()) {
      toast.error('Veuillez saisir un nom de type');
      return;
    }

    try {
      // Use the user's farm_id from profileData
      const newType = await createEquipmentType(newCustomType.trim());
      
      // Set the newly created type in the form
      form.setValue('type', newType.name);
      
      // Reset custom type input and hide input field
      setNewCustomType('');
      setIsCustomType(false);
      
      toast.success('Type ajouté avec succès');
    } catch (error) {
      console.error('Error creating equipment type:', error);
      toast.error('Impossible d\'ajouter le type');
    }
  };

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
            <div className="space-y-2">
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  setIsCustomType(value === 'other');
                }}
                value={field.value}
              >
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
              
              {isCustomType && (
                <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
                  <Input
                    placeholder={t.customTypeLabel}
                    value={newCustomType}
                    onChange={(e) => setNewCustomType(e.target.value)}
                    className="flex-grow"
                  />
                  <Button 
                    type="button" 
                    size="icon" 
                    onClick={handleAddCustomType}
                    disabled={!newCustomType.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
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
