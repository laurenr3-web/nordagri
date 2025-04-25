
import React, { useEffect, useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';

interface EquipmentCompatibilityFieldProps {
  form: UseFormReturn<any>;
}

interface Equipment {
  id: string | number;
  name: string;
  manufacturer?: string;
}

const EquipmentCompatibilityField: React.FC<EquipmentCompatibilityFieldProps> = ({ form }) => {
  const [equipmentOptions, setEquipmentOptions] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);

  // Fetch equipment options from Supabase
  useEffect(() => {
    const fetchEquipment = async () => {
      setLoading(true);
      try {
        console.log("Fetching equipment options for compatibility field");
        const { data, error } = await supabase
          .from('equipment')
          .select('id, name, manufacturer')
          .order('name');

        if (error) {
          console.error('Error fetching equipment:', error);
          return;
        }

        if (data) {
          console.log("Fetched equipment data:", data);
          setEquipmentOptions(data || []);
        }
      } catch (err) {
        console.error('Unexpected error fetching equipment:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  // Update selected equipment based on form value (on load)
  useEffect(() => {
    const currentValues = form.getValues('compatibleEquipment') || [];
    
    console.log("Form values for compatibleEquipment:", currentValues);
    console.log("Available equipment options:", equipmentOptions);
    
    if (Array.isArray(currentValues) && currentValues.length > 0 && equipmentOptions.length > 0) {
      const selected = equipmentOptions.filter(equipment => 
        currentValues.includes(equipment.id.toString())
      );
      console.log("Selected equipment:", selected);
      setSelectedEquipment(selected || []);
    }
  }, [equipmentOptions, form]);

  const handleSelect = (value: string) => {
    // Ensure we're working with arrays
    const currentValues = Array.isArray(form.getValues('compatibleEquipment')) 
      ? [...form.getValues('compatibleEquipment')] 
      : [];
    
    console.log("Current compatibleEquipment values:", currentValues);
    console.log("Selected value:", value);
    
    // Toggle selection
    if (currentValues.includes(value)) {
      const updatedValues = currentValues.filter(v => v !== value);
      form.setValue('compatibleEquipment', updatedValues);
      setSelectedEquipment(prev => prev.filter(equipment => equipment.id.toString() !== value));
      console.log("Removed value, new values:", updatedValues);
    } else {
      const updatedValues = [...currentValues, value];
      form.setValue('compatibleEquipment', updatedValues);
      
      const newEquipment = equipmentOptions.find(equipment => equipment.id.toString() === value);
      if (newEquipment) {
        setSelectedEquipment(prev => [...prev, newEquipment]);
        console.log("Added value, new values:", updatedValues);
      }
    }

    // Don't close the popover on select
  };

  const removeEquipment = (equipmentId: string | number) => {
    const currentValues = Array.isArray(form.getValues('compatibleEquipment')) 
      ? [...form.getValues('compatibleEquipment')] 
      : [];
    
    const updatedValues = currentValues.filter(id => id.toString() !== equipmentId.toString());
    
    console.log("Removing equipment:", equipmentId);
    console.log("Updated values after removal:", updatedValues);
    
    form.setValue('compatibleEquipment', updatedValues);
    setSelectedEquipment(prev => prev.filter(equipment => equipment.id !== equipmentId));
  };

  return (
    <FormField
      control={form.control}
      name="compatibleEquipment"
      render={({ field }) => {
        // Ensure field.value is always an array
        const safeValue = Array.isArray(field.value) ? field.value : [];
        
        return (
          <FormItem className="flex flex-col">
            <FormLabel>Équipements compatibles</FormLabel>
            <FormControl>
              <div className="flex flex-col gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      <span className="truncate">
                        {selectedEquipment.length > 0 
                          ? `${selectedEquipment.length} équipement${selectedEquipment.length > 1 ? 's' : ''} sélectionné${selectedEquipment.length > 1 ? 's' : ''}`
                          : "Sélectionnez les équipements compatibles"}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Rechercher un équipement..." />
                      <CommandEmpty>Aucun équipement trouvé</CommandEmpty>
                      {Array.isArray(equipmentOptions) && equipmentOptions.length > 0 ? (
                        <CommandGroup className="max-h-64 overflow-auto">
                          {loading ? (
                            <div className="p-2 text-center text-sm text-muted-foreground">Chargement...</div>
                          ) : (
                            equipmentOptions.map((equipment) => {
                              const isSelected = safeValue.includes(equipment.id.toString());
                              return (
                                <CommandItem
                                  key={equipment.id}
                                  value={equipment.id.toString()}
                                  onSelect={handleSelect}
                                  className="flex items-center"
                                >
                                  <div className={cn(
                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                                    isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                                  )}>
                                    {isSelected && <CheckIcon className="h-3 w-3" />}
                                  </div>
                                  <span className="flex-1">
                                    {equipment.name}
                                    {equipment.manufacturer && (
                                      <span className="ml-1 text-muted-foreground">
                                        ({equipment.manufacturer})
                                      </span>
                                    )}
                                  </span>
                                </CommandItem>
                              );
                            })
                          )}
                        </CommandGroup>
                      ) : (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          {loading ? "Chargement..." : "Aucun équipement disponible"}
                        </div>
                      )}
                    </Command>
                  </PopoverContent>
                </Popover>

                {selectedEquipment && selectedEquipment.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedEquipment.map((equipment) => (
                      <Badge key={equipment.id} variant="secondary" className="flex items-center gap-1">
                        {equipment.name}
                        <button
                          type="button"
                          className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-1"
                          onClick={() => removeEquipment(equipment.id)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Retirer {equipment.name}</span>
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>
            <FormDescription>
              Laissez vide si la pièce n'est liée à aucune machine spécifique
            </FormDescription>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default EquipmentCompatibilityField;
