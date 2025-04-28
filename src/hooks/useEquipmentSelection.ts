
import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PartFormValues } from '@/components/parts/form/partFormTypes';
import { useEquipments } from '@/hooks/equipment/useEquipments';

export function useEquipmentSelection(form: UseFormReturn<PartFormValues>) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { data: equipments } = useEquipments();
  
  // Initialize with form values when component mounts
  useEffect(() => {
    const currentCompatibility = form.getValues('compatibility') || [];
    if (Array.isArray(currentCompatibility)) {
      setSelectedIds(currentCompatibility);
    }
  }, [form]);

  const handleSelectionChange = (newSelection: string[]) => {
    console.log('New selection:', newSelection);
    
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
    console.log('Clearing equipment selection');
    setSelectedIds([]);
    form.setValue('compatibility', [], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return {
    selectedIds,
    handleSelectionChange,
    clearSelection,
    equipments
  };
}
