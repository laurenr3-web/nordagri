
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PartFormValues } from '../partFormTypes';
import { useManufacturers } from '@/hooks/parts/useManufacturers';
import AddManufacturerDialog from '../AddManufacturerDialog';

interface BasicInfoFieldsProps {
  form: UseFormReturn<PartFormValues>;
  customCategories?: string[];
  onAddCategoryClick?: () => void;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ 
  form, 
  customCategories = [],
  onAddCategoryClick
}) => {
  const [isAddManufacturerDialogOpen, setIsAddManufacturerDialogOpen] = useState(false);
  const { manufacturers, isLoading: isLoadingManufacturers } = useManufacturers();

  const handleSelectManufacturer = (manufacturer: string) => {
    form.setValue('manufacturer', manufacturer);
  };

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nom de la pièce</FormLabel>
            <FormControl>
              <Input placeholder="Filtre à air" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="partNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Référence</FormLabel>
            <FormControl>
              <Input placeholder="AF-JD-4290" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Catégorie</FormLabel>
            <div className="flex items-center gap-2">
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Filtres">Filtres</SelectItem>
                  <SelectItem value="Moteur">Moteur</SelectItem>
                  <SelectItem value="Transmission">Transmission</SelectItem>
                  <SelectItem value="Hydraulique">Hydraulique</SelectItem>
                  <SelectItem value="Électrique">Électrique</SelectItem>
                  <SelectItem value="Freinage">Freinage</SelectItem>
                  <SelectItem value="Refroidissement">Refroidissement</SelectItem>
                  {customCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {onAddCategoryClick && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={onAddCategoryClick}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="manufacturer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fabricant</FormLabel>
            <div className="flex items-center gap-2">
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un fabricant" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Fabricants prédéfinis */}
                  <SelectItem value="John Deere">John Deere</SelectItem>
                  <SelectItem value="Case IH">Case IH</SelectItem>
                  <SelectItem value="New Holland">New Holland</SelectItem>
                  <SelectItem value="Kubota">Kubota</SelectItem>
                  <SelectItem value="Fendt">Fendt</SelectItem>
                  <SelectItem value="Massey Ferguson">Massey Ferguson</SelectItem>
                  <SelectItem value="Universel">Universel</SelectItem>
                  
                  {/* Fabricants dynamiques de la base de données */}
                  {manufacturers.map((manufacturer) => (
                    <SelectItem key={manufacturer.id} value={manufacturer.name}>
                      {manufacturer.name}
                    </SelectItem>
                  ))}
                  
                  {/* Option pour ajouter un nouveau fabricant */}
                  <SelectItem 
                    value="__add_new__" 
                    className="text-primary italic flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un fabricant...
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={() => setIsAddManufacturerDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Dialog pour ajouter un nouveau fabricant */}
      <AddManufacturerDialog
        isOpen={isAddManufacturerDialogOpen}
        onOpenChange={setIsAddManufacturerDialogOpen}
        onSelectManufacturer={handleSelectManufacturer}
      />
    </>
  );
};

export default BasicInfoFields;
