
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ObservationType, UrgencyLevel } from '@/types/FieldObservation';
import { useEquipmentOptions } from '@/hooks/equipment/useEquipmentOptions';
import { UseFormReturn } from 'react-hook-form';
import { ObservationFormValues } from './ObservationFormTypes';
import { AlertCircle } from 'lucide-react';

interface EquipmentSelectProps {
  form: UseFormReturn<ObservationFormValues>;
}

export const EquipmentSelect = ({ form }: EquipmentSelectProps) => {
  const { data: equipments = [], isLoading: isLoadingEquipment } = useEquipmentOptions();
  
  return (
    <FormField
      control={form.control}
      name="equipment_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Équipement <span className="text-red-500">*</span>
          </FormLabel>
          <Select
            disabled={isLoadingEquipment}
            value={field.value?.toString() || ''}
            onValueChange={(value) => field.onChange(Number(value))}
          >
            <FormControl>
              <SelectTrigger className={form.formState.errors.equipment_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Sélectionner l'équipement" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {equipments.map((equipment) => (
                <SelectItem key={equipment.id} value={equipment.id.toString()}>
                  {equipment.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

interface ObservationTypeSelectProps {
  form: UseFormReturn<ObservationFormValues>;
}

export const ObservationTypeSelect = ({ form }: ObservationTypeSelectProps) => (
  <FormField
    control={form.control}
    name="observation_type"
    render={({ field }) => (
      <FormItem>
        <FormLabel>
          Type d'observation <span className="text-red-500">*</span>
        </FormLabel>
        <Select
          value={field.value || ''}
          onValueChange={(value) => field.onChange(value as ObservationType)}
        >
          <FormControl>
            <SelectTrigger className={form.formState.errors.observation_type ? 'border-red-500' : ''}>
              <SelectValue placeholder="Type d'observation" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="panne">Panne</SelectItem>
            <SelectItem value="usure">Usure</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="autre">Autre</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
);

interface UrgencyLevelSelectProps {
  form: UseFormReturn<ObservationFormValues>;
}

export const UrgencyLevelSelect = ({ form }: UrgencyLevelSelectProps) => (
  <FormField
    control={form.control}
    name="urgency_level"
    render={({ field }) => (
      <FormItem>
        <FormLabel>
          Niveau d'urgence <span className="text-red-500">*</span>
        </FormLabel>
        <Select
          value={field.value || ''}
          onValueChange={(value) => field.onChange(value as UrgencyLevel)}
        >
          <FormControl>
            <SelectTrigger className={form.formState.errors.urgency_level ? 'border-red-500' : ''}>
              <SelectValue placeholder="Niveau d'urgence" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="surveiller">À surveiller</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
);
