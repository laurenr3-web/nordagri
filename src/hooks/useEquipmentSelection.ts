
import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PartFormValues } from '@/components/parts/form/partFormTypes';

export function useEquipmentSelection(form: UseFormReturn<PartFormValues>) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Initialize with form values when component mounts
  useEffect(() => {
    const currentCompatibility = form.getValues('compatibility') || [];
    setSelectedIds(Array.isArray(currentCompatibility) ? currentCompatibility : []);
  }, [form]);

  const handleSelectionChange = (newSelection: string[]) => {
    console.log('New selection received:', newSelection);
    
    // Convert string[] to number[]
    const numericIds = newSelection.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    console.log('Converted to numeric IDs:', numericIds);
    
    // Update local state
    setSelectedIds(numericIds);
    
    // Update form value
    form.setValue('compatibility', numericIds, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const clearSelection = () => {
    console.log('Clearing selection');
    setSelectedIds([]);
    form.setValue('compatibility', [], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return {
    selectedIds,
    handleSelectionChange,
    clearSelection
  };
}
