
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EquipmentFormValues, EquipmentStatus } from '../equipmentFormTypes';

interface StatusOption {
  value: EquipmentStatus;
  label: string;
}

interface StatusFieldProps {
  form: UseFormReturn<EquipmentFormValues>;
  label?: string;
  placeholder?: string;
  statusOptions?: StatusOption[];
}

const StatusField: React.FC<StatusFieldProps> = ({ 
  form, 
  label = "Status",
  placeholder = "Select status",
  statusOptions = [
    { value: 'operational', label: 'Operational' },
    { value: 'maintenance', label: 'In Maintenance' },
    { value: 'repair', label: 'Needs Repair' },
    { value: 'inactive', label: 'Retired' },
  ]
}) => {
  return (
    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
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

export default StatusField;
