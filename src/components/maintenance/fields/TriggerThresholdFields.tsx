
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';

interface TriggerThresholdFieldsProps {
  form: UseFormReturn<any>;
  equipment?: {
    unite_d_usure: string;
    valeur_actuelle: number;
  };
}

export function TriggerThresholdFields({ form, equipment }: TriggerThresholdFieldsProps) {
  const triggerUnit = form.watch('trigger_unit');
  const showKilometersField = triggerUnit === 'kilometers';
  const showHoursField = triggerUnit === 'hours';

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="trigger_unit"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Unité de seuil</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || 'hours'}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une unité" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="hours">Heures moteur</SelectItem>
                <SelectItem value="kilometers">Kilomètres</SelectItem>
                <SelectItem value="none">Aucun seuil</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Cette valeur sera comparée à l'usure actuelle de l'équipement ({equipment?.valeur_actuelle || 0} {equipment?.unite_d_usure})
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {showHoursField && (
        <FormField
          control={form.control}
          name="trigger_hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seuil en heures</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.1"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>
                Déclencher la maintenance après ce nombre d'heures
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {showKilometersField && (
        <FormField
          control={form.control}
          name="trigger_kilometers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seuil en kilomètres</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" 
                  step="1"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>
                Déclencher la maintenance après ce nombre de kilomètres
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
