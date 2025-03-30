
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EquipmentFormValues } from './equipmentFormTypes';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AdditionalInfoFieldsProps {
  form: UseFormReturn<EquipmentFormValues>;
  language?: string;
}

const AdditionalInfoFields: React.FC<AdditionalInfoFieldsProps> = ({ 
  form,
  language = 'fr'
}) => {
  const labels = {
    fr: {
      serialNumber: 'Numéro de série',
      status: 'Statut',
      location: 'Emplacement',
      purchaseDate: 'Date d\'achat',
      serialNumberPlaceholder: 'Numéro de série',
      locationPlaceholder: 'Emplacement de l\'équipement',
      selectDate: 'Sélectionner une date',
      statusOptions: {
        operational: 'Opérationnel',
        maintenance: 'En maintenance',
        repair: 'En réparation',
        inactive: 'Inactif'
      }
    },
    en: {
      serialNumber: 'Serial Number',
      status: 'Status',
      location: 'Location',
      purchaseDate: 'Purchase Date',
      serialNumberPlaceholder: 'Serial number',
      locationPlaceholder: 'Equipment location',
      selectDate: 'Select a date',
      statusOptions: {
        operational: 'Operational',
        maintenance: 'In maintenance',
        repair: 'In repair',
        inactive: 'Inactive'
      }
    }
  };

  const t = labels[language as keyof typeof labels] || labels.fr;
  
  return (
    <div className="space-y-4">
      {/* Numéro de série */}
      <FormField
        control={form.control}
        name="serialNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t.serialNumber}</FormLabel>
            <FormControl>
              <Input placeholder={t.serialNumberPlaceholder} {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Statut */}
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t.status}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="operational">{t.statusOptions.operational}</SelectItem>
                <SelectItem value="maintenance">{t.statusOptions.maintenance}</SelectItem>
                <SelectItem value="repair">{t.statusOptions.repair}</SelectItem>
                <SelectItem value="inactive">{t.statusOptions.inactive}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Emplacement */}
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t.location}</FormLabel>
            <FormControl>
              <Input placeholder={t.locationPlaceholder} {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Date d'achat */}
      <FormField
        control={form.control}
        name="purchaseDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{t.purchaseDate}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                  >
                    {field.value ? (
                      format(field.value, 'PPP', { locale: fr })
                    ) : (
                      <span>{t.selectDate}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AdditionalInfoFields;
