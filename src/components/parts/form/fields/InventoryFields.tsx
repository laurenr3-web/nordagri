
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PartFormValues } from '../partFormTypes';
import { useStorageLocations } from '@/hooks/parts/useStorageLocations';
import AddLocationDialog from '../AddLocationDialog';

interface InventoryFieldsProps {
  form: UseFormReturn<PartFormValues>;
}

const InventoryFields: React.FC<InventoryFieldsProps> = ({ form }) => {
  const [isAddLocationDialogOpen, setIsAddLocationDialogOpen] = useState(false);
  const { locations, isLoading: isLoadingLocations } = useStorageLocations();

  const handleSelectLocation = (location: string) => {
    form.setValue('location', location);
  };

  return (
    <>
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Prix (€)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="99.99" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="stock"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Stock (unités)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="10" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="reorderPoint"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Seuil d'alerte</FormLabel>
            <FormControl>
              <Input type="number" placeholder="5" {...field} />
            </FormControl>
            <FormDescription>
              Quantité minimale avant réapprovisionnement
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Emplacement</FormLabel>
            <div className="flex items-center gap-2">
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un emplacement" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Emplacements prédéfinis */}
                  <SelectItem value="Entrepôt A">Entrepôt A</SelectItem>
                  <SelectItem value="Entrepôt B">Entrepôt B</SelectItem>
                  <SelectItem value="Atelier">Atelier</SelectItem>
                  <SelectItem value="Unité mobile">Unité mobile</SelectItem>
                  
                  {/* Emplacements dynamiques de la base de données */}
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.name}>
                      {location.name}
                    </SelectItem>
                  ))}
                  
                  {/* Option pour ajouter un nouvel emplacement */}
                  <SelectItem 
                    value="__add_new__" 
                    className="text-primary italic flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un emplacement...
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={() => setIsAddLocationDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Dialog pour ajouter un nouvel emplacement */}
      <AddLocationDialog
        isOpen={isAddLocationDialogOpen}
        onOpenChange={setIsAddLocationDialogOpen}
        onSelectLocation={handleSelectLocation}
      />
    </>
  );
};

export default InventoryFields;
