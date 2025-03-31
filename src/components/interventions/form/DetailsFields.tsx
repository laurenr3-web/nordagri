
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { InterventionFormValues } from './interventionFormSchema';
import { Loader2, Users } from 'lucide-react';

interface DetailsFieldsProps {
  form: UseFormReturn<InterventionFormValues>;
  technicians: { id: string; name: string }[];
  isLoadingTechnicians: boolean;
}

const DetailsFields: React.FC<DetailsFieldsProps> = ({ 
  form, 
  technicians,
  isLoadingTechnicians
}) => {
  return (
    <>
      {/* Technicien */}
      <FormField
        control={form.control}
        name="technician"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Technicien</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value || ""} 
              disabled={isLoadingTechnicians}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un technicien">
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Assigner un technicien</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {isLoadingTechnicians ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Chargement...</span>
                  </div>
                ) : (
                  technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.name}>
                      {tech.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Description détaillée de l'intervention"
                rows={3}
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Notes */}
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Notes ou instructions supplémentaires"
                rows={2}
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default DetailsFields;
