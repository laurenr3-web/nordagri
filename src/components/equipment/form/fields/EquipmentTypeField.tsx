
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { EquipmentFormValues } from '../equipmentFormTypes';
import { useEquipmentTypes } from '@/hooks/equipment/useEquipmentTypes';
import { toast } from 'sonner';

interface EquipmentTypeFieldProps {
  form: UseFormReturn<EquipmentFormValues>;
  language?: 'fr' | 'en';
}

export const EquipmentTypeField = ({ 
  form,
  language = 'fr'
}: EquipmentTypeFieldProps) => {
  const [showNewTypeInput, setShowNewTypeInput] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const { types, isLoading, createType } = useEquipmentTypes();

  const labels = {
    fr: {
      type: 'Type',
      selectType: 'Sélectionner un type',
      addType: 'Ajouter un type',
      newTypePlaceholder: 'Nom du nouveau type',
      addButton: 'Ajouter',
      cancel: 'Annuler'
    },
    en: {
      type: 'Type',
      selectType: 'Select a type',
      addType: 'Add type',
      newTypePlaceholder: 'New type name',
      addButton: 'Add',
      cancel: 'Cancel'
    }
  };

  const t = labels[language];

  const handleAddNewType = async () => {
    if (!newTypeName.trim()) return;

    try {
      const result = await createType(newTypeName.trim());
      if (result && result.name) {
        form.setValue('type', result.name);
        setShowNewTypeInput(false);
        setNewTypeName('');
        toast.success(`Type "${result.name}" ajouté avec succès`);
      } else {
        console.error('Error: createType returned invalid result', result);
        toast.error('Erreur lors de l\'ajout du type');
      }
    } catch (error) {
      console.error('Error adding new type:', error);
      toast.error('Erreur lors de l\'ajout du type');
    }
  };

  return (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel>{t.type}</FormLabel>
          <div className="space-y-2">
            <Select
              onValueChange={(value) => {
                if (value === "__add_new__") {
                  setShowNewTypeInput(true);
                } else {
                  field.onChange(value);
                }
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
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <>
                    {types.map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="__add_new__" className="text-primary">
                      <Plus className="h-4 w-4 mr-2 inline" />
                      {t.addType}
                    </SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>

            {showNewTypeInput && (
              <div className="flex gap-2">
                <Input
                  placeholder={t.newTypePlaceholder}
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  onClick={handleAddNewType}
                  disabled={!newTypeName.trim()}
                >
                  {t.addButton}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowNewTypeInput(false);
                    setNewTypeName('');
                  }}
                >
                  {t.cancel}
                </Button>
              </div>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
