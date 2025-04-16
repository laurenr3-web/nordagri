
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface WearUnitFieldProps {
  form: UseFormReturn<any>;
}

export function WearUnitField({ form }: WearUnitFieldProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="unite_d_usure"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Unité d'usure</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une unité" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="heures">Heures moteur (h)</SelectItem>
                <SelectItem value="kilometres">Kilomètres (km)</SelectItem>
                <SelectItem value="acres">Acres</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="valeur_actuelle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valeur actuelle</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="0" 
                step="0.01"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
