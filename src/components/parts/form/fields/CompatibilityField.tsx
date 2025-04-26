
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { PartFormValues } from '../partFormTypes';
import EquipmentCompatibilityField from './EquipmentCompatibilityField';

interface CompatibilityFieldProps {
  form: UseFormReturn<PartFormValues>;
}

const CompatibilityField: React.FC<CompatibilityFieldProps> = ({ form }) => {
  return <EquipmentCompatibilityField form={form} />;
};

export default CompatibilityField;
