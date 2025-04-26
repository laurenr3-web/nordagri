
import React, { useEffect, useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { PartFormValues } from '../partFormTypes';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useEquipmentList } from '@/hooks/equipment/useEquipmentList';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EquipmentOption {
  id: number;
  name: string;
  model?: string;
  manufacturer?: string;
  type?: string;
}

interface CompatibilityFieldProps {
  form: UseFormReturn<PartFormValues>;
}

const EquipmentCompatibilityField: React.FC<CompatibilityFieldProps> = ({ form }) => {
  const [open, setOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<number[]>([]);
  const { data: equipment, isLoading, error } = useEquipmentList();

  // Convertir les équipements en options pour la sélection
  const equipmentOptions: EquipmentOption[] = equipment || [];

  // Synchroniser les IDs sélectionnés avec le champ compatibility du formulaire
  useEffect(() => {
    const currentIds = form.getValues('compatibilityIds') || [];
    setSelectedEquipment(currentIds);
  }, [form]);

  // Mettre à jour le formulaire lorsque la sélection change
  const handleEquipmentToggle = (equipmentId: number) => {
    const updatedSelection = selectedEquipment.includes(equipmentId)
      ? selectedEquipment.filter(id => id !== equipmentId)
      : [...selectedEquipment, equipmentId];
    
    setSelectedEquipment(updatedSelection);
    form.setValue('compatibilityIds', updatedSelection, { shouldValidate: true });
  };

  // Fonction pour retirer un équipement sélectionné
  const removeEquipment = (equipmentId: number) => {
    const updatedSelection = selectedEquipment.filter(id => id !== equipmentId);
    setSelectedEquipment(updatedSelection);
    form.setValue('compatibilityIds', updatedSelection, { shouldValidate: true });
  };

  // Obtenir les noms des équipements sélectionnés
  const getSelectedEquipmentNames = () => {
    return equipmentOptions
      .filter(eq => selectedEquipment.includes(eq.id))
      .map(eq => ({
        id: eq.id,
        name: eq.name,
        model: eq.model,
        manufacturer: eq.manufacturer
      }));
  };

  return (
    <FormField
      control={form.control}
      name="compatibilityIds"
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor="compatibility">Équipements compatibles</FormLabel>
          <div className="flex flex-col gap-2">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="justify-between w-full"
                >
                  <span className="truncate">
                    {selectedEquipment.length > 0 
                      ? `${selectedEquipment.length} équipement(s) sélectionné(s)`
                      : "Sélectionner les équipements..."}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                {isLoading ? (
                  <div className="py-6 text-center text-sm">Chargement des équipements...</div>
                ) : error ? (
                  <div className="py-6 text-center text-sm text-destructive">
                    Erreur de chargement des équipements
                  </div>
                ) : (
                  <Command>
                    <CommandInput placeholder="Rechercher un équipement..." />
                    <CommandEmpty>Aucun équipement trouvé.</CommandEmpty>
                    <ScrollArea className="h-72">
                      <CommandGroup>
                        {equipmentOptions.map((eq) => (
                          <CommandItem
                            key={eq.id}
                            value={`${eq.id}-${eq.name}`}
                            onSelect={() => {
                              handleEquipmentToggle(eq.id);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedEquipment.includes(eq.id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{eq.name}</span>
                              {(eq.model || eq.manufacturer) && (
                                <span className="text-xs text-muted-foreground">
                                  {[eq.manufacturer, eq.model].filter(Boolean).join(' - ')}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </ScrollArea>
                  </Command>
                )}
              </PopoverContent>
            </Popover>

            {/* Affichage des équipements sélectionnés */}
            <div className="flex flex-wrap gap-1 mt-1">
              {getSelectedEquipmentNames().map((eq) => (
                <Badge key={eq.id} variant="secondary" className="px-2 py-1 flex items-center gap-1">
                  {eq.name}
                  {eq.model && <span className="text-xs opacity-70">({eq.model})</span>}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => removeEquipment(eq.id)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Supprimer {eq.name}</span>
                  </Button>
                </Badge>
              ))}
              {selectedEquipment.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun équipement sélectionné</p>
              )}
            </div>
          </div>
          <FormDescription id="compatibility-description">
            Sélectionnez les équipements compatibles avec cette pièce
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default EquipmentCompatibilityField;
