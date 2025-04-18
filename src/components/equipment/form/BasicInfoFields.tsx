
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
import { useEquipmentTypes } from '@/hooks/equipment/useEquipmentTypes';

interface BasicInfoFieldsProps {
  form: UseFormReturn<EquipmentFormValues>;
  customCategories?: string[];
  onAddCategoryClick?: () => void;
  language?: string;
  onAddCustomType?: (type: string) => void;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({
  form,
  customCategories = [],
  onAddCategoryClick,
  language = 'fr',
  onAddCustomType
}) => {
  const [newCustomType, setNewCustomType] = useState('');
  const { types, isLoading } = useEquipmentTypes();

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
      customTypeLabel: 'New type name',
      customTypeButton: 'Add this type',
      namePlaceholder: 'Equipment name',
      manufacturerPlaceholder: 'Manufacturer',
      modelPlaceholder: 'Model',
      yearPlaceholder: 'Year'
    }
  };
  
  const t = labels[language as keyof typeof labels] || labels.fr;

  const handleAddCustomType = async () => {
    const customType = newCustomType.trim();
    if (customType && onAddCustomType) {
      await onAddCustomType(customType);
      setNewCustomType('');
    }
  };

  const combinedTypes = [...types.map(type => type.name), ...customCategories];

  return (
    <div className="space-y-4">
      {/* Name */}
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
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectType} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center p-2">
                      Loading types...
                    </div>
                  ) : (
                    <>
                      {combinedTypes.map((typeName) => (
                        <SelectItem key={typeName} value={typeName}>
                          {typeName}
                        </SelectItem>
                      ))}
                      <SelectItem value="__add_new__" className="text-primary font-medium" onSelect={onAddCategoryClick}>
                        ➕ {t.addCategoryBtn}
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Manufacturer */}
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
      
      {/* Model */}
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
      
      {/* Year */}
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
